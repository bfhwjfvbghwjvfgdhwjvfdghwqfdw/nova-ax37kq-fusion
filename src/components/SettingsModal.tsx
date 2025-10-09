import { X, Monitor, Folder, Keyboard, Zap, Eye, Palette, HardDrive, FileText, Moon, Sun, RefreshCw, Check, Sparkles, CheckSquare } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ThemeCustomizer } from './ThemeCustomizer'

export type AppSettings = {
  // Appearance
  theme: 'dark' | 'light' | 'auto'
  accentColor: string
  fontSize: 'small' | 'medium' | 'large'
  compactMode: boolean
  showPreview: boolean
  animationsEnabled: boolean
  glassEffect: boolean
  
  // File Display
  showHiddenFiles: boolean
  showFileExtensions: boolean
  showThumbnails: boolean
  sortBy: 'name' | 'date' | 'size' | 'type'
  sortOrder: 'asc' | 'desc'
  groupFolders: boolean
  dateFormat: 'short' | 'long' | 'relative'
  fileSizeFormat: 'decimal' | 'binary'
  
  // Navigation
  doubleClickToOpen: boolean
  singleClickToOpen: boolean
  openFoldersInNewTab: boolean
  rememberLastLocation: boolean
  showBreadcrumbs: boolean
  showAddressBar: boolean
  
  // Selection
  enableMultiSelect: boolean
  enableRangeSelect: boolean
  enableDragSelect: boolean
  selectOnRightClick: boolean
  showSelectionCheckboxes: boolean
  selectFoldersOnClick: boolean
  
  // Performance
  maxCacheSize: number
  thumbnailQuality: 'low' | 'medium' | 'high'
  enableVideoThumbnails: boolean
  lazyLoadFolders: boolean
  enableFileWatching: boolean
  
  // Context Menu
  showOpenWith: boolean
  showCopyPath: boolean
  showProperties: boolean
  showArchiveOptions: boolean
  showHashOption: boolean
  showShareOption: boolean
  showTagging: boolean
  showFavorites: boolean
  showTerminalOption: boolean
  customMenuItems: Array<{ name: string; command: string }>
  
  // Advanced
  enableDevTools: boolean
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug'
  clearCacheOnExit: boolean
  confirmDelete: boolean
  confirmOverwrite: boolean
}

export const defaultSettings: AppSettings = {
  theme: 'dark',
  accentColor: '#3b82f6',
  fontSize: 'medium',
  compactMode: false,
  showPreview: false,
  animationsEnabled: true,
  glassEffect: true,
  
  showHiddenFiles: false,
  showFileExtensions: true,
  showThumbnails: true,
  sortBy: 'name',
  sortOrder: 'asc',
  groupFolders: true,
  dateFormat: 'short',
  fileSizeFormat: 'decimal',
  
  doubleClickToOpen: true,
  singleClickToOpen: false,
  openFoldersInNewTab: false,
  rememberLastLocation: true,
  showBreadcrumbs: true,
  showAddressBar: true,
  
  enableMultiSelect: true,
  enableRangeSelect: true,
  enableDragSelect: true,
  selectOnRightClick: true,
  showSelectionCheckboxes: false,
  selectFoldersOnClick: true,
  
  maxCacheSize: 500,
  thumbnailQuality: 'medium',
  enableVideoThumbnails: false,
  lazyLoadFolders: true,
  enableFileWatching: true,
  
  showOpenWith: true,
  showCopyPath: true,
  showProperties: true,
  showArchiveOptions: true,
  showHashOption: true,
  showShareOption: true,
  showTagging: true,
  showFavorites: true,
  showTerminalOption: true,
  customMenuItems: [],
  
  enableDevTools: false,
  logLevel: 'error',
  clearCacheOnExit: false,
  confirmDelete: true,
  confirmOverwrite: true,
}

type SettingsModalProps = {
  isOpen: boolean
  onClose: () => void
  settings: AppSettings
  onSave: (settings: AppSettings) => void
}

