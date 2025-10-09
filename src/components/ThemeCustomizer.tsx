import { useState } from 'react'
import { Download, Upload, RotateCcw, Palette, Check } from 'lucide-react'

interface ThemeColors {
  backgroundStart: string
  backgroundEnd: string
  accentColor: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  panelBackground: string
  panelBackgroundOpacity: number
  borderColor: string
  borderOpacity: number
}

interface ThemeCustomizerProps {
  currentColors: ThemeColors
  onApply: (colors: ThemeColors) => void
  onReset: () => void
}

const DEFAULT_DARK_THEME: ThemeColors = {
  backgroundStart: '#0f0f16',
  backgroundEnd: '#09090c',
  accentColor: '#3b82f6',
  textPrimary: '#ffffff',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
  panelBackground: '#111119',
  panelBackgroundOpacity: 0.45,
  borderColor: '#ffffff',
  borderOpacity: 0.08,
}

const DEFAULT_LIGHT_THEME: ThemeColors = {
  backgroundStart: '#ffffff',
  backgroundEnd: '#f5f7ff',
  accentColor: '#6366f1',
  textPrimary: '#1f2937',
  textSecondary: '#4b5563',
  textMuted: '#6b7280',
  panelBackground: '#ffffff',
  panelBackgroundOpacity: 0.95,
  borderColor: '#6366f1',
  borderOpacity: 0.2,
}

const PRESET_THEMES = [
  { name: 'Ocean Blue', colors: { ...DEFAULT_DARK_THEME, accentColor: '#0ea5e9', backgroundStart: '#0a1929', backgroundEnd: '#051220' } },
  { name: 'Purple Haze', colors: { ...DEFAULT_DARK_THEME, accentColor: '#a855f7', backgroundStart: '#1a0a29', backgroundEnd: '#0d0515' } },
  { name: 'Forest Green', colors: { ...DEFAULT_DARK_THEME, accentColor: '#10b981', backgroundStart: '#0a1f0a', backgroundEnd: '#051205' } },
  { name: 'Sunset Orange', colors: { ...DEFAULT_DARK_THEME, accentColor: '#f97316', backgroundStart: '#1f0a0a', backgroundEnd: '#120505' } },
  { name: 'Rose Pink', colors: { ...DEFAULT_DARK_THEME, accentColor: '#ec4899', backgroundStart: '#1f0a1a', backgroundEnd: '#120510' } },
  { name: 'Cyan Glow', colors: { ...DEFAULT_DARK_THEME, accentColor: '#06b6d4', backgroundStart: '#0a1f1f', backgroundEnd: '#051212' } },
]

