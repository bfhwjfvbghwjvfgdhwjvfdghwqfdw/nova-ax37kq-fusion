import { useState, useEffect } from 'react'
import { Minus, Square, X, Maximize2 } from 'lucide-react'
import { UpdateNotification } from './UpdateNotification'

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    // Listen for maximize/unmaximize events from main process
    const handleMaximize = () => {
      setIsMaximized(true)
      document.body.classList.add('is-maximized')
    }
    const handleUnmaximize = () => {
      setIsMaximized(false)
      document.body.classList.remove('is-maximized')
    }
    
    window.xvser.onMaximize?.(handleMaximize)
    window.xvser.onUnmaximize?.(handleUnmaximize)

    // Check initial state
    window.xvser.isMaximized?.().then((maximized) => {
      setIsMaximized(maximized)
      if (maximized) {
        document.body.classList.add('is-maximized')
      } else {
        document.body.classList.remove('is-maximized')
      }
    })
  }, [])

  const handleMinimize = () => {
    window.xvser.minimize?.()
  }

  const handleMaximize = () => {
    if (isMaximized) {
      window.xvser.unmaximize?.()
    } else {
      window.xvser.maximize?.()
    }
  }

  const handleClose = () => {
    window.xvser.close?.()
  }

  return (
    <div 
      className="titlebar flex items-center justify-between h-8 px-2 shrink-0 select-none"
      style={{
        WebkitAppRegion: 'drag',
      } as any}
    >
      {/* Left side - App info */}
      <div className="flex items-center gap-2 pl-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">X</span>
          </div>
          <span className="text-xs font-medium text-white/70">Xvser</span>
        </div>
      </div>

      {/* Right side - Update notification and Window controls */}
      <div 
        className="flex items-center"
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        <UpdateNotification />
        <button
          onClick={handleMinimize}
          className="titlebar-button w-10 h-8 flex items-center justify-center hover:bg-white/10 transition-colors"
          title="Minimize"
        >
          <Minus size={14} className="text-white/70" />
        </button>
        <button
          onClick={handleMaximize}
          className="titlebar-button w-10 h-8 flex items-center justify-center hover:bg-white/10 transition-colors"
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            <Square size={12} className="text-white/70" />
          ) : (
            <Maximize2 size={12} className="text-white/70" />
          )}
        </button>
        <button
          onClick={handleClose}
          className="titlebar-button w-10 h-8 flex items-center justify-center hover:bg-red-500/90 transition-colors group"
          title="Close"
        >
          <X size={14} className="text-white/70 group-hover:text-white" />
        </button>
      </div>
    </div>
  )
}
