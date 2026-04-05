import { motion } from 'framer-motion'
import { Upload, Brain, Zap } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    icon: Upload,
    color: '#3b82f6',
    title: 'Ingest',
    body: 'Any channel. Any volume. Instant.',
  },
  {
    num: '02',
    icon: Brain,
    color: '#10b981',
    title: 'Analyze',
    body: 'LLM + RAG. Context-aware. Always accurate.',
  },
  {
    num: '03',
    icon: Zap,
    color: '#f59e0b',
    title: 'Act',
    body: 'Auto-resolve or escalate. AI decides.',
  },
]

export default function HowItWorks() {
  return (
    <section
      id="workflow"
      style={{
        background: '#111520',
        padding: '100px 0',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: 64, textAlign: 'center' }}>
          <p style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 11, fontWeight: 500,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: '#3B82F6', marginBottom: 16,
          }}>
            The Pipeline
          </p>
          <h2 style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontWeight: 700, fontSize: 'clamp(32px,4vw,48px)',
            color: 'var(--text)', margin: 0, lineHeight: 1.12,
          }}>
            Three Steps. Zero Guesswork.
          </h2>
        </div>

        {/* Steps */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24,
          position: 'relative',
        }}>
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                style={{
                  background: '#1C1F2E',
                  border: '1px solid rgba(59,130,246,0.15)',
                  borderRadius: 24,
                  padding: '36px 32px',
                  boxShadow: '0 0 40px rgba(59,130,246,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Step number watermark */}
                <span style={{
                  position: 'absolute',
                  top: 16, right: 20,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 13, fontWeight: 700,
                  color: 'rgba(59,130,246,0.25)',
                  letterSpacing: '0.05em',
                }}>
                  {step.num}
                </span>

                {/* Icon */}
                <div style={{
                  width: 52, height: 52,
                  borderRadius: 14,
                  background: `${step.color}18`,
                  border: `1px solid ${step.color}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 24,
                }}>
                  <Icon size={24} color={step.color} />
                </div>

                <h3 style={{
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontWeight: 600, fontSize: 22,
                  color: 'var(--text)', margin: '0 0 10px',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 15, color: 'var(--muted)',
                  lineHeight: 1.65, margin: 0,
                }}>
                  {step.body}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}


