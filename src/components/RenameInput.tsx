import { useState, useEffect, useRef } from 'react'
import { Check, X } from 'lucide-react'

interface RenameInputProps {
  initialValue: string
  onConfirm: (newName: string) => void
  onCancel: () => void
  position: { x: number; y: number }
}

export function RenameInput({ initialValue, onConfirm, onCancel, position }: RenameInputProps) {
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Use a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        // Select filename without extension
        const dotIndex = initialValue.lastIndexOf('.')
        if (dotIndex > 0) {
          inputRef.current.setSelectionRange(0, dotIndex)
        } else {
          inputRef.current.select()
        }
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [initialValue])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent event from bubbling to parent
    e.stopPropagation()
    
    if (e.key === 'Enter') {
      e.preventDefault()
      if (value.trim() && value !== initialValue) {
        onConfirm(value.trim())
      } else {
        onCancel()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    setValue(e.target.value)
  }

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (value.trim() && value !== initialValue) {
      onConfirm(value.trim())
    } else {
      onCancel()
    }
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCancel()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCancel()
  }

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[10000] bg-black/20"
        onClick={handleBackdropClick}
        onMouseDown={(e) => e.stopPropagation()}
      />
      
      {/* Rename Input */}
      <div
        className="fixed z-[10001] glass-panel rounded-lg p-4 shadow-2xl"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          minWidth: '350px',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          background: 'rgba(30, 30, 30, 0.98)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
        onClick={handleDialogClick}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="text-sm text-white/70 mb-3 font-medium">Rename</div>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            placeholder="Enter new name..."
            autoFocus
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
            style={{
              backdropFilter: 'blur(8px)'
            }}
          />
          <button
            onClick={handleConfirm}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center justify-center"
            title="Confirm (Enter)"
          >
            <Check size={18} />
          </button>
          <button
            onClick={handleCancel}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center"
            title="Cancel (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </>
  )
}
