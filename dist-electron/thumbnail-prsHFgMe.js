"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const fs = require("fs-extra");
const path = require("path");
const child_process = require("child_process");
const util = require("util");
let sharp;
let ffmpeg;
const execAsync = util.promisify(child_process.exec);
const CACHE_DIR = path.join(process.env.APPDATA || process.env.HOME || ".", ".xvser-cache");
fs.ensureDirSync(CACHE_DIR);
const VIDEO_EXTENSIONS = /* @__PURE__ */ new Set([".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv", ".webm"]);
const IMAGE_EXTENSIONS = /* @__PURE__ */ new Set([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"]);
async function getImageThumbnail(filePath, options = {}) {
  try {
    const { width = 256, height = 256, quality = 80 } = options;
    const cacheKey = `img_${width}x${height}_${quality}_${filePath.replace(/[^a-z0-9]/gi, "_")}`;
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
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }).webp({ quality }).toBuffer();
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
    const cacheKey = `vid_${width}x${height}_${quality}_${timestamp}_${filePath.replace(/[^a-z0-9]/gi, "_")}`;
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
    const tempPath = path.join(CACHE_DIR, `temp_${Date.now()}.png`);
    await new Promise((resolve, reject) => {
      ffmpeg(filePath).on("end", resolve).on("error", reject).screenshots({
        timestamps: [timestamp],
        filename: path.basename(tempPath),
        folder: path.dirname(tempPath),
        size: `${width}x${height}`
      });
    });
    const image = await sharp(tempPath).webp({ quality }).toBuffer();
    await fs.unlink(tempPath);
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
    if (IMAGE_EXTENSIONS.has(ext)) {
      return getImageThumbnail(filePath, options);
    } else if (VIDEO_EXTENSIONS.has(ext)) {
      return getVideoThumbnail(filePath, options);
    }
  } catch (err) {
    console.error("Failed to generate thumbnail:", err);
  }
  return null;
}
exports.getThumbnail = getThumbnail;
