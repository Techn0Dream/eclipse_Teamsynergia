import { useEffect, useState } from 'react'

const cards = [
  { label: 'High priority' },
  { label: 'Fraud detected' },
  { label: 'ETA 12 min' },
  { label: 'Escalated' },
  { label: 'Under review' },
]

export default function FloatingCards() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length)
    }, 3200)

    return () => window.clearInterval(interval)
  }, [])

  const prevIndex = (activeIndex - 1 + cards.length) % cards.length
  const nextIndex = (activeIndex + 1) % cards.length

  return (
    <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-end pr-4" aria-hidden="true">
      <div className="relative h-55 w-87.5 overflow-hidden">
        {cards.map((card, index) => {
          let transform = 'translate(-50%, -50%) scale(0.86)'
          let opacity = 0
          let zIndex = 5

          if (index === activeIndex) {
            transform = 'translate(-50%, -50%) translateX(0px) scale(1)'
            opacity = 1
            zIndex = 30
          } else if (index === prevIndex) {
            transform = 'translate(-50%, -50%) translateX(-108px) scale(0.92)'
            opacity = 0.55
            zIndex = 20
          } else if (index === nextIndex) {
            transform = 'translate(-50%, -50%) translateX(108px) scale(0.92)'
            opacity = 0.55
            zIndex = 20
          }

          return (
            <div
              key={card.label}
              className="absolute left-1/2 top-1/2 flex h-20 w-56 items-center rounded-lg border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-800 shadow-sm backdrop-blur-sm transition-all duration-700 ease-in-out dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              style={{ transform, opacity, zIndex }}
            >
              {card.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
