'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/',        icon: '🏠', label: 'Home' },
  { href: '/plan',    icon: '📋', label: 'Plan' },
  { href: '/log',     icon: '✅', label: 'Log' },
  { href: '/food',    icon: '🥗', label: 'Food' },
  { href: '/back',    icon: '🔄', label: 'Back' },
  { href: '/trends',  icon: '📈', label: 'Trends' },
]

export default function BottomNav() {
  const path = usePathname()
  return (
    <nav className="bottom-nav">
      {nav.map(({ href, icon, label }) => (
        <Link key={href} href={href} className={`nav-item${path === href ? ' active' : ''}`}>
          <span className="nav-item-icon">{icon}</span>
          {label}
        </Link>
      ))}
    </nav>
  )
}
