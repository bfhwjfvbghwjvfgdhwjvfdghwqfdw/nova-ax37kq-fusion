# Quick Testing Guide for File Selection

## ✅ Fixed Issues

The selection now works properly **with or without checkboxes**! Here's what was fixed:

1. **Event Handling**: The click event is now properly passed to the selection handler, allowing Ctrl and Shift keys to be detected
2. **Checkbox Sync**: The checkbox setting now properly syncs between Settings and View menu
3. **Selection Logic**: All selection methods work independently of checkbox visibility

## 🧪 How to Test

### **Test 1: Basic Click Selection (No Checkboxes)**

1. Make sure checkboxes are **OFF** (Settings → Navigation → Show Selection Checkboxes)
2. Navigate to any folder with files
3. **Click** a file → It should be selected (highlighted background)
4. **Click** another file → Previous selection clears, new file is selected
5. ✅ **Expected**: Files get selected with a highlight, one at a time

### **Test 2: Multi-Select with Ctrl+Click**

1. Checkboxes still **OFF**
2. **Click** a file to select it
3. Hold **Ctrl** and **Click** another file
4. Both files should now be selected
5. Hold **Ctrl** and **Click** one of the selected files to deselect it
6. ✅ **Expected**: Can select/deselect multiple files with Ctrl+Click

### **Test 3: Range Select with Shift+Click**

1. Checkboxes still **OFF**
2. **Click** a file (e.g., first file in list)
3. Hold **Shift** and **Click** a file further down (e.g., 5th file)
4. All files between should be selected
5. ✅ **Expected**: Entire range gets selected

### **Test 4: Select All with Ctrl+A**

1. Checkboxes still **OFF**
2. Press **Ctrl+A**
3. All files should be selected
4. Press **Ctrl+A** again or click a file to deselect
5. ✅ **Expected**: All files selected/deselected

### **Test 5: Selection with Checkboxes ON**

1. Turn **ON** checkboxes (Settings → Navigation → Show Selection Checkboxes)
2. Checkboxes should appear next to files
3. Try all the above tests again (Click, Ctrl+Click, Shift+Click, Ctrl+A)
4. ✅ **Expected**: Everything works the same, plus you can click checkboxes

### **Test 6: Right-Click Selection**

1. **Right-click** any file
2. The file should be selected (if "Select on Right-Click" is enabled in Settings)
3. Context menu should appear
4. ✅ **Expected**: File is selected before showing menu

### **Test 7: Folder vs File Selection**

#### With "Select Folders on Click" = ON (default)
1. **Click** a folder → It gets selected (highlighted)
2. **Double-click** the folder → It opens
3. Hold **Ctrl** and **Click** folders → Multiple folders selected

#### With "Select Folders on Click" = OFF
1. **Click** a folder → It opens immediately
2. Hold **Ctrl** and **Click** a folder → It gets selected without opening
3. Hold **Shift** and **Click** → Range selection still works

### **Test 8: Visual Feedback**

1. Select files and check:
   - **Background highlight** appears on selected items
   - **Status bar** shows "X items selected"
   - **Preview pane** shows selected file details (if 1 item selected)
   - **Status bar** shows total size of selected items

### **Test 9: Different View Modes**

Test selection in all view modes:
- **Details View** (table with columns)
- **List View** (compact list)
- **Tiles View** (grid with large icons)
- **Content View** (two columns)

✅ **Expected**: Selection works identically in all views

## 🎛️ Settings to Adjust

Go to **Settings → Navigation → File Selection** and toggle:

1. ☑️ **Enable Multi-Select**: Turn off to disable Ctrl+Click
2. ☑️ **Enable Range Select**: Turn off to disable Shift+Click
3. ☑️ **Select on Right-Click**: Turn off to prevent auto-selection on right-click
4. ☐ **Show Selection Checkboxes**: Turn on to show checkboxes
5. ☑️ **Select Folders on Click**: Turn off for instant folder opening

## 🐛 Known Behaviors (Not Bugs)

1. **Selection clears when changing folders**: This is intentional, like Windows Explorer
2. **Folder behavior changes with settings**: Different users prefer different workflows
3. **Checkboxes appear on hover**: In List/Tiles view, checkboxes fade in on mouse hover for cleaner UI
4. **Right-click auto-select**: Only selects if the item wasn't already selected

## 💡 Tips for Best Experience

### For Windows Explorer Feel:
```
✅ Enable Multi-Select
✅ Enable Range Select  
✅ Select on Right-Click
❌ Show Selection Checkboxes (OFF)
❌ Select Folders on Click (OFF)
✅ Double-Click to Open
```

### For Touch/Mouse-Friendly:
```
✅ Enable Multi-Select
✅ Enable Range Select
✅ Select on Right-Click
✅ Show Selection Checkboxes (ON)
✅ Select Folders on Click
✅ Double-Click to Open
```

### For Quick Navigation:
```
❌ Enable Multi-Select (OFF)
❌ Enable Range Select (OFF)
✅ Select on Right-Click
❌ Show Selection Checkboxes (OFF)
❌ Select Folders on Click (OFF)
❌ Double-Click to Open (OFF)
✅ Single-Click to Open
```

## 🎯 Quick Keyboard Reference

- **Click**: Select single item
- **Ctrl+Click**: Toggle item selection (multi-select)
- **Shift+Click**: Select range from last clicked to current
- **Ctrl+A**: Select all items
- **Enter**: Open selected item(s)
- **Delete**: Move selected items to Recycle Bin
- **F2**: Rename selected item (single only)

---

**Need help?** Check `SELECTION_FEATURES.md` for complete documentation!
