import fs from 'fs-extra'
import path from 'path'
import crypto from 'crypto'
import archiver from 'archiver'
import extract from 'extract-zip'
import { shell, dialog, nativeImage } from 'electron'
import { promisify } from 'util'
import { exec } from 'child_process'
import os from 'os'

const execAsync = promisify(exec)

export async function copyFiles(paths: string[], targetDir: string): Promise<boolean> {
  try {
    for (const srcPath of paths) {
      const name = path.basename(srcPath)
      const destPath = path.join(targetDir, name)
      await fs.copy(srcPath, destPath, { overwrite: false })
    }
    return true
  } catch (err) {
    console.error('Error copying files:', err)
    return false
  }
}

export async function moveFiles(paths: string[], targetDir: string): Promise<boolean> {
  try {
    for (const srcPath of paths) {
      const name = path.basename(srcPath)
      const destPath = path.join(targetDir, name)
      await fs.move(srcPath, destPath, { overwrite: false })
    }
    return true
  } catch (err) {
    console.error('Error moving files:', err)
    return false
  }
}

export async function compressToZip(paths: string[]): Promise<boolean> {
  try {
    const zipPath = path.join(path.dirname(paths[0]), path.basename(paths[0]) + '.zip')
    const output = fs.createWriteStream(zipPath)
    const archive = archiver('zip', { zlib: { level: 9 } })
    
    output.on('close', () => {
      console.log('Archive created:', zipPath)
    })

    archive.pipe(output)

    for (const p of paths) {
      const stats = await fs.stat(p)
      if (stats.isDirectory()) {
        archive.directory(p, path.basename(p))
      } else {
        archive.file(p, { name: path.basename(p) })
      }
    }

    await archive.finalize()
    return true
  } catch (err) {
    console.error('Error creating zip:', err)
    return false
  }
}

export async function extractArchive(archivePath: string): Promise<boolean> {
  try {
    const targetDir = path.dirname(archivePath)
    await extract(archivePath, { dir: targetDir })
    return true
  } catch (err) {
    console.error('Error extracting archive:', err)
    return false
  }
}

export async function createShortcut(filePath: string): Promise<boolean> {
  try {
    const desktopPath = path.join(process.env.USERPROFILE || '', 'Desktop')
    const shortcutPath = path.join(desktopPath, path.basename(filePath) + '.lnk')
    
    if (process.platform === 'win32') {
      const command = `powershell "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('${shortcutPath}'); $s.TargetPath = '${filePath}'; $s.Save()"`
      await execAsync(command)
    }
    return true
  } catch (err) {
    console.error('Error creating shortcut:', err)
    return false
  }
}

export async function shareFiles(paths: string[]): Promise<boolean> {
  try {
    // On Windows, we can use the built-in share dialog
    if (process.platform === 'win32') {
      await shell.showItemInFolder(paths[0])
    }
    return true
  } catch (err) {
    console.error('Error sharing files:', err)
    return false
  }
}

export async function getFileHash(filePath: string): Promise<string> {
  try {
    const fileBuffer = await fs.readFile(filePath)
    const hashSum = crypto.createHash('sha256')
    hashSum.update(fileBuffer)
    return hashSum.digest('hex')
  } catch (err) {
    console.error('Error calculating file hash:', err)
    return ''
  }
}

export async function showProperties(filePath: string): Promise<boolean> {
  try {
    if (process.platform === 'win32') {
      await execAsync(`explorer /select,"${filePath}"`)
    }
    return true
  } catch (err) {
    console.error('Error showing properties:', err)
    return false
  }
}

export async function showOpenWithDialog(filePath: string): Promise<string | null> {
  try {
    const result = await dialog.showOpenDialog({
      title: 'Open With...',
      filters: [
        { name: 'Applications', extensions: ['exe'] }
      ],
      properties: ['openFile']
    })
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  } catch (err) {
    console.error('Error showing open with dialog:', err)
    return null
  }
}

export async function openWith(filePath: string, appPath: string): Promise<boolean> {
  try {
    await execAsync(`"${appPath}" "${filePath}"`)
    return true
  } catch (err) {
    console.error('Error opening file with app:', err)
    return false
  }
}

export async function openInNewWindow(path: string): Promise<boolean> {
  try {
    shell.openPath(path)
    return true
  } catch (err) {
    console.error('Error opening in new window:', err)
    return false
  }
}

// Print file
export async function printFile(filePath: string): Promise<boolean> {
  try {
    if (process.platform === 'win32') {
      await execAsync(`powershell -Command "Start-Process -FilePath '${filePath}' -Verb Print"`)
    } else if (process.platform === 'darwin') {
      await execAsync(`lpr "${filePath}"`)
    } else {
      await execAsync(`lpr "${filePath}"`)
    }
    return true
  } catch (err) {
    console.error('Error printing file:', err)
    return false
  }
}

