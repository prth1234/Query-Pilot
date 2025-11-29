# Notebook Import and Save Features

## Overview
Added three major features to the Query Pilot notebook functionality:

## 1. Import Notebook to SQL Editor 
**Feature**: Consolidate all SQL queries from notebook cells into the SQL editor

**How it works**:
- Click the **"To Editor"** button in the notebook header
- All SQL cells (excluding markdown cells) are consolidated
- Each query is labeled with a comment (e.g., `-- Query 1`, `-- Query 2`)
- Queries are separated by blank lines for readability
- Automatically switches to the Editor view
- Imported query is loaded into the SQL editor

**Use case**: 
- When you want to run a consolidated version of all notebook queries
- When you need to share all queries as a single SQL file
- When you want to optimize/refactor multiple queries together

## 2. Save Notebook Versions
**Feature**: Save the current state of your notebook (like Jupyter notebooks)

**How it works**:
- Click the **"Save Notebook"** button in the notebook header
- Current notebook state is saved including:
  - Notebook name
  - All cells (SQL and markdown)
  - Cell results and execution times
  - Settings (theme, font size, font family, run limit)
  - Timestamp
- Saved notebooks are stored in localStorage
- Each save creates a new version (not overwrite)

**Use case**:
- Save checkpoints while experimenting with queries
- Keep different versions of your analysis
- Restore to a previous working state

## 3. Saved Notebooks Browser
**Feature**: View, load, and manage saved notebook versions

**How it works**:
- Click **"Saved (N)"** button to view all saved notebooks
- Shows a dropdown list with:
  - Notebook name
  - Save timestamp
  - Number of cells
- Click a saved notebook to load it (replaces current notebook)
- Click the trash icon to delete a saved version
- Dropdown shows "No saved notebooks yet" if empty

**UI Features**:
- Saved count displayed in button badge
- Formatted timestamps (e.g., "Nov 29, 2024, 9:30 PM")
- Hover effects for better UX
- Confirmation dialogs before loading/deleting

## Button Layout
The notebook header now includes these buttons (in order):
1. Run settings (Limit, Theme, Editor Settings, etc.)
2. **"To Editor"** - Import to SQL editor
3. **"Saved (N)"** - View saved notebooks
4. **"Save Notebook"** - Save current state
5. Delete All - Clear all results
6. Run All - Execute all cells
7. Add Text - Add markdown cell
8. Add Query - Add SQL cell

## Storage
- All saved notebooks are stored in localStorage under the key `savedNotebooks`
- Each notebook has a unique UUID
- Settings and cells are deep-cloned to avoid reference issues
- Notebooks are ordered by save time (newest first)

## Future Enhancements (Potential)
- Export notebooks as JSON files
- Import notebooks from files
- Cloud sync for notebooks
- Notebook search and filtering
- Notebook tags/categories
- Diff view between versions
