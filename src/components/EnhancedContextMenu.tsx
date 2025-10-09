import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import './ContextMenu.css'
import { 
  FolderOpen, ExternalLink, Copy, Scissors, ClipboardPaste, 
  FileText, Trash2, Edit, Info, Star, Tag, Share2, 
  Download, Archive, Link, Eye, RefreshCw, FolderPlus,
  FilePlus, Terminal, Lock, Unlock, FileCheck, Hash,
  Printer, FileEdit, Send, Pin, EyeOff, Shield, UserCheck,
  RotateCw, RotateCcw, FileType, Image as ImageIcon, Files, Settings as SettingsIcon,
  MonitorPlay, Code, List, LayoutGrid, Columns, ArrowUp, Type, Calendar, HardDrive
} from 'lucide-react'

type DirEntry = {
  name: string
  path: string
  isDir: boolean
  size: number
  mtimeMs: number
  ext: string
}

interface EnhancedContextMenuProps {
  visible: boolean
  x: number
  y: number
  item: DirEntry | null
  selectedCount: number
  clipboard: { type: 'copy' | 'cut', paths: string[] } | null
  currentDir: string | null
  settings: {
    showOpenWith: boolean
    showCopyPath: boolean
    showProperties: boolean
    showArchiveOptions: boolean
    showHashOption: boolean
    showShareOption: boolean
    showTagging: boolean
    showFavorites: boolean
    showTerminalOption: boolean
  }
  onClose: () => void
  onOpen: () => void
  onOpenWith: () => void
  onOpenInNewTab: () => void
  onOpenInNewWindow: () => void
  onReveal: () => void
  onCopy: () => void
  onCut: () => void
  onPaste: () => void
  onDelete: () => void
  onRename: () => void
  onCopyPath: () => void
  onProperties: () => void
  onCompress: () => void
  onExtract: () => void
  onCreateShortcut: () => void
  onShare: () => void
  onAddToFavorites: () => void
  onTag: () => void
  onCopyHash: () => void
  onSetAsWallpaper?: () => void
  onOpenInTerminal?: () => void
  onRefresh: () => void
  onPrint?: () => void
  onEdit?: () => void
  onSendToDesktop?: () => void
  onPinToQuickAccess?: () => void
  onRotateImage?: (direction: 'cw' | 'ccw') => void
  onDuplicate?: () => void
  onBatchRename?: () => void
  onNewFile?: (type: 'text' | 'folder' | 'shortcut') => void
  onOpenInPowerShell?: () => void
  onScanWithDefender?: () => void
  onTakeOwnership?: () => void
  onSetAttributes?: (attrs: { hidden?: boolean, readOnly?: boolean }) => void
  onChangeView?: (layout: 'list' | 'grid' | 'details') => void
  onChangeSortBy?: (sortBy: 'name' | 'date' | 'size' | 'type') => void
}

