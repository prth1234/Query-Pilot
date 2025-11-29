# Fix: Initial 5-Row Display in Notebook Cells

## Problem

When running a query with many rows (e.g., `SELECT * FROM big_table`) in Notebook mode:
- ❌ All rows were displayed initially (table was huge)
- ❌ Cell filled entire viewport
- ❌ User had to scroll through hundreds of rows to see next cell

**Root Cause**: The auto-height calculation was accessing the wrong property (`cell.results.length` instead of `cell.results.rows.length`), causing it to fail and not limit the initial height.

---

## Solution

Fixed the auto-height calculation in `QueryCell.jsx`:

### Before (Broken)
```javascript
if (cell.results) {
    const rowCount = cell.results.length  // ❌ WRONG! results is an object, not array
    // ... rest of logic
}
```

### After (Fixed)
```javascript
if (cell.results && cell.results.rows) {
    const rowCount = cell.results.rows.length  // ✅ Correct!
    
    // Always cap initial display at 5 rows
    const visibleRows = Math.min(rowCount, 5)
    let targetHeight = headerHeight + (visibleRows * rowHeight) + footerHeight
    
    setResultsHeight(targetHeight)
}
```

---

## Behavior Now

### Initial Display (Query Execution)
```
Query: SELECT * FROM users (1000 rows)

Cell Initial State:
┌──────────────────────────┐
│  Code Block (SQL query)  │
├──────────────────────────┤ ← Middle Resizer
│  Query Results           │
│  Row 1                   │
│  Row 2                   │  
│  Row 3                   │  ← Shows exactly 5 rows
│  Row 4                   │
│  Row 5                   │
│  ▼ Scroll for 995 more   │ ← Internal scrollbar
├──────────────────────────┤ ← Bottom Resizer
└──────────────────────────┘
```

### After Resizing (User Drags Bottom Resizer)
```
User drags bottom resizer down (+300px)

Cell After Resize:
┌──────────────────────────┐
│  Code Block              │ ← Grew by 75px (25%)
├──────────────────────────┤
│  Query Results           │
│  Row 1                   │
│  Row 2                   │
│  Row 3                   │
│  Row 4                   │
│  Row 5                   │
│  Row 6                   │  ← Now shows ~12 rows
│  Row 7                   │     (grew by 225px = 75%)
│  Row 8                   │
│  Row 9                   │
│  Row 10                  │
│  Row 11                  │
│  Row 12                  │
│  ▼ Scroll for 988 more   │
├──────────────────────────┤
└──────────────────────────┘
```

---

## Technical Details

### Cell Results Data Structure
```javascript
cell.results = {
    columns: ['id', 'name', 'email'],
    rows: [
        {id: 1, name: 'Alice', email: 'alice@example.com'},
        {id: 2, name: 'Bob', email: 'bob@example.com'},
        // ... more rows
    ],
    rowCount: 1000
}
```

### Height Calculation Formula
```javascript
const rowHeight = 37        // Pixels per row
const headerHeight = 42     // Table header
const footerHeight = 42     // Pagination footer

const visibleRows = Math.min(rowCount, 5)  // Cap at 5
const targetHeight = headerHeight + (visibleRows * rowHeight) + footerHeight

// Example: 5 rows
// targetHeight = 42 + (5 * 37) + 42 = 269px
```

---

## Edge Cases Handled

### Case 1: Few Rows (< 5)
```javascript
Query returns 3 rows:
visibleRows = Math.min(3, 5) = 3
Height = 42 + (3 * 37) + 42 = 195px
```
Shows all 3 rows, no scrollbar needed.

### Case 2: Exactly 5 Rows
```javascript
Query returns 5 rows:
visibleRows = Math.min(5, 5) = 5
Height = 42 + (5 * 37) + 42 = 269px
```
Shows all 5 rows perfectly.

### Case 3: Many Rows (> 5)
```javascript
Query returns 1000 rows:
visibleRows = Math.min(1000, 5) = 5
Height = 42 + (5 * 37) + 42 = 269px
```
Shows 5 rows, enables scrollbar for remaining 995 rows.

---

## User Workflow

### Scenario: Exploring Large Table

1. **Execute Query**
   ```sql
   SELECT * FROM orders LIMIT 1000
   ```
   - ✅ Cell shows 5 rows initially
   - ✅ Scrollbar appears for more data
   - ✅ Can see next cell without scrolling page

2. **Need More Rows?**
   - Drag **bottom resizer** down
   - Cell expands (code 25%, results 75%)
   - See more rows at once

3. **Adjust Balance?**
   - Drag **middle resizer** to adjust code/results split
   - Total height stays same

---

## Files Changed

**`QueryCell.jsx`** - Lines 110-131
- Fixed `cell.results.length` → `cell.results.rows.length`
- Simplified logic with `Math.min(rowCount, 5)`
- Clearer comments about behavior

---

## Behavior Summary

| Scenario | Initial Height | What User Sees |
|----------|---------------|----------------|
| 3 rows | ~195px | All 3 rows, no scroll |
| 5 rows | ~269px | All 5 rows, no scroll |
| 10 rows | ~269px | 5 rows + scroll for 5 more |
| 100 rows | ~269px | 5 rows + scroll for 95 more |
| 1000 rows | ~269px | 5 rows + scroll for 995 more |

**After Resize**: Cell grows, shows proportionally more rows

---

## Testing

### Test 1: Small Result Set
```sql
SELECT * FROM users LIMIT 3
```
Expected: Shows all 3 rows, no scrollbar

### Test 2: Exactly 5 Rows
```sql
SELECT * FROM users LIMIT 5
```
Expected: Shows all 5 rows perfectly

### Test 3: Large Result Set
```sql
SELECT * FROM users LIMIT 1000
```
Expected:
- ✅ Initially shows 5 rows
- ✅ Scrollbar appears
- ✅ Can scroll within table to see more
- ✅ Drag bottom resizer to expand

### Test 4: Resize Behavior
1. Run query with 100 rows
2. Initially see 5 rows (~269px)
3. Drag bottom resizer down 200px
4. Code block grows by 50px (25%)
5. Results grow by 150px (75%)
6. Now see ~9 rows visible

---

## Summary

✅ **Fixed**: Auto-height calculation now correctly accesses `cell.results.rows.length`  
✅ **Capped**: Initial display limited to 5 rows max  
✅ **Scrollable**: Internal scrollbar for additional rows  
✅ **Resizable**: User can expand cell to see more rows  
✅ **Clean**: No more giant cells filling entire screen  

**Result**: Perfect balance of compact initial view with flexible expansion! 🎉
