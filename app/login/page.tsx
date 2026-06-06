'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      const next = searchParams.get('next') ?? '/'
      router.push(next)
    } else {
      setError(true)
      setPassword('')
      inputRef.current?.focus()
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-60px',
        width: 260, height: 260, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(181,105,74,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', left: '-80px',
        width: 220, height: 220, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(92,122,94,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div style={{
        background: 'white',
        borderRadius: 24,
        padding: '40px 32px',
        width: '100%',
        maxWidth: 360,
        boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: 'linear-gradient(135deg, #B5694A 0%, #c97d5d 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, marginBottom: 24,
          boxShadow: '0 4px 16px rgba(181,105,74,0.25)',
        }}>🌿</div>

        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase', color: 'var(--clay)',
          marginBottom: 8,
        }}>Welcome back</div>

        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 28, fontWeight: 700,
          color: 'var(--ink)',
          margin: '0 0 6px',
          lineHeight: 1.2,
        }}>
          Your <em>Wellness</em><br />Tracker
        </h1>

        <p style={{
          fontSize: 13, color: 'var(--muted)',
          margin: '0 0 32px',
          fontFamily: 'Outfit, sans-serif',
        }}>
          Enter your password to continue
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false) }}
              placeholder="Password"
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 15,
                fontFamily: 'Outfit, sans-serif',
                background: error ? '#FFF5F3' : 'var(--warm)',
                border: `1.5px solid ${error ? '#E57373' : 'var(--line)'}`,
                borderRadius: 12,
                outline: 'none',
                color: 'var(--ink)',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
            />
            {error && (
              <div style={{
                fontSize: 12, color: '#C0392B',
                marginTop: 6,
                fontFamily: 'Outfit, sans-serif',
              }}>
                Hmm, that doesn't seem right. Try again?
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!password || loading}
            style={{
              padding: '14px',
              background: password && !loading
                ? 'linear-gradient(135deg, var(--clay) 0%, #c97d5d 100%)'
                : 'var(--warm)',
              color: password && !loading ? 'white' : 'var(--muted)',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'Outfit, sans-serif',
              cursor: password && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              letterSpacing: 0.3,
            }}
          >
            {loading ? 'Checking…' : 'Enter →'}
          </button>
        </form>
      </div>

      <p style={{
        marginTop: 24, fontSize: 11,
        color: 'var(--light)',
        fontFamily: 'Outfit, sans-serif',
      }}>
        Personal wellness tracker · private
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
