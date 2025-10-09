import { useState, useEffect } from 'react'
import { Download, RefreshCw, Check, AlertCircle, X } from 'lucide-react'

type UpdateState = 
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'available'; version: string; releaseNotes?: string }
  | { status: 'downloading'; percent: number }
  | { status: 'downloaded'; version: string }
  | { status: 'error'; message: string }

export function UpdateNotification() {
  const [updateState, setUpdateState] = useState<UpdateState>({ status: 'idle' })
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Listen for update events
    const unsubChecking = window.xvser.onUpdateChecking?.(() => {
      setUpdateState({ status: 'checking' })
    })

    const unsubAvailable = window.xvser.onUpdateAvailable?.((info) => {
      setUpdateState({ 
        status: 'available', 
        version: info.version,
        releaseNotes: info.releaseNotes 
      })
    })

    const unsubNotAvailable = window.xvser.onUpdateNotAvailable?.(() => {
      setUpdateState({ status: 'idle' })
    })

    const unsubProgress = window.xvser.onUpdateDownloadProgress?.((progress) => {
      setUpdateState({ 
        status: 'downloading', 
        percent: Math.floor(progress.percent) 
      })
    })

    const unsubDownloaded = window.xvser.onUpdateDownloaded?.((info) => {
      setUpdateState({ 
        status: 'downloaded', 
        version: info.version 
      })
    })

    const unsubError = window.xvser.onUpdateError?.((error) => {
      setUpdateState({ 
        status: 'error', 
        message: error.message 
      })
      // Auto-hide error after 5 seconds
      setTimeout(() => {
        setUpdateState({ status: 'idle' })
      }, 5000)
    })

    return () => {
      unsubChecking?.()
      unsubAvailable?.()
      unsubNotAvailable?.()
      unsubProgress?.()
      unsubDownloaded?.()
      unsubError?.()
    }
  }, [])

  const handleDownload = async () => {
    try {
      await window.xvser.downloadUpdate?.()
    } catch (err) {
      console.error('Failed to download update:', err)
    }
  }

  const handleInstall = async () => {
    try {
      await window.xvser.installUpdate?.()
    } catch (err) {
      console.error('Failed to install update:', err)
    }
  }

  const handleCheckForUpdates = async () => {
    setUpdateState({ status: 'checking' })
    try {
      await window.xvser.checkForUpdates?.()
    } catch (err) {
      console.error('Failed to check for updates:', err)
      setUpdateState({ status: 'idle' })
    }
  }

  // Don't show anything if idle
  if (updateState.status === 'idle') {
    return null
  }

  // Checking state - subtle indicator
  if (updateState.status === 'checking') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-white/50">
        <RefreshCw size={12} className="animate-spin" />
        <span>Checking...</span>
      </div>
    )
  }

  // Error state
  if (updateState.status === 'error') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-red-400">
        <AlertCircle size={12} />
        <span>Update error</span>
      </div>
    )
  }

  // Update available - show badge
  if (updateState.status === 'available') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 transition-colors"
          title={`Update available: v${updateState.version}`}
        >
          <div className="relative">
            <Download size={14} className="text-blue-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          </div>
          <span className="text-xs text-white/70">Update</span>
        </button>

        {showDetails && (
          <div className="absolute top-full right-0 mt-1 w-64 bg-[#1a1a1f] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-white/10">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-white">Update Available</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-white/50 hover:text-white/70"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-xs text-white/50">Version {updateState.version}</p>
            </div>
            
            {updateState.releaseNotes && (
              <div className="p-3 border-b border-white/10 max-h-32 overflow-y-auto">
                <p className="text-xs text-white/70 whitespace-pre-wrap">
                  {updateState.releaseNotes}
                </p>
              </div>
            )}

            <div className="p-3 flex gap-2">
              <button
                onClick={() => {
                  handleDownload()
                  setShowDetails(false)
                }}
                className="flex-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors"
              >
                Download
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium rounded transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Downloading state
  if (updateState.status === 'downloading') {
    return (
      <div className="flex items-center gap-2 px-2 py-1">
        <Download size={14} className="text-blue-400 animate-pulse" />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-white/70">Downloading...</span>
          <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${updateState.percent}%` }}
            />
          </div>
        </div>
        <span className="text-xs text-white/50">{updateState.percent}%</span>
      </div>
    )
  }

  // Downloaded - ready to install
  if (updateState.status === 'downloaded') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 transition-colors"
          title="Update ready to install"
        >
          <Check size={14} className="text-green-400" />
          <span className="text-xs text-white/70">Ready</span>
        </button>

        {showDetails && (
          <div className="absolute top-full right-0 mt-1 w-64 bg-[#1a1a1f] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-white/10">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-white">Update Ready</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-white/50 hover:text-white/70"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-xs text-white/50">Version {updateState.version} downloaded</p>
            </div>

            <div className="p-3">
              <p className="text-xs text-white/70 mb-3">
                The update is ready to install. The app will restart to complete the installation.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleInstall()
                    setShowDetails(false)
                  }}
                  className="flex-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded transition-colors"
                >
                  Install & Restart
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium rounded transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
