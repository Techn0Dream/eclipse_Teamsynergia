/**
 * Hero — Roco.bank layout style
 * ─────────────────────────────────────────────────────────────────────────────
 * • bg-[#0F1117] full-dark background
 * • Left column: absolute, z-index 10 — text + CTAs
 * • Card fan: absolute right:-80px top:-60px — intentionally bleeds above
 *   navbar and off right viewport edge
 * • 3D mouse parallax via useMotionValue + useSpring on the fan group
 * • Mobile (<768px): centered mini-fan above text, no parallax
 */
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import CardFanAnimation from './CardFanAnimation'

/* Nav arrow — small directional chevron */
function NavArrow({ direction }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      style={{ display: 'block', color: 'rgba(148,163,184,0.5)' }}
    >
      <path
        d={direction === 'up'
          ? 'M4.5 11.25 9 6.75l4.5 4.5'
          : 'M4.5 6.75 9 11.25l4.5-4.5'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Hero() {
  const heroRef  = useRef(null)
  const [isMobile, setIsMobile] = useState(false)

  /* detect mobile */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const cb = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', cb)
    return () => mq.removeEventListener('change', cb)
  }, [])

  /* ── 3D parallax motion values ─────────────────────────────── */
  const mouseX  = useMotionValue(0)
  const mouseY  = useMotionValue(0)

  const rotateX = useSpring(
    useTransform(mouseY, [-300, 300], [8, -8]),
    { stiffness: 80, damping: 25 }
  )
  const rotateY = useSpring(
    useTransform(mouseX, [-600, 600], [-10, 10]),
    { stiffness: 80, damping: 25 }
  )

  const handleMouseMove = (e) => {
    if (isMobile) return
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top  - rect.height / 2)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <section
      ref={heroRef}
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        minHeight: 'min(100vh, 900px)',
        background: 'var(--bg)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
      }}
    >
      <div style={{
        maxWidth: 1100,
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: '4rem',
        flexDirection: isMobile ? 'column' : 'row',
        position: 'relative',
      }}>
        {/* ── Left column: text + CTAs ─────────────────────── */}
        <div
          style={{
            flex: 1,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: isMobile ? 'center' : 'left',
            paddingTop: isMobile ? 80 : 0,
          }}
        >
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#3b82f6',
              marginBottom: 16,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            Resolve.ai Platform
          </motion.p>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: 'clamp(38px, 5vw, 64px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: 'var(--text)',
              margin: '0 0 20px',
            }}
          >
            Resolve.ai
            <br />
            <span
              style={{
                fontWeight: 500,
                color: 'var(--muted)',
              }}
            >
              Intelligence Platform
            </span>
          </motion.h1>

          {/* Sub-text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: 'var(--muted)',
              maxWidth: 440,
              fontFamily: "'Inter', system-ui, sans-serif",
              margin: isMobile ? '0 auto' : 0,
            }}
          >
            AI-guided resolution for modern banking teams. Triage, escalate,
            and resolve customer complaints faster than ever before.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            style={{
              display: 'flex',
              gap: 14,
              marginTop: 32,
              justifyContent: isMobile ? 'center' : 'flex-start',
              flexWrap: 'wrap'
            }}
          >
            <motion.a
              id="hero-cta-demo"
              href="#dashboard"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 28px',
                borderRadius: 8, // Soft rounded corners instead of pills
                background: 'var(--btn-primary-bg)',
                color: 'var(--btn-primary-text)',
                fontFamily: "'Inter', system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
                boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--btn-primary-hover)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--btn-primary-bg)' }}
            >
              See Demo
            </motion.a>

            <motion.a
              id="hero-cta-learn"
              href="#features"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '12px 28px',
                borderRadius: 8, // Soft rounded corners
                background: 'transparent',
                color: 'var(--btn-secondary-text)',
                border: '1px solid var(--btn-secondary-border)',
                fontFamily: "'Inter', system-ui, sans-serif",
                fontWeight: 500,
                fontSize: 15,
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--btn-secondary-hover-bg)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              Learn More
            </motion.a>
          </motion.div>
        </div>

        {/* ── Card fan graphic ───────────────────── */}
        <div style={{
          flex: 1,
          height: isMobile ? 380 : 540,
          width: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <CardFanAnimation
              rotateX={rotateX}
              rotateY={rotateY}
              isMobile={isMobile}
            />
          </div>
        </div>
      </div>
    </section>
  )
}