export function ThemeCustomizer({ currentColors, onApply, onReset }: ThemeCustomizerProps) {
  const [colors, setColors] = useState<ThemeColors>(currentColors)
  const [hasChanges, setHasChanges] = useState(false)

  const updateColor = (key: keyof ThemeColors, value: string | number) => {
    setColors(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const applyTheme = () => {
    onApply(colors)
    setHasChanges(false)
  }

  const resetToDefault = () => {
    setColors(DEFAULT_DARK_THEME)
    onReset()
    setHasChanges(false)
  }

  const loadPreset = (preset: typeof PRESET_THEMES[0]) => {
    setColors(preset.colors)
    setHasChanges(true)
  }

  const exportTheme = () => {
    const json = JSON.stringify(colors, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'xvser-theme.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importTheme = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target?.result as string)
            setColors(imported)
            setHasChanges(true)
          } catch (err) {
            alert('Invalid theme file')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div 
        className="rounded-xl p-6 border-2 transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${colors.backgroundStart} 0%, ${colors.backgroundEnd} 100%)`,
          borderColor: `rgba(${parseInt(colors.borderColor.slice(1, 3), 16)}, ${parseInt(colors.borderColor.slice(3, 5), 16)}, ${parseInt(colors.borderColor.slice(5, 7), 16)}, ${colors.borderOpacity})`
        }}
      >
        <div 
          className="rounded-lg p-4 mb-4"
          style={{
            background: `rgba(${parseInt(colors.panelBackground.slice(1, 3), 16)}, ${parseInt(colors.panelBackground.slice(3, 5), 16)}, ${parseInt(colors.panelBackground.slice(5, 7), 16)}, ${colors.panelBackgroundOpacity})`,
            backdropFilter: 'blur(8px)',
          }}
        >
          <h3 style={{ color: colors.textPrimary }} className="font-semibold mb-2">Preview Panel</h3>
          <p style={{ color: colors.textSecondary }} className="text-sm mb-1">This is how your theme will look</p>
          <p style={{ color: colors.textMuted }} className="text-xs">Secondary text appears like this</p>
          <button 
            className="mt-3 px-4 py-2 rounded-lg font-medium text-white transition-transform hover:scale-105"
            style={{ backgroundColor: colors.accentColor }}
          >
            Accent Button
          </button>
        </div>
      </div>

      {/* Preset Themes */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette size={16} className="text-white/60" />
          <h3 className="text-sm font-semibold text-white/80">Preset Themes</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_THEMES.map((preset) => (
            <button
              key={preset.name}
              onClick={() => loadPreset(preset)}
              className="p-3 rounded-lg glass-panel hover:bg-white/10 transition-all text-left"
            >
              <div 
                className="w-full h-16 rounded-lg mb-2"
                style={{
                  background: `linear-gradient(135deg, ${preset.colors.backgroundStart} 0%, ${preset.colors.backgroundEnd} 100%)`
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: preset.colors.accentColor }}
                  ></div>
                </div>
              </div>
              <div className="text-xs font-medium text-white/80">{preset.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Color Pickers */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white/80">Custom Colors</h3>
        
        <div className="space-y-3">
          <ColorPicker
            label="Background Start"
            value={colors.backgroundStart}
            onChange={(v) => updateColor('backgroundStart', v)}
          />
          <ColorPicker
            label="Background End"
            value={colors.backgroundEnd}
            onChange={(v) => updateColor('backgroundEnd', v)}
          />
          <ColorPicker
            label="Accent Color"
            value={colors.accentColor}
            onChange={(v) => updateColor('accentColor', v)}
          />
          <ColorPicker
            label="Text Primary"
            value={colors.textPrimary}
            onChange={(v) => updateColor('textPrimary', v)}
          />
          <ColorPicker
            label="Text Secondary"
            value={colors.textSecondary}
            onChange={(v) => updateColor('textSecondary', v)}
          />
          <ColorPicker
            label="Text Muted"
            value={colors.textMuted}
            onChange={(v) => updateColor('textMuted', v)}
          />
          <ColorPicker
            label="Panel Background"
            value={colors.panelBackground}
            onChange={(v) => updateColor('panelBackground', v)}
          />
          
          <div>
            <label className="text-xs text-white/60 mb-1 block">Panel Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={colors.panelBackgroundOpacity}
              onChange={(e) => updateColor('panelBackgroundOpacity', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-white/40 mt-1">{Math.round(colors.panelBackgroundOpacity * 100)}%</div>
          </div>

          <ColorPicker
            label="Border Color"
            value={colors.borderColor}
            onChange={(v) => updateColor('borderColor', v)}
          />
          
          <div>
            <label className="text-xs text-white/60 mb-1 block">Border Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={colors.borderOpacity}
              onChange={(e) => updateColor('borderOpacity', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-white/40 mt-1">{Math.round(colors.borderOpacity * 100)}%</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-white/10">
        <button
          onClick={applyTheme}
          disabled={!hasChanges}
          className="flex-1 px-4 py-2 rounded-lg bg-brand hover:bg-brand/80 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition-all"
        >
          <Check size={16} />
          Apply Theme
        </button>
        <button
          onClick={exportTheme}
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 font-medium flex items-center gap-2 transition-all"
        >
          <Download size={16} />
          Export
        </button>
        <button
          onClick={importTheme}
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 font-medium flex items-center gap-2 transition-all"
        >
          <Upload size={16} />
          Import
        </button>
        <button
          onClick={resetToDefault}
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 font-medium flex items-center gap-2 transition-all"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </div>
  )
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-white/60 mb-1 block">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded-lg cursor-pointer border border-white/20"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg outline-none focus:ring-1 focus:ring-brand/50 focus:border-brand/50 text-sm font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  )
}
