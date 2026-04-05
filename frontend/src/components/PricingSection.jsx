import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'

const TIERS = [
  {
    id: 'tier-starter',
    name: 'Starter',
    price: 'Free',
    priceSub: 'Forever',
    description: 'Get started instantly.',
    cta: 'Get Started',
    ctaHref: '#dashboard',
    popular: false,
    features: [
      '1,000 complaints/mo',
      'AI categorization',
      'Sentiment detection',
      'Basic dashboard',
    ],
  },
  {
    id: 'tier-growth',
    name: 'Growth',
    price: '$299',
    priceSub: 'per month',
    description: 'For scaling teams.',
    cta: 'Start Free Trial',
    ctaHref: '#dashboard',
    popular: true,
    features: [
      '50,000 complaints/mo',
      'Risk scoring',
      'Pattern detection',
      'Resolution playbooks',
      'Priority support',
    ],
  },
  {
    id: 'tier-enterprise',
    name: 'Enterprise',
    price: 'Custom',
    priceSub: 'Talk to us',
    description: 'Unlimited, SLA-backed.',
    cta: 'Contact Sales',
    ctaHref: '#dashboard',
    popular: false,
    features: [
      'Unlimited volume',
      'Custom AI training',
      'Fraud detection',
      'SLA guarantee',
      'Dedicated manager',
    ],
  },
]

export default function PricingSection() {
  return (
    <section
      id="pricing"
      style={{
        background: 'var(--bg)',
        padding: '100px 0',
        position: 'relative',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* top glow line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <p style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 11, fontWeight: 500,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: '#3B82F6', marginBottom: 16,
          }}>
            Pricing
          </p>
          <h2 style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontWeight: 700, fontSize: 'clamp(32px,4vw,48px)',
            color: 'var(--text)', margin: 0, lineHeight: 1.12,
          }}>
            Start Free. Scale Fast.
          </h2>
          <p style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 16, color: 'var(--muted)',
            marginTop: 14,
          }}>
            No hidden fees. No surprises.
          </p>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          alignItems: 'stretch',
        }}>
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              style={{
                position: 'relative',
                background: '#1C1F2E',
                border: tier.popular
                  ? '2px solid #3b82f6'
                  : '1px solid rgba(59,130,246,0.15)',
                borderRadius: 24,
                padding: '40px 32px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: tier.popular
                  ? '0 0 60px rgba(59,130,246,0.2), inset 0 1px 0 rgba(59,130,246,0.1)'
                  : '0 0 40px rgba(59,130,246,0.06)',
                transition: 'box-shadow 0.25s',
              }}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div style={{
                  position: 'absolute', top: 0, left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontSize: 11, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    color: '#fff',
                    background: '#3b82f6',
                    borderRadius: 100,
                    padding: '4px 14px',
                    boxShadow: '0 0 20px rgba(59,130,246,0.5)',
                    whiteSpace: 'nowrap',
                  }}>
                    <Zap size={11} /> Most Popular
                  </span>
                </div>
              )}

              {/* Tier name */}
              <p style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: 16, fontWeight: 600,
                color: tier.popular ? '#3b82f6' : 'var(--text)',
                margin: '0 0 4px',
              }}>
                {tier.name}
              </p>
              <p style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13, color: 'var(--label)',
                margin: '0 0 28px',
              }}>
                {tier.description}
              </p>

              {/* Price */}
              <div style={{ marginBottom: 32 }}>
                <span style={{
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontWeight: 700, fontSize: 52, lineHeight: 1,
                  color: 'var(--text)', letterSpacing: '-0.02em',
                }}>
                  {tier.price}
                </span>
                <span style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 13, color: 'var(--label)',
                  marginLeft: 8,
                }}>
                  {tier.priceSub}
                </span>
              </div>

              {/* CTA */}
              <a
                href={tier.ctaHref}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontWeight: 700, fontSize: 15,
                  color: tier.popular ? '#fff' : 'var(--muted)',
                  background: tier.popular ? '#3b82f6' : 'transparent',
                  border: tier.popular ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 100,
                  padding: '13px 28px',
                  textDecoration: 'none',
                  marginBottom: 32,
                  boxShadow: tier.popular ? '0 0 20px rgba(59,130,246,0.3)' : 'none',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (tier.popular) {
                    e.currentTarget.style.background = '#60a5fa'
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(59,130,246,0.5)'
                  } else {
                    e.currentTarget.style.color = 'var(--text)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (tier.popular) {
                    e.currentTarget.style.background = '#3b82f6'
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(59,130,246,0.3)'
                  } else {
                    e.currentTarget.style.color = 'var(--muted)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                  }
                }}
              >
                {tier.cta}
              </a>

              {/* Divider */}
              <div style={{
                height: 1,
                background: tier.popular ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)',
                marginBottom: 28,
              }} />

              {/* Features */}
              <p style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 10, fontWeight: 500,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--muted)', marginBottom: 16,
              }}>
                Included
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                {tier.features.map((feat) => (
                  <li
                    key={feat}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      marginBottom: 12,
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: tier.popular ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Check size={11} color={tier.popular ? '#3b82f6' : 'var(--label)'} />
                    </div>
                    <span style={{
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 14, color: '#CBD5E1',
                    }}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}



