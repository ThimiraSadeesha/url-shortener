"use client";

import { useState } from "react";
import { shortenUrl } from "@/lib/api";

export function UrlShortener() {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setShortUrl(null);
    setCopied(false);
    setLoading(true);

    try {
      const trimmed = longUrl.trim();
      if (!trimmed) {
        setError("Enter a URL to shorten");
        return;
      }
      const url = trimmed.match(/^https?:\/\//) ? trimmed : `https://${trimmed}`;
      const result = await shortenUrl(url);
      setShortUrl(result.short_url);
      setLongUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!shortUrl) return;
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="long-url" className="sr-only">
          Long URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="long-url"
            type="url"
            inputMode="url"
            placeholder="https://example.com/very/long/path"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            disabled={loading}
            className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-sm outline-none ring-violet-500/0 transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 rounded-xl bg-violet-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Shortening…" : "Shorten"}
          </button>
        </div>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
        >
          {error}
        </p>
      )}

      {shortUrl && (
        <div className="mt-6 rounded-2xl border border-violet-200/80 bg-violet-50/80 p-5 dark:border-violet-900/50 dark:bg-violet-950/30">
          <p className="text-sm font-medium text-violet-900 dark:text-violet-200">
            Your short link
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 break-all font-mono text-sm text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
            >
              {shortUrl}
            </a>
            <button
              type="button"
              onClick={copyLink}
              className="shrink-0 rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-medium text-violet-800 transition hover:bg-violet-100 dark:border-violet-700 dark:bg-zinc-900 dark:text-violet-200 dark:hover:bg-violet-950"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
