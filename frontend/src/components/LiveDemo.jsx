import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  Bot,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  Sparkles,
  UserRound,
  Zap,
} from 'lucide-react'
import { processComplaint } from './api'

/* ─── Static case feed ──────────────────────────────────────────────────── */
const complaintFeed = [
  {
    id: 'CMP-9812',
    customer: 'Aarav Mehta',
    issue: 'Card blocked abroad without any prior notice',
    channel: 'Mobile App',
    priority: 'CRITICAL',
    status: 'Escalated',
    eta: '12 min',
  },
  {
    id: 'CMP-7741',
    customer: 'Priya Sharma',
    issue: 'Duplicate debit detected on my savings account',
    channel: 'Email',
    priority: 'HIGH',
    status: 'Investigating',
    eta: '18 min',
  },
  {
    id: 'CMP-6619',
    customer: 'Rohit Verma',
    issue: 'UPI transfer pending 3 days after debit',
    channel: 'Web Portal',
    priority: 'MEDIUM',
    status: 'Queued',
    eta: '1 hr',
  },
]

/* ─── Priority config ───────────────────────────────────────────────────── */
const PRIORITY_CONFIG = {
  CRITICAL: { label: 'CRITICAL', dot: '#EF4444', badge: { bg: '#FEE2E2', border: '#FCA5A5', text: '#EF4444' } },
  HIGH:     { label: 'HIGH',     dot: '#F97316', badge: { bg: '#FFEDD5', border: '#FDBA74', text: '#EA580C' } },
  MEDIUM:   { label: 'MEDIUM',   dot: '#EAB308', badge: { bg: '#FEF3C7', border: '#FDE68A', text: '#D97706' } },
  LOW:      { label: 'LOW',      dot: '#22C55E', badge: { bg: '#D1FAE5', border: '#6EE7B7', text: '#059669' } },
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority?.toUpperCase()] || PRIORITY_CONFIG.MEDIUM
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 6,
      background: cfg.badge.bg,
      border: `1px solid ${cfg.badge.border}`,
      color: cfg.badge.text,
      fontFamily: "'Inter', system-ui, sans-serif",
      fontWeight: 700, fontSize: 10,
      letterSpacing: '0.05em', textTransform: 'uppercase',
    }}>
      {cfg.label}
    </span>
  )
}

/* ─── Result card sub-component ─────────────────────────────────────────── */
function ResultCard({ icon: Icon, label, children, accent }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '16px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {Icon && <Icon size={14} color={accent || 'var(--label)'} />}
        <span style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 11, fontWeight: 600,
          color: 'var(--muted)',
        }}>{label}</span>
      </div>
      {children}
    </div>
  )
}

