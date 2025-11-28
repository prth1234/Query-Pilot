# Latest Fixes Summary 🛠️

## 1. ✅ "Apply" Button Changed to "Close"
**Problem**: The "Apply" button in table settings was misleading since settings apply instantly.
**Solution**: Renamed the button to "Close" to better reflect its behavior (closing the modal).

## 2. ✅ Results Table Expand Fixed
**Problem**: The expand/fullscreen button on the results table wasn't working.
**Cause**: The CSS rules for `.results-container.full-screen` were accidentally removed during a previous edit to fix the dropdown overflow.
**Solution**: Restored the missing CSS rules:
- `position: fixed`
- `top: 0`, `left: 0`
- `width: 100vw`, `height: 100vh`
- `z-index: 10000`

The expand button should now correctly toggle the results table to full screen! 🚀
