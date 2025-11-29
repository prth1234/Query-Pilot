# SQL Query Editor - Save Functionality

## ✅ Features Implemented

Added the same save/versioning functionality to the **SQL Query Editor** view (matching the Notebook view):

### 1. **Editable Query Name**
- Query name displayed in the editor header
- Click to edit (pencil icon appears on hover)
- Default name: "Untitled Query"
- Saved to localStorage

### 2. **Save Query Button** (💾)
- Icon-only button (purple, left side)
- Located next to query name
- Saves with name-based versioning:
  - **Same name** → Updates existing
  - **Different name** → Creates new version
- Prevents duplicate saves (checks for changes)

### 3. **Saved Queries Dropdown** (🕐)
- Icon-only button with badge showing count
- Located next to save button
- Dropdown shows all saved queries
- Click to load any saved query
- Delete individual queries
- Click-outside to close

## UI Layout

```
┌──────────────────────────────────────────────────────────────┐
│ [▼] My Analytics Query ✏️  [💾] [🕐³]      [⚙️] [▶️ Run All] │
└──────────────────────────────────────────────────────────────┘
     ↑          ↑              ↑    ↑             ↑
Collapse  Editable Name    Save  Saved      Settings/Run
```

- **Left side**: Query name, Save, Saved
- **Right side**: Settings, Theme, Run buttons (unchanged)

## How It Works

### Saving Behavior
1. **First save**: Creates new query
2. **Save with same name**: Updates existing
3. **Save with different name**: Creates new version
4. **Save without changes**: Shows "No changes detected"

### What's Compared
- Query name
- SQL query content  
- Settings (theme, font size, font family, run limit)

### Data Storage
- **localStorage key**: `savedQueries`
- **Each saved query**:
  ```javascript
  {
    id: 'uuid',
    name: 'My Query',
    savedAt: '2024-11-29T...',
    query: 'SELECT...',
    settings: {...}
  }
  ```

## Example Workflows

### Workflow A: Iterative Development
```
Create "Customer Report"
→ Save [💾]
→ Edit queries
→ Save [💾] (updates existing)
→ Refine more
→ Save [💾] (updates again)

Result: 1 saved query, always current
```

### Workflow B: Multiple Versions
```
Create "Analysis v1"
→ Save [💾]
→ Rename to "Analysis v2"
→ Save [💾] (creates new)
→ Rename to "Analysis v3"
→ Save [💾] (creates new)

Result: 3 separate versions
```

## Code Changes

### Files Modified
1. **QueryEditor.jsx**
   - Added query name state and editing
   - Added savedQueries state
   - Implemented save/load/delete handlers
   - Added versioning logic
   - Updated UI with name input and buttons

2. **QueryEditor.css**
   - Added styles for query name editing
   - Added save/saved button styles
   - Added saved queries dropdown styles
   - Added badge styling
   - Added animations

### New Features in QueryEditor
- `queryName` - Current query name
- `savedQueries` - Array of saved queries
- `isEditingName` - Toggle for name editing
- `showSavedQueries` - Toggle for dropdown
- `handleSaveQuery()` - Save with versioning
- `handleLoadQuery()` - Load saved query
- `handleDeleteSavedQuery()` - Delete saved query
- `hasQueryChanged()` - Detect changes

## Benefits

✅ **Same UX as Notebook** - Consistent UI/UX across both views
✅ **Name-based versioning** - Same name updates, different name creates new
✅ **No duplicates** - Smart change detection
✅ **Quick access** - Dropdown with all saved queries
✅ **Badge counter** - Shows number of saves at a glance
✅ **Click-outside** - Dropdown closes automatically

## Summary

The SQL Query Editor now has the same powerful save/versioning system as the Notebook view! Users can:
- Name their queries
- Save and update them
- Create multiple versions
- Load previous queries
- Delete old versions

All with the same smart versioning that prevents duplicates! 🎉
