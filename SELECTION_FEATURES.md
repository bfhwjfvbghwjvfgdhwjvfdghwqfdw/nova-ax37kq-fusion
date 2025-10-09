# File Selection Features

Your Xvser file manager now includes comprehensive file selection capabilities similar to Windows Explorer, with full customization options!

## 🎯 Selection Methods

### 1. **Single Click Selection**
- **Click** on any file or folder to select it
- The selected item will be highlighted with a background color
- Previous selections are cleared when you click a new item

### 2. **Multi-Select (Ctrl+Click)**
- **Ctrl+Click** on files to select multiple items
- Each Ctrl+Click toggles the selection state of that item
- Great for selecting non-consecutive files
- Can be enabled/disabled in Settings → Navigation

### 3. **Range Select (Shift+Click)**
- Select a file, then **Shift+Click** another file
- All files between the two will be selected
- Perfect for selecting consecutive groups of files
- Can be enabled/disabled in Settings → Navigation

### 4. **Select All (Ctrl+A)**
- Press **Ctrl+A** to select all files in the current folder
- Press **Ctrl+A** again or **Escape** to deselect all

### 5. **Checkbox Selection**
- Enable checkboxes in View Menu → Display → Item checkboxes
- Click checkboxes to toggle individual file selection
- Checkboxes appear on hover in list/grid views
- Header checkbox selects/deselects all files

## ⚙️ Customization Options

Access these settings via **Settings → Navigation → File Selection**:

### **Enable Multi-Select**
- Default: ✅ Enabled
- When enabled: Use Ctrl+Click to select multiple files
- When disabled: Ctrl+Click behaves like normal click

### **Enable Range Select**
- Default: ✅ Enabled
- When enabled: Use Shift+Click to select file ranges
- When disabled: Shift+Click behaves like normal click

### **Select on Right-Click**
- Default: ✅ Enabled
- When enabled: Right-clicking a file automatically selects it before showing the context menu
- When disabled: Right-click shows context menu without changing selection

### **Show Selection Checkboxes**
- Default: ❌ Disabled
- When enabled: Displays checkboxes next to each file for easy selection
- Checkboxes appear on hover in list/grid views
- Always visible in details view

### **Select Folders on Click**
- Default: ✅ Enabled
- When enabled: Clicking folders selects them (like files)
- When disabled: Clicking folders opens them immediately
- Note: Ctrl+Click and Shift+Click still work regardless of this setting

## 🎨 Visual Feedback

### Selected Items
- **Highlighted Background**: Selected items show a distinct background color
- **Preview Pane**: When one item is selected, its details appear in the preview pane
- **Status Bar**: Shows count of selected items and total size
- **Multi-Selection**: Status bar shows "X items selected" with combined file size

### Selection States
- **Normal**: Default appearance
- **Hover**: Slight highlight on mouse over
- **Selected**: Clear background highlight
- **Selected + Hover**: Combined visual feedback

## 📋 Quick Actions with Selection

Once files are selected, you can:

### Toolbar Actions
- **Open**: Opens the first selected file/folder
- **Delete**: Moves all selected items to Recycle Bin
- **New**: Creates a new folder (clears selection)

### Keyboard Shortcuts
- **Enter**: Open selected items
- **Delete**: Move selected items to Recycle Bin
- **F2**: Rename (single item only)
- **Ctrl+A**: Select all
- **Ctrl+C**: Copy (future feature)
- **Ctrl+X**: Cut (future feature)
- **Ctrl+V**: Paste (future feature)

### Context Menu (Right-Click)
- Works with single or multiple selections
- Actions apply to all selected items
- Options: Open, Rename, Delete, Properties, etc.

### Status Bar Actions
- **Copy Path**: Copies file path to clipboard (single item)
- **Reveal**: Opens containing folder in Windows Explorer (single item)

## 💡 Usage Tips

### For Power Users
1. **Bulk Operations**: Select multiple files with Ctrl+Click or Shift+Click, then delete or move them all at once
2. **Quick Selection**: Enable checkboxes for mouse-only file selection
3. **Keyboard Navigation**: Use Ctrl+A to quickly select all files, then Ctrl+Click to deselect specific ones

### For Casual Users
1. **Simple Mode**: Disable "Select Folders on Click" for instant folder navigation
2. **Visual Selection**: Enable checkboxes for clear visual feedback
3. **Right-Click Selection**: Keep "Select on Right-Click" enabled for convenience

### Windows Explorer-Like Behavior
To make Xvser behave exactly like Windows Explorer:
- ✅ Enable Multi-Select
- ✅ Enable Range Select
- ✅ Enable Select on Right-Click
- ❌ Disable Show Selection Checkboxes
- ❌ Disable Select Folders on Click
- ✅ Enable Double-Click to Open

## 🎯 Selection in Different View Modes

### Details View
- Checkboxes shown in first column (when enabled)
- Header checkbox for select all
- Full row is clickable

### List View
- Compact vertical layout
- Checkboxes appear on hover (when enabled)
- Icon and name visible

### Tiles/Grid View
- Large icons for easy selection
- Checkboxes in top-left corner (when enabled)
- Perfect for image files

### Content View
- Two-column layout with file details
- Checkboxes shown (when enabled)
- Shows more metadata

## 🔧 Technical Details

### Performance
- Selection state is managed efficiently with Sets
- No performance impact even with thousands of files
- Visual updates use React optimizations

### Persistence
- Selection is cleared when changing directories
- Selection state is not persisted between sessions
- Settings are saved to localStorage

### Compatibility
- Works with all file types
- Supports folders and files equally
- Compatible with virtual scrolling for large directories

## 🆕 Future Enhancements

Planned features:
- **Drag-to-Select Rectangle**: Draw a selection box with mouse
- **Invert Selection**: Select all unselected items
- **Select by Pattern**: Select files matching a pattern (*.txt)
- **Select by Type**: Quick filter buttons (All Images, All Documents, etc.)
- **Remember Selection**: Persist selection when navigating back
- **Selection Clipboard**: Copy/Cut/Paste operations

---

**Enjoy your enhanced file selection experience!** 🎉

If you have suggestions or find issues, please open an issue on GitHub.
