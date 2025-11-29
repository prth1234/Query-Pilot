# Fix: Notebook Rows, Code Height, and Editor Layout

## Problems Addressed

1.  **Notebook Rows < 5**: The height calculation was underestimating the space needed for 5 rows.
2.  **Code Block Too Tall**: Default height was 150px, taking up too much space.
3.  **Editor View Broken**: The results table in Editor mode was small and not filling the page because of the `compact` mode restrictions I added earlier.

## Solutions

### 1. Notebook Height Calculation
Updated `QueryCell.jsx` to use more accurate constants:
- **Row Height**: 42px (was 37px)
- **Header Height**: 100px (was 42px) - accounts for filters, padding, etc.
- **Footer Height**: 50px (was 42px)
- **Minimum Height**: 200px (was 150px)

This ensures that when we request 5 rows, we actually allocate enough pixels to show them completely.

### 2. Code Block Height
Reduced default `editorHeight` in `QueryCell.jsx`:
- **Before**: 150px
- **After**: 80px (~3 lines)

### 3. Editor View Layout
Updated `ResultsTable.css` to remove size restrictions from `compact` mode:
- **Removed**: `flex: 0 0 auto` from `.results-container.compact`
- **Removed**: `max-height: 280px` from `.results-container.compact .table-wrapper`
- **Result**: Editor view now fills the available space (flex: 1) while keeping the "compact" styling (borders, shadows).

## Behavior Now

### Notebook Mode
- **Initial**: Shows ~5 full rows (height ~360px)
- **Code Block**: Starts small (~3 lines)
- **Resize**: Can expand to show more rows
- **Style**: No borders/shadows (clean look)

### Editor Mode
- **Initial**: Fills the remaining page space
- **Resize**: Responds to workspace split pane resizing
- **Style**: Has borders/shadows (standalone look)

## Files Modified
- `QueryCell.jsx`: Height constants and default editor height
- `ResultsTable.css`: Removed size restrictions for compact mode

## Testing
- [ ] Check Notebook cell shows 5 rows initially
- [ ] Check Notebook code block is ~3 lines tall
- [ ] Check Editor view results table fills the bottom of the screen
