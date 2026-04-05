import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import StatsRow from './components/StatsRow'
import LiveDemo from './components/LiveDemo'
import Footer from './components/Footer'

function App() {
  const [theme, setTheme] = useState('light')
  const [themeLoaded, setThemeLoaded] = useState(false)

  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem('complaint-ai-theme')
    const initialTheme = savedTheme === 'dark' ? 'dark' : 'light'
    const root = document.documentElement

    root.setAttribute('data-theme', initialTheme)
    root.classList.toggle('dark', initialTheme === 'dark')
    setTheme(initialTheme)
    setThemeLoaded(true)
  }, [])

  useEffect(() => {
    if (!themeLoaded) return

    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.classList.toggle('dark', theme === 'dark')

    localStorage.setItem('complaint-ai-theme', theme)
  }, [theme, themeLoaded])

  const themeLabel = useMemo(
    () => (theme === 'dark' ? 'Classic Dark' : 'Classic Light'),
    [theme]
  )

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className="min-h-screen bg-(--bg) text-(--text) transition-colors duration-300">
      <Navbar theme={theme} themeLabel={themeLabel} toggleTheme={toggleTheme} />
      <main>
        <Hero />
        <LiveDemo theme={theme} />
        <StatsRow />
      </main>
      <Footer />
    </div>
  )
}

export default App