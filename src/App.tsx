import type { ViewLayout, IconSize } from '@/types/api'
import { FileListSimple as FileList } from '@/components/FileListSimple'
import { EnhancedContextMenu } from '@/components/EnhancedContextMenu'
import { RenameInput } from '@/components/RenameInput'
import { TitleBar } from '@/components/TitleBar'
import { Folder, Settings, Trash2, ChevronRight, ChevronDown, ChevronLeft, FileText, List, LayoutGrid, Columns, AlignJustify, Type, Calendar, HardDrive, Tag, ArrowUp, ArrowDown, CheckSquare, FileType, EyeOff, RefreshCw } from 'lucide-react'
import { createPortal } from 'react-dom'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SettingsModal, AppSettings, defaultSettings } from '@/components/SettingsModal'
import { BookmarksManager } from '@/components/BookmarksManager'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setViewOptions } from '@/store/uiSlice'
import { addFavorite } from '@/store/favoritesSlice'
import { openTagDialog } from '@/store/tagsSlice'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'

// Load and apply saved theme colors
const loadSavedTheme = () => {
  const savedTheme = localStorage.getItem('xvser-custom-theme')
  if (savedTheme) {
    try {
      const theme = JSON.parse(savedTheme)
      // Apply theme colors
      document.documentElement.style.setProperty('--accent-color', theme.accentColor || '#007bff')
      console.log('Custom theme loaded from localStorage:', theme)
    } catch (error) {
      console.error('Failed to load custom theme:', error)
    }
  }
}

type DirEntry = {
  name: string
  path: string
  isDir: boolean
  size: number
  mtimeMs: number
  ext: string
}

// Fixed breadcrumb generation
function breadcrumbParts(path: string): Array<{ label: string; path: string }> {
  if (!path) return [];
  
  const isWindows = path.includes('\\');
  const separator = isWindows ? '\\' : '/';
  const normalizedPath = path.replace(/\/+/g, '/').replace(/\\+/g, '\\');
  const parts = normalizedPath.split(separator).filter(Boolean);
  
  const result = [];
  let currentPath = '';
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (isWindows && i === 0 && /^[A-Za-z]:$/.test(part)) {
      currentPath = part + separator;
      result.push({ label: part + separator, path: currentPath });
      continue;
    }
    
    currentPath = currentPath ? 
      currentPath + part + separator : 
      separator + part;
      
    result.push({ label: part, path: currentPath });
  }
  
  return result;
}

