import { contextBridge, ipcRenderer } from 'electron'

type DirEntry = {
  name: string
  path: string
  isDir: boolean
  size: number
  mtimeMs: number
  ext: string
}

const api = {
  chooseDir: () => ipcRenderer.invoke('fs:chooseDir') as Promise<string | null>,
  list: (dirPath: string) => ipcRenderer.invoke('fs:list', dirPath) as Promise<DirEntry[]>,
  setWatch: (dirPath: string) => ipcRenderer.invoke('fs:setWatch', dirPath) as Promise<boolean>,
  openPath: (p: string) => ipcRenderer.invoke('fs:openPath', p) as Promise<boolean>,
  revealInFolder: (p: string) => ipcRenderer.invoke('fs:revealInFolder', p) as Promise<boolean>,
  trash: (p: string) => ipcRenderer.invoke('fs:trash', p) as Promise<boolean>,
  rename: (fromPath: string, toName: string) => ipcRenderer.invoke('fs:rename', fromPath, toName) as Promise<string>,
  newFolder: (parent: string, baseName?: string) => ipcRenderer.invoke('fs:newFolder', parent, baseName) as Promise<string>,
  getDrives: () => ipcRenderer.invoke('fs:getDrives') as Promise<Array<{ name: string; path: string; type: 'drive' }>>,
  getKnownFolders: () => ipcRenderer.invoke('fs:getKnownFolders') as Promise<Array<{ name: string; path: string; icon: string }>>,
  getFreeSpace: (path: string) => ipcRenderer.invoke('fs:getFreeSpace', path) as Promise<number | null>,
  getFileIcon: (path: string, size?: 'small' | 'normal' | 'large') => ipcRenderer.invoke('fs:getFileIcon', path, size) as Promise<string | null>,
  onFsChanged: (cb: (event: { type: string; path: string }) => void) => {
    const listener = (_e: unknown, payload: { type: string; path: string }) => cb(payload)
    ipcRenderer.on('fs:changed', listener)
    return () => ipcRenderer.removeListener('fs:changed', listener)
  },
  // File operations
  copyFiles: (paths: string[], targetDir: string) => ipcRenderer.invoke('fs:copyFiles', paths, targetDir) as Promise<boolean>,
  moveFiles: (paths: string[], targetDir: string) => ipcRenderer.invoke('fs:moveFiles', paths, targetDir) as Promise<boolean>,
  compressToZip: (paths: string[]) => ipcRenderer.invoke('fs:compressToZip', paths) as Promise<boolean>,
  extractArchive: (path: string) => ipcRenderer.invoke('fs:extractArchive', path) as Promise<boolean>,
  createShortcut: (path: string) => ipcRenderer.invoke('fs:createShortcut', path) as Promise<boolean>,
  shareFiles: (paths: string[]) => ipcRenderer.invoke('fs:shareFiles', paths) as Promise<boolean>,
  getFileHash: (path: string) => ipcRenderer.invoke('fs:getFileHash', path) as Promise<string>,
  showProperties: (path: string) => ipcRenderer.invoke('fs:showProperties', path) as Promise<boolean>,
  showOpenWithDialog: (path: string) => ipcRenderer.invoke('fs:showOpenWithDialog', path) as Promise<string | null>,
  openWith: (path: string, appPath: string) => ipcRenderer.invoke('fs:openWith', path, appPath) as Promise<boolean>,
  openInNewWindow: (path: string) => ipcRenderer.invoke('fs:openInNewWindow', path) as Promise<boolean>,
  
  // Additional file operations
  printFile: (path: string) => ipcRenderer.invoke('fs:printFile', path) as Promise<boolean>,
  editFile: (path: string) => ipcRenderer.invoke('fs:editFile', path) as Promise<boolean>,
  sendToDesktop: (path: string) => ipcRenderer.invoke('fs:sendToDesktop', path) as Promise<boolean>,
  pinToQuickAccess: (path: string) => ipcRenderer.invoke('fs:pinToQuickAccess', path) as Promise<boolean>,
  setFileAttributes: (path: string, attributes: { hidden?: boolean, readOnly?: boolean }) => ipcRenderer.invoke('fs:setFileAttributes', path, attributes) as Promise<boolean>,
  scanWithDefender: (path: string) => ipcRenderer.invoke('fs:scanWithDefender', path) as Promise<boolean>,
  takeOwnership: (path: string) => ipcRenderer.invoke('fs:takeOwnership', path) as Promise<boolean>,
  openInTerminal: (path: string) => ipcRenderer.invoke('fs:openInTerminal', path) as Promise<boolean>,
  openInPowerShell: (path: string) => ipcRenderer.invoke('fs:openInPowerShell', path) as Promise<boolean>,
  setAsWallpaper: (path: string) => ipcRenderer.invoke('fs:setAsWallpaper', path) as Promise<boolean>,
  rotateImage: (path: string, direction: 'cw' | 'ccw') => ipcRenderer.invoke('fs:rotateImage', path, direction) as Promise<boolean>,
  batchRename: (paths: string[], pattern: string) => ipcRenderer.invoke('fs:batchRename', paths, pattern) as Promise<boolean>,
  convertToPDF: (path: string) => ipcRenderer.invoke('fs:convertToPDF', path) as Promise<boolean>,
  createNewFile: (parentDir: string, fileName: string, type: 'text' | 'folder' | 'shortcut') => ipcRenderer.invoke('fs:createNewFile', parentDir, fileName, type) as Promise<string>,
  getFilePermissions: (path: string) => ipcRenderer.invoke('fs:getFilePermissions', path) as Promise<any>,
  setFilePermissions: (path: string, mode: number) => ipcRenderer.invoke('fs:setFilePermissions', path, mode) as Promise<boolean>,
  getFileHashes: (path: string) => ipcRenderer.invoke('fs:getFileHashes', path) as Promise<{ md5: string, sha1: string, sha256: string }>,
  duplicateItem: (path: string) => ipcRenderer.invoke('fs:duplicateItem', path) as Promise<string>,

  // Window controls
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  unmaximize: () => ipcRenderer.invoke('window:unmaximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized') as Promise<boolean>,
  onMaximize: (cb: () => void) => {
    const listener = () => cb()
    ipcRenderer.on('window:maximized', listener)
    return () => ipcRenderer.removeListener('window:maximized', listener)
  },
  onUnmaximize: (cb: () => void) => {
    const listener = () => cb()
    ipcRenderer.on('window:unmaximized', listener)
    return () => ipcRenderer.removeListener('window:unmaximized', listener)
  },

  // Update system
  checkForUpdates: () => ipcRenderer.invoke('update:check') as Promise<{ success?: boolean; error?: string; updateInfo?: any }>,
  downloadUpdate: () => ipcRenderer.invoke('update:download') as Promise<{ success?: boolean; error?: string }>,
  installUpdate: () => ipcRenderer.invoke('update:install') as Promise<{ success?: boolean; error?: string }>,
  onUpdateChecking: (cb: () => void) => {
    const listener = () => cb()
    ipcRenderer.on('update:checking', listener)
    return () => ipcRenderer.removeListener('update:checking', listener)
  },
  onUpdateAvailable: (cb: (info: { version: string; releaseDate?: string; releaseNotes?: string }) => void) => {
    const listener = (_e: unknown, info: { version: string; releaseDate?: string; releaseNotes?: string }) => cb(info)
    ipcRenderer.on('update:available', listener)
    return () => ipcRenderer.removeListener('update:available', listener)
  },
  onUpdateNotAvailable: (cb: () => void) => {
    const listener = () => cb()
    ipcRenderer.on('update:not-available', listener)
    return () => ipcRenderer.removeListener('update:not-available', listener)
  },
  onUpdateDownloadProgress: (cb: (progress: { percent: number; transferred: number; total: number }) => void) => {
    const listener = (_e: unknown, progress: { percent: number; transferred: number; total: number }) => cb(progress)
    ipcRenderer.on('update:download-progress', listener)
    return () => ipcRenderer.removeListener('update:download-progress', listener)
  },
  onUpdateDownloaded: (cb: (info: { version: string }) => void) => {
    const listener = (_e: unknown, info: { version: string }) => cb(info)
    ipcRenderer.on('update:downloaded', listener)
    return () => ipcRenderer.removeListener('update:downloaded', listener)
  },
  onUpdateError: (cb: (error: { message: string }) => void) => {
    const listener = (_e: unknown, error: { message: string }) => cb(error)
    ipcRenderer.on('update:error', listener)
    return () => ipcRenderer.removeListener('update:error', listener)
  },
}

contextBridge.exposeInMainWorld('xvser', api)

export {}
