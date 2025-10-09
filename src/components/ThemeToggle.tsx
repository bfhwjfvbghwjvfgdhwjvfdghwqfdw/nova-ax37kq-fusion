import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleTheme } from '@/store/uiSlice'

export function ThemeToggle() {
  const theme = useAppSelector((s) => s.ui.theme)
  const dispatch = useAppDispatch()
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    return () => {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [theme])

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Create ripple element
    const rippleId = Date.now()
    setRipples(prev => [...prev, { id: rippleId, x, y }])
    
    // Trigger theme ripple effect on document root
    const rippleEl = document.createElement('div')
    rippleEl.className = 'theme-ripple'
    rippleEl.style.left = `${e.clientX}px`
    rippleEl.style.top = `${e.clientY}px`
    document.body.appendChild(rippleEl)
    
    // Toggle theme
    dispatch(toggleTheme())
    
    // Clean up ripple after animation
    setTimeout(() => {
      rippleEl.remove()
      setRipples(prev => prev.filter(r => r.id !== rippleId))
    }, 800)
  }

  return (
    <button
      onClick={handleToggle}
      className="relative h-8 px-4 rounded-lg bg-white/5 hover:bg-white/10 inline-flex items-center gap-2 transition-all active:scale-95 overflow-hidden"
      title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
    >
      <div className="relative z-10 flex items-center gap-2">
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        <span className="text-sm font-medium">{theme === 'dark' ? 'Light' : 'Dark'}</span>
      </div>
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/20 animate-ripple pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: '20px',
            height: '20px',
          }}
        />
      ))}
    </button>
  )
}