// Tree folder component for sidebar navigation
function TreeFolder({ 
  path, 
  name, 
  depth = 0,
  currentDir,
  setCurrentDir,
  pushHistory 
}: { 
  path: string;
  name: string;
  depth?: number;
  currentDir: string | null;
  setCurrentDir: (p: string) => void;
  pushHistory: (p: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<DirEntry[] | null>(null);
  const [loading, setLoading] = useState(false);

  const loadChildren = async () => {
    if (loading || children !== null) return;
    setLoading(true);
    try {
      const list = await window.xvser.list(path);
      setChildren(list.filter(e => e.isDir));
    } catch {
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!expanded) {
      await loadChildren();
    }
    setExpanded(!expanded);
  };

  const handleClick = () => {
    setCurrentDir(path);
    pushHistory(path);
  };

  const isActive = currentDir === path;
  const hasChildren = children === null || children.length > 0;

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5 text-sm text-left ${isActive ? 'bg-white/10' : ''}`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        <span onClick={toggleExpand} className="shrink-0 w-4 h-4 flex items-center justify-center cursor-pointer hover:bg-white/10 rounded">
          {loading ? (
            <span className="text-white/30 text-xs">⋯</span>
          ) : hasChildren ? (
            expanded ? <ChevronDown size={12} className="text-white/50" /> : <ChevronRight size={12} className="text-white/50" />
          ) : (
            <span className="w-3"></span>
          )}
        </span>
        <Folder size={14} className="shrink-0 text-yellow-500/80" />
        <span className="truncate">{name}</span>
      </button>
      {expanded && children && children.length > 0 && (
        <div>
          {children.map(child => (
            <TreeFolder
              key={child.path}
              path={child.path}
              name={child.name}
              depth={depth + 1}
              currentDir={currentDir}
              setCurrentDir={setCurrentDir}
              pushHistory={pushHistory}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function App() {
  useEffect(() => {
    loadSavedTheme()
  }, [])
  const dispatch = useAppDispatch()
  const viewOptions = useAppSelector(state => state.ui.viewOptions)
  const [currentDir, setCurrentDir] = useState<string | null>(null)
  const [entries, setEntries] = useState<DirEntry[]>([])
  const [fileClipboard, setFileClipboard] = useState<{ type: 'copy' | 'cut', paths: string[] } | null>(null)
  const cutItems = useMemo(() => fileClipboard?.type === 'cut' ? new Set(fileClipboard.paths) : new Set<string>(), [fileClipboard])
  const [icons, setIcons] = useState<Record<string, string | null>>({})
  const [viewMenuOpen, setViewMenuOpen] = useState(false)
  const viewBtnRef = useRef<HTMLButtonElement | null>(null)
  const previousSizeRef = useRef<'small' | 'normal' | 'large'>('normal')
  const [visibleRange, setVisibleRange] = useState<{ start: number; end: number }>({ start: 0, end: 50 })

  // Close view menu on outside click or Escape
  // Menu portal ref for click outside handling
  const viewMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const tgt = e.target as Node;
      const btn = viewBtnRef.current;
      const menu = viewMenuRef.current;
      
      if (!btn) return;
      // if click inside button or menu, leave it open
      if (btn.contains(tgt) || (menu && menu.contains(tgt))) return;
      // otherwise close
      setViewMenuOpen(false);
    };

    const onKey = (e: KeyboardEvent) => { 
      if (e.key === 'Escape') setViewMenuOpen(false);
    };

    if (viewMenuOpen) {
      // Use a slight delay to attach the listener to avoid immediate closure
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
      }, 0);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', onDown);
        document.removeEventListener('keydown', onKey);
      };
    }
  }, [viewMenuOpen]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [knownFolders, setKnownFolders] = useState<
    Array<{ name: string; path: string; icon: string }>
  >([]);
  const [freeSpace, setFreeSpace] = useState<number | null>(null)
  const [drives, setDrives] = useState<
    Array<{ name: string; path: string; type: 'drive' }>
  >([]);
  // Tabs state: multiple folders in parallel, like a browser
  interface TabState {
    id: string;
    dir: string | null;
    title: string;
    history: string[];
    historyIndex: number;
  }
  const genId = () => Math.random().toString(36).slice(2);
  const genTabTitle = (dir: string | null) => {
    if (!dir) return 'This PC';
    const parts = dir.split(/\\\\|\//).filter(Boolean);
    return parts[parts.length - 1] || dir;
  };
  const firstTabIdRef = useRef<string>(genId());
  const [tabs, setTabs] = useState<TabState[]>([
    { id: firstTabIdRef.current, dir: null, title: 'This PC', history: [], historyIndex: -1 }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>(firstTabIdRef.current);
  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId)!, [tabs, activeTabId]);
  const history = activeTab?.history ?? [];
  const historyIndex = activeTab?.historyIndex ?? -1;
  const [addr, setAddr] = useState<string>('');
  const [ctxMenu, setCtxMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    item?: DirEntry;
  }>({ visible: false, x: 0, y: 0 });
  const [leftWidth, setLeftWidth] = useState(220)
  const [isResizing, setIsResizing] = useState(false)
  const [isWindowResizing, setIsWindowResizing] = useState(false)
  const dragging = useRef<'left' | null>(null)
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [renameDialog, setRenameDialog] = useState<{ visible: boolean; path: string; name: string; x: number; y: number } | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('xvser-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        console.log('Loaded settings from localStorage:', parsed.theme, parsed.accentColor)
        return parsed
      } catch (error) {
        console.error('Failed to parse saved settings, using defaults:', error)
        return defaultSettings
      }
    }
    console.log('No saved settings found, using defaults')
    return defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      const settingsJson = JSON.stringify(settings)
      localStorage.setItem('xvser-settings', settingsJson)
      console.log('Settings saved to localStorage:', settings.theme, settings.accentColor)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }, [settings]);
  
  // Sync showSelectionCheckboxes with viewOptions
  useEffect(() => {
    if (settings.showSelectionCheckboxes !== viewOptions.showItemCheckboxes) {
      dispatch(setViewOptions({ showItemCheckboxes: settings.showSelectionCheckboxes }));
    }
  }, [settings.showSelectionCheckboxes, dispatch]);

  const saveSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
  }, []);

  const loadDir = useCallback(async (dir: string) => {
    setLoading(true);
    try {
      let list = await window.xvser.list(dir);
      
      // Apply settings filters
      if (!settings.showHiddenFiles) {
        list = list.filter(e => !e.name.startsWith('.'));
      }
      
      // Sort entries
      list = [...list].sort((a, b) => {
        // Group folders first if enabled
        if (settings.groupFolders) {
          if (a.isDir && !b.isDir) return -1;
          if (!a.isDir && b.isDir) return 1;
        }
        
        // Sort by selected criteria
        let comparison = 0;
        switch (settings.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'date':
            comparison = a.mtimeMs - b.mtimeMs;
            break;
          case 'size':
            comparison = a.size - b.size;
            break;
          case 'type':
            comparison = a.ext.localeCompare(b.ext);
            break;
        }
        
        return settings.sortOrder === 'desc' ? -comparison : comparison;
      });
      
      setEntries(list);
    } finally {
      setLoading(false);
    }
  }, [settings]);

  // Load Quick Access + drives on mount
  useEffect(() => {
    (async () => {
      const [kf, dv] = await Promise.all([
        window.xvser.getKnownFolders(),
        window.xvser.getDrives(),
      ]);
      setKnownFolders(kf);
      setDrives(dv);
    })();
  }, []);

  useEffect(() => {
    if (!currentDir) {
      setFreeSpace(null)
      return
    }

    loadDir(currentDir)

    // fetch free space for the current drive/folder
    ;(async () => {
      try {
        const fsBytes = await window.xvser.getFreeSpace(currentDir)
        setFreeSpace(fsBytes)
      } catch {
        setFreeSpace(null)
      }
    })()

    // Only watch files if setting is enabled
    if (settings.enableFileWatching) {
      window.xvser.setWatch(currentDir)
      const off = window.xvser.onFsChanged(() => {
        loadDir(currentDir)
      })
      return () => off()
    }
  }, [currentDir, loadDir, settings.enableFileWatching]);

  // Load icons for visible entries only (cache them with size)
  useEffect(() => {
    let active = true
    const abortController = new AbortController()
    const signal = abortController.signal

    ;(async () => {
      const sizeHint = viewOptions.iconSize === 'extra-large' || viewOptions.iconSize === 'large' ? 'large' : viewOptions.iconSize === 'medium' ? 'normal' : 'small'
      
      // Clear existing icons when size changes
      if (sizeHint !== previousSizeRef.current) {
        setIcons({})
        previousSizeRef.current = sizeHint
      }

      // Determine visible slice with smaller overscan to reduce load
      const start = Math.max(0, visibleRange.start - 10)
      const end = Math.min(entries.length, (visibleRange.end || 0) + 10)
      const visible = entries.slice(start, end)

      // Create cache keys with size included
      const cacheKeys = visible.map(e => `${e.path}:${sizeHint}`)
      const missing = visible.filter((e, i) => !icons[cacheKeys[i]])
      const missingKeys = cacheKeys.filter(key => !icons[key])
      
      if (missing.length === 0) return

      // Prioritize folders and non-media files (faster to load)
      const prioritized = missing.sort((a, b) => {
        if (a.isDir && !b.isDir) return -1
        if (!a.isDir && b.isDir) return 1
        
        const aExt = a.ext.toLowerCase()
        const bExt = b.ext.toLowerCase()
        const videoExts = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm']
        const aIsVideo = videoExts.includes(aExt)
        const bIsVideo = videoExts.includes(bExt)
        
        if (!aIsVideo && bIsVideo) return -1
        if (aIsVideo && !bIsVideo) return 1
        return 0
      })

      // Load icons in smaller batches with longer delays for videos
      const batchSize = 4 // Reduced batch size
      for (let i = 0; i < prioritized.length; i += batchSize) {
        if (!active || signal.aborted) break
        
        const batch = prioritized.slice(i, i + batchSize)
        const batchKeys = batch.map(e => `${e.path}:${sizeHint}`)
        
        // Process batch items sequentially to reduce memory pressure
        for (let j = 0; j < batch.length; j++) {
          if (!active || signal.aborted) break
          
          const e = batch[j]
          const key = batchKeys[j]
          
          try {
            // Skip if already loaded
            if (icons[key] !== undefined) continue
            
            const data = await window.xvser.getFileIcon(e.path, sizeHint)
            if (!active || signal.aborted) return
            
            setIcons(prev => ({ ...prev, [key]: data || null }))
          } catch {
            setIcons(prev => ({ ...prev, [key]: null }))
          }
          
          // Small delay between items to prevent overwhelming the system
          if (j < batch.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 10))
          }
        }

        // Longer delay between batches
        if (i + batchSize < prioritized.length) {
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }
    })()

    return () => { 
      active = false 
      abortController.abort()
    }
  }, [entries, viewOptions.iconSize, visibleRange, icons])

  // Sync address bar with currentDir
  useEffect(() => {
    if (currentDir) setAddr(currentDir);
    else setAddr('');
  }, [currentDir]);

  // Navigate within the active tab and push into its history
  const setActiveDir = useCallback((dir: string | null, pushIntoHistory: boolean = true) => {
    setCurrentDir(dir);
    setSelected(new Set());
    setTabs(prev => prev.map(t => {
      if (t.id !== activeTabId) return t;
      const newTitle = genTabTitle(dir);
      if (!pushIntoHistory) return { ...t, dir, title: newTitle };
      const nextHist = t.history.slice(0, t.historyIndex + 1);
      if (dir !== null) nextHist.push(dir);
      return { ...t, dir, title: newTitle, history: nextHist, historyIndex: t.historyIndex + 1 };
    }));
  }, [activeTabId]);

  const pushHistory = useCallback((dir: string | null) => {
    setActiveDir(dir, true);
  }, [setActiveDir]);

  // Open a directory in a brand new tab and activate it
  const openInNewTab = useCallback((dir: string | null, activate: boolean = true) => {
    const id = genId();
    const newTab: TabState = {
      id,
      dir,
      title: genTabTitle(dir),
      history: dir ? [dir] : [],
      historyIndex: dir ? 0 : -1,
    };
    setTabs(prev => [...prev, newTab]);
    if (activate) {
      setActiveTabId(id);
      setCurrentDir(dir);
      setSelected(new Set());
    }
  }, []);

  const chooseFolder = useCallback(async () => {
    const chosen = await window.xvser.chooseDir();
    if (chosen) {
      setCurrentDir(chosen);
      pushHistory(chosen);
      setSelected(new Set());
    }
  }, [pushHistory]);

  const onOpen = useCallback(async () => {
    if (selected.size === 0) return;
    const first = entries.find((e) => selected.has(e.path));
    if (!first) return;
    if (first.isDir) {
      // Open directories in a new tab
      openInNewTab(first.path);
    } else {
      await window.xvser.openPath(first.path);
    }
  }, [entries, selected]);

  const onDelete = useCallback(async () => {
    if (selected.size === 0 || !currentDir) return;
    if (settings.confirmDelete) {
      const confirm = window.confirm(`Move ${selected.size} item(s) to Recycle Bin?`);
      if (!confirm) return;
    }
    for (const p of selected) {
      await window.xvser.trash(p);
    }
    await loadDir(currentDir);
    setSelected(new Set());
  }, [selected, currentDir, loadDir, settings.confirmDelete]);

  const onRename = useCallback(async () => {
    if (selected.size !== 1 || !currentDir) return;
    const p = Array.from(selected)[0];
    const current = entries.find((e) => e.path === p);
    if (!current) return;
    
    // Show rename dialog at center of screen
    const x = window.innerWidth / 2 - 150;
    const y = window.innerHeight / 2 - 50;
    setRenameDialog({ visible: true, path: p, name: current.name, x, y });
  }, [selected, entries, currentDir]);

  const handleRenameConfirm = useCallback(async (newName: string) => {
    if (!renameDialog || !currentDir) return;
    try {
      const newPath = await window.xvser.rename(renameDialog.path, newName);
      // Force a complete reload to ensure Windows Explorer sees the change
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for filesystem
      await loadDir(currentDir);
      // Select the renamed item
      if (newPath) {
        setSelected(new Set([newPath]));
      }
    } catch (error) {
      console.error('Rename failed:', error);
      alert('Failed to rename: ' + (error as Error).message);
    } finally {
      setRenameDialog(null);
    }
  }, [renameDialog, currentDir, loadDir]);

  const onNewFolder = useCallback(async () => {
    if (!currentDir) return;
    const created = await window.xvser.newFolder(currentDir);
    await loadDir(currentDir);
    setSelected(new Set([created]));
  }, [currentDir, loadDir]);

  const toggleSelect = (p: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const allSelected = useMemo(() => selected.size > 0 && selected.size === entries.length, [selected, entries]);
  const toggleSelectAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(entries.map((e) => e.path)));
  };

  const canGoUp = useMemo(() => !!currentDir && getParent(currentDir) !== null, [currentDir]);
  const goUp = () => {
    if (!currentDir) return;
    const p = getParent(currentDir);
    if (p) {
      setCurrentDir(p);
      pushHistory(p);
    } else {
      setCurrentDir(null);
      pushHistory(null);
    }
  };

  const canBack = historyIndex > 0;
  const canForward = historyIndex >= 0 && historyIndex < history.length - 1;
  const goBack = () => {
    if (!canBack) return;
    const idx = historyIndex - 1;
    const newDir = history[idx];
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, historyIndex: idx, dir: newDir, title: genTabTitle(newDir) } : t));
    setCurrentDir(newDir);
    setSelected(new Set());
  };
  const goForward = () => {
    if (!canForward) return;
    const idx = historyIndex + 1;
    const newDir = history[idx];
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, historyIndex: idx, dir: newDir, title: genTabTitle(newDir) } : t));
    setCurrentDir(newDir);
    setSelected(new Set());
  };

  const onAddressGo = async () => {
    if (!addr) return;
    try {
      const list = await window.xvser.list(addr);
      if (Array.isArray(list)) {
        setCurrentDir(addr);
        pushHistory(addr);
      }
    } catch {}
  };

  const onRowContext = (e: React.MouseEvent, item: DirEntry) => {
    e.preventDefault();
    
    // Auto-select item on right-click if enabled
    if (settings.selectOnRightClick && !selected.has(item.path)) {
      setSelected(new Set([item.path]));
    }
    
    setCtxMenu({ visible: true, x: e.clientX, y: e.clientY, item });
  };
  const closeCtx = () => setCtxMenu((m) => ({ ...m, visible: false }));
  const ctxOpen = async () => { if (ctxMenu.item) { if (ctxMenu.item.isDir) { openInNewTab(ctxMenu.item.path) } else { await window.xvser.openPath(ctxMenu.item.path) } } closeCtx() }
  const ctxReveal = async () => { if (ctxMenu.item) await window.xvser.revealInFolder(ctxMenu.item.path); closeCtx() }
  const ctxRename = () => { 
    if (!ctxMenu.item) return;
    const x = ctxMenu.x;
    const y = ctxMenu.y + 20;
    setRenameDialog({ visible: true, path: ctxMenu.item.path, name: ctxMenu.item.name, x, y });
    closeCtx();
  }
  const ctxDelete = async () => { 
    if (!ctxMenu.item || !currentDir) return; 
    if (settings.confirmDelete) {
      const ok = window.confirm(`Move "${ctxMenu.item.name}" to Recycle Bin?`); 
      if (!ok) return;
    }
    await window.xvser.trash(ctxMenu.item.path); 
    await loadDir(currentDir); 
    closeCtx();
  }

  const selectedTotalSize = useMemo(() => {
    let s = 0
    for (const p of selected) {
      const e = entries.find(en => en.path === p)
      if (e && !e.isDir) s += e.size
    }
    return s
  }, [selected, entries])

  const folderTotalSize = useMemo(() => {
    return entries.reduce((acc, e) => acc + (e.isDir ? 0 : e.size), 0)
  }, [entries])

  // Apply settings effects
  useEffect(() => {
    console.log('Applying settings:', {
      theme: settings.theme,
      accentColor: settings.accentColor,
      fontSize: settings.fontSize,
      animationsEnabled: settings.animationsEnabled
    })
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', settings.theme);
    
    // Apply accent color
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
    
    // Apply font size
    const fontSizeMap = { small: '12px', medium: '14px', large: '16px' };
    document.documentElement.style.setProperty('--base-font-size', fontSizeMap[settings.fontSize]);
    
    // Apply animations
    if (!settings.animationsEnabled) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
    } else {
      document.documentElement.style.setProperty('--animation-duration', '0.2s');
    }
    
    console.log('Theme applied successfully')
  }, [settings]);

  // Remember last location
  useEffect(() => {
    if (settings.rememberLastLocation && currentDir) {
      localStorage.setItem('xvser-last-location', currentDir);
    }
  }, [currentDir, settings.rememberLastLocation]);

  // Load last location on mount
  useEffect(() => {
    if (settings.rememberLastLocation) {
      const lastLocation = localStorage.getItem('xvser-last-location');
      if (lastLocation) {
        setCurrentDir(lastLocation);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear cache on exit if enabled
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (settings.clearCacheOnExit) {
        // Clear thumbnails and other cached data
        localStorage.removeItem('xvser-thumbnail-cache');
        localStorage.removeItem('xvser-preview-cache');
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [settings.clearCacheOnExit]);

  // Handle window resize to disable animations during resize
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout
    
    const handleResize = () => {
      setIsWindowResizing(true)
      document.body.classList.add('is-resizing')
      
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        setIsWindowResizing(false)
        document.body.classList.remove('is-resizing')
      }, 150)
    }
    
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimer)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + Left Arrow = Back
      if (e.altKey && e.key === 'ArrowLeft' && canBack) {
        e.preventDefault();
        goBack();
      }
      // Alt + Right Arrow = Forward
      if (e.altKey && e.key === 'ArrowRight' && canForward) {
        e.preventDefault();
        goForward();
      }
      // Alt + Up Arrow = Up
      if (e.altKey && e.key === 'ArrowUp' && canGoUp) {
        e.preventDefault();
        goUp();
      }
      // Backspace = Up (like Windows Explorer)
      if (e.key === 'Backspace' && canGoUp && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        goUp();
      }
      // F2 = Rename
      if (e.key === 'F2' && selected.size === 1) {
        e.preventDefault();
        onRename();
      }
      // Delete = Move to trash
      if (e.key === 'Delete' && selected.size > 0) {
        e.preventDefault();
        onDelete();
      }
      // Ctrl + A = Select all
      if (e.ctrlKey && e.key === 'a' && currentDir) {
        e.preventDefault();
        toggleSelectAll();
      }
      // F5 = Refresh
      if (e.key === 'F5' && currentDir) {
        e.preventDefault();
        loadDir(currentDir);
      }
      // Enter = Open selected
      if (e.key === 'Enter' && selected.size > 0) {
        e.preventDefault();
        onOpen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canBack, canForward, canGoUp, goBack, goForward, goUp, selected, onRename, onDelete, toggleSelectAll, currentDir, loadDir, onOpen]);

  // Handle file/folder click based on settings
  // Enhanced file selection with Ctrl and Shift support
  const [lastClickedIndex, setLastClickedIndex] = useState<number>(-1);
  const [dragSelecting, setDragSelecting] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const selectionBoxRef = useRef<HTMLDivElement>(null);
  const lastClickRef = useRef<{ path: string; time: number, clicks: number } | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Mouse coordinates relative to file list container
  const getRelativeCoords = useCallback((event: React.MouseEvent | MouseEvent) => {
    const container = document.querySelector('.file-list-container');
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    return {
      x: event.clientX - rect.left + container.scrollLeft,
      y: event.clientY - rect.top + container.scrollTop
    };
  }, []);

  const handleItemClick = useCallback((item: DirEntry, event: React.MouseEvent) => {
    const itemIndex = entries.findIndex(e => e.path === item.path);
    const now = Date.now();

    // Handle Ctrl+Click - toggle selection without affecting other items
    if (event.ctrlKey && settings.enableMultiSelect) {
      event.preventDefault();
      event.stopPropagation();
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      lastClickRef.current = null;
      toggleSelect(item.path);
      setLastClickedIndex(itemIndex);
      return;
    }
    
    // Handle Shift+Click - select range from last clicked to current
    if (event.shiftKey && settings.enableRangeSelect && lastClickedIndex !== -1) {
      event.preventDefault();
      event.stopPropagation();
      
      // Build new selection from range
      const newSelection = new Set<string>();
      const rangeStart = Math.min(lastClickedIndex, itemIndex);
      const rangeEnd = Math.max(lastClickedIndex, itemIndex);
      for (let i = rangeStart; i <= rangeEnd; i++) {
        newSelection.add(entries[i].path);
      }
      setSelected(newSelection);
      return;
    }

    // Improved double-click detection
    const prev = lastClickRef.current;
    if (prev && prev.path === item.path && (now - prev.time) < 500) {
      // This is a double-click
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      lastClickRef.current = null;
      
      // Execute double-click action
      if (item.isDir) {
        openInNewTab(item.path, !event.ctrlKey);
      } else {
        window.xvser.openPath(item.path);
      }
      return;
    }

    // Single click - update selection after a brief delay
    // This prevents selection flash when user double-clicks
    lastClickRef.current = { path: item.path, time: now, clicks: 1 };
    
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    clickTimeoutRef.current = setTimeout(() => {
      // Only select if there wasn't a second click
      if (lastClickRef.current?.path === item.path) {
        setSelected(new Set([item.path]));
        setLastClickedIndex(itemIndex);
      }
    }, 200);
  }, [settings.enableMultiSelect, settings.enableRangeSelect, entries, lastClickedIndex, toggleSelect, openInNewTab]);

  // Handle drag selection start
  const handleDragStart = useCallback((event: React.MouseEvent) => {
    if (!settings.enableDragSelect) return;
    
    // Only start drag selection on left mouse button
    if (event.button !== 0) return;
    
    const coords = getRelativeCoords(event);
    setDragSelecting(true);
    setDragStart(coords);
    setDragCurrent(coords);

    // Add global mouse move and up handlers
    const onMouseMove = (e: MouseEvent) => {
      setDragCurrent(getRelativeCoords(e));
    };

    const onMouseUp = () => {
      setDragSelecting(false);
      setDragStart(null);
      setDragCurrent(null);
      
      // Calculate which items are in the selection box
      if (selectionBoxRef.current) {
        const box = selectionBoxRef.current.getBoundingClientRect();
        const newSelection = new Set<string>();
        
        // Check each visible item against the selection box
        const items = document.querySelectorAll('.file-list-item');
        items.forEach((item) => {
          const rect = item.getBoundingClientRect();
          if (rect.left < box.right && 
              rect.right > box.left && 
              rect.top < box.bottom && 
              rect.bottom > box.top) {
            const path = item.getAttribute('data-path');
            if (path) newSelection.add(path);
          }
        });
        
        setSelected(newSelection);
      }

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [settings.enableDragSelect, getRelativeCoords]);

  // Use native double-click as backup
  const handleItemDoubleClick = useCallback((item: DirEntry) => {
    // Clear any pending single-click timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    lastClickRef.current = null;
    
    // Execute double-click action
    if (item.isDir) {
      openInNewTab(item.path, true);
    } else {
      window.xvser.openPath(item.path);
    }
  }, [openInNewTab]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // Copy path to clipboard
  const copyPathToClipboard = useCallback(async (path: string) => {
    try {
      await navigator.clipboard.writeText(path);
      // TODO: Show toast notification
    } catch (err) {
      console.error('Failed to copy path:', err);
    }
  }, []);

  // Tab context menu
  const [tabMenu, setTabMenu] = useState<{ visible: boolean, x: number, y: number, tabId: string | null }>({ visible: false, x: 0, y: 0, tabId: null });
  const closeTabMenu = useCallback(() => setTabMenu(m => ({ ...m, visible: false })), []);

  const closeTabById = useCallback((id: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(x => x.id === id);
      if (idx === -1) return prev;
      const next = prev.slice(0, idx).concat(prev.slice(idx + 1));
      if (id === activeTabId) {
        if (next.length === 0) {
          const id2 = genId();
          const newTab: TabState = { id: id2, dir: null, title: 'This PC', history: [], historyIndex: -1 };
          setActiveTabId(id2);
          setCurrentDir(null);
          setSelected(new Set());
          return [newTab];
        }
        const neighbor = next[Math.max(0, idx - 1)];
        setActiveTabId(neighbor.id);
        setCurrentDir(neighbor.dir);
        setSelected(new Set());
      }
      return next;
    });
  }, [activeTabId]);

  const duplicateTabById = useCallback((id: string) => {
    setTabs(prev => {
      const src = prev.find(t => t.id === id);
      if (!src) return prev;
      const id2 = genId();
      const clone: TabState = { id: id2, dir: src.dir, title: genTabTitle(src.dir), history: [...src.history], historyIndex: src.historyIndex };
      setActiveTabId(id2);
      setCurrentDir(src.dir);
      setSelected(new Set());
      return [...prev, clone];
    });
  }, []);

  const closeOthers = useCallback((id: string) => {
    setTabs(prev => {
      const keep = prev.find(t => t.id === id);
      if (!keep) return prev;
      setActiveTabId(id);
      setCurrentDir(keep.dir);
      setSelected(new Set());
      return [keep];
    });
  }, []);

  const closeToRight = useCallback((id: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx === -1) return prev;
      const kept = prev.slice(0, idx + 1);
      const activeStillThere = kept.some(t => t.id === activeTabId);
      if (!activeStillThere) {
        const last = kept[kept.length - 1];
        setActiveTabId(last.id);
        setCurrentDir(last.dir);
        setSelected(new Set());
      }
      return kept;
    });
  }, [activeTabId]);

  useEffect(() => {
    const onDocMouseDown = () => closeTabMenu();
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeTabMenu(); };
    window.addEventListener('mousedown', onDocMouseDown);
    window.addEventListener('keydown', onEsc);
    return () => { window.removeEventListener('mousedown', onDocMouseDown); window.removeEventListener('keydown', onEsc); };
  }, [closeTabMenu]);

  // Persist tabs across restarts
  useEffect(() => {
    try {
      const state = JSON.stringify({ tabs, activeTabId });
      localStorage.setItem('xvser-tabs-state', state);
    } catch {}
  }, [tabs, activeTabId]);

  // Restore tabs on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('xvser-tabs-state');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.tabs) && parsed.tabs.length > 0) {
          const loadedTabs: TabState[] = parsed.tabs.map((t: any) => ({
            id: String(t.id),
            dir: t.dir ?? null,
            title: genTabTitle(t.dir ?? null),
            history: Array.isArray(t.history) ? t.history.map((x: any) => String(x)) : [],
            historyIndex: typeof t.historyIndex === 'number' ? t.historyIndex : (t.history?.length ? t.history.length - 1 : -1),
          }));
          const actId: string = String(parsed.activeTabId ?? loadedTabs[0].id);
          setTabs(loadedTabs);
          const active = loadedTabs.find(t => t.id === actId) ?? loadedTabs[0];
          setActiveTabId(active.id);
          setCurrentDir(active.dir ?? null);
          setSelected(new Set());
        }
      }
    } catch {}
  }, []);

  return (
    <div 
      className={`h-full flex flex-col overflow-hidden rounded-xl ${settings.compactMode ? 'compact-mode' : ''} ${!settings.glassEffect ? 'no-glass' : ''} ${isWindowResizing ? 'window-resizing' : ''}`}
      style={{ 
        fontSize: settings.fontSize === 'small' ? '12px' : settings.fontSize === 'large' ? '16px' : '14px',
        contain: 'layout style paint',
        borderRadius: '14px',
        willChange: isWindowResizing ? 'contents' : 'auto'
      }}
    >
      {/* Custom Title Bar */}
      <TitleBar />

      {/* Top toolbar */}
      <div className="glass-panel mx-2 mt-2 px-3 py-2 flex items-center gap-3 shrink-0 rounded-xl border border-white/5" style={{animationDelay: '0s'}}>
          {/* Tabs bar */}
          <div className="glass-panel mx-2 mt-2 px-2 py-1 flex items-center gap-1 overflow-x-auto rounded-xl border border-white/5">
            {tabs.map(t => (
                  <button
                key={t.id}
                onClick={() => { const tab = tabs.find(x => x.id === t.id); setActiveTabId(t.id); setCurrentDir(tab?.dir ?? null); setSelected(new Set()); }}
                onContextMenu={(e) => { e.preventDefault(); setTabMenu({ visible: true, x: e.clientX, y: e.clientY, tabId: t.id }); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${t.id === activeTabId ? 'bg-white/10' : 'hover:bg-white/8'}`}
                title={t.dir || 'This PC'}
              >
                <span className="truncate max-w-[160px]">{t.title}</span>
                  <span
                  className="opacity-70 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTabById(t.id);
                  }}
                >
                  ×
                </span>
              </button>
            ))}
            <button
              onClick={() => openInNewTab(null, true)}
              className="ml-1 px-2 py-1 rounded-md hover:bg-white/8"
              title="New tab"
            >
              +
            </button>
          </div>

          {/* Tab context menu portal */}
          {tabMenu.visible && createPortal(
            <div
              className="fixed z-[9999] w-48 rounded-lg shadow-2xl backdrop-blur-xl view-menu"
              style={{ left: tabMenu.x, top: tabMenu.y, animation: 'menuPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) both' }}
              onMouseDown={e => e.stopPropagation()}
            >
              <div className="overflow-hidden view-menu-border rounded-lg">
                <button className="w-full text-left px-3 py-2 hover:bg-white/10 text-sm" onClick={() => { if (tabMenu.tabId) closeTabById(tabMenu.tabId); closeTabMenu(); }}>Close</button>
                <button className="w-full text-left px-3 py-2 hover:bg-white/10 text-sm" onClick={() => { if (tabMenu.tabId) closeOthers(tabMenu.tabId); closeTabMenu(); }}>Close others</button>
                <button className="w-full text-left px-3 py-2 hover:bg-white/10 text-sm" onClick={() => { if (tabMenu.tabId) closeToRight(tabMenu.tabId); closeTabMenu(); }}>Close to the right</button>
                <button className="w-full text-left px-3 py-2 hover:bg-white/10 text-sm" onClick={() => { if (tabMenu.tabId) duplicateTabById(tabMenu.tabId); closeTabMenu(); }}>Duplicate</button>
              </div>
            </div>,
            document.body
          )}

          <div className="flex items-center gap-1">
          <button onClick={goBack} disabled={!canBack} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${canBack ? 'hover:bg-white/8' : 'opacity-40 cursor-not-allowed'}`}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={goForward} disabled={!canForward} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${canForward ? 'hover:bg-white/8' : 'opacity-40 cursor-not-allowed'}`}>
            <ChevronRight size={16} />
          </button>
          <button onClick={goUp} disabled={!canGoUp} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${canGoUp ? 'hover:bg-white/8' : 'opacity-40 cursor-not-allowed'}`}>
            <ChevronRight size={16} className="rotate-[-90deg]" />
          </button>
        </div>
        {settings.showAddressBar && (
          <div className="flex-1 mx-3">
            <input
              placeholder={currentDir ? currentDir : 'This PC'}
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onAddressGo() }}
              className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-md outline-none focus:ring-1 focus:ring-brand/50 focus:border-brand/50 text-sm"
            />
          </div>
        )}
        {!settings.showAddressBar && <div className="flex-1"></div>}
        <div className="flex items-center gap-1.5">
          <button onClick={onNewFolder} disabled={!currentDir} className="px-3 py-1.5 rounded-md bg-brand/15 hover:bg-brand/25 text-sm font-medium disabled:opacity-40">New</button>
          <div className="relative">
            <button ref={viewBtnRef} onClick={() => setViewMenuOpen(v => !v)} className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/8 text-sm font-medium">View</button>
            {viewMenuOpen && createPortal(
              <div 
                ref={viewMenuRef}
                className="fixed right-4 top-14 z-[9999] w-[280px] rounded-xl shadow-2xl backdrop-blur-xl view-menu"
                style={{ 
                  animation: 'menuPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
                  maxHeight: 'calc(100vh - 120px)'
                }}
              >
                <div className="overflow-y-auto overflow-x-hidden" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                  {/* Header */}
                  <div className="px-4 py-2 border-b view-menu-border">
                    <div className="text-sm font-semibold view-menu-text">View Options</div>
                    <div className="text-xs view-menu-text-muted mt-0.5">Customize how files are displayed</div>
                  </div>

                  {/* Layout Section */}
                  <div className="px-2 py-2">
                    <div className="px-2 py-1 text-[10px] uppercase tracking-wider view-menu-label font-semibold">Layout</div>
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      {[
                        { value: 'details', label: 'Details', icon: AlignJustify },
                        { value: 'tiles', label: 'Tiles', icon: LayoutGrid },
                        { value: 'list', label: 'List', icon: List },
                        { value: 'content', label: 'Content', icon: Columns }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(setViewOptions({ layout: value as ViewLayout }));
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-all duration-200 flex items-center gap-2 ${
                            viewOptions.layout === value 
                              ? 'view-menu-active' 
                              : 'view-menu-item'
                          }`}
                        >
                          <Icon size={16} />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Icon Size Section */}
                  <div className="px-2 py-2 border-t view-menu-border">
                    <div className="px-2 py-1 text-[10px] uppercase tracking-wider view-menu-label font-semibold">Icon Size</div>
                    <div className="flex gap-1 mt-1">
                      {[
                        { value: 'small', label: 'S' },
                        { value: 'medium', label: 'M' },
                        { value: 'large', label: 'L' },
                        { value: 'extra-large', label: 'XL' }
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(setViewOptions({ iconSize: value as IconSize }));
                          }}
                          className={`flex-1 px-2 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            viewOptions.iconSize === value 
                              ? 'view-menu-size-active' 
                              : 'view-menu-size'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort Section */}
                  <div className="px-2 py-2 border-t view-menu-border">
                    <div className="px-2 py-1 text-[10px] uppercase tracking-wider view-menu-label font-semibold">Sort By</div>
                    <div className="space-y-0.5 mt-1">
                      {[
                        { value: 'name', label: 'Name', icon: Type },
                        { value: 'date', label: 'Date Modified', icon: Calendar },
                        { value: 'size', label: 'Size', icon: HardDrive },
                        { value: 'type', label: 'Type', icon: Tag }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSettings(prev => ({ ...prev, sortBy: value as any }));
                          }}
                          className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all duration-200 flex items-center justify-between ${
                            settings.sortBy === value 
                              ? 'view-menu-sort-active' 
                              : 'view-menu-sort'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon size={14} />
                            <span>{label}</span>
                          </span>
                          {settings.sortBy === value && (
                            <span className="text-brand">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                    {/* Sort Order Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSettings(prev => ({
                          ...prev,
                          sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                        }));
                      }}
                      className="w-full mt-1 px-3 py-2 rounded-lg text-sm view-menu-item transition-all duration-200 flex items-center justify-between"
                    >
                      <span>Order: {settings.sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                      {settings.sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </button>
                  </div>

                  {/* Display Options */}
                  <div className="px-2 py-2 border-t view-menu-border">
                    <div className="px-2 py-1 text-[10px] uppercase tracking-wider view-menu-label font-semibold">Display</div>
                    <div className="space-y-1 mt-1">
                      <label className="flex items-center justify-between px-3 py-2 rounded-lg view-menu-toggle cursor-pointer transition-all duration-200">
                        <span className="flex items-center gap-2 text-sm view-menu-text-muted">
                          <CheckSquare size={14} />
                          <span>Item checkboxes</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.showSelectionCheckboxes || !!viewOptions.showItemCheckboxes}
                          onChange={(e) => {
                            e.stopPropagation();
                            const checked = e.target.checked;
                            setSettings(prev => ({ ...prev, showSelectionCheckboxes: checked }));
                            dispatch(setViewOptions({ showItemCheckboxes: checked }));
                          }}
                          className="w-4 h-4"
                        />
                      </label>
                      <label className="flex items-center justify-between px-3 py-2 rounded-lg view-menu-toggle cursor-pointer transition-all duration-200">
                        <span className="flex items-center gap-2 text-sm view-menu-text-muted">
                          <FileType size={14} />
                          <span>File extensions</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.showFileExtensions}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSettings(prev => ({ ...prev, showFileExtensions: e.target.checked }));
                          }}
                          className="w-4 h-4"
                        />
                      </label>
                      <label className="flex items-center justify-between px-3 py-2 rounded-lg view-menu-toggle cursor-pointer transition-all duration-200">
                        <span className="flex items-center gap-2 text-sm view-menu-text-muted">
                          <EyeOff size={14} />
                          <span>Hidden files</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.showHiddenFiles}
                          onChange={(e) => {
                            e.stopPropagation();
                            const checked = e.target.checked;
                            setSettings(prev => ({ ...prev, showHiddenFiles: checked }));
                            if (currentDir) loadDir(currentDir);
                          }}
                          className="w-4 h-4"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="px-2 py-2 border-t view-menu-border">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentDir) loadDir(currentDir);
                        setViewMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-lg text-sm view-menu-item transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={14} />
                      <span>Refresh View</span>
                    </button>
                  </div>
                </div>
              </div>, document.body)}
          </div>
          <button onClick={onOpen} disabled={selected.size === 0} className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/8 text-sm font-medium disabled:opacity-40">Open</button>
          <button onClick={onDelete} disabled={selected.size === 0} className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/8 text-sm font-medium disabled:opacity-40"><Trash2 size={14} /></button>
          <div className="w-px h-5 bg-white/10"></div>
          
          <ThemeToggle />
        </div>
      </div>

      {/* Main content area */}
      <div
        className="flex-1 min-h-0 flex gap-0 px-2 pb-2 overflow-hidden"
        style={{ contain: 'layout style' }}
        onMouseMove={(e) => {
          if (!dragging.current) return;
          if (dragging.current === 'left') {
            requestAnimationFrame(() => {
              setLeftWidth((w) => Math.max(180, Math.min(400, w + e.movementX)));
            });
            setIsResizing(true);
          }
        }}
        onMouseUp={() => {
          dragging.current = null;
          setTimeout(() => setIsResizing(false), 50);
        }}
        onMouseLeave={() => {
          dragging.current = null;
          setTimeout(() => setIsResizing(false), 50);
        }}
      >
        {/* Left navigation pane */}
        <div 
          className="glass-panel rounded-xl p-3 overflow-auto shrink-0 border border-white/5" 
          style={{ 
            width: `${leftWidth}px`, 
            animationDelay: '0.05s',
            transition: isResizing ? 'none' : 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: isResizing ? 'width' : 'auto',
            contain: 'layout style paint'
          }}
        >
          <div className="text-xs uppercase tracking-wide text-white/40 mb-2 px-2 font-semibold">Quick Access</div>
          <div className="space-y-0.5 mb-4">
            {knownFolders.map(k => (
              <button 
                key={k.path} 
                onClick={() => { /* open Quick Access in a new tab */ openInNewTab(k.path); }} 
                onAuxClick={(e) => { if (e.button === 1) openInNewTab(k.path, false) }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-white/6 text-sm text-left transition-colors ${currentDir === k.path ? 'bg-white/10 font-medium' : ''}`}
              >
                <Folder size={16} className="shrink-0 text-blue-400/80"/> <span className="truncate">{k.name}</span>
              </button>
            ))}
          </div>
          <div className="text-xs uppercase tracking-wide text-white/40 mb-2 px-2 font-semibold">This PC</div>
          <div className="space-y-0.5">
            <button 
              onClick={() => openInNewTab(null)} 
              onAuxClick={(e) => { if (e.button === 1) openInNewTab(null, false) }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-white/6 text-sm text-left transition-colors ${currentDir === null ? 'bg-white/10 font-medium' : ''}`}
            >
              <Folder size={16} className="shrink-0 text-gray-400"/> <span>This PC</span>
            </button>
            {drives.map(d => (
              <TreeFolder
                key={d.path}
                path={d.path}
                name={d.name}
                currentDir={currentDir}
                setCurrentDir={setCurrentDir}
                pushHistory={pushHistory}
              />
            ))}
          </div>
          
          {/* Settings button at bottom */}
          <div className="mt-auto pt-3 border-t border-white/8">
            <button 
              onClick={() => setSettingsOpen(true)} 
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-white/6 text-sm text-left transition-colors"
            >
              <Settings size={16} className="shrink-0"/> <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Resizer */}
        <div
          onMouseDown={() => (dragging.current = 'left')}
          className="w-1 cursor-col-resize hover:bg-brand/20 shrink-0"
        />

        {/* Center content pane with optional preview */}
        <div className="flex-1 min-w-0 flex gap-0 overflow-hidden" style={{ contain: 'layout' }}>
        <div className={`${settings.showPreview ? 'flex-1' : 'w-full'} min-w-0 glass-panel rounded-xl overflow-hidden flex flex-col border border-white/5`} style={{animationDelay: '0.1s', contain: 'layout style paint'}}>
          {currentDir ? (
            <>
              {/* Breadcrumb */}
              {settings.showBreadcrumbs && (
                <div className="px-3 py-2 text-white/70 text-xs border-b border-white/10 flex items-center gap-1 flex-wrap bg-white/5 shrink-0" style={{animation: 'fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'}}>
                  {breadcrumbParts(currentDir).map((seg, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i>0 && <span className="text-white/30">›</span>}
                      <button 
                        onClick={() => { openInNewTab(seg.path, true); }} 
                        onAuxClick={(e) => { if (e.button === 1) openInNewTab(seg.path, false) }} 
                        className="hover:underline text-white/80 transition-all"
                      >
                        {seg.label}
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* File content area */}
              <div className="flex-1 overflow-hidden min-h-0">
                <FileList
                  entries={entries}
                  loading={loading}
                  selected={selected}
                  cutItems={cutItems}
                  icons={icons}
                  viewOptions={viewOptions}
                  settings={settings}
                  allSelected={allSelected}
                  onToggleSelectAll={toggleSelectAll}
                  onToggleSelect={toggleSelect}
                  onEntryClick={(entry, event) => handleItemClick(entry, event)}
                  onEntryDoubleClick={entry => handleItemDoubleClick(entry)}
                  onContextMenu={onRowContext}
                  onBackgroundContextMenu={(e) => {
                    setCtxMenu({ visible: true, x: e.clientX, y: e.clientY, item: undefined });
                  }}
                  onVisibleRangeChange={(start, end) => setVisibleRange({ start, end })}
                  onEntryAuxClick={(entry, evt) => {
                    if ((evt as React.MouseEvent).button === 1) {
                      if (entry.isDir) openInNewTab(entry.path, false)
                      else window.xvser.openPath(entry.path)
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <>
              {/* This PC header */}
              <div className="px-3 py-2 text-white/70 text-xs border-b border-white/10 bg-white/5 shrink-0 font-semibold">This PC</div>
              
              {/* This PC content */}
              <div className="flex-1 overflow-auto p-6 space-y-8 min-h-0">
                <div>
                  <div className="text-white/70 mb-4 text-sm font-semibold">Folders</div>
                  <div className="grid grid-cols-4 gap-4">
                    {knownFolders.map(k => (
                      <button key={k.path} onClick={() => { openInNewTab(k.path); }} onAuxClick={(e) => { if (e.button === 1) openInNewTab(k.path, false) }} className="glass-panel rounded-lg p-4 text-left hover:bg-white/10 transition-colors">
                        <div className="text-3xl mb-2">📁</div>
                        <div className="font-medium text-sm">{k.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-white/70 mb-4 text-sm font-semibold">Devices and drives</div>
                  <div className="grid grid-cols-4 gap-4">
                    {drives.map(d => (
                      <button key={d.path} onClick={() => { openInNewTab(d.path); }} onAuxClick={(e) => { if (e.button === 1) openInNewTab(d.path, false) }} className="glass-panel rounded-lg p-4 text-left hover:bg-white/10 transition-colors">
                        <div className="text-3xl mb-2">💾</div>
                        <div className="font-medium text-sm">{d.name}</div>
                        <div className="text-xs text-white/40 mt-1">{d.path}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <BookmarksManager onNavigate={(path) => openInNewTab(path, true)} />
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Preview pane */}
        {settings.showPreview && (
          <>
            {/* Resizer */}
            <div className="w-1 cursor-col-resize hover:bg-brand/20 shrink-0" />
            
            {/* Preview panel */}
            <div className="w-80 glass-panel rounded-xl overflow-hidden flex flex-col border border-white/5 ml-2 preview-pane-enter">
              <div className="px-3 py-2 text-xs border-b border-white/10 bg-white/5 shrink-0 font-semibold">Preview</div>
              <div className="flex-1 overflow-auto p-4">
                {selected.size === 1 ? (
                  <div className="space-y-4">
                    {(() => {
                      const p = Array.from(selected)[0]
                      const entry = entries.find(e => e.path === p)
                      if (!entry) return <div className="text-white/40 text-sm">No file selected</div>
                      
                      const iconKey = `${entry.path}:large`
                      const iconData = icons[iconKey]
                      
                      return (
                        <>
                          {/* Icon/Thumbnail */}
                          <div className="flex justify-center">
                            {iconData ? (
                              <img src={iconData} alt={entry.name} className="max-w-full max-h-48 rounded-lg" />
                            ) : (
                              <div className="w-32 h-32 bg-white/5 rounded-lg flex items-center justify-center">
                                {entry.isDir ? <Folder size={64} className="text-white/40" /> : <FileText size={64} className="text-white/40" />}
                              </div>
                            )}
                          </div>
                          
                          {/* File info */}
                          <div className="space-y-2">
                            <div>
                              <div className="text-xs text-white/50 mb-1">Name</div>
                              <div className="text-sm font-medium break-all">{entry.name}</div>
                            </div>
                            
                            <div>
                              <div className="text-xs text-white/50 mb-1">Type</div>
                              <div className="text-sm">{entry.isDir ? 'File folder' : (entry.ext ? entry.ext.toUpperCase().slice(1) + ' File' : 'File')}</div>
                            </div>
                            
                            {!entry.isDir && (
                              <div>
                                <div className="text-xs text-white/50 mb-1">Size</div>
                                <div className="text-sm">{formatSize(entry.size, settings.fileSizeFormat === 'binary')}</div>
                              </div>
                            )}
                            
                            <div>
                              <div className="text-xs text-white/50 mb-1">Date Modified</div>
                              <div className="text-sm">{formatDate(entry.mtimeMs, 'long')}</div>
                            </div>
                            
                            <div>
                              <div className="text-xs text-white/50 mb-1">Path</div>
                              <div className="text-xs text-white/70 break-all">{entry.path}</div>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                ) : selected.size > 1 ? (
                  <div className="text-white/40 text-sm">
                    {selected.size} items selected
                    <div className="mt-2 text-xs">
                      Total size: {formatSize(selectedTotalSize, settings.fileSizeFormat === 'binary')}
                    </div>
                  </div>
                ) : (
                  <div className="text-white/40 text-sm">No file selected</div>
                )}
              </div>
            </div>
          </>
        )}
        </div>
      </div>

      {/* Status bar */}
      <div className="glass-panel mx-2 mb-2 px-3 py-2 text-xs text-white/60 flex items-center gap-4 shrink-0 rounded-xl border border-white/5" style={{animationDelay: '0.15s'}}>
        <div className="flex items-center gap-3">
          <div className="font-medium">{selected.size}</div>
          <button onClick={() => { if (selected.size===1) { const p=Array.from(selected)[0]; copyPathToClipboard(p) } }} disabled={selected.size !== 1} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm disabled:opacity-50">Copy Path</button>
          <button onClick={() => { if (selected.size===1) { const p=Array.from(selected)[0]; window.xvser.revealInFolder(p) } }} disabled={selected.size !== 1} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm disabled:opacity-50">Reveal</button>
          <div className="text-sm">{selected.size === 1 ? 'item' : 'items'} selected</div>
          {selected.size > 0 && (
            <div className="text-white/50">• {formatSize(selectedTotalSize, settings.fileSizeFormat === 'binary')}</div>
          )}
        </div>

        <div className="text-white/40">•</div>

        <div className="flex items-center gap-3">
          <div className="text-sm">{entries.length} items</div>
          <div className="text-white/50">• {formatSize(folderTotalSize, settings.fileSizeFormat === 'binary')}</div>
        </div>

        <div className="ml-auto text-sm">
          Free space: {freeSpace === null ? '—' : formatSize(freeSpace, settings.fileSizeFormat === 'binary')}
        </div>
      </div>

      {/* Context menu */}
      <EnhancedContextMenu
        visible={ctxMenu.visible}
        x={ctxMenu.x}
        y={ctxMenu.y}
        item={ctxMenu.item || null}
        selectedCount={selected.size}
        clipboard={fileClipboard}
        currentDir={currentDir}
        settings={{
          showOpenWith: settings.showOpenWith,
          showCopyPath: settings.showCopyPath,
          showProperties: settings.showProperties,
          showArchiveOptions: settings.showArchiveOptions,
          showHashOption: settings.showHashOption,
          showShareOption: settings.showShareOption,
          showTagging: settings.showTagging,
          showFavorites: settings.showFavorites,
          showTerminalOption: settings.showTerminalOption
        }}
        onClose={closeCtx}
        onOpen={ctxOpen}
        onOpenWith={async () => {
          if (!ctxMenu.item) return;
          const result = await window.xvser.showOpenWithDialog(ctxMenu.item.path);
          if (result) {
            await window.xvser.openWith(ctxMenu.item.path, result);
          }
          closeCtx();
        }}
        onOpenInNewTab={() => { if (ctxMenu.item) openInNewTab(ctxMenu.item.path); closeCtx() }}
        onOpenInNewWindow={() => {
          if (ctxMenu.item) {
            window.xvser.openInNewWindow(ctxMenu.item.path);
          }
          closeCtx();
        }}
        onReveal={ctxReveal}
        onCopy={async () => {
          if (!ctxMenu.item) return;
          const paths = selected.size > 0 ? Array.from(selected) : [ctxMenu.item.path];
          setFileClipboard({ type: 'copy', paths });
          closeCtx();
        }}
        onCut={async () => {
          if (!ctxMenu.item) return;
          const paths = selected.size > 0 ? Array.from(selected) : [ctxMenu.item.path];
          setFileClipboard({ type: 'cut', paths });
          closeCtx();
        }}
        onPaste={async () => {
          if (!fileClipboard || !currentDir) return;
          const { type, paths } = fileClipboard;
          if (type === 'copy') {
            await window.xvser.copyFiles(paths, currentDir);
          } else {
            await window.xvser.moveFiles(paths, currentDir);
            setFileClipboard(null);
          }
          await loadDir(currentDir);
          closeCtx();
        }}
        onDelete={ctxDelete}
        onRename={ctxRename}
        onCopyPath={() => { if (ctxMenu.item) copyPathToClipboard(ctxMenu.item.path); closeCtx() }}
        onProperties={async () => {
          // Show properties for the item or current directory
          const path = ctxMenu.item ? ctxMenu.item.path : currentDir;
          if (!path) return;
          await window.xvser.showProperties(path);
          closeCtx();
        }}
        onCompress={async () => {
          if (!ctxMenu.item || !currentDir) return;
          const paths = selected.size > 0 ? Array.from(selected) : [ctxMenu.item.path];
          await window.xvser.compressToZip(paths);
          await loadDir(currentDir);
          closeCtx();
        }}
        onExtract={async () => {
          if (!ctxMenu.item || !currentDir) return;
          await window.xvser.extractArchive(ctxMenu.item.path);
          await loadDir(currentDir);
          closeCtx();
        }}
        onCreateShortcut={async () => {
          if (!ctxMenu.item) return;
          await window.xvser.createShortcut(ctxMenu.item.path);
          closeCtx();
        }}
        onShare={async () => {
          if (!ctxMenu.item) return;
          await window.xvser.shareFiles(selected.size > 0 ? Array.from(selected) : [ctxMenu.item.path]);
          closeCtx();
        }}
        onAddToFavorites={async () => {
          if (!ctxMenu.item) return;
          dispatch(addFavorite({ path: ctxMenu.item.path, name: ctxMenu.item.name }));
          closeCtx();
        }}
        onTag={() => {
          if (!ctxMenu.item) return;
          const paths = selected.size > 0 ? Array.from(selected) : [ctxMenu.item.path];
          dispatch(openTagDialog(paths));
          closeCtx();
        }}
        onCopyHash={async () => {
          if (!ctxMenu.item) return;
          const hash = await window.xvser.getFileHash(ctxMenu.item.path);
          await navigator.clipboard.writeText(hash);
          closeCtx();
        }}
        onRefresh={() => { if (currentDir) loadDir(currentDir); closeCtx() }}
        onPrint={async () => {
          if (!ctxMenu.item) return;
          await window.xvser.printFile(ctxMenu.item.path);
          closeCtx();
        }}
        onEdit={async () => {
          if (!ctxMenu.item) return;
          await window.xvser.editFile(ctxMenu.item.path);
          closeCtx();
        }}
        onSendToDesktop={async () => {
          if (!ctxMenu.item) return;
          await window.xvser.sendToDesktop(ctxMenu.item.path);
          closeCtx();
        }}
        onPinToQuickAccess={async () => {
          if (!ctxMenu.item || !ctxMenu.item.isDir) return;
          await window.xvser.pinToQuickAccess(ctxMenu.item.path);
          closeCtx();
        }}
        onRotateImage={async (direction) => {
          if (!ctxMenu.item) return;
          await window.xvser.rotateImage(ctxMenu.item.path, direction);
          if (currentDir) await loadDir(currentDir);
          closeCtx();
        }}
        onDuplicate={async () => {
          if (!ctxMenu.item || !currentDir) return;
          await window.xvser.duplicateItem(ctxMenu.item.path);
          await loadDir(currentDir);
          closeCtx();
        }}
        onBatchRename={async () => {
          if (selected.size === 0 || !currentDir) return;
          const pattern = window.prompt('Enter rename pattern (use {index}, {name}, {ext}):', '{name}_{index}');
          if (!pattern) return;
          await window.xvser.batchRename(Array.from(selected), pattern);
          await loadDir(currentDir);
          closeCtx();
        }}
        onNewFile={async (type) => {
          if (!currentDir) return;
          const fileName = type === 'folder' ? 'New Folder' : type === 'text' ? 'New Text Document.txt' : 'New Shortcut.lnk';
          await window.xvser.createNewFile(currentDir, fileName, type);
          await loadDir(currentDir);
          closeCtx();
        }}
        onOpenInPowerShell={async () => {
          const path = ctxMenu.item?.isDir ? ctxMenu.item.path : currentDir;
          if (!path) return;
          await window.xvser.openInPowerShell(path);
          closeCtx();
        }}
        onScanWithDefender={async () => {
          if (!ctxMenu.item) return;
          await window.xvser.scanWithDefender(ctxMenu.item.path);
          closeCtx();
        }}
        onTakeOwnership={async () => {
          if (!ctxMenu.item) return;
          const confirm = window.confirm('Taking ownership requires administrator privileges. Continue?');
          if (!confirm) return;
          await window.xvser.takeOwnership(ctxMenu.item.path);
          closeCtx();
        }}
        onSetAttributes={async (attrs) => {
          if (!ctxMenu.item) return;
          await window.xvser.setFileAttributes(ctxMenu.item.path, attrs);
          if (currentDir) await loadDir(currentDir);
          closeCtx();
        }}
        onSetAsWallpaper={async () => {
          if (!ctxMenu.item) return;
          await window.xvser.setAsWallpaper(ctxMenu.item.path);
          closeCtx();
        }}
        onOpenInTerminal={async () => {
          const path = ctxMenu.item?.isDir ? ctxMenu.item.path : currentDir;
          if (!path) return;
          await window.xvser.openInTerminal(path);
          closeCtx();
        }}
        onChangeView={(layout) => {
          dispatch(setViewOptions({ layout }));
        }}
        onChangeSortBy={(sortBy) => {
          setSettings(prev => ({ ...prev, sortBy }));
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={saveSettings}
      />

      {/* Rename Dialog */}
      {renameDialog && (
        <RenameInput
          initialValue={renameDialog.name}
          onConfirm={handleRenameConfirm}
          onCancel={() => setRenameDialog(null)}
          position={{ x: renameDialog.x, y: renameDialog.y }}
        />
      )}
    </div>
  )
}

// Helper function to get parent directory
function getParent(path: string): string | null {
  if (!path) return null;
  
  if (path.match(/^([A-Za-z]):\\$/)) {
    return null; // At root drive level
  }
  
  // Remove trailing separators
  const cleanPath = path.replace(/[\\/]+$/, '');
  
  // Find last separator position
  const lastSeparator = Math.max(
    cleanPath.lastIndexOf('/'),
    cleanPath.lastIndexOf('\\')
  );
  
  if (lastSeparator <= 0) {
    return null; // No parent
  }
  
  return cleanPath.substring(0, lastSeparator);
}

// Format file size helper
function formatSize(bytes: number, useBinary: boolean = true): string {
  if (bytes === 0) return '0 bytes';
  const k = useBinary ? 1024 : 1000;
  const sizes = useBinary 
    ? ['bytes', 'KiB', 'MiB', 'GiB', 'TiB']
    : ['bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// Format date helper
function formatDate(ms: number, format: 'short' | 'long' | 'relative'): string {
  const date = new Date(ms);
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString();
    case 'long':
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'relative': {
      const now = Date.now();
      const diff = now - ms;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 7) return date.toLocaleDateString();
      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      return 'Just now';
    }
  }
}

// Remove file extension
function removeExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === 0) return filename;
  return filename.substring(0, lastDot);
}