/* ─── Skeleton placeholder ──────────────────────────────────────────────── */
function SkeletonLine({ width = '100%', height = 14, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: 4,
      background: 'var(--border)',
      animation: 'pulse 1.6s ease-in-out infinite',
      ...style,
    }} />
  )
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function LiveDemo() {
  const [selectedCaseId, setSelectedCaseId] = useState(complaintFeed[0].id)
  const [complaint, setComplaint] = useState(complaintFeed[0].issue)
  const [customerType, setCustomerType] = useState('retail')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const handleAnalyzeComplaint = async (event) => {
    event.preventDefault()
    if (!complaint.trim()) {
      setErrorMessage('Please enter a complaint before analyzing.')
      return
    }
    setLoading(true)
    setErrorMessage('')
    setResult(null)
    try {
      const response = await processComplaint(complaint.trim(), customerType)
      setResult(response)
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to process complaint right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCaseSelect = (item) => {
    setSelectedCaseId(item.id)
    setComplaint(item.issue)
    setErrorMessage('')
    setResult(null)
  }

  return (
    <section
      id="dashboard"
      style={{
        background: 'var(--bg-soft)',
        padding: '100px 0',
        position: 'relative',
        borderTop: '1px solid var(--border)',
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1;   }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Section header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 100,
            background: 'var(--surface)', border: '1px solid var(--border)',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
            textTransform: 'uppercase', color: 'var(--text)',
            marginBottom: 20,
          }}>
            <Sparkles size={12} color="var(--primary)" />
            Live Dashboard
          </span>
          <h2 style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontWeight: 700, fontSize: 'clamp(28px, 4vw, 40px)',
            color: 'var(--text)', margin: '0 0 16px', letterSpacing: '-0.02em',
          }}>
            Analyze complaints in real-time
          </h2>
          <p style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 16, color: 'var(--muted)', margin: 0,
          }}>
            Experience how Resolve.ai processes complex text natively.
          </p>
        </motion.div>

        {/* ── Main grid ──────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.6fr',
          gap: 24,
          alignItems: 'start',
        }}
          className="demo-grid"
        >

          {/* ── LEFT: Case Console ───────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '24px',
                borderBottom: '1px solid var(--border)',
              }}>
                <h3 style={{
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontWeight: 600, fontSize: 16, color: 'var(--text)', margin: '0 0 4px',
                }}>Case Console</h3>
                <p style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 13, color: 'var(--muted)', margin: 0,
                }}>Select a recent ticket to test.</p>
              </div>

              <div style={{ padding: '16px' }}>
                {complaintFeed.map((item, index) => {
                  const isSelected = selectedCaseId === item.id
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      viewport={{ once: true }}
                      onClick={() => handleCaseSelect(item)}
                      style={{
                        padding: '16px',
                        borderRadius: 12,
                        marginBottom: 12,
                        cursor: 'pointer',
                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        background: isSelected ? 'var(--surface-muted)' : 'var(--surface)',
                        boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.02)' : 'none',
                        transition: 'all 0.2s',
                      }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                        <div>
                          <span style={{
                            fontFamily: "'Inter', system-ui, sans-serif",
                            fontSize: 11, fontWeight: 500, color: 'var(--muted)',
                          }}>{item.id}</span>
                          <p style={{
                            fontFamily: "'Inter', system-ui, sans-serif",
                            fontSize: 14, fontWeight: 500, color: 'var(--text)',
                            margin: '4px 0 0', lineHeight: 1.4,
                          }}>{item.issue}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <PriorityBadge priority={item.priority} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <UserRound size={12} color="var(--label)" />
                          <span style={{
                            fontFamily: "'Inter', system-ui, sans-serif",
                            fontSize: 12, color: 'var(--muted)',
                          }}>{item.customer}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT: AI Engine + Results ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Input panel */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--bg-soft)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot size={18} color="var(--text)" />
                </div>
                <div>
                  <h3 style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontWeight: 600, fontSize: 16, color: 'var(--text)', margin: 0,
                  }}>Resolve.ai Engine</h3>
                </div>
              </div>

              <form onSubmit={handleAnalyzeComplaint}>
                <div style={{ marginBottom: 20 }}>
                  <label htmlFor="complaint-input" style={{
                    display: 'block',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 12, fontWeight: 500, color: 'var(--text)',
                    marginBottom: 8,
                  }}>
                    Customer Complaint
                  </label>
                  <textarea
                    id="complaint-input"
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    rows={4}
                    placeholder="e.g. Money deducted but transaction failed..."
                    disabled={loading}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--input-bg)',
                      padding: '12px 14px',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 14, color: 'var(--text)',
                      outline: 'none', resize: 'vertical',
                      transition: 'border-color 0.2s',
                      opacity: loading ? 0.7 : 1,
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
                  />
                </div>

                <div style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="customer-type" style={{
                      display: 'block',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 12, fontWeight: 500, color: 'var(--text)',
                      marginBottom: 8,
                    }}>
                      Customer Segment
                    </label>
                    <select
                      id="customer-type"
                      value={customerType}
                      onChange={(e) => setCustomerType(e.target.value)}
                      disabled={loading}
                      style={{
                        width: '100%', borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--input-bg)',
                        padding: '12px 14px',
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontSize: 14, color: 'var(--text)', outline: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      <option value="retail">Retail Customer</option>
                      <option value="premium">Premium Customer</option>
                      <option value="business">Business Customer</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    borderRadius: 8,
                    background: loading ? 'var(--muted)' : 'var(--btn-primary-bg)',
                    border: 'none',
                    padding: '14px 24px',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 600, fontSize: 15, color: 'var(--btn-primary-text)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: loading ? 'none' : '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--btn-primary-hover)' }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'var(--btn-primary-bg)' }}
                >
                  {loading ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Determine Action
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* ── Results panel ──────────────────────────────────────── */}
            <AnimatePresence mode="wait">

              {/* Error state */}
              {!loading && errorMessage && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 12,
                    padding: '20px',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                  }}
                >
                  <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{
                      fontFamily: "'Space Grotesk', system-ui, sans-serif",
                      fontWeight: 600, fontSize: 14, color: '#991B1B', margin: '0 0 4px',
                    }}>Processing Error</p>
                    <p style={{
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 13, color: '#B91C1C', margin: 0, lineHeight: 1.5,
                    }}>{errorMessage}</p>
                  </div>
                </motion.div>
              )}

              {/* Loading skeleton */}
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <span style={{
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 14, fontWeight: 500, color: 'var(--text)',
                    }}>Resolve.ai is analyzing…</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        padding: '16px', borderRadius: 12,
                        border: '1px solid var(--border)',
                      }}>
                        <SkeletonLine width="40%" height={12} style={{ marginBottom: 12 }} />
                        <SkeletonLine width="80%" height={16} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Result cards */}
              {!loading && !errorMessage && result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Result header */}
                  <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={16} color="#10B981" />
                      <span style={{
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontWeight: 600, fontSize: 14, color: 'var(--text)',
                      }}>Analysis Complete</span>
                    </div>
                    <PriorityBadge priority={result.priority} />
                  </div>

                  {/* Cards grid */}
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Row 1 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <ResultCard icon={Activity} label="Category" accent="#2563EB">
                        <p style={{
                          fontFamily: "'Space Grotesk', system-ui, sans-serif",
                          fontWeight: 600, fontSize: 16, color: 'var(--text)',
                          margin: 0, textTransform: 'capitalize',
                        }}>
                          {result.category}
                        </p>
                      </ResultCard>

                      <ResultCard icon={ShieldAlert} label="Priority" accent="#EA580C">
                        <PriorityBadge priority={result.priority} />
                      </ResultCard>
                    </div>

                    {/* Row 2 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <ResultCard icon={UserRound} label="Routing Action" accent="#059669">
                        <span style={{
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontWeight: 600, fontSize: 14,
                          color: result.action === 'human_support' ? '#2563EB' : '#10B981',
                        }}>
                          {result.action === 'human_support' ? 'Human Agent' : 'Auto Resolve'}
                        </span>
                      </ResultCard>

                      <ResultCard icon={Clock3} label="Est. Resolution" accent="#6366F1">
                        <p style={{
                          fontFamily: "'Space Grotesk', system-ui, sans-serif",
                          fontWeight: 600, fontSize: 16, color: 'var(--text)', margin: 0,
                        }}>
                          {result.estimated_resolution_time}
                        </p>
                      </ResultCard>
                    </div>

                    {/* Full width resolution */}
                    <ResultCard icon={CheckCircle2} label="Recommended Steps" accent="#10B981">
                      <p style={{
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontSize: 14, color: 'var(--text)', margin: 0,
                        lineHeight: 1.6,
                      }}>
                        {result.resolution}
                      </p>
                    </ResultCard>

                    {/* Confidence meter */}
                    <div style={{
                      background: 'var(--bg-soft)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '16px 20px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontSize: 12, fontWeight: 500,
                          color: 'var(--muted)',
                        }}>AI Confidence Score</span>
                        <span style={{
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontWeight: 700, fontSize: 15, color: 'var(--text)',
                        }}>
                          {Math.round((result.confidence_score || 0) * 100)}%
                        </span>
                      </div>
                      <div style={{ height: 6, borderRadius: 100, background: 'var(--border)', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(result.confidence_score || 0) * 100}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          style={{
                            height: '100%', borderRadius: 100,
                            background: result.confidence_score >= 0.75
                              ? '#10B981'
                              : result.confidence_score >= 0.5
                              ? '#F59E0B'
                              : '#EF4444',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Empty state — awaiting input */}
              {!loading && !errorMessage && !result && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    border: '1px dashed var(--border)',
                    borderRadius: 16,
                    padding: '48px 24px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <Bot size={20} color="var(--label)" />
                  </div>
                  <p style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontWeight: 600, fontSize: 16, color: 'var(--text)', margin: '0 0 6px',
                  }}>Ready to Analyze</p>
                  <p style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 14, color: 'var(--muted)', margin: 0,
                  }}>Paste a customer interaction or select a test case.</p>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </div>

        {/* ── Responsive grid override ────────────────────────────────── */}
        <style>{`
          @media (max-width: 900px) {
            .demo-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </section>
  )
}
