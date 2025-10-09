import { useState, useEffect } from 'react'
import { Star, FolderOpen, Trash2, Edit, Plus, X } from 'lucide-react'

interface Bookmark {
  id: string
  name: string
  path: string
  icon: string
  color: string
}

interface BookmarksManagerProps {
  onNavigate: (path: string) => void
}

const COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Green', value: '#10b981' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Cyan', value: '#06b6d4' },
]

export function BookmarksManager({ onNavigate }: BookmarksManagerProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBookmark, setNewBookmark] = useState({ name: '', path: '', color: COLORS[0].value })

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('xvser-bookmarks')
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved))
      } catch {}
    }
  }, [])

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('xvser-bookmarks', JSON.stringify(bookmarks))
  }, [bookmarks])

  const addBookmark = () => {
    if (!newBookmark.name || !newBookmark.path) return

    const bookmark: Bookmark = {
      id: Date.now().toString(),
      name: newBookmark.name,
      path: newBookmark.path,
      icon: '📁',
      color: newBookmark.color,
    }

    setBookmarks(prev => [...prev, bookmark])
    setNewBookmark({ name: '', path: '', color: COLORS[0].value })
    setShowAddForm(false)
  }

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id))
  }

  const startEdit = (bookmark: Bookmark) => {
    setEditingId(bookmark.id)
    setEditName(bookmark.name)
  }

  const saveEdit = (id: string) => {
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, name: editName } : b))
    setEditingId(null)
    setEditName('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const addCurrentFolder = async () => {
    // This would need to be wired up to get current directory
    // For now, show the form
    setShowAddForm(true)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={16} className="text-yellow-400" />
          <h3 className="font-semibold text-white/80">Bookmarks</h3>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="glass-panel rounded-lg p-4 space-y-3 border border-white/10">
          <input
            type="text"
            placeholder="Bookmark name"
            value={newBookmark.name}
            onChange={(e) => setNewBookmark(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg outline-none focus:ring-1 focus:ring-brand/50 text-sm"
          />
          <input
            type="text"
            placeholder="Folder path"
            value={newBookmark.path}
            onChange={(e) => setNewBookmark(prev => ({ ...prev, path: e.target.value }))}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg outline-none focus:ring-1 focus:ring-brand/50 text-sm font-mono"
          />
          <div>
            <div className="text-xs text-white/60 mb-2">Color</div>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(color => (
                <button
                  key={color.value}
                  onClick={() => setNewBookmark(prev => ({ ...prev, color: color.value }))}
                  className={`w-8 h-8 rounded-lg transition-all ${newBookmark.color === color.value ? 'ring-2 ring-white/50 scale-110' : ''}`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          <button
            onClick={addBookmark}
            className="w-full px-4 py-2 rounded-lg bg-brand hover:bg-brand/80 font-medium transition-colors"
          >
            Add Bookmark
          </button>
        </div>
      )}

      {/* Bookmarks List */}
      <div className="space-y-2">
        {bookmarks.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-white/40 text-sm">
            No bookmarks yet. Click + to add one!
          </div>
        )}

        {bookmarks.map(bookmark => (
          <div
            key={bookmark.id}
            className="group glass-panel rounded-lg p-3 hover:bg-white/5 transition-all border border-white/5"
          >
            {editingId === bookmark.id ? (
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded outline-none focus:ring-1 focus:ring-brand/50 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(bookmark.id)
                    if (e.key === 'Escape') cancelEdit()
                  }}
                />
                <button
                  onClick={() => saveEdit(bookmark.id)}
                  className="p-1.5 rounded hover:bg-green-500/20 text-green-400"
                >
                  <FolderOpen size={14} />
                </button>
                <button
                  onClick={cancelEdit}
                  className="p-1.5 rounded hover:bg-white/10"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-8 rounded-full"
                  style={{ backgroundColor: bookmark.color }}
                />
                <button
                  onClick={() => onNavigate(bookmark.path)}
                  className="flex-1 text-left"
                >
                  <div className="font-medium text-sm text-white/90">{bookmark.name}</div>
                  <div className="text-xs text-white/40 font-mono truncate">{bookmark.path}</div>
                </button>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={() => startEdit(bookmark)}
                    className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white/90"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => removeBookmark(bookmark.id)}
                    className="p-1.5 rounded hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Add Current Folder */}
      {bookmarks.length > 0 && !showAddForm && (
        <button
          onClick={addCurrentFolder}
          className="w-full px-4 py-2 rounded-lg border border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-all text-sm text-white/60 hover:text-white/90"
        >
          + Add current folder
        </button>
      )}
    </div>
  )
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('xvser-bookmarks')
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved))
      } catch {}
    }
  }, [])

  const addBookmark = (name: string, path: string, color: string = COLORS[0].value) => {
    const bookmark: Bookmark = {
      id: Date.now().toString(),
      name,
      path,
      icon: '📁',
      color,
    }
    const updated = [...bookmarks, bookmark]
    setBookmarks(updated)
    localStorage.setItem('xvser-bookmarks', JSON.stringify(updated))
  }

  const removeBookmark = (id: string) => {
    const updated = bookmarks.filter(b => b.id !== id)
    setBookmarks(updated)
    localStorage.setItem('xvser-bookmarks', JSON.stringify(updated))
  }

  const isBookmarked = (path: string) => {
    return bookmarks.some(b => b.path === path)
  }

  return { bookmarks, addBookmark, removeBookmark, isBookmarked }
}
