import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import { nativeImage } from 'electron'
import path from 'node:path'
import fs from 'fs-extra'
import chokidar, { FSWatcher } from 'chokidar'
import os from 'node:os'
import fsp from 'node:fs/promises'
import { exec } from 'child_process'
import { autoUpdater } from 'electron-updater'
import * as fileOps from './fileOperations'

// Handle Squirrel (Windows installer) events so app quits during install/uninstall
// This prevents the app from launching a normal window while the installer is running.
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const squirrelStartup = require('electron-squirrel-startup')
  if (squirrelStartup) {
    app.quit()
  }
} catch {}

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

// Prevent the main process from crashing on known non-fatal filesystem errors
// (Windows sometimes exposes locked files such as C:\DumpStack.log.tmp which
// produce EBUSY on lstat). We specifically ignore EBUSY here so the app keeps
// running; other uncaught exceptions will cause a normal exit so they can be
// investigated.
process.on('uncaughtException', (err: any) => {
  try {
    if (err && err.code === 'EBUSY') {
      console.warn('Ignored EBUSY in main process:', err && err.message)
      return
    }
  } catch (e) {
    // fallthrough to logging below
  }
  console.error('Uncaught exception in main process', err)
  // Exit so that production monitoring / restart logic can take over.
  process.exit(1)
})

let win: BrowserWindow | null = null
let watcher: FSWatcher | null = null
let watchedPath: string | null = null

const resolveIcon = (): string | undefined => {
  try {
    if (app.isPackaged) {
      // When packaged, include build/icon.ico via electron-builder files
      const candidate = path.join(process.resourcesPath, 'build', 'icon.ico')
      return candidate
    } else {
      return path.join(__dirname, '..', 'build', 'icon.ico')
    }
  } catch {
    return undefined
  }
}

const createWindow = async () => {
  const iconPath = resolveIcon()
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0b0b0f',
    frame: false,
    titleBarStyle: 'hidden',
    title: 'Xvser',
    icon: iconPath,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: !app.isPackaged,
    },
  })

  if (!app.isPackaged) {
    const url = process.env.VITE_DEV_SERVER_URL || 'http://localhost:8000'
    win.loadURL(url)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    // When packaged, __dirname is dist-electron inside app.asar
    // and index.html is in dist folder at the same level
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Window control events
  win.on('maximize', () => {
    win?.webContents.send('window:maximized')
  })
  
  win.on('unmaximize', () => {
    win?.webContents.send('window:unmaximized')
  })
}

