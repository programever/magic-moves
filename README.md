# Magic Moves

Motion games for kids. The MacBook camera watches their bodies; they play with their hands, shown on the TV.

Run: `python3 -m http.server 8765 --bind 127.0.0.1` in this folder, then open http://localhost:8765 in Chrome.

```
index.html           home page: pick a game
games/<name>/        one folder per game (index.html + its own music/pictures)
  snitch/            Catch the Snitch: wand (right hand) catches flying Snitches, avoid Bludgers
  broom/             Broom Race: move body left/right through rings, both hands up = boost
  patronus/          Patronus vs Dementors: hold the wand on a Dementor to cast a Patronus
  feather/           Wingardium Leviosa: keep falling feathers up with the wand
  dragon/            Dragon Egg Hunt: collect eggs while the dragon sleeps, FREEZE when it wakes
  spiders/           Escape the Spiders: jump over logs, duck under webs
  hat/               Sorting Hat Dance: copy the pose the hat calls out
  spells/            Spell Class: trace a spell shape in the air with the wand
  owls/              Hedwig Post: take letters from owls, put them in the box with the same color
  duel/              Wizard Duel: sisters duel; right hand flicks spells, left hand up = shield
  dino/              Forbidden Forest Run: jump over roots, duck under bats (2 players = top/bottom lanes)
  run/               Run to Hogsmeade: run in place (knees up) to race from Hogwarts to Hogsmeade
  jacks/             Jumping Jack Spell: jumping jacks light up the Great Hall, 10 = Lumos Maxima
  sword/             Sword of Gryffindor: swing both hands to slash flying cursed objects, not Hedwig
  tower/             Astronomy Tower: climb in place (hands over head in turn) to reach the telescope
shared/              used by every game
  recorder.js        records the camera + microphone each round; end screen: Replay / Save video (else deleted)
  tracking.js        camera + body tracking (MediaPipe pose, 2 players)
  look.js            Camera Dim/Normal/Bright setting (per game) + drawCameraOver()
  kids.js            players: names + faces, drawKidFace(), kidImg()
  kids.example.js    example for shared/private/kids.js
  lib/               MediaPipe library + model, downloaded so it works offline
  music/             NOT in git: game.mp3 (during play), winner.mp3 (trophy screen)
  private/           NOT in git: kids.js (real names) + photos/ (face photos)
.venv/               Python + Playwright, only for testing
```

New game: copy `games/snitch/` to `games/<name>/`, change it, add a card in `index.html`.
Test a short round: add `?t=10` to the game address (10 second round).
Not in git (see .gitignore): shared/private/ (kids' names + photos), shared/music/ (songs we do not own),
.venv/. Without them the games still run: default player names, and music made by code.