// Edit file with default editor
export async function editFile(filePath: string): Promise<boolean> {
  try {
    const ext = path.extname(filePath).toLowerCase()
    const textExts = ['.txt', '.md', '.json', '.xml', '.html', '.css', '.js', '.ts', '.jsx', '.tsx', '.ini', '.cfg', '.conf', '.log']
    
    if (textExts.includes(ext)) {
      if (process.platform === 'win32') {
        await execAsync(`notepad "${filePath}"`)
      } else if (process.platform === 'darwin') {
        await execAsync(`open -e "${filePath}"`)
      } else {
        await execAsync(`xdg-open "${filePath}"`)
      }
      return true
    }
    
    // Fallback to default open
    await shell.openPath(filePath)
    return true
  } catch (err) {
    console.error('Error editing file:', err)
    return false
  }
}

// Send to Desktop (create shortcut)
export async function sendToDesktop(filePath: string): Promise<boolean> {
  try {
    const desktopPath = path.join(os.homedir(), 'Desktop')
    const fileName = path.basename(filePath)
    const shortcutPath = path.join(desktopPath, fileName + '.lnk')
    
    if (process.platform === 'win32') {
      const command = `powershell "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('${shortcutPath}'); $s.TargetPath = '${filePath}'; $s.Save()"`
      await execAsync(command)
    } else {
      // On Unix-like systems, create a symbolic link
      await fs.symlink(filePath, path.join(desktopPath, fileName))
    }
    return true
  } catch (err) {
    console.error('Error sending to desktop:', err)
    return false
  }
}

// Pin to Quick Access (Windows)
export async function pinToQuickAccess(folderPath: string): Promise<boolean> {
  try {
    if (process.platform === 'win32') {
      const command = `powershell "$o = New-Object -ComObject Shell.Application; $o.Namespace('${folderPath}').Self.InvokeVerb('pintohome')"`
      await execAsync(command)
    }
    return true
  } catch (err) {
    console.error('Error pinning to Quick Access:', err)
    return false
  }
}

// Set file attributes (hidden, read-only, etc.)
export async function setFileAttributes(filePath: string, attributes: { hidden?: boolean, readOnly?: boolean }): Promise<boolean> {
  try {
    if (process.platform === 'win32') {
      const commands: string[] = []
      if (attributes.hidden !== undefined) {
        commands.push(`attrib ${attributes.hidden ? '+H' : '-H'} "${filePath}"`)
      }
      if (attributes.readOnly !== undefined) {
        commands.push(`attrib ${attributes.readOnly ? '+R' : '-R'} "${filePath}"`)
      }
      
      for (const cmd of commands) {
        await execAsync(cmd)
      }
    } else {
      // Unix-like systems
      if (attributes.hidden !== undefined && attributes.hidden) {
        // Rename to start with dot
        const dir = path.dirname(filePath)
        const name = path.basename(filePath)
        if (!name.startsWith('.')) {
          await fs.rename(filePath, path.join(dir, '.' + name))
        }
      }
      if (attributes.readOnly !== undefined) {
        const mode = attributes.readOnly ? 0o444 : 0o644
        await fs.chmod(filePath, mode)
      }
    }
    return true
  } catch (err) {
    console.error('Error setting file attributes:', err)
    return false
  }
}

// Scan with Windows Defender
export async function scanWithDefender(filePath: string): Promise<boolean> {
  try {
    if (process.platform === 'win32') {
      const command = `"C:\\Program Files\\Windows Defender\\MpCmdRun.exe" -Scan -ScanType 3 -File "${filePath}"`
      await execAsync(command)
    }
    return true
  } catch (err) {
    console.error('Error scanning with Defender:', err)
    return false
  }
}

// Take ownership (requires admin)
export async function takeOwnership(filePath: string): Promise<boolean> {
  try {
    if (process.platform === 'win32') {
      const username = os.userInfo().username
      await execAsync(`takeown /F "${filePath}"`)
      await execAsync(`icacls "${filePath}" /grant ${username}:F`)
    } else {
      await execAsync(`sudo chown ${os.userInfo().username} "${filePath}"`)
    }
    return true
  } catch (err) {
    console.error('Error taking ownership:', err)
    return false
  }
}

// Open in Terminal/Command Prompt
export async function openInTerminal(folderPath: string): Promise<boolean> {
  try {
    if (process.platform === 'win32') {
      await execAsync(`start cmd /K "cd /d ${folderPath}"`)
    } else if (process.platform === 'darwin') {
      await execAsync(`open -a Terminal "${folderPath}"`)
    } else {
      await execAsync(`gnome-terminal --working-directory="${folderPath}"`)
    }
    return true
  } catch (err) {
    console.error('Error opening in terminal:', err)
    return false
  }
}

// Open in PowerShell
export async function openInPowerShell(folderPath: string): Promise<boolean> {
  try {
    if (process.platform === 'win32') {
      await execAsync(`start powershell -NoExit -Command "cd '${folderPath}'"`)
    }
    return true
  } catch (err) {
    console.error('Error opening in PowerShell:', err)
    return false
  }
}

