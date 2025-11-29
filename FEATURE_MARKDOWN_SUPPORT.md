# Feature: Markdown Support in Notebook

## Overview
Added support for Markdown cells in the Notebook, allowing users to add rich text documentation alongside their SQL queries.

## Implementation Details

### 1. MarkdownCell Component (`src/MarkdownCell.jsx`)
- **Modes**:
  - **Edit Mode**: 
    - **Editor**: CodeMirror with Markdown syntax highlighting.
    - **Live Preview**: Shows rendered markdown below the editor as you type.
    - **Action**: "Check" (Tick) button to save and switch to View Mode.
  - **View Mode**: 
    - **Rendered View**: Shows the final rendered markdown.
    - **Action**: "Pencil" (Edit) button to switch back to Edit Mode.
    - **Interaction**: Double-click to edit.
- **Styling**: Custom CSS for markdown elements (headers, code blocks, lists) to match the application's dark theme.

### 2. NotebookView Updates (`src/NotebookView.jsx`)
- **Cell Types**: Cells now have a `type` property (`'sql'` or `'markdown'`).
- **UI Actions**:
  - **Add Query**: Adds a standard SQL cell.
  - **Add Text**: Adds a new Markdown cell.
- **Rendering**: Conditionally renders `QueryCell` or `MarkdownCell` based on type.
- **State Management**: Updated `handleContentChange` to handle both `query` (SQL) and `content` (Markdown) updates.

### 3. Dependencies
- Added `react-markdown` for rendering.
- Added `@codemirror/lang-markdown` for editor syntax highlighting.

## User Experience
1.  Click **"Add Text"** to insert a markdown cell.
2.  Type markdown content. A live preview appears below.
3.  Click the **Check (Tick)** button to finish editing. The cell displays as rendered text.
4.  Click the **Pencil** button or double-click the text to edit again.

## Files Modified
- `src/NotebookView.jsx`
- `src/MarkdownCell.jsx`
- `src/QueryCell.css`
