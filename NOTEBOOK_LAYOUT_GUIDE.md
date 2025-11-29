# Notebook Header - New Layout

## Visual Comparison

### BEFORE (Old Layout)
```
┌────────────────────────────────────────────────────────────────────────────────┐
│                                                                                │
│  📓 My Notebook ✏️                                                             │
│                                                                                │
│                          [⚙️ Settings] [🔢 Limit] | [↑ To Editor]             │
│                          [🕐 Saved (3)] [💾 Save Notebook]                    │
│                          [🗑️ Delete All] [▶️ Run All]                          │
│                          [➕ Add Text] [➕ Add Query]                          │
└────────────────────────────────────────────────────────────────────────────────┘
```
**Issues**:
- Save buttons far from notebook title
- Text labels made buttons wide
- Duplicate saves without changes
- Visually disconnected from notebook identity

---

### AFTER (New Layout)
```
┌────────────────────────────────────────────────────────────────────────────────┐
│                                                                                │
│  📓 My Notebook ✏️  [💾] [🕐³]                                                 │
│                                                                                │
│                          [⚙️ Settings] [🔢 Limit] | [↑ To Editor]             │
│                          [🗑️ Delete All] [▶️ Run All]                          │
│                          [➕ Add Text] [➕ Add Query]                          │
└────────────────────────────────────────────────────────────────────────────────┘
```
**Improvements**:
- ✅ Save buttons next to title (logical grouping)
- ✅ Icon-only buttons (compact)
- ✅ Badge shows count (3 saved versions)
- ✅ Smart versioning prevents duplicates
- ✅ Visual hierarchy improved

---

## Button Details

### Left Side (Notebook Identity & Versioning)

#### 1. Notebook Title
```
┌─────────────────────────┐
│ 📓 My Notebook ✏️       │
└─────────────────────────┘
  Click to edit name
```

#### 2. Save Button (💾)
```
┌─────┐
│ 💾  │  ← Icon only, no text
└─────┘
  Purple background
  Saves current version
  Tooltip: "Save current notebook version"
```

**Smart Behavior**:
- Compares current state with last saved version
- Only saves if changes detected
- Shows alert if no changes

#### 3. Saved Button (🕐)
```
┌─────┐
│ 🕐³ │  ← Icon with badge
└─────┘
  Badge shows count (3)
  Gray background
  Tooltip: "View saved notebooks"
```

**Click to reveal dropdown**:
```
┌────────────────────────────────────┐
│ SAVED NOTEBOOKS                    │
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │ Analysis v3                [🗑️]│ │
│ │ Nov 29, 9:45 PM • 5 cells      │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ Analysis v2                [🗑️]│ │
│ │ Nov 29, 8:30 PM • 4 cells      │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ Analysis v1                [🗑️]│ │
│ │ Nov 29, 6:15 PM • 3 cells      │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

---

### Right Side (Actions)

All action buttons remain on the right:
- ⚙️ Settings
- 🔢 Run Limit
- ↑ To Editor
- 🗑️ Delete All
- ▶️ Run All
- ➕ Add Text
- ➕ Add Query

---

## Smart Versioning Logic

### What Gets Compared

```javascript
Current Notebook              Last Saved Version
─────────────────            ─────────────────
Name: "Analysis"       ===   Name: "Analysis"
Cells: 5               ===   Cells: 5
Cell[0].query          ===   Cell[0].query
Cell[1].query          ===   Cell[1].query
...
Theme: "VS Code Dark"  ===   Theme: "VS Code Dark"
Font Size: 13          ===   Font Size: 13
```

**If ALL match** → No changes detected → Don't save
**If ANY differ** → Changes detected → Save new version

### What Gets Ignored

❌ Cell results (these change every run)
❌ Execution times
❌ Error states
❌ Cell IDs (UUIDs)
❌ Timestamps

---

## User Flows

### Flow 1: First Save
```
1. Create new notebook
   ↓
2. Write queries
   ↓
3. Click [💾] save icon
   ↓
4. ✅ Saves successfully
   ↓
5. Badge appears: [🕐¹]
```

### Flow 2: Save After Changes
```
1. Notebook saved (badge: [🕐¹])
   ↓
2. Edit a query
   ↓
3. Click [💾] save icon
   ↓
4. ✅ Detects changes
   ↓
5. Saves new version
   ↓
6. Badge updates: [🕐²]
   ↓
7. Alert: "Saved as new version!"
```

### Flow 3: Duplicate Save Prevention
```
1. Notebook saved (badge: [🕐²])
   ↓
2. No edits made
   ↓
3. Click [💾] save icon
   ↓
4. ⚠️ Compares with last save
   ↓
5. No changes detected
   ↓
6. Alert: "No changes detected. Notebook is already up to date."
   ↓
7. Badge stays: [🕐²]
```

### Flow 4: Load Previous Version
```
1. Click [🕐²] badge
   ↓
2. Dropdown opens
   ↓
3. Click "Analysis v1"
   ↓
4. Confirmation: "Load 'Analysis v1'?"
   ↓
5. Click OK
   ↓
6. ✅ Notebook restored to v1 state
   ↓
7. Alert: "Notebook loaded successfully!"
```

---

## CSS Updates

### Badge Styling
```css
.saved-count-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #a371f7;    /* Purple */
    color: white;
    font-size: 9px;
    font-weight: 600;
    padding: 2px 5px;
    border-radius: 10px;
}
```

**Visual Result**:
```
┌─────────┐
│  🕐   │
│      ³│  ← Badge in top-right
└─────────┘
```

### Button Grouping
```css
.notebook-title-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: 12px;
}
```

**Visual Result**:
```
Title ───── 12px gap ───── [💾] 6px [🕐]
```

---

## Keyboard Shortcuts (Future Enhancement)

Potential shortcuts:
- `Cmd + S` → Save notebook
- `Cmd + Shift + S` → View saved notebooks
- `Cmd + Shift + L` → Load last saved version

---

## Benefits Summary

### Before
❌ Save buttons cluttered the right side
❌ Text labels took up space
❌ Easy to accidentally save duplicates
❌ Had to search for save functionality
❌ No visual indication of save count

### After
✅ Logical button placement (saves near title)
✅ Compact icon-only design
✅ Smart versioning prevents duplicates
✅ Clear badge showing save count
✅ Better visual hierarchy
✅ User gets immediate feedback
✅ More screen space for actions

---

## Technical Details

### State Management
```javascript
const [savedNotebooks, setSavedNotebooks] = useState([])
const [showSavedNotebooks, setShowSavedNotebooks] = useState(false)
```

### LocalStorage Keys
```javascript
'savedNotebooks'    // Array of saved notebook objects
'notebookCells'     // Current notebook cells
'notebookName'      // Current notebook name
```

### Saved Notebook Object
```javascript
{
  id: 'uuid-v4',
  name: 'My Notebook',
  savedAt: '2024-11-29T15:30:00.000Z',
  cells: [...],
  settings: {
    theme: {...},
    fontSize: 13,
    fontFamily: {...},
    limit: {...}
  }
}
```

---

This new layout provides a cleaner, more intuitive interface for managing notebook versions! 🎉
