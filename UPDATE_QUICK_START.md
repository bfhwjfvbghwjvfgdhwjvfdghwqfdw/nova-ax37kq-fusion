# Update System - Quick Start Guide

## 🎯 What You Got

A complete auto-update system that:
- ✅ Checks for updates automatically on startup
- ✅ Shows a small notification in the title bar (non-intrusive)
- ✅ Lets users control when to download and install
- ✅ Works with GitHub Releases

## 📍 Where the Update Notification Appears

```
┌─────────────────────────────────────────────────────────┐
│ [X] Xvser              [🔵 Update] [─] [□] [✕]         │ ← Title Bar
└─────────────────────────────────────────────────────────┘
                            ↑
                    Update badge appears here!
```

## 🚀 How to Publish Your First Update

### Step 1: Update Version
Edit `package.json`:
```json
{
  "version": "0.2.0"  ← Change this
}
```

### Step 2: Build
```bash
npm run build
npm run dist:win
```

### Step 3: Create GitHub Release

1. Go to: `https://github.com/YOUR_USERNAME/xvser/releases/new`
2. Fill in:
   - **Tag:** `v0.2.0` (must start with 'v')
   - **Title:** `Version 0.2.0`
   - **Description:** What's new in this version
3. Upload files from `release/` folder:
   - `Xvser-Setup-0.2.0.exe`
   - `latest.yml`
4. Click **Publish release**

### Step 4: Test
1. Open your installed Xvser app
2. Wait 4 seconds
3. Update notification appears in title bar! 🎉

## 🎨 What Users See

### 1. Update Available
```
[🔵 Update] ← Blue icon with pulse animation
```
Click to see:
```
┌─────────────────────────────┐
│ Update Available      [✕]   │
│ Version 0.2.0               │
├─────────────────────────────┤
│ • New features              │
│ • Bug fixes                 │
│ • Performance improvements  │
├─────────────────────────────┤
│ [Download]  [Later]         │
└─────────────────────────────┘
```

### 2. Downloading
```
[🔵 Downloading... ████░░░░ 45%]
```

### 3. Ready to Install
```
[✅ Ready] ← Green checkmark
```
Click to see:
```
┌─────────────────────────────┐
│ Update Ready          [✕]   │
│ Version 0.2.0 downloaded    │
├─────────────────────────────┤
│ The update is ready to      │
│ install. The app will       │
│ restart to complete.        │
├─────────────────────────────┤
│ [Install & Restart] [Later] │
└─────────────────────────────┘
```

## ⚙️ Configuration

**IMPORTANT:** Update `electron-builder.json` with your GitHub info:

```json
{
  "publish": {
    "provider": "github",
    "owner": "YOUR_GITHUB_USERNAME",  ← Change this!
    "repo": "xvser",                  ← Change if different
    "releaseType": "release"
  }
}
```

## 🧪 Testing

### Test Locally
1. Build version 0.1.0 and install it
2. Create GitHub release for 0.2.0
3. Open the installed app
4. Update notification appears after 4 seconds

### Check Logs
In development mode, open DevTools and look for:
```
[updater] checking for update
[updater] update available 0.2.0
[updater] downloading 45%
[updater] update downloaded; ready to install
```

## 🐛 Troubleshooting

### "No update notification appears"
- ✅ Is the app packaged? (Updates don't work in dev mode)
- ✅ Is there a newer version on GitHub?
- ✅ Is the GitHub release published (not draft)?
- ✅ Is `latest.yml` uploaded to the release?
- ✅ Is `owner` and `repo` correct in `electron-builder.json`?

### "Download fails"
- ✅ Check internet connection
- ✅ Check GitHub release is public
- ✅ Check firewall/antivirus

### "Install fails"
- ✅ Close all app instances
- ✅ Run as administrator
- ✅ Check Windows SmartScreen

## 📝 Files Modified

- ✅ `electron/main.ts` - Update logic
- ✅ `electron/preload.ts` - IPC bridge
- ✅ `src/types/window.d.ts` - TypeScript types
- ✅ `src/components/UpdateNotification.tsx` - UI component (NEW)
- ✅ `src/components/TitleBar.tsx` - Integration

## 🎓 Learn More

See `UPDATE_SYSTEM.md` for:
- Detailed API reference
- Advanced configuration
- Security considerations
- Future enhancements

## 💡 Tips

1. **Version Format:** Always use semantic versioning (0.1.0, 0.2.0, 1.0.0)
2. **Git Tags:** Tag must start with 'v' (v0.2.0)
3. **Release Notes:** Write clear, user-friendly release notes
4. **Testing:** Always test updates before publishing
5. **Backup:** Keep old versions in case rollback is needed

## 🎉 That's It!

Your app now has a professional auto-update system. Users will love the convenience!

---

**Need help?** Check the console logs or see `UPDATE_SYSTEM.md` for detailed docs.
