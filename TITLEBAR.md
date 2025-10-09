# Custom Title Bar Implementation

## Overview
Your Xvser app now has a modern, frameless window with a custom title bar that matches your glassy aesthetic!

## Features Implemented

### ✨ Custom Title Bar
- **Glassy, modern design** with backdrop blur effects
- **Custom window controls**: Minimize, Maximize/Restore, Close buttons
- **Draggable area**: Click and drag anywhere on the title bar to move the window
- **App branding**: Shows "X" icon and "Xvser" text on the left
- **Theme support**: Adapts to both dark and light themes

### 🎨 Curved Window Corners
- **Rounded corners (12px)** when in windowed mode
- **Automatically removes curves** when maximized for a native feel
- **Smooth transitions** between states
- **Matches the modern UI aesthetic** of the rest of your app

### 🎯 Window Controls
All standard window operations work:
- **Minimize**: Reduces window to taskbar
- **Maximize/Restore**: Toggles between windowed and fullscreen
- **Close**: Closes the application
- **Drag to move**: Drag the title bar to reposition the window
- **Double-click to maximize**: Double-click the title bar to maximize (native behavior)

## How It Works

### Files Modified
1. **`electron/main.ts`**: 
   - Changed window to frameless (`frame: false`)
   - Added IPC handlers for window controls
   - Added maximize/unmaximize event listeners

2. **`electron/preload.ts`**: 
   - Exposed window control APIs to renderer process

3. **`src/components/TitleBar.tsx`**: 
   - New custom title bar component
   - Manages maximized state
   - Handles window control button clicks

4. **`src/App.tsx`**: 
   - Integrated TitleBar component at the top

5. **`src/index.css`**: 
   - Added title bar styling with glass effect
   - Added curved corner styles
   - Dynamic styling based on maximized state

6. **`src/types/global.d.ts`**: 
   - Added TypeScript definitions for window control APIs

## CSS Classes

### Window State Classes
- `body.is-maximized`: Applied when window is maximized
  - Removes border-radius from #root
  - Removes curves from titlebar

### Title Bar Classes
- `.titlebar`: Main title bar container with drag region
- `.titlebar-button`: Window control buttons
- Special styling for close button (red hover effect)

## Customization

### Change Corner Radius
Edit `src/index.css`:
```css
#root {
  border-radius: 12px; /* Change this value */
}
```

### Modify Title Bar Height
Edit `src/components/TitleBar.tsx`:
```tsx
className="titlebar flex items-center justify-between h-8..." 
// Change h-8 to h-10, h-12, etc.
```

### Change Title Bar Appearance
Edit the title bar background in `src/index.css`:
```css
.titlebar {
  background: rgba(11, 11, 15, 0.85); /* Dark theme */
  backdrop-filter: blur(20px);
}
```

## Benefits

✅ **Modern UI**: Frameless window with custom controls  
✅ **Brand consistency**: Title bar matches your app's design language  
✅ **Smooth animations**: All state changes are animated  
✅ **Cross-theme support**: Works in both dark and light modes  
✅ **Native feel**: Curved corners in windowed mode, sharp edges when maximized  
✅ **Performance**: Hardware-accelerated with proper GPU rendering  

## Testing
To test the new title bar:
1. Install the app: `release\Xvser-Setup-0.1.0.exe`
2. Notice the curved corners in windowed mode
3. Try dragging the title bar to move the window
4. Click maximize - corners should become sharp
5. Click restore - corners should return to rounded
6. Test minimize and close buttons

Enjoy your new modern, frameless window! 🎉
