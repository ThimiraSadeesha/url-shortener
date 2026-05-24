import { UrlShortener } from "@/components/UrlShortener";

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.18),transparent)]"
        aria-hidden
      />
      <header className="relative z-10 border-b border-zinc-200/80 bg-white/70 px-6 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white">
            /
          </span>
          <span className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            ShortLink
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Shorten links in seconds
          </h1>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Paste a long URL and get a short link backed by AWS Lambda and
            DynamoDB. Links expire after 30 days.
          </p>
        </div>
        <UrlShortener />
      </main>

      <footer className="relative z-10 border-t border-zinc-200/80 px-6 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        url-shortener monorepo · Go Lambdas + Next.js
      </footer>
    </div>
  );
}