app.whenReady().then(() => {
  // Ensure Windows branding and notifications use our ID
  try {
    app.setName('Xvser')
    app.setAppUserModelId('com.voidsystems.xvser')
  } catch {}
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// Auto-update integration (GitHub releases)
if (app.isPackaged) {
  // Private GitHub repository authentication
  const ghToken = process.env.APP_UPDATE_TOKEN || process.env.GH_TOKEN || ''
  if (ghToken) {
    ;(autoUpdater as any).requestHeaders = {
      Authorization: `token ${ghToken}`,
    }
    console.log('[updater] using token from environment for private GitHub access')
  }
  autoUpdater.autoDownload = false // User-controlled downloads
  autoUpdater.autoInstallOnAppQuit = true
  
  autoUpdater.on('checking-for-update', () => {
    console.log('[updater] checking for update')
    win?.webContents.send('update:checking')
  })
  
  autoUpdater.on('update-available', (info) => {
    console.log('[updater] update available', info?.version)
    win?.webContents.send('update:available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes
    })
  })
  
  autoUpdater.on('update-not-available', () => {
    console.log('[updater] no update')
    win?.webContents.send('update:not-available')
  })
  
  autoUpdater.on('download-progress', (progress) => {
    console.log(`[updater] downloading ${Math.floor(progress.percent)}%`)
    win?.webContents.send('update:download-progress', {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total
    })
  })
  
  autoUpdater.on('update-downloaded', (info) => {
    console.log('[updater] update downloaded; ready to install')
    win?.webContents.send('update:downloaded', {
      version: info.version
    })
  })
  
  autoUpdater.on('error', (err) => {
    console.error('[updater] error', err)
    win?.webContents.send('update:error', { message: err.message })
  })
  
  // Delay initial check a bit to avoid competing with first paint
  setTimeout(() => {
    try { 
      autoUpdater.checkForUpdates()
    } catch (e) { 
      console.warn('autoUpdater error', e) 
    }
  }, 4000)
}

// Update IPC handlers
ipcMain.handle('update:check', async () => {
  if (!app.isPackaged) {
    return { error: 'Updates only available in packaged app' }
  }
  try {
    const result = await autoUpdater.checkForUpdates()
    return { success: true, updateInfo: result?.updateInfo }
  } catch (err: any) {
    return { error: err.message }
  }
})

ipcMain.handle('update:download', async () => {
  if (!app.isPackaged) {
    return { error: 'Updates only available in packaged app' }
  }
  try {
    await autoUpdater.downloadUpdate()
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
})

ipcMain.handle('update:install', () => {
  if (!app.isPackaged) {
    return { error: 'Updates only available in packaged app' }
  }
  // Quit and install - will restart the app
  autoUpdater.quitAndInstall(false, true)
  return { success: true }
})



type DirEntry = {
  name: string
  path: string
  isDir: boolean
  size: number
  mtimeMs: number
  ext: string
}

async function listDirectory(dirPath: string): Promise<DirEntry[]> {
  // Prefer Dirent objects to cheaply know isDir; then stat with limited concurrency
  let dirents: Array<{ name: string; isDirectory?: () => boolean }> = []
  try {
    // Use Node fs to get dirents (fs-extra doesn't support withFileTypes)
    // Using fsp helps avoid blocking the event loop
    // @ts-ignore
    dirents = (await (fsp as any).readdir(dirPath, { withFileTypes: true })) as any
  } catch {
    // Fallback to names only
    const names = await fs.readdir(dirPath)
    dirents = names.map((name) => ({ name }))
  }

  const results: Array<DirEntry | undefined> = new Array(dirents.length)

  const mapLimit = async <T>(items: T[], limit: number, worker: (item: T, index: number) => Promise<void>) => {
    let i = 0
    const n = items.length
    const workers = Array(Math.min(limit, n))
      .fill(0)
      .map(async () => {
        while (true) {
          const idx = i++
          if (idx >= n) break
          await worker(items[idx], idx)
        }
      })
    await Promise.all(workers)
  }

  await mapLimit(dirents, 64, async (d, idx) => {
    const name = (d as any).name ?? (d as any)
    const full = path.join(dirPath, name)
    try {
      const st = await fsp.stat(full)
      const isDir = typeof (d as any).isDirectory === 'function' ? (d as any).isDirectory() : st.isDirectory()
      results[idx] = {
        name,
        path: full,
        isDir,
        size: st.size,
        mtimeMs: st.mtimeMs,
        ext: path.extname(name).toLowerCase(),
      }
    } catch {
      // ignore entries we cannot stat
      results[idx] = undefined
    }
  })

  const entries = results.filter(Boolean) as DirEntry[]
  entries.sort((a, b) => (a.isDir === b.isDir ? a.name.localeCompare(b.name) : a.isDir ? -1 : 1))
  return entries
}

function startWatcher(dirPath: string) {
  if (watcher) {
    watcher.close()
    watcher = null
  }
  watchedPath = dirPath
  try {
    watcher = chokidar.watch(dirPath, { depth: 0, ignoreInitial: true })
    watcher
      .on('add', (p) => win?.webContents.send('fs:changed', { type: 'add', path: p }))
      .on('addDir', (p) => win?.webContents.send('fs:changed', { type: 'addDir', path: p }))
      .on('unlink', (p) => win?.webContents.send('fs:changed', { type: 'unlink', path: p }))
      .on('unlinkDir', (p) => win?.webContents.send('fs:changed', { type: 'unlinkDir', path: p }))
      .on('change', (p) => win?.webContents.send('fs:changed', { type: 'change', path: p }))
      .on('error', (error) => {
        // Chokidar may emit EBUSY when attempting to stat locked system files
        // on Windows (for example, C:\DumpStack.log.tmp). Ignore EBUSY but
        // surface other errors for debugging.
        try {
          if ((error as any).code === 'EBUSY') {
            console.warn('Watcher ignored EBUSY for', dirPath)
            return
          }
        } catch (e) {
          // fallthrough
        }
        console.error('Watcher error for', dirPath, error)
      })
  } catch (e: any) {
    if (e && e.code === 'EBUSY') {
      console.warn('Failed to start watcher (EBUSY) for', dirPath)
      return
    }
    throw e
  }
}

ipcMain.handle('fs:chooseDir', async () => {
  const res = await dialog.showOpenDialog(win!, { properties: ['openDirectory', 'createDirectory'] })
  if (res.canceled || res.filePaths.length === 0) return null
  return res.filePaths[0]
})

ipcMain.handle('fs:list', async (_e, dirPath: string) => {
  return await listDirectory(dirPath)
})

ipcMain.handle('fs:setWatch', async (_e, dirPath: string) => {
  startWatcher(dirPath)
  return true
})

ipcMain.handle('fs:openPath', async (_e, targetPath: string) => {
  await shell.openPath(targetPath)
  return true
})

ipcMain.handle('fs:trash', async (_e, targetPath: string) => {
  if ((shell as any).trashItem) {
    await (shell as any).trashItem(targetPath)
  } else {
    // fallback to remove to temp dir
    await fs.remove(targetPath)
  }
  return true
})

ipcMain.handle('fs:rename', async (_e, fromPath: string, toName: string) => {
  const toPath = path.join(path.dirname(fromPath), toName)
  await fs.rename(fromPath, toPath)
  return toPath
})

ipcMain.handle('fs:newFolder', async (_e, parent: string, baseName: string = 'New Folder') => {
  let i = 0
  let candidate = path.join(parent, baseName)
  while (await fs.pathExists(candidate)) {
    i += 1
    candidate = path.join(parent, `${baseName} (${i})`)
  }
  await fs.mkdir(candidate)
  return candidate
})

function isWindows() {
  return os.platform() === 'win32'
}

async function listDrivesWindows(): Promise<Array<{ name: string; path: string; type: 'drive' }>> {
  const drives: Array<{ name: string; path: string; type: 'drive' }> = []
  // Probe common drive letters A-Z
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i)
    const drivePath = `${letter}:\\`
    try {
      await fs.access(drivePath)
      drives.push({ name: `${letter}:`, path: drivePath, type: 'drive' })
    } catch {}
  }
  return drives
}