export function EnhancedContextMenu(props: EnhancedContextMenuProps) {
  const {
    visible,
    x,
    y,
    item,
    selectedCount,
    clipboard,
    currentDir,
    settings,
    onClose,
    onOpen,
    onOpenWith,
    onOpenInNewTab,
    onOpenInNewWindow,
    onReveal,
    onCopy,
    onCut,
    onPaste,
    onDelete,
    onRename,
    onCopyPath,
    onProperties,
    onCompress,
    onExtract,
    onCreateShortcut,
    onShare,
    onAddToFavorites,
    onTag,
    onCopyHash,
    onSetAsWallpaper,
    onOpenInTerminal,
    onRefresh,
    onPrint,
    onEdit,
    onSendToDesktop,
    onPinToQuickAccess,
    onRotateImage,
    onDuplicate,
    onBatchRename,
    onNewFile,
    onOpenInPowerShell,
    onScanWithDefender,
    onTakeOwnership,
    onSetAttributes,
    onChangeView,
    onChangeSortBy,
  } = props

  // Create wrapped handlers that close the menu after action
  const handleAction = useCallback((action: Function) => {
    return (...args: any[]) => {
      action(...args);
      onClose();
    };
  }, [onClose]);

  const [showSendTo, setShowSendTo] = useState(false)
  const [sendToMenuPosition, setSendToMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const [showOpenWith, setShowOpenWith] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [newMenuPosition, setNewMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const [showView, setShowView] = useState(false)
  const [viewMenuPosition, setViewMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const [showSortBy, setShowSortBy] = useState(false)
  const [sortByMenuPosition, setSortByMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const [showGroupBy, setShowGroupBy] = useState(false)
  const [groupByMenuPosition, setGroupByMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const [advancedMenuPosition, setAdvancedMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Reset submenu states when main menu closes
  useEffect(() => {
    if (!visible) {
      setShowAdvanced(false)
      setAdvancedMenuPosition(null)
      setShowSendTo(false)
      setSendToMenuPosition(null)
      setShowView(false)
      setViewMenuPosition(null)
      setShowSortBy(false)
      setSortByMenuPosition(null)
      setShowGroupBy(false)
      setGroupByMenuPosition(null)
      setShowNew(false)
      setNewMenuPosition(null)
    }
  }, [visible])

  if (!visible) return null

  const isImage = item && !item.isDir && ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'].includes(item.ext.toLowerCase())
  const isArchive = item && !item.isDir && ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'].includes(item.ext.toLowerCase())
  const isTextFile = item && !item.isDir && ['.txt', '.md', '.json', '.xml', '.html', '.css', '.js', '.ts', '.jsx', '.tsx', '.ini', '.cfg', '.conf', '.log'].includes(item.ext.toLowerCase())
  const isPrintable = item && !item.isDir && ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'].includes(item.ext.toLowerCase())
  const canPaste = clipboard && clipboard.paths.length > 0

  // Calculate menu position to keep it within viewport
  const menuWidth = 320
  const menuHeight = 600 // Approximate max height
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  let adjustedX = x
  let adjustedY = y
  
  // Adjust horizontal position
  if (x + menuWidth > viewportWidth) {
    adjustedX = Math.max(10, viewportWidth - menuWidth - 10)
  }
  
  // Adjust vertical position
  if (y + menuHeight > viewportHeight) {
    adjustedY = Math.max(10, viewportHeight - menuHeight - 10)
  }

  return (
    <div
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
      className="fixed inset-0 z-[9999]"
    >
      <div
        className="glass-panel rounded-lg min-w-[220px] max-w-[320px] overflow-hidden absolute context-menu-main"
        style={{ 
          left: adjustedX + 'px', 
          top: adjustedY + 'px',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {!item ? (
          <>
            {/* Background context menu - no item selected */}
            {/* New submenu */}
            {onNewFile && (
              <div className="p-1">
                <button
                  className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                  onClick={() => { onNewFile('folder'); onClose(); }}
                >
                  <FolderPlus size={16} className="text-yellow-400" />
                  <span>New Folder</span>
                </button>
                <button
                  className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                  onClick={() => { onNewFile('text'); onClose(); }}
                >
                  <FilePlus size={16} className="text-blue-400" />
                  <span>New Text Document</span>
                </button>
              </div>
            )}

            <div className="h-px bg-white/10 my-1"></div>

            <div className="p-1">
              {/* View submenu */}
              <div className="relative">
                <button
                  className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    
                    let x = rect.right + 4;
                    let y = rect.top;
                    
                    if (x + 220 > viewportWidth) {
                      x = Math.max(0, rect.left - 224);
                    }
                    
                    if (y + 200 > viewportHeight) {
                      y = Math.max(0, viewportHeight - 200);
                    }
                    
                    setViewMenuPosition({ x, y });
                    setShowView(true);
                  }}
                  onMouseLeave={(e) => {
                    const related = e.relatedTarget as HTMLElement;
                    if (!related?.closest('.view-submenu')) {
                      setTimeout(() => {
                        if (!document.querySelector('.view-submenu:hover')) {
                          setShowView(false);
                        }
                      }, 50);
                    }
                  }}
                >
                  <Eye size={16} className="text-blue-400" />
                  <span>View</span>
                  <span className="ml-auto text-xs text-white/40">›</span>
                </button>

                {showView && viewMenuPosition && createPortal(
                  <div 
                    className="view-submenu context-menu-submenu fixed glass-panel rounded-lg py-1 min-w-[200px] z-[10000]"
                    style={{
                      left: `${viewMenuPosition.x}px`,
                      top: `${viewMenuPosition.y}px`,
                      overflow: 'hidden',
                      pointerEvents: 'auto'
                    }}
                    onMouseEnter={() => setShowView(true)}
                    onMouseLeave={() => setShowView(false)}
                  >
                    <div className="p-1">
                      <div className="px-3 py-1 text-xs text-white/40 select-none">Layout</div>
                      <button 
                        className="menu-item w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center gap-2" 
                        onClick={() => { 
                          onChangeView?.('list');
                          onClose(); 
                        }}
                      >
                        <List size={14} className="text-blue-400" />
                        <span>List</span>
                      </button>
                      <button 
                        className="menu-item w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center gap-2" 
                        onClick={() => { 
                          onChangeView?.('grid');
                          onClose(); 
                        }}
                      >
                        <LayoutGrid size={14} className="text-green-400" />
                        <span>Grid</span>
                      </button>
                      <button 
                        className="menu-item w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center gap-2" 
                        onClick={() => { 
                          onChangeView?.('details');
                          onClose(); 
                        }}
                      >
                        <Columns size={14} className="text-purple-400" />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>,
                  document.body
                )}
              </div>

              {/* Sort By submenu */}
              <div className="relative">
                <button
                  className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    
                    let x = rect.right + 4;
                    let y = rect.top;
                    
                    if (x + 220 > viewportWidth) {
                      x = Math.max(0, rect.left - 224);
                    }
                    
                    if (y + 250 > viewportHeight) {
                      y = Math.max(0, viewportHeight - 250);
                    }
                    
                    setSortByMenuPosition({ x, y });
                    setShowSortBy(true);
                  }}
                  onMouseLeave={(e) => {
                    const related = e.relatedTarget as HTMLElement;
                    if (!related?.closest('.sortby-submenu')) {
                      setTimeout(() => {
                        if (!document.querySelector('.sortby-submenu:hover')) {
                          setShowSortBy(false);
                        }
                      }, 50);
                    }
                  }}
                >
                  <ArrowUp size={16} className="text-purple-400" />
                  <span>Sort by</span>
                  <span className="ml-auto text-xs text-white/40">›</span>
                </button>

                {showSortBy && sortByMenuPosition && createPortal(
                  <div 
                    className="sortby-submenu context-menu-submenu fixed glass-panel rounded-lg py-1 min-w-[200px] z-[10000]"
                    style={{
                      left: `${sortByMenuPosition.x}px`,
                      top: `${sortByMenuPosition.y}px`,
                      overflow: 'hidden',
                      pointerEvents: 'auto'
                    }}
                    onMouseEnter={() => setShowSortBy(true)}
                    onMouseLeave={() => setShowSortBy(false)}
                  >
                    <div className="p-1">
                      <button 
                        className="menu-item w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center gap-2" 
                        onClick={() => { 
                          onChangeSortBy?.('name');
                          onClose(); 
                        }}
                      >
                        <Type size={14} className="text-blue-400" />
                        <span>Name</span>
                      </button>
                      <button 
                        className="menu-item w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center gap-2" 
                        onClick={() => { 
                          onChangeSortBy?.('date');
                          onClose(); 
                        }}
                      >
                        <Calendar size={14} className="text-green-400" />
                        <span>Date modified</span>
                      </button>
                      <button 
                        className="menu-item w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center gap-2" 
                        onClick={() => { 
                          onChangeSortBy?.('type');
                          onClose(); 
                        }}
                      >
                        <FileType size={14} className="text-purple-400" />
                        <span>Type</span>
                      </button>
                      <button 
                        className="menu-item w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center gap-2" 
                        onClick={() => { 
                          onChangeSortBy?.('size');
                          onClose(); 
                        }}
                      >
                        <HardDrive size={14} className="text-orange-400" />
                        <span>Size</span>
                      </button>
                    </div>
                  </div>,
                  document.body
                )}
              </div>

              <button
                className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                onClick={() => { onRefresh(); onClose(); }}
              >
                <RefreshCw size={16} className="text-white/60" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="h-px bg-white/10 my-1"></div>

            <div className="p-1">
              {canPaste && (
                <button
                  className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                  onClick={onPaste}
                >
                  <ClipboardPaste size={16} className="text-green-400" />
                  <span>Paste</span>
                  <span className="ml-auto text-xs text-white/40">Ctrl+V</span>
                </button>
              )}

              {settings.showProperties && (
                <button
                  className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                  onClick={() => { onProperties(); onClose(); }}
                >
                  <Info size={16} className="text-white/60" />
                  <span>Properties</span>
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Item-specific context menu */}
            {/* Basic operations */}
            <div className="p-1">
              <button
                className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                onClick={onOpen}
              >
                <FolderOpen size={16} className="text-blue-400" />
                <span>Open</span>
              </button>

              {settings.showOpenWith && (
                <div className="relative">
                  <button
                    className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                    onClick={onOpenWith}
                    onMouseEnter={() => setShowOpenWith(true)}
                    onMouseLeave={() => setShowOpenWith(false)}
                  >
                    <ExternalLink size={16} className="text-green-400" />
                    <span>Open with</span>
                  </button>
                </div>
              )}

              <button
                className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                onClick={onOpenInNewTab}
              >
                <FileText size={16} className="text-purple-400" />
                <span>Open in new tab</span>
              </button>

              <button
                className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                onClick={onOpenInNewWindow}
              >
                <Files size={16} className="text-indigo-400" />
                <span>Open in new window</span>
              </button>
            </div>

            <div className="h-px bg-white/10 my-1"></div>

            {/* Clipboard operations */}
            <div className="p-1">
              <button
                className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                onClick={onCopy}
              >
                <Copy size={16} className="text-blue-400" />
                <span>Copy</span>
                <span className="ml-auto text-xs text-white/40">Ctrl+C</span>
              </button>

              <button
                className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                onClick={onCut}
              >
                <Scissors size={16} className="text-orange-400" />
                <span>Cut</span>
                <span className="ml-auto text-xs text-white/40">Ctrl+X</span>
              </button>

              <button
                className={`menu-item w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                  canPaste ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={canPaste ? onPaste : undefined}
                disabled={!canPaste}
              >
                <ClipboardPaste size={16} className="text-green-400" />
                <span>Paste</span>
                <span className="ml-auto text-xs text-white/40">Ctrl+V</span>
              </button>

              {settings.showCopyPath && (
                <button
                  className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                  onClick={onCopyPath}
                >
                  <Link size={16} className="text-teal-400" />
                  <span>Copy path</span>
                  <span className="ml-auto text-xs text-white/40">Alt+Shift+C</span>
                </button>
              )}
            </div>

            <div className="h-px bg-white/10 my-1"></div>

            {/* Edit operations */}
            <div className="p-1">
              <button
                className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                onClick={onRename}
              >
                <FileEdit size={16} className="text-yellow-400" />
                <span>Rename</span>
                <span className="ml-auto text-xs text-white/40">F2</span>
              </button>

              {onDuplicate && (
                <button
                  className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                  onClick={handleAction(onDuplicate)}
                >
                  <Files size={16} className="text-blue-400" />
                  <span>Make a copy</span>
                </button>
              )}

              {settings.showArchiveOptions && isArchive && (
                <button
                  className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                  onClick={onExtract}
                >
                  <Archive size={16} className="text-purple-400" />
                  <span>Extract here</span>
                </button>
              )}

              {settings.showArchiveOptions && !isArchive && (
                <button
                  className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                  onClick={onCompress}
                >
                  <Archive size={16} className="text-purple-400" />
                  <span>Compress to ZIP</span>
                </button>
              )}
            </div>

            {/* Image-specific operations */}
            {isImage && (
              <>
                <div className="h-px bg-white/10 my-1"></div>
                <div className="p-1">
                  {onRotateImage && (
                    <>
                      <button
                        className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                        onClick={() => onRotateImage('cw')}
                      >
                        <RotateCw size={16} className="text-blue-400" />
                        <span>Rotate clockwise</span>
                      </button>
                      <button
                        className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                        onClick={() => onRotateImage('ccw')}
                      >
                        <RotateCcw size={16} className="text-blue-400" />
                        <span>Rotate counter-clockwise</span>
                      </button>
                    </>
                  )}
                  {onSetAsWallpaper && (
                    <button
                      className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                      onClick={handleAction(onSetAsWallpaper)}
                    >
                      <MonitorPlay size={16} className="text-purple-400" />
                      <span>Set as wallpaper</span>
                    </button>
                  )}
                </div>
              </>
            )}

            {/* File-specific operations */}
            {(isTextFile || isPrintable) && (
              <>
                <div className="h-px bg-white/10 my-1"></div>
                <div className="p-1">
                  {isTextFile && onEdit && (
                    <button
                      className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                      onClick={handleAction(onEdit)}
                    >
                      <Code size={16} className="text-green-400" />
                      <span>Edit</span>
                    </button>
                  )}
                  {isPrintable && onPrint && (
                    <button
                      className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                      onClick={handleAction(onPrint)}
                    >
                      <Printer size={16} className="text-blue-400" />
                      <span>Print</span>
                    </button>
                  )}
                </div>
              </>
            )}

            <div className="h-px bg-white/10 my-1"></div>

            {/* Terminal operations */}
            {settings.showTerminalOption && (onOpenInTerminal || onOpenInPowerShell) && (
              <>
                <div className="h-px bg-white/10 my-1"></div>
                <div className="p-1">
                  {onOpenInTerminal && (
                    <button
                      className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                      onClick={handleAction(onOpenInTerminal)}
                    >
                      <Terminal size={16} className="text-green-400" />
                      <span>Open in Terminal</span>
                    </button>
                  )}
                  {onOpenInPowerShell && (
                    <button
                      className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                      onClick={handleAction(onOpenInPowerShell)}
                    >
                      <Terminal size={16} className="text-blue-400" />
                      <span>Open in PowerShell</span>
                    </button>
                  )}
                </div>
              </>
            )}

            <div className="h-px bg-white/10 my-1"></div>

            {/* Advanced operations */}
            <div className="p-1">
              {(onSetAttributes || settings.showHashOption || onScanWithDefender || onTakeOwnership) && (
                <div className="relative">
                  <button
                    className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const menuRect = e.currentTarget.closest('.glass-panel')?.getBoundingClientRect();
                      if (!menuRect) return;

                      const viewportWidth = window.innerWidth;
                      const viewportHeight = window.innerHeight;
                      
                      // Position to the right of the parent menu
                      let x = rect.right + 4;
                      let y = rect.top;
                      
                      // Fall back to left side if no room on right
                      if (x + 220 > viewportWidth) {
                        x = Math.max(0, rect.left - 224);
                      }
                      
                      // Adjust vertical position if needed
                      if (y + 300 > viewportHeight) {
                        y = Math.max(0, viewportHeight - 300);
                      }
                      
                      setAdvancedMenuPosition({ x, y });
                      setShowAdvanced(true);
                    }}
                    onMouseLeave={(e) => {
                      const related = e.relatedTarget as HTMLElement;
                      if (!related?.closest('.context-menu-submenu')) {
                        setTimeout(() => {
                          if (!document.querySelector('.context-menu-submenu:hover')) {
                            setShowAdvanced(false);
                          }
                        }, 50);
                      }
                    }}
                  >
                    <SettingsIcon size={16} className="text-gray-400" />
                    <span>Advanced</span>
                    <span className="ml-auto text-xs text-white/40">›</span>
                  </button>

                  {showAdvanced && advancedMenuPosition && createPortal(
                    <div 
                      className="context-menu-submenu fixed glass-panel rounded-lg py-1 min-w-[220px] max-h-[300px] z-[10000]"
                      style={{
                        left: `${advancedMenuPosition.x}px`,
                        top: `${advancedMenuPosition.y}px`,
                        overflow: 'hidden',
                        pointerEvents: 'auto'
                      }}
                      onMouseEnter={() => setShowAdvanced(true)}
                      onMouseLeave={() => setShowAdvanced(false)}
                    >
                      {/* File Attributes Section */}
                      {onSetAttributes && (
                        <>
                          <div className="px-3 py-1 text-xs text-white/40 select-none">File Attributes</div>
                          <div className="p-1">
                            <button
                              className="menu-item w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center gap-2"
                              onClick={() => { onSetAttributes({ hidden: false }); onClose(); }}
                            >
                              <Eye size={14} className="text-blue-400" />
                              <span>Show file</span>
                            </button>
                            <button
                              className="menu-item w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center gap-2"
                              onClick={() => { onSetAttributes({ hidden: true }); onClose(); }}
                            >
                              <EyeOff size={14} className="text-gray-400" />
                              <span>Hide file</span>
                            </button>
                            <button
                              className="menu-item w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center gap-2"
                              onClick={() => { onSetAttributes({ readOnly: false }); onClose(); }}
                            >
                              <Unlock size={14} className="text-green-400" />
                              <span>Remove read-only</span>
                            </button>
                            <button
                              className="menu-item w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center gap-2"
                              onClick={() => { onSetAttributes({ readOnly: true }); onClose(); }}
                            >
                              <Lock size={14} className="text-orange-400" />
                              <span>Make read-only</span>
                            </button>
                          </div>
                          <div className="h-px bg-white/10 my-1"></div>
                        </>
                      )}

                      {/* Security Section */}
                      {(settings.showHashOption || onScanWithDefender || onTakeOwnership) && (
                        <>
                          <div className="px-3 py-1 text-xs text-white/40 select-none">Security</div>
                          <div className="p-1">
                            {!item?.isDir && settings.showHashOption && (
                              <button
                                className="menu-item w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center gap-2"
                                onClick={handleAction(onCopyHash)}
                              >
                                <Hash size={14} className="text-yellow-400" />
                                <span>Copy checksum (SHA-256)</span>
                              </button>
                            )}
                            {onScanWithDefender && (
                              <button
                                className="menu-item w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center gap-2"
                                onClick={() => { onScanWithDefender(); onClose(); }}
                              >
                                <Shield size={14} className="text-purple-400" />
                                <span>Scan with Defender</span>
                              </button>
                            )}
                            {onTakeOwnership && (
                              <button
                                className="menu-item w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center gap-2"
                                onClick={() => { onTakeOwnership(); onClose(); }}
                              >
                                <UserCheck size={14} className="text-teal-400" />
                                <span>Take ownership</span>
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>,
                    document.body
                  )}
                </div>
              )}

              {/* Send To submenu */}
              {(onSendToDesktop || onPinToQuickAccess || settings.showShareOption) && (
                <div className="relative">
                  <button
                    className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const viewportWidth = window.innerWidth;
                      const viewportHeight = window.innerHeight;
                      
                      let x = rect.right + 4;
                      let y = rect.top;
                      
                      if (x + 220 > viewportWidth) {
                        x = Math.max(0, rect.left - 224);
                      }
                      
                      if (y + 200 > viewportHeight) {
                        y = Math.max(0, viewportHeight - 200);
                      }
                      
                      setSendToMenuPosition({ x, y });
                      setShowSendTo(true);
                    }}
                    onMouseLeave={(e) => {
                      const related = e.relatedTarget as HTMLElement;
                      if (!related?.closest('.sendto-submenu')) {
                        setTimeout(() => {
                          if (!document.querySelector('.sendto-submenu:hover')) {
                            setShowSendTo(false);
                          }
                        }, 50);
                      }
                    }}
                  >
                    <Send size={16} className="text-cyan-400" />
                    <span>Send to</span>
                    <span className="ml-auto text-xs text-white/40">›</span>
                  </button>

                  {showSendTo && sendToMenuPosition && createPortal(
                    <div 
                      className="sendto-submenu context-menu-submenu fixed glass-panel rounded-lg py-1 min-w-[200px] z-[10000]"
                      style={{
                        left: `${sendToMenuPosition.x}px`,
                        top: `${sendToMenuPosition.y}px`,
                        pointerEvents: 'auto'
                      }}
                      onMouseEnter={() => setShowSendTo(true)}
                      onMouseLeave={() => setShowSendTo(false)}
                    >
                      <div className="p-1">
                        {onSendToDesktop && (
                          <button
                            className="menu-item w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center gap-2"
                            onClick={() => { onSendToDesktop(); onClose(); }}
                          >
                            <Send size={14} className="text-blue-400" />
                            <span>Desktop</span>
                          </button>
                        )}
                        {onPinToQuickAccess && item?.isDir && (
                          <button
                            className="menu-item w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center gap-2"
                            onClick={() => { onPinToQuickAccess(); onClose(); }}
                          >
                            <Pin size={14} className="text-yellow-400" />
                            <span>Quick Access</span>
                          </button>
                        )}
                        {settings.showShareOption && onShare && (
                          <button
                            className="menu-item w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm flex items-center gap-2"
                            onClick={() => { onShare(); onClose(); }}
                          >
                            <Share2 size={14} className="text-green-400" />
                            <span>Share...</span>
                          </button>
                        )}
                      </div>
                    </div>,
                    document.body
                  )}
                </div>
              )}

              {settings.showFavorites && (
                <button 
                  className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                  onClick={onAddToFavorites}
                >
                  <Star size={16} className="text-yellow-400" />
                  <span>Add to favorites</span>
                </button>
              )}

              {settings.showTagging && (
                <button
                  className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                  onClick={onTag}
                >
                  <Tag size={16} className="text-pink-400" />
                  <span>Add tags...</span>
                </button>
              )}
            </div>

            <div className="h-px bg-white/10 my-1"></div>

            {/* Bottom actions */}
            <div className="p-1">
              <button
                className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                onClick={onRefresh}
              >
                <RefreshCw size={16} className="text-white/60" />
                <span>Refresh</span>
                <span className="ml-auto text-xs text-white/40">F5</span>
              </button>

              <button
                className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors"
                onClick={onProperties}
              >
                <Info size={16} className="text-white/60" />
                <span>Properties</span>
                <span className="ml-auto text-xs text-white/40">Alt+Enter</span>
              </button>
            </div>

            <div className="h-px bg-white/10 my-1"></div>

            {/* Delete */}
            <div className="p-1">
              <button
                className="menu-item w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/20 flex items-center gap-3 transition-colors text-red-400"
                onClick={() => { onDelete(); onClose(); }}
              >
                <Trash2 size={16} />
                <span>Delete</span>
                <span className="ml-auto text-xs text-white/40">Delete</span>
              </button>
            </div>
          </>
        )}

        {selectedCount > 1 && (
          <div className="px-3 py-2 text-xs text-white/40 border-t border-white/10">
            {selectedCount} items selected
          </div>
        )}
      </div>
    </div>
  )
}