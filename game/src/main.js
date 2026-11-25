// main.js — Copper Ladle Kitchen: the shift loop. Orders land on the board,
// the cook runs the counter — bins, board, grill, plating, pass — and every
// dish is built step by step against the guests' patience.

import { RECIPES } from './recipes.js';
import { drawScene, STATION_X, BIN_ORDER } from './render.js';
import { sfx, unlockAudio, toggleMute } from './audio.js';

const canvas = document.getElementById('kitchen');
const ctx = canvas.getContext('2d');

const CHOP_SECONDS = 1.1;
const GRILL_SECONDS = 2.2;
const BURN_AFTER = 6; // seconds a grilled item can sit before it burns

function freshState() {
  return {
    screen: 'title',
    chef: { x: 640, targetX: 640, facing: 1, holding: null, walkPhase: 0 },
    orders: [],
    board: { item: null, progress: 0 },
    grill: { item: null },
    plate: null,
    passPlate: null,
    score: 0,
    served: 0,
    walkouts: 0,
    shiftLeft: 150,
    spawnIn: 1.2,
    rush: false,
    prompt: '',
    floaters: [],
    pendingStation: null,
    elapsed: 0,
    paused: false,
  };
}

let state = freshState();

function addFloater(x, y, text, color) {
  state.floaters.push({ x, y, text, color, ttl: 1.4 });
}

function spawnOrder() {
  if (state.orders.length >= 4) return;
  const recipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];
  const patienceMax = Math.max(30, 48 - state.served * 0.8);
  state.orders.push({ recipe, patience: patienceMax, patienceMax });
  sfx.bell();
}

function stationAt(x) {
  const near = (cx) => Math.abs(x - cx) < 34;
  const binIndex = STATION_X.bins.findIndex((bx) => near(bx));
  if (binIndex >= 0) return { kind: 'bin', ing: BIN_ORDER[binIndex], x: STATION_X.bins[binIndex] };
  if (near(STATION_X.board)) return { kind: 'board', x: STATION_X.board };
  if (near(STATION_X.grill)) return { kind: 'grill', x: STATION_X.grill };
  if (near(STATION_X.plating)) return { kind: 'plating', x: STATION_X.plating };
  if (near(STATION_X.pass)) return { kind: 'pass', x: STATION_X.pass };
  if (near(STATION_X.trash)) return { kind: 'trash', x: STATION_X.trash };
  return null;
}

function plateMatchesOrder(plate, order) {
  if (!plate || plate.steps.length !== order.recipe.steps.length) return false;
  const want = order.recipe.steps.map((s) => `${s.ing}:${s.prep}`).sort();
  const got = plate.steps.map((s) => `${s.ing}:${s.prep}`).sort();
  return want.every((w, i) => w === got[i]);
}

function interact() {
  const st = stationAt(state.chef.x);
  state.prompt = '';
  if (!st) return;
  const held = state.chef.holding;
  if (st.kind === 'bin') {
    if (!held) {
      state.chef.holding = { ing: st.ing, prep: 'raw' };
      sfx.pickup();
    }
  } else if (st.kind === 'board') {
    if (held && held.prep === 'raw' && !state.board.item) {
      state.board.item = held;
      state.board.progress = 0;
      state.chef.holding = null;
    } else if (!held && state.board.item && state.board.progress >= 1) {
      state.chef.holding = { ing: state.board.item.ing, prep: 'chopped' };
      state.board.item = null;
      sfx.pickup();
    }
  } else if (st.kind === 'grill') {
    if (held && held.prep === 'raw' && !state.grill.item) {
      state.grill.item = { ing: held.ing, prep: 'grilling', progress: 0, doneFor: 0 };
      state.chef.holding = null;
      sfx.sizzle();
    } else if (!held && state.grill.item && state.grill.item.prep !== 'grilling') {
      state.chef.holding = { ing: state.grill.item.ing, prep: state.grill.item.prep };
      state.grill.item = null;
      sfx.pickup();
    }
  } else if (st.kind === 'plating') {
    if (held && held.prep !== 'burnt') {
      if (!state.plate) state.plate = { steps: [] };
      const need = held.prep === 'raw' ? 'raw' : held.prep === 'chopped' ? 'chop' : 'grill';
      state.plate.steps.push({ ing: held.ing, prep: need });
      state.chef.holding = null;
      sfx.plate();
    } else if (!held && state.plate && !state.passPlate) {
      state.passPlate = state.plate;
      state.plate = null;
      sfx.plate();
    }
  } else if (st.kind === 'pass') {
    if (state.passPlate) {
      const idx = state.orders.findIndex((o) => plateMatchesOrder(state.passPlate, o));
      if (idx >= 0) {
        const order = state.orders[idx];
        const tip = Math.round((order.patience / order.patienceMax) * 6);
        state.score += order.recipe.price + tip;
        state.served += 1;
        addFloater(STATION_X.pass, 380, `+$${order.recipe.price + tip}`, '#58a34c');
        state.orders.splice(idx, 1);
        sfx.serve();
      } else {
        addFloater(STATION_X.pass, 380, 'No order matches!', '#e2483a');
        sfx.fail();
      }
      state.passPlate = null;
    }
  } else if (st.kind === 'trash') {
    if (held) {
      state.chef.holding = null;
      sfx.trash();
    } else if (state.plate) {
      state.plate = null;
      sfx.trash();
    }
  }
}

