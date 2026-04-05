import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ShieldCheck, ChevronDown, Zap, Sun, Moon } from 'lucide-react'

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#workflow', label: 'How It Works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#dashboard', label: 'Demo' },
]

export default function Navbar({ theme, toggleTheme }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  /* Google Translate */
  useEffect(() => {
    const init = () => {
      if (!window.google?.translate?.TranslateElement) return
      const el = document.getElementById('google_translate_element')
      if (!el) return
      el.innerHTML = ''
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', includedLanguages: 'en,hi,fr,de,es,ja,zh-CN,ar', autoDisplay: false },
        'google_translate_element'
      )
    }
    window.googleTranslateElementInit = init
    const existing = document.querySelector('script[data-google-translate="true"]')
    if (!existing) {
      const s = document.createElement('script')
      s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      s.async = true; s.defer = true
      s.setAttribute('data-google-translate', 'true')
      document.body.appendChild(s)
    } else if (window.google?.translate?.TranslateElement) {
      init()
    }
  }, [])

  /* Close dropdown on outside click */
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
        backgroundColor: 'color-mix(in srgb, var(--bg) 86%, transparent)',
      }}
    >
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        height: 64,
      }}>
        {/* Logo */}
        <a href="#hero" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: 'rgba(59,130,246,0.15)',
            border: '1px solid rgba(59,130,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck size={18} color="#3b82f6" />
          </div>
          <span
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 700, fontSize: 18,
              letterSpacing: '-0.01em',
              color: 'var(--text)',
            }}
          >
            Resolve<span style={{ color: 'var(--primary)' }}>.ai</span>
          </span>
        </a>

        {/* Nav links — desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="hidden md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 14, fontWeight: 500,
                color: 'var(--text)',
                textDecoration: 'none',
                padding: '6px 14px', borderRadius: 8,
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text)' }}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Translate */}
          <div
            className="translate-shell hidden md:flex"
            style={{
              alignItems: 'center',
              borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              padding: '5px 12px',
            }}
          >
            <Globe size={14} color="var(--muted)" style={{ marginRight: 8, flexShrink: 0 }} />
            <div id="google_translate_element" style={{ minWidth: 120 }} />
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13, fontWeight: 500,
              color: 'var(--btn-secondary-text)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '6px 14px', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--btn-secondary-hover-bg)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* CTA */}
          <a
            href="#dashboard"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 700, fontSize: 14,
              color: 'var(--btn-primary-text)',
              background: 'var(--btn-primary-bg)',
              borderRadius: 8,
              padding: '8px 20px',
              textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--btn-primary-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--btn-primary-bg)' }}
          >
            <Zap size={14} />
            Start Free
          </a>
        </div>
      </div>
    </motion.nav>
  )
}