function knownFoldersWindows(): Array<{ name: string; path: string; icon: string }> {
  const user = process.env.USERPROFILE || os.homedir()
  return [
    { name: 'Desktop', path: path.join(user, 'Desktop'), icon: 'desktop' },
    { name: 'Documents', path: path.join(user, 'Documents'), icon: 'documents' },
    { name: 'Downloads', path: path.join(user, 'Downloads'), icon: 'downloads' },
    { name: 'Pictures', path: path.join(user, 'Pictures'), icon: 'pictures' },
    { name: 'Music', path: path.join(user, 'Music'), icon: 'music' },
    { name: 'Videos', path: path.join(user, 'Videos'), icon: 'videos' },
  ]
}

ipcMain.handle('fs:getDrives', async () => {
  if (isWindows()) return await listDrivesWindows()
  // For non-Windows, show root mount
  return [{ name: 'Root', path: '/', type: 'drive' as const }]
})

ipcMain.handle('fs:getKnownFolders', async () => {
  if (isWindows()) return knownFoldersWindows()
  const home = os.homedir()
  return [
    { name: 'Home', path: home, icon: 'home' },
    { name: 'Desktop', path: path.join(home, 'Desktop'), icon: 'desktop' },
    { name: 'Documents', path: path.join(home, 'Documents'), icon: 'documents' },
    { name: 'Downloads', path: path.join(home, 'Downloads'), icon: 'downloads' },
    { name: 'Pictures', path: path.join(home, 'Pictures'), icon: 'pictures' },
  ]
})