function update(dt) {
  if (state.screen !== 'playing') return;
  state.elapsed += dt;
  if (state.paused) return;
  state.shiftLeft -= dt;
  if (state.shiftLeft <= 0) {
    state.screen = 'end';
    return;
  }
  state.rush = state.shiftLeft < 60;
  // Orders: patience drains, new tickets land faster as the shift heats up.
  state.spawnIn -= dt;
  if (state.spawnIn <= 0) {
    spawnOrder();
    state.spawnIn = Math.max(4.2, 9 - state.served * 0.35) * (0.8 + Math.random() * 0.4);
  }
  state.orders = state.orders.filter((o) => {
    o.patience -= dt;
    if (o.patience > 0) return true;
    state.walkouts += 1;
    state.score = Math.max(0, state.score - 5);
    addFloater(120, 220, 'A guest walked out!', '#e2483a');
    sfx.fail();
    return false;
  });
  // The board and the grill work while the cook is elsewhere.
  if (state.board.item && state.board.progress < 1) {
    state.board.progress = Math.min(1, state.board.progress + dt / CHOP_SECONDS);
    if (Math.random() < dt * 6) sfx.chop();
  }
  if (state.grill.item) {
    const g = state.grill.item;
    if (g.prep === 'grilling') {
      g.progress = Math.min(1, g.progress + dt / GRILL_SECONDS);
      if (g.progress >= 1) g.prep = 'grilled';
    } else if (g.prep === 'grilled') {
      g.doneFor += dt;
      if (g.doneFor > BURN_AFTER) {
        g.prep = 'burnt';
        addFloater(STATION_X.grill, 380, 'Burnt!', '#e2483a');
      }
    }
  }
  // The cook walks toward the target; arrival triggers a queued interaction.
  const chef = state.chef;
  const dx = chef.targetX - chef.x;
  if (Math.abs(dx) > 4) {
    const step = Math.sign(dx) * Math.min(Math.abs(dx), 340 * dt);
    chef.x += step;
    chef.facing = dx >= 0 ? 1 : -1;
    chef.walkPhase += dt * 11;
  } else if (state.pendingStation) {
    state.pendingStation = null;
    interact();
  }
  const st = stationAt(chef.x);
  state.prompt = st ? promptFor(st) : '';
  state.floaters = state.floaters.filter((f) => (f.ttl -= dt) > 0);
  state.floaters.forEach((f) => { f.y -= dt * 26; });
}

function promptFor(st) {
  const held = state.chef.holding;
  if (st.kind === 'bin') return held ? '' : `SPACE: take ${st.ing}`;
  if (st.kind === 'board') {
    if (state.board.item) return state.board.progress >= 1 ? 'SPACE: pick up chopped' : 'Chopping…';
    return held && held.prep === 'raw' ? 'SPACE: chop it' : '';
  }
  if (st.kind === 'grill') {
    if (state.grill.item) return state.grill.item.prep === 'grilling' ? 'Grilling…' : 'SPACE: take it off';
    return held && held.prep === 'raw' ? 'SPACE: grill it' : '';
  }
  if (st.kind === 'plating') {
    if (held) return held.prep === 'burnt' ? 'Burnt — bin it' : 'SPACE: add to plate';
    if (state.plate && !state.passPlate) return 'SPACE: move plate to pass';
    return '';
  }
  if (st.kind === 'pass') return state.passPlate ? 'SPACE: serve!' : '';
  if (st.kind === 'trash') return held || state.plate ? 'SPACE: throw away' : '';
  return '';
}

