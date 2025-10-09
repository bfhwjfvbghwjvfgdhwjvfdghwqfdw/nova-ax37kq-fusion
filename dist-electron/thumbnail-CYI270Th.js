"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const fs = require("fs-extra");
const path = require("path");
const require$$1 = require("child_process");
const require$$0 = require("util");
let sharp;
let ffmpeg;
const execAsync = require$$0.promisify(require$$1.exec);
const CACHE_DIR = path.join(process.env.APPDATA || process.env.HOME || ".", ".xvser-cache");
fs.ensureDirSync(CACHE_DIR);
const VIDEO_EXTENSIONS = /* @__PURE__ */ new Set([".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv", ".webm", ".m4v", ".3gp"]);
const IMAGE_EXTENSIONS = /* @__PURE__ */ new Set([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tiff", ".svg"]);
class ThumbnailQueue {
  constructor() {
    __publicField(this, "queue", []);
    __publicField(this, "processing", 0);
    __publicField(this, "maxConcurrent", 2);
    // Limit concurrent FFmpeg processes
    __publicField(this, "cache", /* @__PURE__ */ new Map());
    __publicField(this, "maxCacheSize", 500);
  }
  // Maximum cached promises
  async add(filePath, options) {
    const cacheKey = this.getCacheKey(filePath, options);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    const promise = new Promise((resolve, reject) => {
      this.queue.push({ filePath, options, resolve, reject });
      this.processQueue();
    });
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(cacheKey, promise);
    return promise;
  }
  getCacheKey(filePath, options) {
    const { width = 256, height = 256, quality = 80, timestamp = "00:00:01" } = options;
    return `${filePath}:${width}x${height}:${quality}:${timestamp}`;
  }
  async processQueue() {
    if (this.processing >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    this.processing++;
    const item = this.queue.shift();
    try {
      const ext = path.extname(item.filePath).toLowerCase();
      let result = null;
      if (IMAGE_EXTENSIONS.has(ext)) {
        result = await getImageThumbnail(item.filePath, item.options);
      } else if (VIDEO_EXTENSIONS.has(ext)) {
        result = await getVideoThumbnail(item.filePath, item.options);
      }
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      this.processing--;
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }
  }
  clearCache() {
    this.cache.clear();
  }
  getQueueSize() {
    return this.queue.length;
  }
}
const thumbnailQueue = new ThumbnailQueue();
async function getImageThumbnail(filePath, options = {}) {
  try {
    const { width = 256, height = 256, quality = 80 } = options;
    const fileName = path.basename(filePath).replace(/[^a-z0-9]/gi, "_");
    const cacheKey = `img_${width}x${height}_${quality}_${fileName}`;
    const cachePath = path.join(CACHE_DIR, cacheKey + ".webp");
    try {
      const [cacheStats, sourceStats] = await Promise.all([
        fs.stat(cachePath),
        fs.stat(filePath)
      ]);
      if (cacheStats.mtimeMs > sourceStats.mtimeMs) {
        const cached = await fs.readFile(cachePath);
        return `data:image/webp;base64,${cached.toString("base64")}`;
      }
    } catch {
    }
    const image = await sharp(filePath).resize(width, height, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: true
    }).webp({ quality, effort: 0 }).toBuffer({ resolveWithObject: false });
    await fs.writeFile(cachePath, image);
    return `data:image/webp;base64,${image.toString("base64")}`;
  } catch (err) {
    console.error("Failed to generate image thumbnail:", err);
    return null;
  }
}
async function getVideoThumbnail(filePath, options = {}) {
  try {
    const { width = 256, height = 256, quality = 80, timestamp = "00:00:01" } = options;
    const fileName = path.basename(filePath).replace(/[^a-z0-9]/gi, "_");
    const cacheKey = `vid_${width}x${height}_${quality}_${timestamp}_${fileName}`;
    const cachePath = path.join(CACHE_DIR, cacheKey + ".webp");
    try {
      const [cacheStats, sourceStats] = await Promise.all([
        fs.stat(cachePath),
        fs.stat(filePath)
      ]);
      if (cacheStats.mtimeMs > sourceStats.mtimeMs) {
        const cached = await fs.readFile(cachePath);
        return `data:image/webp;base64,${cached.toString("base64")}`;
      }
    } catch {
    }
    const tempPath = path.join(CACHE_DIR, `temp_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`);
    await new Promise((resolve, reject) => {
      const ffmpegProcess = require$$1.spawn("ffmpeg", [
        "-ss",
        timestamp,
        "-i",
        filePath,
        "-vframes",
        "1",
        "-vf",
        `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
        "-q:v",
        "5",
        // Lower quality for faster processing
        "-y",
        tempPath
      ], {
        windowsHide: true,
        stdio: "ignore"
        // Ignore output to reduce memory
      });
      const timeout = setTimeout(() => {
        ffmpegProcess.kill("SIGKILL");
        reject(new Error("FFmpeg timeout"));
      }, 1e4);
      ffmpegProcess.on("close", (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });
      ffmpegProcess.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
    if (!await fs.pathExists(tempPath)) {
      throw new Error("FFmpeg did not create thumbnail");
    }
    const image = await sharp(tempPath).webp({ quality, effort: 0 }).toBuffer({ resolveWithObject: false });
    try {
      await fs.unlink(tempPath);
    } catch {
    }
    await fs.writeFile(cachePath, image);
    return `data:image/webp;base64,${image.toString("base64")}`;
  } catch (err) {
    console.error("Failed to generate video thumbnail:", err);
    return null;
  }
}
async function initDeps() {
  if (!sharp) {
    try {
      sharp = (await import("sharp")).default;
    } catch (err) {
      console.error("Failed to load sharp:", err);
      return false;
    }
  }
  if (!ffmpeg) {
    try {
      ffmpeg = (await import("fluent-ffmpeg")).default;
      await execAsync("ffmpeg -version");
    } catch (err) {
      console.error("Failed to initialize ffmpeg:", err);
      return false;
    }
  }
  return true;
}
async function getThumbnail(filePath, options = {}) {
  const ext = path.extname(filePath).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext) && !VIDEO_EXTENSIONS.has(ext)) {
    return null;
  }
  if (!await initDeps()) {
    return null;
  }
  try {
    return await thumbnailQueue.add(filePath, options);
  } catch (err) {
    console.error("Failed to generate thumbnail:", err);
    return null;
  }
}
exports.getThumbnail = getThumbnail;
