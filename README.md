# Motion Games

Motion games for kids. The MacBook camera watches their bodies; they play with their hands, shown on the TV.

Run: `python3 -m http.server 8765 --bind 127.0.0.1` in this folder, then open http://localhost:8765 in Chrome.

```
index.html           home page: pick a game
games/<name>/        one folder per game (index.html + its own music/pictures)
  snitch/            Catch the Snitch (Harry Potter). music/ = songs from Iker (not in git)
shared/              used by every game
  tracking.js        camera + body tracking (MediaPipe pose, 2 players)
  kids.js            players: names + faces, drawKidFace(), kidImg()
  kids.example.js    example for shared/private/kids.js
  lib/               MediaPipe library + model, downloaded so it works offline
  private/           NOT in git: kids.js (real names) + photos/ (face photos)
.venv/               Python + Playwright, only for testing
```

New game: copy `games/snitch/` to `games/<name>/`, change it, add a card in `index.html`.
Test a short round: add `?t=10` to the game address (10 second round).
Not in git (see .gitignore): shared/private/ (kids' names + photos), games/*/music/ (songs we do not own),
.venv/. Without them the games still run: default player names, and music made by code.