// Get free space for the drive containing a path. Returns bytes available or null on error.
ipcMain.handle('fs:getFreeSpace', async (_e, anyPath: string) => {
  try {
    if (!anyPath) return null
    // Normalize to drive/root path
    if (process.platform === 'win32') {
      const m = anyPath.match(/^([A-Za-z]:)\\?/) // capture drive letter with colon
      const driveLetter = m ? m[1].charAt(0) : null
      // Prefer PowerShell to get accurate free space in bytes
      if (driveLetter) {
        // Try several methods and parse numeric output
        const tryCmd = async (cmd: string) => {
          try {
            const out = await new Promise<string>((resolve, reject) => {
              exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
                if (err) return reject(err)
                resolve((stdout || stderr).toString())
              })
            })
            const digits = (out.match(/(\d[\d,]*)/) || [])[1]
            if (!digits) return null
            // remove commas
            const num = parseInt(digits.replace(/,/g, ''), 10)
            if (Number.isFinite(num)) return num
          } catch (e) {
            // ignore and return null
          }
          return null
        }

        // 1) Try Get-Volume (returns bytes)
        try {
          const cmd1 = `powershell -NoProfile -Command "(Get-Volume -DriveLetter ${driveLetter}).SizeRemaining"`
          const v1 = await tryCmd(cmd1)
          if (v1 !== null) return v1
        } catch (e) {
          // ignore
        }

        // 2) Try Get-PSDrive
        try {
          const cmd2 = `powershell -NoProfile -Command "[long](Get-PSDrive -Name ${driveLetter}).Free"`
          const v2 = await tryCmd(cmd2)
          if (v2 !== null) return v2
        } catch (e) {
          // ignore
        }

        // 3) Fallback to WMIC
        try {
          const dev = driveLetter + ':'
          const cmd3 = `wmic logicaldisk where "DeviceID='${dev}'" get FreeSpace /value`
          const out3 = await new Promise<string>((resolve, reject) => {
            exec(cmd3, { windowsHide: true }, (err, stdout, stderr) => {
              if (err) return reject(err)
              resolve((stdout || stderr).toString())
            })
          })
          const m2 = out3.match(/FreeSpace=(\d+)/)
          if (m2) return parseInt(m2[1], 10)
        } catch (e) {
          // ignore
        }
      }

      return null
    } else {
      // POSIX: use df -k and parse
      const cmd = `df -k "${anyPath.replace(/"/g, '\\"')}"`
      const out = await new Promise<string>((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
          if (err) return reject(err)
          resolve(stdout || stderr)
        })
      })
      const lines = out.trim().split(/\r?\n/)
      if (lines.length < 2) return null
      const parts = lines[1].split(/\s+/)
      // df -k: parts[3] is available blocks in KB
      const availableKB = parseInt(parts[3], 10)
      if (Number.isFinite(availableKB)) return availableKB * 1024
      return null
    }
  } catch (err) {
    console.error('Failed to get free space for', anyPath, err)
    return null
  }
})

// Return a data URL for the file/folder icon. sizeHint can be 'small' | 'normal' | 'large'
ipcMain.handle('fs:getFileIcon', async (_e, targetPath: string, sizeHint: 'small' | 'normal' | 'large' = 'normal', enableVideoThumbnails: boolean = false) => {
  try {
    // For images and optionally videos, generate a proper thumbnail
    const ext = path.extname(targetPath).toLowerCase()
    const videoExts = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.3gp']
    const isVideo = videoExts.includes(ext)
    
    // Skip video thumbnails if disabled
    if (isVideo && !enableVideoThumbnails) {
      // Use system icon for videos when thumbnails are disabled
      let opts: any = {}
      if (sizeHint === 'small') opts.size = 'small'
      if (sizeHint === 'large') opts.size = 'large'
      const img = await app.getFileIcon(targetPath, opts)
      return img.toDataURL()
    }
    
    const { getThumbnail } = await import('./thumbnail')
    const thumbnail = await getThumbnail(targetPath, {
      width: sizeHint === 'small' ? 64 : sizeHint === 'large' ? 256 : 128,
      height: sizeHint === 'small' ? 64 : sizeHint === 'large' ? 256 : 128,
      quality: 85
    })
    if (thumbnail) return thumbnail

    // Fallback to system icon
    let opts: any = {}
    if (sizeHint === 'small') opts.size = 'small'
    if (sizeHint === 'large') opts.size = 'large'
    const img = await app.getFileIcon(targetPath, opts)
    // Ensure it's a PNG data URL
    const dataUrl = img.toDataURL()
    return dataUrl
  } catch (err) {
    try {
      // Last resort: create from path (may return generic icon)
      const img2 = nativeImage.createFromPath(targetPath)
      if (!img2.isEmpty()) return img2.toDataURL()
    } catch (e) {}
    return null
  }
})

ipcMain.handle('fs:revealInFolder', async (_e, targetPath: string) => {
  try {
    shell.showItemInFolder(targetPath)
    return true
  } catch {
    await shell.openPath(path.dirname(targetPath))
    return true
  }
})

// Window control handlers
ipcMain.handle('window:minimize', () => {
  win?.minimize()
})

