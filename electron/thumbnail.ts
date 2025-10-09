import { app, nativeImage } from 'electron'
import fs from 'fs-extra'
import path from 'path'
import { exec, spawn } from 'child_process'
import { promisify } from 'util'

// Lazily import sharp and ffmpeg to avoid startup issues
let sharp: any
let ffmpeg: any

const execAsync = promisify(exec)

// Cache directory for thumbnails
const CACHE_DIR = path.join(process.env.APPDATA || process.env.HOME || '.', '.xvser-cache')
fs.ensureDirSync(CACHE_DIR)

const VIDEO_EXTENSIONS = new Set(['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.3gp'])
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.svg'])

// Thumbnail generation queue to prevent overwhelming the system
interface QueueItem {
  filePath: string
  options: ThumbnailOptions
  resolve: (value: string | null) => void
  reject: (error: any) => void
}

class ThumbnailQueue {
  private queue: QueueItem[] = []
  private processing = 0
  private maxConcurrent = 2 // Limit concurrent FFmpeg processes
  private cache = new Map<string, Promise<string | null>>()
  private maxCacheSize = 500 // Maximum cached promises
  
  async add(filePath: string, options: ThumbnailOptions): Promise<string | null> {
    const cacheKey = this.getCacheKey(filePath, options)
    
    // Return cached promise if available
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }
    
    // Create new promise and cache it
    const promise = new Promise<string | null>((resolve, reject) => {
      this.queue.push({ filePath, options, resolve, reject })
      this.processQueue()
    })
    
    // Manage cache size
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    
    this.cache.set(cacheKey, promise)
    return promise
  }
  
  private getCacheKey(filePath: string, options: ThumbnailOptions): string {
    const { width = 256, height = 256, quality = 80, timestamp = '00:00:01' } = options
    return `${filePath}:${width}x${height}:${quality}:${timestamp}`
  }
  
  private async processQueue() {
    if (this.processing >= this.maxConcurrent || this.queue.length === 0) {
      return
    }
    
    this.processing++
    const item = this.queue.shift()!
    
    try {
      const ext = path.extname(item.filePath).toLowerCase()
      let result: string | null = null
      
      if (IMAGE_EXTENSIONS.has(ext)) {
        result = await getImageThumbnail(item.filePath, item.options)
      } else if (VIDEO_EXTENSIONS.has(ext)) {
        result = await getVideoThumbnail(item.filePath, item.options)
      }
      
      item.resolve(result)
    } catch (error) {
      item.reject(error)
    } finally {
      this.processing--
      // Process next item
      if (this.queue.length > 0) {
        this.processQueue()
      }
    }
  }
  
  clearCache() {
    this.cache.clear()
  }
  
  getQueueSize(): number {
    return this.queue.length
  }
}

const thumbnailQueue = new ThumbnailQueue()

interface ThumbnailOptions {
  width?: number
  height?: number
  quality?: number
  timestamp?: string // For video thumbnails, e.g. '00:00:01'
}

async function getImageThumbnail(filePath: string, options: ThumbnailOptions = {}): Promise<string | null> {
  try {
    const { width = 256, height = 256, quality = 80 } = options
    const fileName = path.basename(filePath).replace(/[^a-z0-9]/gi, '_')
    const cacheKey = `img_${width}x${height}_${quality}_${fileName}`
    const cachePath = path.join(CACHE_DIR, cacheKey + '.webp')

    // Return cached thumbnail if it exists and is newer than source
    try {
      const [cacheStats, sourceStats] = await Promise.all([
        fs.stat(cachePath),
        fs.stat(filePath)
      ])
      if (cacheStats.mtimeMs > sourceStats.mtimeMs) {
        const cached = await fs.readFile(cachePath)
        return `data:image/webp;base64,${cached.toString('base64')}`
      }
    } catch {}

    // Generate new thumbnail with memory limits
    const image = await sharp(filePath)
      .resize(width, height, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        withoutEnlargement: true
      })
      .webp({ quality, effort: 0 }) // effort: 0 for faster encoding
      .toBuffer({ resolveWithObject: false })

    // Cache the thumbnail
    await fs.writeFile(cachePath, image)

    return `data:image/webp;base64,${image.toString('base64')}`
  } catch (err) {
    console.error('Failed to generate image thumbnail:', err)
    return null
  }
}

