# Quick Reference: Notebook Versioning

## 🎯 Key Principle
**Same Name = Update | Different Name = New Version**

---

## Visual Examples

### Example 1: Single Notebook (Iterative Work)
```
Timeline:
─────────────────────────────────────────────────

9:00 AM  │ Create "Sales Report"
         │ [💾 Save]
         ↓
         Saved: ["Sales Report"]
         
11:00 AM │ Edit queries
         │ [💾 Save]  ← Same name
         ↓
         Saved: ["Sales Report"]  (UPDATED, not new)
         
3:00 PM  │ Add more analysis
         │ [💾 Save]  ← Same name
         ↓
         Saved: ["Sales Report"]  (UPDATED again)

Result: Only 1 saved notebook, always current
```

### Example 2: Multiple Versions (Explicit Versioning)
```
Timeline:
─────────────────────────────────────────────────

9:00 AM  │ Create "Report v1"
         │ [💾 Save]
         ↓
         Saved: ["Report v1"]
         
11:00 AM │ Rename to "Report v2"
         │ [💾 Save]  ← Different name
         ↓
         Saved: ["Report v2", "Report v1"]  (NEW version)
         
3:00 PM  │ Rename to "Report v3"
         │ [💾 Save]  ← Different name
         ↓
         Saved: ["Report v3", "Report v2", "Report v1"]  (NEW version)

Result: 3 separate versions preserved
```

---

## Decision Tree

```
Click Save [💾]
      ↓
  Has changes? ─── NO ──→ Alert: "No changes detected"
      ↓ YES              (Don't save)
      ↓
  Name exists in saved? ─── NO ──→ Create NEW version
      ↓ YES                        Alert: "New version created!"
      ↓
  UPDATE existing
  Alert: "Notebook updated!"
```

---

## Common Use Cases

### Use Case 1: Daily Work on Same Project
```
✅ Keep same name: "Customer Analysis"
✅ Save whenever you make progress
✅ Result: Always 1 current version

Good for:
- Ongoing analysis
- Daily reports
- Single project tracking
```

### Use Case 2: Milestone Versions
```
✅ Rename for each milestone:
   "Analysis - Draft"
   "Analysis - Review"
   "Analysis - Final"
✅ Each save creates new version
✅ Result: Historical versions preserved

Good for:
- Project stages
- Before/after comparisons
- Backup important states
```

### Use Case 3: Experimentation
```
✅ Keep working name: "Experiment"
✅ When you find a good approach:
   Rename: "Experiment - Good Approach v1"
   Save [💾]
✅ Reset name: "Experiment"
✅ Continue trying new things

Good for:
- Trying different queries
- A/B testing
- Exploratory work
```

---

## Saved Notebooks Dropdown

### How to Access
```
Click [🕐³] button (next to notebook title)
         ↓
┌────────────────────────────────┐
│ SAVED NOTEBOOKS                │
├────────────────────────────────┤
│ Report v3                      │
│ Nov 29, 3:00 PM • 8 cells  [🗑️]│
├────────────────────────────────┤
│ Report v2                      │
│ Nov 29, 11:00 AM • 6 cells [🗑️]│
├────────────────────────────────┤
│ Report v1                      │
│ Nov 29, 9:00 AM • 4 cells  [🗑️]│
└────────────────────────────────┘

Actions:
- Click any notebook → Load it
- Click [🗑️] → Delete that version
- Click outside → Close dropdown
```

---

## Tips & Best Practices

### ✅ DO
- Use descriptive names: "Q4 Sales Analysis"
- Rename for major milestones
- Keep working name consistent for daily updates
- Delete old versions you don't need

### ❌ DON'T
- Use generic names: "Notebook", "Untitled"
- Constantly change names (creates too many versions)
- Save without changes (you'll get an alert anyway)
- Forget to rename before major changes

---

## Keyboard Workflow (Recommended)

```
1. Start work
   ↓
2. Name your notebook (click title, rename)
   ↓
3. Write queries
   ↓
4. [💾 Save] often (same name = updates)
   ↓
5. When starting new major work:
   - Rename: "Project - Phase 2"
   - [💾 Save] (creates new version)
   ↓
6. Continue with Step 3
```

---

## Comparison: Update vs New

| Aspect | UPDATE (Same Name) | NEW (Different Name) |
|--------|-------------------|---------------------|
| When | Name already exists | Name is new/unique |
| Action | Replaces old content | Adds to saved list |
| Alert | "Notebook updated!" | "New version created!" |
| Count | Badge stays same | Badge increments |
| Use for | Iterative work | Milestones/backups |

---

## Quick Examples

### "I'm working on daily reports"
```
Name: "Daily Sales Report"
Save: Multiple times per day
Result: 1 notebook, always current
Perfect! ✅
```

### "I want to keep each week's version"
```
Names: "Week 1 Report", "Week 2 Report", "Week 3 Report"
Save: After each week
Result: 3 separate notebooks
Perfect! ✅
```

### "I'm experimenting and want to save good ideas"
```
Name: "Work in Progress"
When you find something good:
- Rename: "Good Approach - 2024-11-29"
- Save [💾]
- Rename back: "Work in Progress"
- Continue experimenting
Perfect! ✅
```

---

## Troubleshooting

### "My saved list has duplicates"
This shouldn't happen anymore! If the names are exactly the same, it should update instead of creating new.

### "I accidentally updated and lost my old version"
Before making major changes, rename first to create a new version.

### "The dropdown won't close"
Click anywhere outside the dropdown - it should close automatically.

### "Save button does nothing"
Check if there are actual changes. You'll get an alert if no changes detected.

---

This versioning system gives you **automatic updates** for frequent saves and **manual control** through naming for important milestones! 🎉
