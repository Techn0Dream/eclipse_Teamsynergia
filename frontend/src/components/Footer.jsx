import { ShieldCheck, Globe, Mail } from 'lucide-react'

const SOCIAL = [
  { Icon: Globe,   href: '#', label: 'Website' },
  { Icon: Mail, href: '#', label: 'Email' },
  { Icon: ShieldCheck,  href: '#', label: 'Security' },
]

const LINKS = {
  Product:   ['Features', 'How It Works', 'Pricing', 'Demo'],
  Support:   ['Documentation', 'API Reference', 'Privacy Policy', 'Terms of Use'],
}

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-soft)',
      borderTop: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '64px 24px 40px',
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr 1fr',
        gap: 48,
        flexWrap: 'wrap',
      }}>

        {/* Brand column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShieldCheck size={18} color="var(--primary)" />
            </div>
            <span style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 700, fontSize: 17, color: 'var(--text)',
            }}>
              Resolve<span style={{ color: 'var(--primary)' }}>.ai</span>
            </span>
          </div>

          <p style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 14, color: 'var(--muted)',
            lineHeight: 1.7, maxWidth: 280, margin: '0 0 24px',
          }}>
            AI-guided resolution for modern banking teams. Triage, escalate, and resolve customer complaints faster than ever.
          </p>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: 10 }}>
            {SOCIAL.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--muted)',
                  transition: 'all 0.15s', textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg)'
                  e.currentTarget.style.borderColor = 'var(--primary)'
                  e.currentTarget.style.color = 'var(--primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--surface)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--muted)'
                }}
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([group, links]) => (
          <div key={group}>
            <p style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--text)', marginBottom: 20,
            }}>{group}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {links.map((l) => (
                <li key={l} style={{ marginBottom: 12 }}>
                  <a
                    href="#"
                    style={{
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 14, color: 'var(--muted)',
                      textDecoration: 'none', transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)' }}
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '24px',
        maxWidth: 1100, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <p style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13, color: 'var(--muted)', margin: 0,
        }}>
          © 2025 Resolve.ai — Built for modern banks.
        </p>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Cookies'].map((l) => (
            <a key={l} href="#" style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13, color: 'var(--muted)',
              textDecoration: 'none', transition: 'color 0.15s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)' }}
            >{l}</a>
          ))}
        </div>
      </div>
    </footer>
  )
}
