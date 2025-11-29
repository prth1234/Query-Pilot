# Notebook Features - Visual Guide

## New UI Layout

### Notebook Header (After Implementation)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  📓 My Analysis Notebook ✏️                                                         │
│                                                                                     │
│                    [⚙️ Settings] [🔢 Limit 1000 ▾] | [↑ To Editor] [🕐 Saved (3)] │
│                    [💾 Save Notebook] [🗑️ Delete All] [▶️ Run All]                │
│                    [➕ Add Text] [➕ Add Query]                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Button Descriptions

### 1. ↑ To Editor (New!)
- **Style**: Secondary (gray)
- **Icon**: UploadIcon
- **Action**: Consolidates all SQL queries from notebook cells and imports them to the SQL Editor view
- **Position**: After the keyboard hints, before Saved button

### 2. 🕐 Saved (N) (New!)
- **Style**: Secondary (gray)
- **Icon**: ClockIcon
- **Badge**: Shows count of saved notebooks
- **Action**: Opens dropdown to view and manage saved notebook versions
- **Position**: After To Editor button

### 3. 💾 Save Notebook (New!)
- **Style**: Purple/Violet
- **Icon**: DownloadIcon
- **Action**: Saves current notebook state as a new version
- **Position**: After Saved button

## Saved Notebooks Dropdown

When you click "Saved (3)", you see:

```
┌─────────────────────────────────────────────┐
│ SAVED NOTEBOOKS                             │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ 📊 Customer Analysis                    │ │
│ │ Nov 29, 2024, 9:30 PM • 5 cells    [🗑️] │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 📈 Sales Report Q4                      │ │
│ │ Nov 28, 2024, 3:45 PM • 8 cells    [🗑️] │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 🔍 Data Quality Check                   │ │
│ │ Nov 27, 2024, 11:20 AM • 3 cells   [🗑️] │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

Each saved notebook shows:
- Notebook name
- Save timestamp
- Number of cells
- Delete button (trash icon)

## Feature Workflow Examples

### Example 1: Import to Editor

1. You have a notebook with 3 SQL query cells:
   ```sql
   -- Cell 1
   SELECT * FROM customers WHERE country = 'USA';
   
   -- Cell 2
   SELECT COUNT(*) FROM orders WHERE status = 'pending';
   
   -- Cell 3
   SELECT product_name, SUM(quantity) FROM sales GROUP BY product_name;
   ```

2. Click **"To Editor"** button

3. Automatically switches to Editor view with consolidated query:
   ```sql
   -- Query 1
   SELECT * FROM customers WHERE country = 'USA';
   
   -- Query 2
   SELECT COUNT(*) FROM orders WHERE status = 'pending';
   
   -- Query 3
   SELECT product_name, SUM(quantity) FROM sales GROUP BY product_name;
   ```

### Example 2: Save and Restore Versions

**Timeline:**

**10:00 AM** - Working on initial analysis
- Create queries for customer segmentation
- Click **"Save Notebook"** → "Customer Analysis v1" saved

**11:30 AM** - Add more complex queries
- Add join queries and aggregations
- Click **"Save Notebook"** → "Customer Analysis v2" saved

**2:00 PM** - Experiment with different approach
- Modify queries significantly
- Something breaks...
- Click **"Saved (2)"**
- Select "Customer Analysis v1" from dropdown
- Confirm load
- ✅ Back to working state from 10:00 AM!

### Example 3: Manage Saved Notebooks

```
Current: "Saved (5)"

Click "Saved (5)" dropdown:
├─ My Latest Analysis (Nov 29, 9:45 PM) ✓ Click to load
├─ Experiment v2 (Nov 29, 8:30 PM) ✓ Click to load
├─ Experiment v1 (Nov 29, 6:15 PM) [🗑️ Click to delete]
├─ Old Report (Nov 28, 3:00 PM) [🗑️ Click to delete]
└─ Test Queries (Nov 27, 1:20 PM) [🗑️ Click to delete]

After deleting "Test Queries":
Now shows: "Saved (4)"
```

## Color Coding

- **Secondary buttons** (gray): To Editor, Saved
- **Purple button**: Save Notebook (special save action)
- **Green button**: Run All (primary action)
- **Blue buttons**: Add Text, Add Query (creation actions)
- **Red button**: Delete All (destructive action)

## Keyboard Shortcuts

The existing keyboard shortcuts still work:
- `Cmd + Enter` in a cell: Run that cell
- `Shift + Enter` in a cell: Run cell and move to next

## Storage

All data is stored in localStorage:
- `notebookCells` - Current notebook cells
- `notebookName` - Current notebook name
- `savedNotebooks` - Array of saved notebook versions
- `notebookRunLimit`, `notebookTheme`, `notebookFontSize`, `notebookFontFamily` - Settings

## What Gets Saved

Each saved notebook includes:
- ✅ Notebook name (e.g., "My Analysis")
- ✅ All cells (SQL and markdown)
- ✅ Cell queries and content
- ✅ Cell results and execution times
- ✅ All settings (theme, font, limit)
- ✅ Timestamp of when saved
- ✅ Unique ID for the save
