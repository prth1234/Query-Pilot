# Feature: Notebook UI Refinements

## 1. Smart Result Height
- **Issue**: Short result sets (e.g., 3 rows) were displaying with excessive blank space below them.
- **Fix**: Adjusted the auto-height calculation logic in `QueryCell` to tighter bounds: `90px (headers/padding) + (rows * 42px)`.
- **Logic**: `min(5, rowCount)` determines the initial visible rows, ensuring the container fits the content snugly up to 5 rows, then scrolls.

## 2. Results Info Bar
- **Goal**: Display metadata and actions without overlapping the table controls.
- **UI**: Added a dedicated toolbar above the results table.
- **Content**:
  - **Left**: "Last run: [Time]" and "Duration: [ms]".
  - **Right**: "Clear" button (Red badge).
- **Benefit**: Solves the overlap issue where the "Clear" button was covering table filters/search.

## Files Modified
- `src/NotebookView.jsx` (Added `lastRunAt` state)
- `src/QueryCell.jsx` (Updated height logic and UI layout)
