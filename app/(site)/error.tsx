'use client'

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[50vh] max-w-[560px] mx-auto px-6 py-16 font-inter text-ink">
      <p className="font-archivo text-[22px] mb-3">Something broke on this page</p>
      <p className="text-[14px] text-ink/70 mb-4">
        Open the browser developer console (Safari/Chrome: right-click → Inspect → Console) and reload. The
        message below is for debugging.
      </p>
      <pre className="text-[12px] bg-card border-2 border-ink p-4 overflow-auto whitespace-pre-wrap mb-6">
        {error.message}
      </pre>
      <button
        type="button"
        onClick={() => reset()}
        className="font-inter text-[11px] font-bold uppercase tracking-[1px] px-5 py-3 border-2 border-ink bg-yellow cursor-pointer"
      >
        Try again
      </button>
    </div>
  )
}
