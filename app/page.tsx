import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-an-bg-base text-an-fg-base px-6">
      <div className="text-center max-w-lg an-fade-in">
        <h1 className="font-display text-[28px] font-medium text-an-fg-base mb-4">
          AI Document Assistant
        </h1>
        <p className="text-an-fg-subtle text-[14px] leading-relaxed mb-8">
          Upload a document, ask questions, get instant analysis powered by Azure AI.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="h-9 px-4 rounded-md border border-an-border text-an-fg-base text-[14px] font-medium flex items-center hover:bg-an-bg-surface transition duration-150"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="h-9 px-4 rounded-md bg-an-accent hover:bg-an-accent-hover text-white text-[14px] font-medium flex items-center transition duration-150"
          >
            Get started
          </Link>
        </div>
      </div>
    </main>
  )
}