// Demo scenes for screenshots and for curious visitors: ?shot=cover|rush|served
// freezes a rich, real mid-service moment using the game's own state.
function applyDemoScene(name) {
  state = freshState();
  state.screen = 'playing';
  state.shiftLeft = 107;
  state.score = 128;
  state.served = 9;
  const [burger, melt, skillet] = [RECIPES[0], RECIPES[1], RECIPES[2]];
  state.orders = [
    { recipe: burger, patience: 34, patienceMax: 48 },
    { recipe: melt, patience: 41, patienceMax: 48 },
    { recipe: skillet, patience: 26, patienceMax: 48 },
  ];
  state.plate = { steps: [
    { ing: 'bun', prep: 'raw' },
    { ing: 'patty', prep: 'grill' },
    { ing: 'cheese', prep: 'raw' },
  ] };
  state.passPlate = { steps: [
    { ing: 'potato', prep: 'chop' },
    { ing: 'onion', prep: 'chop' },
    { ing: 'egg', prep: 'grill' },
  ] };
  state.board.item = { ing: 'tomato' };
  state.board.progress = 0.55;
  state.grill.item = { ing: 'patty', prep: 'grilling', progress: 0.45, doneFor: 0 };
  state.chef.x = STATION_X.board;
  state.chef.targetX = STATION_X.board;
  if (name === 'rush') {
    state.shiftLeft = 38;
    state.rush = true;
    state.score = 342;
    state.served = 24;
    state.orders.push({ recipe: RECIPES[4], patience: 8, patienceMax: 40 });
    state.orders[0].patience = 9;
    state.chef.x = STATION_X.bins[2];
    state.chef.targetX = STATION_X.bins[2];
    state.chef.holding = { ing: 'cheese', prep: 'raw' };
    state.board.item = null;
    state.grill.item = { ing: 'egg', prep: 'grilled', progress: 1, doneFor: 1 };
  }
  if (name === 'served') {
    state.passPlate = null;
    state.score = 356;
    // A long-lived floater: screenshot tooling waits a few seconds, and the
    // "+$17 SERVED!" moment is the whole point of this scene.
    state.floaters.push({ x: STATION_X.pass, y: 380, text: '+$17 SERVED!', color: '#58a34c', ttl: 99 });
    state.chef.x = STATION_X.pass - 60;
    state.chef.targetX = state.chef.x;
  }
}

const params = new URLSearchParams(location.search);
if (params.has('shot')) {
  const name = params.get('shot');
  if (name === 'title') {
    state.screen = 'title';
  } else {
    applyDemoScene(name);
  }
}

const keys = new Set();
window.addEventListener('keydown', (e) => {
  unlockAudio();
  if (e.code === 'KeyM') toggleMute();
  if (e.code === 'KeyP' && state.screen === 'playing') {
    state.paused = !state.paused;
    state.prompt = state.paused ? 'PAUSED — P to resume' : '';
  }
  if (e.code === 'Space') {
    e.preventDefault();
    if (state.screen !== 'playing') {
      state = freshState();
      state.screen = 'playing';
      return;
    }
    interact();
  }
  keys.add(e.code);
});
window.addEventListener('keyup', (e) => keys.delete(e.code));

canvas.addEventListener('click', (e) => {
  unlockAudio();
  if (state.screen !== 'playing') {
    state = freshState();
    state.screen = 'playing';
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
  const st = stationAt(x);
  if (st) {
    state.chef.targetX = st.x;
    state.pendingStation = st.kind;
  }
});

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state.screen === 'playing') {
    if (keys.has('ArrowLeft') || keys.has('KeyA')) {
      state.chef.targetX = Math.max(30, state.chef.x - 260 * dt);
      state.pendingStation = null;
    }
    if (keys.has('ArrowRight') || keys.has('KeyD')) {
      state.chef.targetX = Math.min(1250, state.chef.x + 260 * dt);
      state.pendingStation = null;
    }
    update(dt);
  }
  drawScene(ctx, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
