import { motion } from 'framer-motion'
import { Activity, CheckCircle2, Zap } from 'lucide-react'

const STATS = [
  {
    icon: CheckCircle2,
    value: '500K+',
    label: 'Complaints Analyzed',
    color: '#10B981',
    glow: 'var(--bg-soft)',
  },
  {
    icon: Activity,
    value: '94%',
    label: 'Resolution Accuracy',
    color: '#3B82F6',
    glow: 'var(--bg-soft)',
  },
  {
    icon: Zap,
    value: '1.2s',
    label: 'Avg. AI Response',
    color: '#F59E0B',
    glow: 'var(--bg-soft)',
  },
]

export default function StatsRow() {
  return (
    <section
      style={{
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '48px 0',
      }}
    >
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 24,
      }}>
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.1 }}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 10, flexShrink: 0,
              background: s.glow,
              border: `1px solid var(--border)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <p style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 700, fontSize: 32, lineHeight: 1,
                color: 'var(--text)', margin: '0 0 6px',
                letterSpacing: '-0.02em',
              }}>
                {s.value}
              </p>
              <p style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13, fontWeight: 500,
                color: 'var(--muted)',
                margin: 0,
              }}>
                {s.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