export function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'appearance' | 'display' | 'navigation' | 'performance' | 'context' | 'advanced' | 'theme'>('appearance')
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings)
  const [isMounted, setIsMounted] = useState<boolean>(isOpen)
  // isVisible is the animation state: true = shown (translated to 0), false = hidden (translated down)
  const [isVisible, setIsVisible] = useState<boolean>(false)

  const ANIM_MS = 250

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true)
      // If animations are enabled, start hidden then flip to visible in the next frame
      if (localSettings.animationsEnabled) {
        setIsVisible(false)
        // next frame to allow transition from hidden -> visible
        requestAnimationFrame(() => requestAnimationFrame(() => setIsVisible(true)))
      } else {
        setIsVisible(true)
      }
      return
    }

    // Parent closed the modal: animate out or unmount immediately
    if (!isOpen && isMounted) {
      if (localSettings.animationsEnabled) {
        setIsVisible(false)
        const t = setTimeout(() => {
          setIsMounted(false)
        }, ANIM_MS)
        return () => clearTimeout(t)
      }
      setIsMounted(false)
      setIsVisible(false)
    }
  }, [isOpen])

  if (!isMounted) return null

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    // allow onSave to be async
    try {
      await Promise.resolve(onSave(localSettings))
    } catch (e) {
      console.error('Save failed', e)
      throw e
    }

    if (localSettings.animationsEnabled) {
      setIsVisible(false)
      setTimeout(() => {
        setIsMounted(false)
        onClose()
      }, ANIM_MS)
    } else {
      onClose()
      setIsMounted(false)
    }
  }

  const handleReset = () => {
    if (window.confirm('Reset all settings to default?')) {
      setLocalSettings(defaultSettings)
    }
  }

  const tabs = [
    { id: 'appearance' as const, name: 'Appearance', icon: Palette },
    { id: 'display' as const, name: 'File Display', icon: FileText },
    { id: 'navigation' as const, name: 'Navigation', icon: Folder },
    { id: 'performance' as const, name: 'Performance', icon: Zap },
    { id: 'context' as const, name: 'Context Menu', icon: Eye },
    { id: 'advanced' as const, name: 'Advanced', icon: Monitor },
    { id: 'theme' as const, name: 'Custom Theme', icon: Sparkles }
  ]

  const accentColors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Green', value: '#10b981' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
  ]

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300"
      style={{
        background: isVisible ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
        backdropFilter: isVisible ? 'blur(8px)' : 'blur(0px)',
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
    >
      <div
        className={`glass-panel rounded-2xl w-[950px] max-h-[85vh] flex flex-col overflow-hidden border border-white/10 shadow-2xl transform transition-all duration-300 ease-out ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90'
          }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div>
            <h2 className="text-xl font-semibold">Settings</h2>
            <p className="text-xs text-white/50 mt-1">Customize Xvser to your preferences</p>
          </div>
          <button
            onClick={() => {
              if (localSettings.animationsEnabled) {
                setIsVisible(false)
                setTimeout(() => {
                  setIsMounted(false)
                  onClose()
                }, ANIM_MS)
              } else {
                onClose()
                setIsMounted(false)
              }
            }}
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-56 border-r border-white/10 p-3 overflow-auto bg-white/[0.02]">
            <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold px-3 mb-2">Categories</div>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left mb-1 transition-all ${
                  activeTab === tab.id ? 'bg-brand/20 text-white font-medium shadow-lg shadow-brand/10' : 'text-white/70 hover:bg-white/8'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto">
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Appearance</h3>
                  <p className="text-sm text-white/50 mt-1">Customize the look and feel of Xvser</p>
                </div>
                
                {/* Theme Card */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                    <Monitor size={16} className="text-brand" />
                    Theme
                  </label>
                  <select
                    value={localSettings.theme}
                    onChange={(e) => updateSetting('theme', e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-brand/50 text-sm font-medium"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                  <p className="text-xs text-white/50 mt-2">Choose your preferred color theme</p>
                </div>

                {/* Accent Color Card */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                    <Palette size={16} className="text-brand" />
                    Accent Color
                  </label>
                  <div className="grid grid-cols-6 gap-3">
                    {accentColors.map(color => (
                      <button
                        key={color.value}
                        onClick={() => updateSetting('accentColor', color.value)}
                        className={`h-12 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          localSettings.accentColor === color.value ? 'border-white shadow-lg scale-105' : 'border-white/20'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/50 mt-2">Highlight color for buttons and accents</p>
                </div>

                {/* Font Size Card */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="block text-sm font-medium mb-3">Font Size</label>
                  <select
                    value={localSettings.fontSize}
                    onChange={(e) => updateSetting('fontSize', e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-brand/50 text-sm font-medium"
                  >
                    <option value="small">Small (12px)</option>
                    <option value="medium">Medium (14px)</option>
                    <option value="large">Large (16px)</option>
                  </select>
                  <p className="text-xs text-white/50 mt-2">Adjust text size throughout the app</p>
                </div>

                {/* Visual Options Card */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                  <div className="text-sm font-medium mb-3">Visual Options</div>
                  
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                        <Eye size={18} className="text-brand" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Compact Mode</div>
                        <div className="text-xs text-white/50">Reduce spacing for more content</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.compactMode}
                      onChange={(e) => updateSetting('compactMode', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                        <Zap size={18} className="text-brand" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Enable Animations</div>
                        <div className="text-xs text-white/50">Smooth transitions and effects</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.animationsEnabled}
                      onChange={(e) => updateSetting('animationsEnabled', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                        <Monitor size={18} className="text-brand" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Glass Effect</div>
                        <div className="text-xs text-white/50">Frosted glass background blur</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.glassEffect}
                      onChange={(e) => updateSetting('glassEffect', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                        <FileText size={18} className="text-brand" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Show Preview Pane</div>
                        <div className="text-xs text-white/50">Display file preview on the right</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.showPreview}
                      onChange={(e) => updateSetting('showPreview', e.target.checked)}
                      className="w-5 h-5"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'display' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">File Display</h3>
                  <p className="text-sm text-white/50 mt-1">Control how files and folders are shown</p>
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={localSettings.showHiddenFiles}
                    onChange={(e) => updateSetting('showHiddenFiles', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Show Hidden Files</div>
                    <div className="text-xs text-white/60">Display files starting with . or marked as hidden</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showFileExtensions}
                    onChange={(e) => updateSetting('showFileExtensions', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Show File Extensions</div>
                    <div className="text-xs text-white/60">Display .txt, .pdf, etc.</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showThumbnails}
                    onChange={(e) => updateSetting('showThumbnails', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Show Thumbnails</div>
                    <div className="text-xs text-white/60">Preview images and videos</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.groupFolders}
                    onChange={(e) => updateSetting('groupFolders', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Group Folders First</div>
                    <div className="text-xs text-white/60">Show folders before files</div>
                  </div>
                </label>

                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <select
                    value={localSettings.sortBy}
                    onChange={(e) => updateSetting('sortBy', e.target.value as any)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-brand/40"
                  >
                    <option value="name">Name</option>
                    <option value="date">Date Modified</option>
                    <option value="size">Size</option>
                    <option value="type">Type</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sort Order</label>
                  <select
                    value={localSettings.sortOrder}
                    onChange={(e) => updateSetting('sortOrder', e.target.value as any)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-brand/40"
                  >
                    <option value="asc">Ascending (A-Z)</option>
                    <option value="desc">Descending (Z-A)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date Format</label>
                  <select
                    value={localSettings.dateFormat}
                    onChange={(e) => updateSetting('dateFormat', e.target.value as any)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-brand/40"
                  >
                    <option value="short">Short (1/1/24)</option>
                    <option value="long">Long (January 1, 2024)</option>
                    <option value="relative">Relative (2 hours ago)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">File Size Format</label>
                  <select
                    value={localSettings.fileSizeFormat}
                    onChange={(e) => updateSetting('fileSizeFormat', e.target.value as any)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-brand/40"
                  >
                    <option value="decimal">Decimal (1 KB = 1000 B)</option>
                    <option value="binary">Binary (1 KiB = 1024 B)</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'navigation' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Navigation</h3>
                  <p className="text-sm text-white/50 mt-1">Customize how you browse and navigate</p>
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.doubleClickToOpen}
                    onChange={(e) => updateSetting('doubleClickToOpen', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Double-Click to Open</div>
                    <div className="text-xs text-white/60">Require double-click to open files and folders</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.singleClickToOpen}
                    onChange={(e) => updateSetting('singleClickToOpen', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Single-Click to Open</div>
                    <div className="text-xs text-white/60">Open with single click (like web links)</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.openFoldersInNewTab}
                    onChange={(e) => updateSetting('openFoldersInNewTab', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Open Folders in New Tab</div>
                    <div className="text-xs text-white/60">Ctrl+Click to open in new tab</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.rememberLastLocation}
                    onChange={(e) => updateSetting('rememberLastLocation', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Remember Last Location</div>
                    <div className="text-xs text-white/60">Open to last visited folder on startup</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showBreadcrumbs}
                    onChange={(e) => updateSetting('showBreadcrumbs', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Show Breadcrumbs</div>
                    <div className="text-xs text-white/60">Display clickable path navigation</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showAddressBar}
                    onChange={(e) => updateSetting('showAddressBar', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Show Address Bar</div>
                    <div className="text-xs text-white/60">Display editable path input</div>
                  </div>
                </label>
                
                {/* Selection Section */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mt-6">
                  <div className="text-sm font-medium mb-4 flex items-center gap-2">
                    <CheckSquare size={16} className="text-brand" />
                    File Selection
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.enableMultiSelect}
                        onChange={(e) => updateSetting('enableMultiSelect', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="font-medium text-sm">Enable Multi-Select</div>
                        <div className="text-xs text-white/60">Use Ctrl+Click to select multiple files</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.enableRangeSelect}
                        onChange={(e) => updateSetting('enableRangeSelect', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="font-medium text-sm">Enable Range Select</div>
                        <div className="text-xs text-white/60">Use Shift+Click to select a range</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.selectOnRightClick}
                        onChange={(e) => updateSetting('selectOnRightClick', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="font-medium text-sm">Select on Right-Click</div>
                        <div className="text-xs text-white/60">Right-click automatically selects item</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.showSelectionCheckboxes}
                        onChange={(e) => updateSetting('showSelectionCheckboxes', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="font-medium text-sm">Show Selection Checkboxes</div>
                        <div className="text-xs text-white/60">Display checkboxes for easy selection</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.selectFoldersOnClick}
                        onChange={(e) => updateSetting('selectFoldersOnClick', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="font-medium text-sm">Select Folders on Click</div>
                        <div className="text-xs text-white/60">Single-click selects folders instead of opening</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Performance</h3>
                  <p className="text-sm text-white/50 mt-1">Optimize speed and resource usage</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Max Cache Size (MB)</label>
                  <input
                    type="number"
                    value={localSettings.maxCacheSize}
                    onChange={(e) => updateSetting('maxCacheSize', parseInt(e.target.value))}
                    min="100"
                    max="5000"
                    step="100"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-brand/40"
                  />
                  <div className="text-xs text-white/60 mt-1">Memory used for thumbnails and previews</div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail Quality</label>
                  <select
                    value={localSettings.thumbnailQuality}
                    onChange={(e) => updateSetting('thumbnailQuality', e.target.value as any)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-brand/40"
                  >
                    <option value="low">Low (Fast)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="high">High (Best Quality)</option>
                  </select>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.enableVideoThumbnails}
                    onChange={(e) => updateSetting('enableVideoThumbnails', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Enable Video Thumbnails</div>
                    <div className="text-xs text-white/60">⚠️ Generate thumbnails for videos (uses FFmpeg, can be slow)</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.lazyLoadFolders}
                    onChange={(e) => updateSetting('lazyLoadFolders', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Lazy Load Folders</div>
                    <div className="text-xs text-white/60">Load folder contents on demand for better performance</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.enableFileWatching}
                    onChange={(e) => updateSetting('enableFileWatching', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Enable File Watching</div>
                    <div className="text-xs text-white/60">Auto-refresh when files change (uses more resources)</div>
                  </div>
                </label>
              </div>
            )}

            {activeTab === 'context' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Context Menu</h3>
                  <p className="text-sm text-white/50 mt-1">Configure right-click menu options</p>
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showOpenWith}
                    onChange={(e) => updateSetting('showOpenWith', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Show "Open With"</div>
                    <div className="text-xs text-white/60">Choose application to open files</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showCopyPath}
                    onChange={(e) => updateSetting('showCopyPath', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Show "Copy Path"</div>
                    <div className="text-xs text-white/60">Copy full file path to clipboard</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showProperties}
                    onChange={(e) => updateSetting('showProperties', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Show "Properties"</div>
                    <div className="text-xs text-white/60">View detailed file information</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showArchiveOptions}
                    onChange={(e) => updateSetting('showArchiveOptions', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Show Archive Options</div>
                    <div className="text-xs text-white/60">Compress and extract archive files</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showHashOption}
                    onChange={(e) => updateSetting('showHashOption', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Show "Copy Hash"</div>
                    <div className="text-xs text-white/60">Copy file checksum to clipboard</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showShareOption}
                    onChange={(e) => updateSetting('showShareOption', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Show "Share"</div>
                    <div className="text-xs text-white/60">Share files with other apps</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showTagging}
                    onChange={(e) => updateSetting('showTagging', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Show "Add Tags"</div>
                    <div className="text-xs text-white/60">Tag files for better organization</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showFavorites}
                    onChange={(e) => updateSetting('showFavorites', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Show "Add to Favorites"</div>
                    <div className="text-xs text-white/60">Add files or folders to favorites</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showTerminalOption}
                    onChange={(e) => updateSetting('showTerminalOption', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Show "Open in Terminal"</div>
                    <div className="text-xs text-white/60">Open terminal in selected folder</div>
                  </div>
                </label>

                <div className="pt-4 border-t border-white/10">
                  <div className="font-medium mb-2">Custom Menu Items</div>
                  <div className="text-xs text-white/60 mb-3">Add custom actions to the context menu (coming soon)</div>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm">
                    Add Custom Item
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Advanced</h3>
                  <p className="text-sm text-white/50 mt-1">Developer and power user options</p>
                </div>
              </div>
            )}

            {activeTab === 'theme' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Custom Theme</h3>
                  <p className="text-sm text-white/50 mt-1">Create your own color scheme</p>
                </div>
                <ThemeCustomizer
                  currentColors={(() => {
                    // Try to load saved theme colors
                    const savedTheme = localStorage.getItem('xvser-custom-theme')
                    if (savedTheme) {
                      try {
                        return JSON.parse(savedTheme)
                      } catch (e) {
                        console.error('Failed to parse saved theme:', e)
                      }
                    }
                    // Fall back to default with current accent color
                    return {
                      backgroundStart: '#0f0f16',
                      backgroundEnd: '#09090c',
                      accentColor: localSettings.accentColor,
                      textPrimary: '#ffffff',
                      textSecondary: '#d1d5db',
                      textMuted: '#9ca3af',
                      panelBackground: '#111119',
                      panelBackgroundOpacity: 0.45,
                      borderColor: '#ffffff',
                      borderOpacity: 0.08,
                    }
                  })()}
                  onApply={(colors) => {
                    console.log('ThemeCustomizer: Applying colors', colors)
                    
                    // Update local settings with new accent color
                    updateSetting('accentColor', colors.accentColor)
                    
                    // Apply ALL theme colors immediately
                    document.documentElement.style.setProperty('--accent-color', colors.accentColor)
                    
                    // Apply background gradient
                    const bodyStyle = document.body.style
                    bodyStyle.background = `linear-gradient(135deg, ${colors.backgroundStart} 0%, ${colors.backgroundEnd} 100%)`
                    
                    // Apply text colors
                    document.documentElement.style.setProperty('--text-primary', colors.textPrimary)
                    document.documentElement.style.setProperty('--text-secondary', colors.textSecondary)
                    document.documentElement.style.setProperty('--text-muted', colors.textMuted)
                    
                    // Apply panel styles
                    document.documentElement.style.setProperty('--panel-bg', colors.panelBackground)
                    document.documentElement.style.setProperty('--panel-opacity', colors.panelBackgroundOpacity.toString())
                    
                    // Store full custom colors in localStorage
                    localStorage.setItem('xvser-custom-theme', JSON.stringify(colors))
                    console.log('ThemeCustomizer: All colors saved and applied', colors)
                  }}
                  onReset={() => {
                    console.log('ThemeCustomizer: Resetting to defaults')
                    // Remove saved custom theme
                    localStorage.removeItem('xvser-custom-theme')
                    
                    // Reset accent color to default
                    updateSetting('accentColor', defaultSettings.accentColor)
                    
                    // Reset all theme colors to defaults
                    const defaultColors = {
                      backgroundStart: '#0f0f16',
                      backgroundEnd: '#09090c',
                      accentColor: defaultSettings.accentColor,
                      textPrimary: '#ffffff',
                      textSecondary: '#d1d5db',
                      textMuted: '#9ca3af',
                      panelBackground: '#111119',
                      panelBackgroundOpacity: 0.45,
                      borderColor: '#ffffff',
                      borderOpacity: 0.08,
                    }

                    // Apply default colors
                    document.documentElement.style.setProperty('--accent-color', defaultColors.accentColor)
                    document.body.style.background = `linear-gradient(135deg, ${defaultColors.backgroundStart} 0%, ${defaultColors.backgroundEnd} 100%)`
                    document.documentElement.style.setProperty('--text-primary', defaultColors.textPrimary)
                    document.documentElement.style.setProperty('--text-secondary', defaultColors.textSecondary)
                    document.documentElement.style.setProperty('--text-muted', defaultColors.textMuted)
                    document.documentElement.style.setProperty('--panel-bg', defaultColors.panelBackground)
                    document.documentElement.style.setProperty('--panel-opacity', defaultColors.panelBackgroundOpacity.toString())
                  }}
                />
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Advanced</h3>
                  <p className="text-sm text-white/50 mt-1">Developer and power user options</p>
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.enableDevTools}
                    onChange={(e) => updateSetting('enableDevTools', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Enable Developer Tools</div>
                    <div className="text-xs text-white/60">Show debug console and inspector</div>
                  </div>
                </label>

                <div>
                  <label className="block text-sm font-medium mb-2">Log Level</label>
                  <select
                    value={localSettings.logLevel}
                    onChange={(e) => updateSetting('logLevel', e.target.value as any)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-brand/40"
                  >
                    <option value="none">None</option>
                    <option value="error">Error</option>
                    <option value="warn">Warning</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.clearCacheOnExit}
                    onChange={(e) => updateSetting('clearCacheOnExit', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Clear Cache on Exit</div>
                    <div className="text-xs text-white/60">Free up disk space when closing the app</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.confirmDelete}
                    onChange={(e) => updateSetting('confirmDelete', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Confirm Delete</div>
                    <div className="text-xs text-white/60">Ask before moving files to trash</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.confirmOverwrite}
                    onChange={(e) => updateSetting('confirmOverwrite', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Confirm Overwrite</div>
                    <div className="text-xs text-white/60">Ask before replacing existing files</div>
                  </div>
                </label>


              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition-colors"
          >
            <RefreshCw size={14} className="inline mr-1.5" />
            Reset to Defaults
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (localSettings.animationsEnabled) {
                  setIsVisible(false)
                  setTimeout(() => {
                    setIsMounted(false)
                    onClose()
                  }, ANIM_MS)
                } else {
                  onClose()
                  setIsMounted(false)
                }
              }}
              className="px-5 py-2.5 text-sm bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 text-sm bg-brand hover:bg-brand-dark rounded-lg font-medium shadow-lg shadow-brand/20 transition-all hover:shadow-xl hover:shadow-brand/30"
            >
              <Check size={14} className="inline mr-1.5" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