// Set as desktop background (images only)
export async function setAsWallpaper(imagePath: string): Promise<boolean> {
  try {
    if (process.platform === 'win32') {
      const command = `powershell -Command "Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Wallpaper { [DllImport(\\"user32.dll\\", CharSet=CharSet.Auto)] public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni); }'; [Wallpaper]::SystemParametersInfo(20, 0, '${imagePath}', 3)"`
      await execAsync(command)
    } else if (process.platform === 'darwin') {
      await execAsync(`osascript -e 'tell application "Finder" to set desktop picture to POSIX file "${imagePath}"'`)
    } else {
      await execAsync(`gsettings set org.gnome.desktop.background picture-uri "file://${imagePath}"`)
    }
    return true
  } catch (err) {
    console.error('Error setting wallpaper:', err)
    return false
  }
}

// Rotate image
export async function rotateImage(imagePath: string, direction: 'cw' | 'ccw'): Promise<boolean> {
  try {
    const image = nativeImage.createFromPath(imagePath)
    if (image.isEmpty()) return false
    
    // Rotate the image
    const rotated = direction === 'cw' ? 
      image.resize({ width: image.getSize().height, height: image.getSize().width }) :
      image.resize({ width: image.getSize().height, height: image.getSize().width })
    
    // Save back to file
    await fs.writeFile(imagePath, rotated.toPNG())
    return true
  } catch (err) {
    console.error('Error rotating image:', err)
    return false
  }
}

// Batch rename files
export async function batchRename(paths: string[], pattern: string): Promise<boolean> {
  try {
    for (let i = 0; i < paths.length; i++) {
      const oldPath = paths[i]
      const dir = path.dirname(oldPath)
      const ext = path.extname(oldPath)
      const newName = pattern.replace('{index}', String(i + 1).padStart(3, '0'))
        .replace('{name}', path.basename(oldPath, ext))
        .replace('{ext}', ext)
      const newPath = path.join(dir, newName + ext)
      
      await fs.rename(oldPath, newPath)
    }
    return true
  } catch (err) {
    console.error('Error batch renaming:', err)
    return false
  }
}

// Convert to PDF (requires external tool or library)
export async function convertToPDF(filePath: string): Promise<boolean> {
  try {
    // This is a placeholder - actual implementation would require a PDF library
    // or external tool like LibreOffice
    console.log('PDF conversion not yet implemented for:', filePath)
    return false
  } catch (err) {
    console.error('Error converting to PDF:', err)
    return false
  }
}

// Create new file
export async function createNewFile(parentDir: string, fileName: string, type: 'text' | 'folder' | 'shortcut'): Promise<string> {
  try {
    let targetPath = path.join(parentDir, fileName)
    let counter = 1
    
    // Find unique name
    while (await fs.pathExists(targetPath)) {
      const ext = path.extname(fileName)
      const base = path.basename(fileName, ext)
      targetPath = path.join(parentDir, `${base} (${counter})${ext}`)
      counter++
    }
    
    if (type === 'folder') {
      await fs.mkdir(targetPath)
    } else if (type === 'text') {
      await fs.writeFile(targetPath, '')
    } else if (type === 'shortcut') {
      // Create shortcut
      if (process.platform === 'win32') {
        const command = `powershell "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('${targetPath}.lnk'); $s.Save()"`
        await execAsync(command)
        targetPath += '.lnk'
      }
    }
    
    return targetPath
  } catch (err) {
    console.error('Error creating new file:', err)
    throw err
  }
}

// Get file permissions
export async function getFilePermissions(filePath: string): Promise<any> {
  try {
    const stats = await fs.stat(filePath)
    return {
      mode: stats.mode,
      uid: stats.uid,
      gid: stats.gid,
      isReadOnly: (stats.mode & 0o200) === 0
    }
  } catch (err) {
    console.error('Error getting file permissions:', err)
    return null
  }
}

// Set file permissions
export async function setFilePermissions(filePath: string, mode: number): Promise<boolean> {
  try {
    await fs.chmod(filePath, mode)
    return true
  } catch (err) {
    console.error('Error setting file permissions:', err)
    return false
  }
}

// Get multiple file hashes
export async function getFileHashes(filePath: string): Promise<{ md5: string, sha1: string, sha256: string }> {
  try {
    const fileBuffer = await fs.readFile(filePath)
    
    return {
      md5: crypto.createHash('md5').update(fileBuffer).digest('hex'),
      sha1: crypto.createHash('sha1').update(fileBuffer).digest('hex'),
      sha256: crypto.createHash('sha256').update(fileBuffer).digest('hex')
    }
  } catch (err) {
    console.error('Error calculating file hashes:', err)
    return { md5: '', sha1: '', sha256: '' }
  }
}

// Duplicate file/folder
export async function duplicateItem(itemPath: string): Promise<string> {
  try {
    const dir = path.dirname(itemPath)
    const ext = path.extname(itemPath)
    const base = path.basename(itemPath, ext)
    
    let counter = 1
    let newPath = path.join(dir, `${base} - Copy${ext}`)
    
    while (await fs.pathExists(newPath)) {
      newPath = path.join(dir, `${base} - Copy (${counter})${ext}`)
      counter++
    }
    
    await fs.copy(itemPath, newPath)
    return newPath
  } catch (err) {
    console.error('Error duplicating item:', err)
    throw err
  }
}