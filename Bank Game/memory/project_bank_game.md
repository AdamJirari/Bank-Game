---
name: project-bank-game
description: Deutsche Bank World Cup Challenge — a soccer quiz game built for the DB Tech Fair
metadata:
  type: project
---

Deutsche Bank World Cup Challenge game, built as a web app (HTML/CSS/JS) for the DB Tech Fair, timed with the World Cup.

**Why:** Tech Fair at Deutsche Bank, 4 payment teams each owning one quiz module. Content team fills in questions separately via admin panel.

**How to apply:** Game lives at `/Users/adamjalil/Desktop/Bank Game/`. Open `index.html` in a browser or run `npx serve -l 3456 .` to serve it locally. Admin panel at `admin.html`, default password: DB2024.

**Structure:**
- `index.html` — game UI (welcome → field → quiz → victory)
- `admin.html` — admin panel (login, edit modules/questions, export/import JSON, settings)
- `css/style.css` — game styles
- `css/admin.css` — admin panel styles
- `js/data.js` — default questions + localStorage data management (`DataManager`)
- `js/game.js` — game engine (`Game` IIFE)
- `js/admin.js` — admin logic (`Admin` IIFE)

**Game mechanics:**
- 4 modules/stops along a horizontal soccer field (left→right)
- Ball starts left, advances to each station after module completion
- 3 questions per module (dummy banking questions pre-loaded)
- Correct answer: +100pts, Wrong: -25pts
- Module complete modal → ball animates to next station → GOAL after all 4
- Leaderboard stored in localStorage, top 10

**Admin panel:**
- Password: DB2024 (changeable in Settings)
- Edit module name, team, icon, color per module
- Edit question text, 4 options, mark correct answer, add explanation
- Add/delete questions per module
- Export/Import JSON (for content team to fill in)
- Reset to defaults, clear leaderboard

**Known state:** Skeleton complete, dummy questions in place. Content team will replace via admin panel or JSON import.
