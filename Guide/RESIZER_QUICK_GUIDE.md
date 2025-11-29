# Quick Guide: Cell Resizing in Notebook Mode

## 📚 Terminology

```
┌──────────────────────────────┐
│  CELL = Everything below     │
├──────────────────────────────┤
│  Code Block (SQL Editor)     │ ← 25% expansion
├──────────────────────────────┤ ← Middle Resizer
│  Result Block (Data Table)   │ ← 75% expansion  
├──────────────────────────────┤ ← Bottom Resizer
└──────────────────────────────┘
```

---

## 🎯 Two Ways to Resize

### 1️⃣ Middle Resizer (Between Code & Results)
```
Drag Up ↑
Code: 100px → 50px  (shrinks)
Results: 200px → 250px (grows)
Cell: 300px → 300px (same)

Drag Down ↓
Code: 100px → 150px (grows)
Results: 200px → 150px (shrinks)
Cell: 300px → 300px (same)
```

**Use When**: Adjusting balance between code and results

---

### 2️⃣ Bottom Resizer (Bottom of Cell)
```
Drag Down ↓ (+100px)
Code: 100px → 125px  (+25px = 25%)
Results: 200px → 275px (+75px = 75%)
Cell: 300px → 400px  (+100px total)

Both grow! Results grow 3x faster!
```

**Use When**: Need to see MORE data overall

---

## 🚀 Quick Actions

| I Want To... | Use This Resizer |
|-------------|------------------|
| See more rows of data | **Bottom** (expands whole cell) |
| See more code, less results | **Middle** (drag up) |
| See more results, less code | **Middle** (drag down) |
| Expand everything | **Bottom** (both grow) |

---

## ✨ Key Points

1. **Cell** = Code Block + Result Block (remember this!)
2. **Middle** = Trade space between code and results
3. **Bottom** = Expand whole cell (25% code, 75% results)
4. No empty space - everything fills properly
5. Minimum 60px per block (can't collapse completely)

---

## 🎬 Visual Behavior

### Middle Resizer (Hinged)
```
Before:     After (drag down):
┌─────┐     ┌─────┐
│ C:2 │     │ C:3 │ ← Code GROWS
├─────┤     ├─────┤
│ R:3 │     │ R:2 │ ← Results SHRINK
└─────┘     └─────┘
```

### Bottom Resizer (Proportional)
```
Before:     After (drag down):
┌─────┐     ┌─────┐
│ C:2 │     │C:2.5│ ← Code grows a bit
├─────┤     ├─────┤
│ R:3 │     │R:4.5│ ← Results grow more!
└─────┘     └─────┘
            Cell expanded!
```

---

## ⚡ Pro Tip

Want to see **100 rows** of results?
1. Run your query
2. Drag **bottom resizer** down
3. Results table grows dramatically
4. Code block grows just enough to stay readable
5. Perfect view! 🎉

---

**Fixed**: No more empty space when resizing! ✅
