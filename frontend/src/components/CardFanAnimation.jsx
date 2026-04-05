import { motion } from 'framer-motion'

/* ─── Card definitions ───────────────────────────────────────────────────── */
const CARDS = [
  {
    id: 'fan-card-1',
    bg: '#E6F0FF', // soft blue
    shadow: '0 4px 14px rgba(0,0,0,0.05)',
    accentColor: '#2563EB',
    iconBg: '#BFDBFE',
    iconEmoji: '🔍',
    category: 'Fraud Detection',
    complaint: 'Unauthorized transaction of $2,847 flagged on personal account ending 4821',
    badge: 'HIGH RISK',
    badgeColor: '#FEE2E2',
    badgeBorder: '#FCA5A5',
    badgeText: '#EF4444',
    confidence: '97.3% confidence',
    /* desktop layout */
    top: 40,
    left: 40,
    rotate: -4,
    zIndex: 4,
    /* float loop */
    floatY: [0, -6, 0],
    floatDur: 4,
    /* mobile layout */
    mTop: 0,
    mLeft: 10,
    mRotate: -2,
  },
  {
    id: 'fan-card-2',
    bg: '#DFF5EC', // light green
    shadow: '0 4px 14px rgba(0,0,0,0.05)',
    accentColor: '#10B981',
    iconBg: '#A7F3D0',
    iconEmoji: '⚠️',
    category: 'Billing Dispute',
    complaint: 'Double charge recorded on 14 Mar — customer disputed $189 subscription renewal',
    badge: 'MEDIUM',
    badgeColor: '#FEF3C7',
    badgeBorder: '#FDE68A',
    badgeText: '#D97706',
    confidence: '91.8% confidence',
    top: 140,
    left: -20,
    rotate: -1,
    zIndex: 3,
    floatY: [0, -4, 0],
    floatDur: 5,
    mTop: 95,
    mLeft: 10,
    mRotate: -1,
  },
  {
    id: 'fan-card-3',
    bg: '#FFF3E0', // light orange
    shadow: '0 4px 14px rgba(0,0,0,0.05)',
    accentColor: '#F59E0B',
    iconBg: '#FDE68A',
    iconEmoji: '💬',
    category: 'Service Failure',
    complaint: 'ATM cash dispense error — machine debited account but did not release funds',
    badge: 'ESCALATED',
    badgeColor: '#FFEDD5',
    badgeBorder: '#FDBA74',
    badgeText: '#EA580C',
    confidence: '88.5% confidence',
    top: 240,
    left: 20,
    rotate: 2,
    zIndex: 2,
    floatY: [0, -5, 0],
    floatDur: 3.5,
    mTop: 175,
    mLeft: 10,
    mRotate: 1,
  },
  {
    id: 'fan-card-4',
    bg: '#F3E8FF', // light purple (for variety)
    shadow: '0 4px 14px rgba(0,0,0,0.05)',
    accentColor: '#8B5CF6',
    iconBg: '#E9D5FF',
    iconEmoji: '✅',
    category: 'Resolved',
    complaint: 'KYC document resubmission accepted — account limits restored within 4 hours',
    badge: 'RESOLVED',
    badgeColor: '#D1FAE5',
    badgeBorder: '#6EE7B7',
    badgeText: '#059669',
    confidence: '99.1% confidence',
    top: 340,
    left: 80,
    rotate: 5,
    zIndex: 1,
    floatY: [0, -3, 0],
    floatDur: 4.5,
    mTop: 245,
    mLeft: 15,
    mRotate: 2,
  },
]

const ENTRY_EASE = [0.16, 1, 0.3, 1]
const ENTRY_DELAYS = [0, 0.15, 0.28, 0.4]

export default function CardFanAnimation({ rotateX, rotateY, isMobile }) {
  const cardW = isMobile ? 280 : 380
  const cardH = isMobile ? 175 : 220

  return (
    <motion.div
      style={{
        rotateX: isMobile ? 0 : rotateX,
        rotateY: isMobile ? 0 : rotateY,
        transformPerspective: 1200,
        transformStyle: 'preserve-3d',
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      {CARDS.map((card, i) => {
        const top    = isMobile ? card.mTop    : card.top
        const left   = isMobile ? card.mLeft   : card.left
        const rotate = isMobile ? card.mRotate : card.rotate

        return (
          <motion.div
            key={card.id}
            id={card.id}
            initial={{ opacity: 0, y: 100, rotate: 0, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, rotate, scale: 1 }}
            transition={{
              duration: 1.2,
              delay: ENTRY_DELAYS[i],
              ease: ENTRY_EASE,
            }}
            style={{
              position: 'absolute',
              top,
              left,
              width: cardW,
              height: cardH,
              zIndex: card.zIndex,
            }}
          >
            <motion.div
              animate={{ y: card.floatY }}
              transition={{
                duration: card.floatDur,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 16, // reduced from 24
                background: card.bg,
                boxShadow: card.shadow,
                border: `1px solid rgba(0,0,0,0.05)`,
                padding: 20, // slightly reduced padding
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                userSelect: 'none',
              }}
            >
              {/* TOP ROW */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Icon circle */}
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: card.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0,
                }}>
                  {card.iconEmoji}
                </div>

                {/* Category pill */}
                <span style={{
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  background: 'rgba(0,0,0,0.04)',
                  color: 'rgba(0,0,0,0.5)',
                  borderRadius: 6,
                  padding: '4px 10px',
                  whiteSpace: 'nowrap',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 600,
                }}>
                  {card.category}
                </span>
              </div>

              {/* MIDDLE — complaint text */}
              <div style={{ margin: 'auto 0', paddingTop: 10, paddingBottom: 10 }}>
                <p style={{
                  fontSize: isMobile ? 13 : 15,
                  fontWeight: 600,
                  color: '#111827', // dark text instead of white
                  lineHeight: 1.45,
                  maxWidth: '100%',
                  fontFamily: "'Inter', system-ui, sans-serif", // Changed to Inter for body readability
                  margin: 0,
                }}>
                  {card.complaint}
                </p>
              </div>

              {/* BOTTOM ROW */}
              <div style={{
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}>
                {/* Risk badge */}
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: card.badgeText,
                  background: card.badgeColor,
                  border: `1px solid ${card.badgeBorder}`,
                  borderRadius: 6,
                  padding: '3px 8px',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}>
                  {card.badge}
                </span>

                {/* Confidence score */}
                <span style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'rgba(0,0,0,0.4)',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}>
                  {card.confidence}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
