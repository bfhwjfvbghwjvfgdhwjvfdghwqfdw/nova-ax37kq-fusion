/*
 Builds a Windows installer (Setup.exe) using:
 1) @electron/packager to create a packaged app folder
 2) electron-winstaller (Squirrel.Windows) to create an installer

 This avoids electron-builder entirely, working around symlink permission issues.
*/

const path = require('path');
const fs = require('fs');
const packager = require('@electron/packager');
const electronInstaller = require('electron-winstaller');

async function main() {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8'));
  const appName = pkg.productName || pkg.name || 'App';
  const setupIconPath = path.resolve(__dirname, '..', 'build', 'icon.ico');
  const version = pkg.version || '0.0.0';

  const outDir = path.resolve(process.cwd(), 'release-packager');
  const appOutName = `${appName}-win32-x64`;

  console.log(`[1/3] Packaging app with @electron/packager to ${outDir}`);
  const appPaths = await packager({
    dir: path.resolve(process.cwd()),
    out: outDir,
    platform: 'win32',
    arch: 'x64',
    overwrite: true,
    asar: true,
    prune: false,
    icon: setupIconPath,
    executableName: appName,
    appCopyright: pkg.author ? `${pkg.author}` : undefined,
    appVersion: version,
  });

  const appDir = appPaths && appPaths[0] ? appPaths[0] : path.resolve(outDir, appOutName);
  if (!fs.existsSync(appDir)) {
    throw new Error(`Packager output not found at ${appDir}`);
  }

  console.log(`[2/3] Creating Squirrel installer with electron-winstaller from ${appDir}`);
  const squirrelOut = path.resolve(process.cwd(), 'release-squirrel');
  if (!fs.existsSync(squirrelOut)) fs.mkdirSync(squirrelOut, { recursive: true });

  const setupExeName = `${appName}-Setup-${version}.exe`;

  await electronInstaller.createWindowsInstaller({
    appDirectory: appDir,
    outputDirectory: squirrelOut,
    authors: pkg.author ? `${pkg.author}` : 'Unknown',
    exe: `${appName}.exe`,
    setupExe: setupExeName,
    noMsi: true,
    setupIcon: setupIconPath
    // iconUrl is optional; without it, default exe icon may be used in shortcuts
  });

  console.log(`[3/3] Done. Installer created: ${path.join(squirrelOut, setupExeName)}`);
}

main().catch((err) => {
  console.error('Squirrel build failed:', err);
  process.exit(1);
});
