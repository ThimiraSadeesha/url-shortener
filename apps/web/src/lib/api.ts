export type ShortenResponse = {
  short_code: string;
  short_url: string;
};

export type ApiError = {
  error: string;
};

const DEFAULT_API_BASE =
  "https://dsqeedu5n5.execute-api.ap-south-1.amazonaws.com/prod";

function apiBase(): string {
  const base = (
    process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE
  ).replace(/\/$/, "");
  return base;
}

function createEndpoint(): string {
  // Dev server rewrite → same origin, no CORS preflight to API Gateway
  if (process.env.NODE_ENV === "development") {
    return "/api/proxy/create";
  }
  return `${apiBase()}/create`;
}

export async function shortenUrl(longUrl: string): Promise<ShortenResponse> {
  let res: Response;
  try {
    res = await fetch(createEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ long_url: longUrl }),
    });
  } catch {
    throw new Error(
      "Could not reach the API. If this is the deployed site, enable CORS on API Gateway (see scripts/enable-api-cors.sh).",
    );
  }

  let data: ShortenResponse | ApiError;
  try {
    data = (await res.json()) as ShortenResponse | ApiError;
  } catch {
    throw new Error(`Unexpected API response (${res.status})`);
  }

  if (!res.ok) {
    const message = "error" in data ? data.error : "Failed to shorten URL";
    throw new Error(message);
  }
  return data as ShortenResponse;
}
