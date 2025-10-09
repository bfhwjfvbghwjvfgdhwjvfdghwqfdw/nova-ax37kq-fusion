declare global {
  interface Window {
    xvser: {
      chooseDir: () => Promise<string | null>
      list: (dirPath: string) => Promise<Array<{
        name: string
        path: string
        isDir: boolean
        size: number
        mtimeMs: number
        ext: string
      }>>
      setWatch: (dirPath: string) => Promise<boolean>
      openPath: (p: string) => Promise<boolean>
      revealInFolder: (p: string) => Promise<boolean>
      trash: (p: string) => Promise<boolean>
      rename: (fromPath: string, toName: string) => Promise<string>
      newFolder: (parent: string, baseName?: string) => Promise<string>
      getDrives: () => Promise<Array<{ name: string; path: string; type: 'drive' }>>
      getKnownFolders: () => Promise<Array<{ name: string; path: string; icon: string }>>
      getFreeSpace: (p: string) => Promise<number | null>
      getFileIcon: (p: string, size?: 'small' | 'normal' | 'large') => Promise<string | null>
      onFsChanged: (cb: (event: { type: string; path: string }) => void) => () => void
      
      // Enhanced context menu operations
      copyFiles: (paths: string[], targetDir: string) => Promise<boolean>
      moveFiles: (paths: string[], targetDir: string) => Promise<boolean>
      compressToZip: (paths: string[]) => Promise<boolean>
      extractArchive: (path: string) => Promise<boolean>
      createShortcut: (path: string) => Promise<boolean>
      shareFiles: (paths: string[]) => Promise<boolean>
      getFileHash: (path: string) => Promise<string>
      showProperties: (path: string) => Promise<boolean>
      showOpenWithDialog: (path: string) => Promise<string | null>
      openWith: (path: string, appPath: string) => Promise<boolean>
      openInNewWindow: (path: string) => Promise<boolean>
      
      // Additional file operations
      printFile: (path: string) => Promise<boolean>
      editFile: (path: string) => Promise<boolean>
      sendToDesktop: (path: string) => Promise<boolean>
      pinToQuickAccess: (path: string) => Promise<boolean>
      setFileAttributes: (path: string, attributes: { hidden?: boolean, readOnly?: boolean }) => Promise<boolean>
      scanWithDefender: (path: string) => Promise<boolean>
      takeOwnership: (path: string) => Promise<boolean>
      openInTerminal: (path: string) => Promise<boolean>
      openInPowerShell: (path: string) => Promise<boolean>
      setAsWallpaper: (path: string) => Promise<boolean>
      rotateImage: (path: string, direction: 'cw' | 'ccw') => Promise<boolean>
      batchRename: (paths: string[], pattern: string) => Promise<boolean>
      convertToPDF: (path: string) => Promise<boolean>
      createNewFile: (parentDir: string, fileName: string, type: 'text' | 'folder' | 'shortcut') => Promise<string>
      getFilePermissions: (path: string) => Promise<any>
      setFilePermissions: (path: string, mode: number) => Promise<boolean>
      getFileHashes: (path: string) => Promise<{ md5: string, sha1: string, sha256: string }>
      duplicateItem: (path: string) => Promise<string>
      
      // Window controls
      minimize?: () => void
      maximize?: () => void
      unmaximize?: () => void
      close?: () => void
      isMaximized?: () => Promise<boolean>
      onMaximize?: (cb: () => void) => () => void
      onUnmaximize?: (cb: () => void) => () => void
    }
  }
}
export {}
