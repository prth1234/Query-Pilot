# Feature: Notebook Usability Improvements

## 1. Clear Result Only
- **Goal**: Allow users to clear the result of a query without clearing the query code itself.
- **UI**: Added a **"Clear"** badge button (red) in the top-right corner of the results area.
- **Behavior**: Clicking it removes the result table and error message, but keeps the SQL query in the editor.

## 2. Delete Functionality Fix
- **Issue**: Deleting a cell sometimes removed the wrong cell (from the bottom) due to ID collisions or index-based filtering.
- **Fix**: 
  - Switched from `Date.now()` to `crypto.randomUUID()` for cell ID generation.
  - This ensures every cell has a globally unique ID, making React rendering and state updates reliable.

## Files Modified
- `src/NotebookView.jsx`
- `src/QueryCell.jsx`
