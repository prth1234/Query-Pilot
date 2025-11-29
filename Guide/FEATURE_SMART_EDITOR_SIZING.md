# Feature: Smart Auto-Sizing Code Editor

## Overview
The code editor in Notebook cells now features "smart auto-sizing" to improve readability and usability. It automatically adjusts its height based on the content while providing manual override capabilities.

## Behavior

### 1. Default Mode (Auto-Sizing)
When a cell is created or hasn't been manually resized:
- **Minimum Height**: ~3 lines (80px).
- **Growth**: As you type or paste code, the editor grows vertically to fit the content.
- **Maximum Height**: ~12 lines (300px).
- **Overflow**: If the code exceeds 12 lines, the editor stops growing and shows an internal scrollbar.

### 2. Manual Mode (Fixed Height)
As soon as you drag the resize handle (middle or bottom):
- **Auto-Sizing Disabled**: The editor locks to the specific pixel height you set.
- **No Maximum**: You can drag it to be as tall as you want (e.g., to see 50 lines of code at once).
- **Persistence**: The cell remembers it is in "manual mode" and stays at that height.

## Implementation Details

### State
- `hasManuallyResized` (boolean): Tracks whether the user has interacted with the resizer.

### Logic
- **CodeMirror Props**:
  - `height`: `auto` (default) vs `[pixels]px` (manual).
  - `minHeight`: `80px`.
  - `maxHeight`: `300px` (default) vs `none` (manual).

### Resizing Interaction
- When `handleMouseDown` is triggered on a resizer:
  1. Sets `hasManuallyResized = true`.
  2. Captures the *current* visual height of the editor (which might be different from the state if it was in auto mode) to ensure smooth resizing start.

## User Benefits
- **Clean UI**: Empty or short queries don't take up unnecessary space.
- **Readability**: Long queries are automatically visible up to a reasonable limit without manual adjustment.
- **Control**: Users can still enforce a specific size if desired.

## Files Modified
- `src/QueryCell.jsx`
