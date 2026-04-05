import { motion } from 'framer-motion'
import {
  BrainCircuit,
  MessageSquareHeart,
  ShieldAlert,
  GitBranchPlus,
  Sparkles,
  Monitor,
} from 'lucide-react'

const FEATURES = [
  {
    icon: BrainCircuit,
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.12)',
    title: 'Instant Classification',
    body: '12 categories. Zero manual sorting.',
  },
  {
    icon: MessageSquareHeart,
    color: '#10b981',
    glow: 'rgba(16,185,129,0.12)',
    title: 'Read Between the Lines',
    body: 'Urgency detected. Priority set automatically.',
  },
  {
    icon: ShieldAlert,
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.12)',
    title: 'Know Before It Escalates',
    body: 'Critical flags surface in milliseconds.',
  },
  {
    icon: GitBranchPlus,
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.12)',
    title: 'See the Signal, Not the Noise',
    body: '100 complaints. 1 root cause. Found.',
  },
  {
    icon: Sparkles,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.12)',
    title: 'Answers, Not Tickets',
    body: 'AI resolves. Humans handle what matters.',
  },
  {
    icon: Monitor,
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.12)',
    title: "Your Bank's Nervous System",
    body: 'Real-time. Always on. Always clear.',
  },
]

export default function FeaturesSection() {
  return (
    <section
      id="features"
      style={{
        background: 'var(--bg)',
        padding: '100px 0',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 11, fontWeight: 500,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: '#3B82F6', marginBottom: 16,
          }}>
            Capabilities
          </p>
          <h2 style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontWeight: 700, fontSize: 'clamp(32px,4vw,48px)',
            color: 'var(--text)', margin: 0, lineHeight: 1.12,
          }}>
            Intelligence at Every Layer
          </h2>
          <p style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 16, color: 'var(--muted)',
            marginTop: 14, maxWidth: 400, margin: '14px auto 0',
          }}>
            Not just storage. Actual thinking.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                style={{
                  background: '#1C1F2E',
                  border: '1px solid rgba(59,130,246,0.15)',
                  borderRadius: 20,
                  padding: '28px 28px',
                  boxShadow: `0 0 40px ${f.glow}`,
                  cursor: 'default',
                  transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                }}
                whileHover={{
                  y: -4,
                  boxShadow: `0 0 60px rgba(59,130,246,0.2)`,
                  borderColor: 'rgba(59,130,246,0.4)',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${f.color}18`,
                  border: `1px solid ${f.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <Icon size={20} color={f.color} />
                </div>
                <h3 style={{
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontWeight: 600, fontSize: 17,
                  color: 'var(--text)', margin: '0 0 8px',
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 14, color: 'var(--muted)',
                  lineHeight: 1.65, margin: 0,
                }}>
                  {f.body}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}