ipcMain.handle('window:maximize', () => {
  win?.maximize()
})

ipcMain.handle('window:unmaximize', () => {
  win?.unmaximize()
})

ipcMain.handle('window:close', () => {
  win?.close()
})

ipcMain.handle('window:isMaximized', () => {
  return win?.isMaximized() ?? false
})

// New file operation handlers
ipcMain.handle('fs:copyFiles', async (_e, paths: string[], targetDir: string) => {
  return fileOps.copyFiles(paths, targetDir)
})

ipcMain.handle('fs:moveFiles', async (_e, paths: string[], targetDir: string) => {
  return fileOps.moveFiles(paths, targetDir)
})

ipcMain.handle('fs:compressToZip', async (_e, paths: string[]) => {
  return fileOps.compressToZip(paths)
})

ipcMain.handle('fs:extractArchive', async (_e, path: string) => {
  return fileOps.extractArchive(path)
})

ipcMain.handle('fs:createShortcut', async (_e, path: string) => {
  return fileOps.createShortcut(path)
})

ipcMain.handle('fs:shareFiles', async (_e, paths: string[]) => {
  return fileOps.shareFiles(paths)
})

ipcMain.handle('fs:getFileHash', async (_e, path: string) => {
  return fileOps.getFileHash(path)
})

ipcMain.handle('fs:showProperties', async (_e, path: string) => {
  return fileOps.showProperties(path)
})

ipcMain.handle('fs:showOpenWithDialog', async (_e, path: string) => {
  return fileOps.showOpenWithDialog(path)
})

ipcMain.handle('fs:openWith', async (_e, path: string, appPath: string) => {
  return fileOps.openWith(path, appPath)
})

ipcMain.handle('fs:openInNewWindow', async (_e, path: string) => {
  return fileOps.openInNewWindow(path)
})

// Additional file operation handlers
ipcMain.handle('fs:printFile', async (_e, path: string) => {
  return fileOps.printFile(path)
})

ipcMain.handle('fs:editFile', async (_e, path: string) => {
  return fileOps.editFile(path)
})

ipcMain.handle('fs:sendToDesktop', async (_e, path: string) => {
  return fileOps.sendToDesktop(path)
})

ipcMain.handle('fs:pinToQuickAccess', async (_e, path: string) => {
  return fileOps.pinToQuickAccess(path)
})

ipcMain.handle('fs:setFileAttributes', async (_e, path: string, attributes: { hidden?: boolean, readOnly?: boolean }) => {
  return fileOps.setFileAttributes(path, attributes)
})

ipcMain.handle('fs:scanWithDefender', async (_e, path: string) => {
  return fileOps.scanWithDefender(path)
})

ipcMain.handle('fs:takeOwnership', async (_e, path: string) => {
  return fileOps.takeOwnership(path)
})

ipcMain.handle('fs:openInTerminal', async (_e, path: string) => {
  return fileOps.openInTerminal(path)
})

ipcMain.handle('fs:openInPowerShell', async (_e, path: string) => {
  return fileOps.openInPowerShell(path)
})

ipcMain.handle('fs:setAsWallpaper', async (_e, path: string) => {
  return fileOps.setAsWallpaper(path)
})

ipcMain.handle('fs:rotateImage', async (_e, path: string, direction: 'cw' | 'ccw') => {
  return fileOps.rotateImage(path, direction)
})

ipcMain.handle('fs:batchRename', async (_e, paths: string[], pattern: string) => {
  return fileOps.batchRename(paths, pattern)
})

ipcMain.handle('fs:convertToPDF', async (_e, path: string) => {
  return fileOps.convertToPDF(path)
})

ipcMain.handle('fs:createNewFile', async (_e, parentDir: string, fileName: string, type: 'text' | 'folder' | 'shortcut') => {
  return fileOps.createNewFile(parentDir, fileName, type)
})

ipcMain.handle('fs:getFilePermissions', async (_e, path: string) => {
  return fileOps.getFilePermissions(path)
})

ipcMain.handle('fs:setFilePermissions', async (_e, path: string, mode: number) => {
  return fileOps.setFilePermissions(path, mode)
})

ipcMain.handle('fs:getFileHashes', async (_e, path: string) => {
  return fileOps.getFileHashes(path)
})

ipcMain.handle('fs:duplicateItem', async (_e, path: string) => {
  return fileOps.duplicateItem(path)
})
