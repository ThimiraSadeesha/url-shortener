export type ShortenResponse = {
  short_code: string;
  short_url: string;
};

export type ApiError = {
  error: string;
};

function apiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  return base;
}

export async function shortenUrl(longUrl: string): Promise<ShortenResponse> {
  const res = await fetch(`${apiBase()}/api/shorten`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ long_url: longUrl }),
  });

  const data = (await res.json()) as ShortenResponse | ApiError;
  if (!res.ok) {
    const message = "error" in data ? data.error : "Failed to shorten URL";
    throw new Error(message);
  }
  return data as ShortenResponse;
}
