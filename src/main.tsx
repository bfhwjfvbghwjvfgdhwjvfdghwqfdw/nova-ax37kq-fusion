import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { Provider } from 'react-redux'
import { store } from './store/store'
import '@fontsource-variable/inter'

// Prevent animations during page load
document.documentElement.classList.add('preload')
window.addEventListener('load', () => {
  document.documentElement.classList.remove('preload')
})

// Load and apply settings before paint to prevent flash
const loadedSettings = (() => {
  try {
    const saved = localStorage.getItem('xvser-settings')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
})()

// Load custom theme colors if they exist
const customTheme = (() => {
  try {
    const saved = localStorage.getItem('xvser-custom-theme')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
})()

if (loadedSettings) {
  // Apply theme
  document.documentElement.setAttribute('data-theme', loadedSettings.theme || 'dark')
  
  // Apply accent color (prioritize custom theme over settings)
  const accentColor = customTheme?.accentColor || loadedSettings.accentColor
  if (accentColor) {
    document.documentElement.style.setProperty('--accent-color', accentColor)
    console.log('Startup: Applied accent color', accentColor)
  }
  
  // Apply full custom theme if exists
  if (customTheme) {
    console.log('Startup: Applying custom theme', customTheme)
    
    // Apply background gradient
    if (customTheme.backgroundStart && customTheme.backgroundEnd) {
      document.body.style.background = `linear-gradient(135deg, ${customTheme.backgroundStart} 0%, ${customTheme.backgroundEnd} 100%)`
    }
    
    // Apply text colors
    if (customTheme.textPrimary) {
      document.documentElement.style.setProperty('--text-primary', customTheme.textPrimary)
    }
    if (customTheme.textSecondary) {
      document.documentElement.style.setProperty('--text-secondary', customTheme.textSecondary)
    }
    if (customTheme.textMuted) {
      document.documentElement.style.setProperty('--text-muted', customTheme.textMuted)
    }
    
    // Apply panel styles
    if (customTheme.panelBackground) {
      document.documentElement.style.setProperty('--panel-bg', customTheme.panelBackground)
    }
    if (customTheme.panelBackgroundOpacity) {
      document.documentElement.style.setProperty('--panel-opacity', customTheme.panelBackgroundOpacity.toString())
    }
    
    console.log('Startup: Custom theme fully applied')
  }
  
  // Apply font size
  if (loadedSettings.fontSize) {
    const fontSizeMap: Record<string, string> = { small: '12px', medium: '14px', large: '16px' }
    document.documentElement.style.setProperty('--base-font-size', fontSizeMap[loadedSettings.fontSize] || '14px')
  }
  
  // Apply animations
  if (loadedSettings.animationsEnabled === false) {
    document.documentElement.style.setProperty('--animation-duration', '0s')
  }
} else {
  // Fallback to dark theme
  document.documentElement.setAttribute('data-theme', 'dark')
}

const rootEl = document.getElementById('root')!
createRoot(rootEl).render(
  <Provider store={store}>
    <App />
  </Provider>,
)

// Gracefully hide splash after minimum 3 seconds
const startTime = Date.now()
const MIN_SPLASH_DURATION = 3000 // 3 seconds

const hideSplash = () => {
  const splash = document.getElementById('xvser-splash')
  if (splash) {
    const elapsed = Date.now() - startTime
    const remainingTime = Math.max(0, MIN_SPLASH_DURATION - elapsed)
    
    setTimeout(() => {
      splash.classList.add('hide')
      setTimeout(() => splash.remove(), 650)
    }, remainingTime)
  }
}

if (document.readyState === 'complete') {
  requestAnimationFrame(hideSplash)
} else {
  window.addEventListener('load', () => requestAnimationFrame(hideSplash))
}
