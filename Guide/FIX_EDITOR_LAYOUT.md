# Fix: SQL Editor View Layout

## Problem
The SQL Editor view's results table was restricted to a small height (~5 rows) because of a `max-height` constraint that was unintentionally left in the `compact` mode CSS. This prevented the table from filling the available space at the bottom of the screen.

## Solution
Removed the `max-height` and `flex` restrictions from the `.results-container.compact .table-wrapper` CSS rule.

### Before (Broken)
```css
.results-container.compact .table-wrapper {
    max-height: 280px; /* ❌ Restricted height */
    flex: 0 0 auto;    /* ❌ Prevented growth */
}
```

### After (Fixed)
```css
.results-container.compact .table-wrapper {
    max-height: none; /* ✅ Allow filling space */
    flex: 1;          /* ✅ Allow growth */
}
```

## Behavior Now

### Editor Mode
- **Results Table**: Fills the entire remaining vertical space in the `results-section`.
- **Styling**: Retains the "compact" styling (borders, shadows, rounded corners) to distinguish it from the notebook view.
- **Scrolling**: Internal scrollbar appears if the content exceeds the available space.

### Notebook Mode
- **Results Table**: Fills the cell height (controlled by the cell resizing logic).
- **Styling**: No borders or shadows (clean look).

## Files Modified
- `ResultsTable.css`: Updated `.results-container.compact .table-wrapper` rule.

## Testing
- [ ] Open SQL Editor view.
- [ ] Run a query.
- [ ] Verify the results table extends to the bottom of the screen.
- [ ] Resize the split pane; the table should resize accordingly.
