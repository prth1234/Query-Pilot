# Feature: Full Screen Notebook Mode

## Overview
Added a "Full Screen Mode" toggle to the Notebook view. This allows users to maximize the notebook interface to occupy the entire screen, providing a distraction-free environment for data analysis.

## Implementation Details

### 1. NotebookView.jsx
- **State**: Added `isFullScreen` state (boolean).
- **UI**: Added a toggle button in the header (next to settings).
  - Icon: `ScreenFullIcon` (when normal) / `ScreenNormalIcon` (when full screen).
  - Action: Toggles `isFullScreen` state.
- **Class**: Conditionally applies `full-screen-mode` class to the main `notebook-view` container.

### 2. NotebookView.css
- **.notebook-view.full-screen-mode**:
  - `position: fixed`
  - `top: 0`, `left: 0`
  - `width: 100vw`, `height: 100vh`
  - `z-index: 9999` (covers sidebar and header)
  - `background: #0d1117` (ensures opaque background)
- **Adjustments**:
  - Increased padding for header and cells container in full screen mode for better readability.

## User Experience
1.  **Enter Full Screen**: Click the "Full Screen" icon in the notebook header.
2.  **View**: The notebook expands to cover the entire browser window.
3.  **Exit Full Screen**: Click the "Exit Full Screen" icon (same location).

## Interaction with Other Features
- **Cell Full Screen**: Individual cells can still be toggled to full screen. Their z-index (10000) is higher than the notebook full screen (9999), so they will correctly overlay the notebook view.
- **Resizing**: Cell resizing works as expected within the full screen view.

## Files Modified
- `src/NotebookView.jsx`
- `src/NotebookView.css`