async function getVideoThumbnail(filePath: string, options: ThumbnailOptions = {}): Promise<string | null> {
  try {
    const { width = 256, height = 256, quality = 80, timestamp = '00:00:01' } = options
    const fileName = path.basename(filePath).replace(/[^a-z0-9]/gi, '_')
    const cacheKey = `vid_${width}x${height}_${quality}_${timestamp}_${fileName}`
    const cachePath = path.join(CACHE_DIR, cacheKey + '.webp')

    // Return cached thumbnail if it exists and is newer than source
    try {
      const [cacheStats, sourceStats] = await Promise.all([
        fs.stat(cachePath),
        fs.stat(filePath)
      ])
      if (cacheStats.mtimeMs > sourceStats.mtimeMs) {
        const cached = await fs.readFile(cachePath)
        return `data:image/webp;base64,${cached.toString('base64')}`
      }
    } catch {}

    // Use direct FFmpeg spawn for better control and lower memory usage
    const tempPath = path.join(CACHE_DIR, `temp_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`)
    
    await new Promise<void>((resolve, reject) => {
      const ffmpegProcess = spawn('ffmpeg', [
        '-ss', timestamp,
        '-i', filePath,
        '-vframes', '1',
        '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
        '-q:v', '5', // Lower quality for faster processing
        '-y',
        tempPath
      ], {
        windowsHide: true,
        stdio: 'ignore' // Ignore output to reduce memory
      })
      
      // Set timeout to prevent hanging
      const timeout = setTimeout(() => {
        ffmpegProcess.kill('SIGKILL')
        reject(new Error('FFmpeg timeout'))
      }, 10000) // 10 second timeout
      
      ffmpegProcess.on('close', (code) => {
        clearTimeout(timeout)
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`))
        }
      })
      
      ffmpegProcess.on('error', (err) => {
        clearTimeout(timeout)
        reject(err)
      })
    })

    // Check if temp file was created
    if (!await fs.pathExists(tempPath)) {
      throw new Error('FFmpeg did not create thumbnail')
    }

    // Optimize the thumbnail with sharp
    const image = await sharp(tempPath)
      .webp({ quality, effort: 0 })
      .toBuffer({ resolveWithObject: false })

    // Clean up temp file
    try {
      await fs.unlink(tempPath)
    } catch {}

    // Cache the thumbnail
    await fs.writeFile(cachePath, image)

    return `data:image/webp;base64,${image.toString('base64')}`
  } catch (err) {
    console.error('Failed to generate video thumbnail:', err)
    return null
  }
}

async function initDeps() {
  if (!sharp) {
    try {
      sharp = (await import('sharp')).default
    } catch (err) {
      console.error('Failed to load sharp:', err)
      return false
    }
  }
  
  if (!ffmpeg) {
    try {
      ffmpeg = (await import('fluent-ffmpeg')).default
      // Test if ffmpeg is installed
      await execAsync('ffmpeg -version')
    } catch (err) {
      console.error('Failed to initialize ffmpeg:', err)
      return false
    }
  }
  
  return true
}

export async function getThumbnail(filePath: string, options: ThumbnailOptions = {}): Promise<string | null> {
  const ext = path.extname(filePath).toLowerCase()
  
  if (!IMAGE_EXTENSIONS.has(ext) && !VIDEO_EXTENSIONS.has(ext)) {
    return null
  }

  // Initialize dependencies only when needed
  if (!await initDeps()) {
    return null
  }
  
  try {
    // Use queue to prevent overwhelming the system
    return await thumbnailQueue.add(filePath, options)
  } catch (err) {
    console.error('Failed to generate thumbnail:', err)
    return null
  }
}

// Export function to clear cache
export function clearThumbnailCache() {
  thumbnailQueue.clearCache()
}

// Export function to get queue status
export function getThumbnailQueueSize(): number {
  return thumbnailQueue.getQueueSize()
}