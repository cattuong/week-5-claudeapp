'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('All fields are required.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Signup failed.'); return }
      localStorage.setItem('userId', data.userId)
      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div data-theme="light" className="min-h-screen bg-an-bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-[28px] font-medium text-an-fg-base mb-2 text-center">
          Create an account
        </h1>
        <p className="text-an-fg-subtle text-[13px] text-center mb-8">
          Already have one?{' '}
          <Link href="/login" className="text-an-accent hover:underline">Log in</Link>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-an-fg-base">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-9 px-3 rounded-md bg-an-bg-subtle border border-an-border text-[14px] text-an-fg-base placeholder:text-an-fg-muted focus:border-an-border-strong focus:outline-none transition duration-150"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-an-fg-base">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="h-9 px-3 rounded-md bg-an-bg-subtle border border-an-border text-[14px] text-an-fg-base placeholder:text-an-fg-muted focus:border-an-border-strong focus:outline-none transition duration-150"
            />
          </div>

          {error && (
            <p className="text-[13px] text-[var(--an-error)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-9 rounded-md bg-an-accent hover:bg-an-accent-hover text-white text-[14px] font-medium transition duration-150 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
