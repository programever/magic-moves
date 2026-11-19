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
  dance/             Dance Party: touch the beat stars on the beat (music made by code)
  fishing/           Ocean Fishing: catch fish with a net in the right hand, avoid jellyfish
  dino/              Dino Run: jump over rocks, duck under pterodactyls (2 players = top/bottom lanes)
shared/              used by every game
  recorder.js        records the camera + microphone each round; end screen: Replay / Save video (else deleted)
  tracking.js        camera + body tracking (MediaPipe pose, 2 players)
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
