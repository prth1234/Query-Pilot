# UI & Functionality Updates

## ✅ 1. Badge-Style Buttons
**Goal**: Make all buttons in Query Editor rounded (badge style) like Notebook View.
**Changes**:
- Updated `QueryEditor.jsx` to use `notebook-action-button` classes.
- Added shared styles to `QueryEditor.css`.
- Applied to: New Query, Save, Saved, Fullscreen, Theme, Settings buttons.

## ✅ 2. New Query Button
**Goal**: Add functionality to create a new query with unsaved changes protection.
**Changes**:
- Added **New Query** button (➕) to the header.
- Added `handleNewQuery` function.
- **Smart Protection**: Checks `isCurrentQueryMatchingAnySaved()` before resetting.
- **Behavior**: Resets to "Untitled Query" and default SQL.

## ✅ 3. Font Family Fix
**Goal**: Fix font family setting not applying in CodeMirror.
**Changes**:
- Added a `EditorView.theme` extension to `QueryEditor.jsx`.
- Explicitly overrides font family for `.cm-content` and `.cm-scroller`.
- Updated `useMemo` dependencies to include `fontFamily`.

## How to Test

### Badge Buttons
- Check the Query Editor header.
- All buttons should be rounded pills/circles.
- Hover effects should match Notebook View.

### New Query
1. Make changes to a query.
2. Click **New Query** (➕).
3. Should warn: "You have unsaved changes..."
4. Save the query.
5. Click **New Query**.
6. Should reset instantly (no warning).

### Font Family
1. Open Settings (⚙️).
2. Change Font Family (e.g., to "Courier New").
3. The code editor font should change **immediately**.

All requested features are implemented! 🎉
