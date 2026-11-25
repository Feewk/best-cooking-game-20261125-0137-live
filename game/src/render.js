// render.js — every pixel of Copper Ladle Kitchen is drawn here with canvas
// shapes: the kitchen, the order board, the ingredient bins, the stations,
// the cook, the plates and the HUD. No image files are loaded at all.

import { INGREDIENTS } from './recipes.js';

export const VIEW = { width: 1280, height: 800 };

// Station x-centres along the counter, shared with the game logic in main.js.
export const STATION_X = {
  bins: [54, 108, 162, 216, 270, 324, 378, 432],
  board: 512,
  grill: 648,
  plating: 806,
  pass: 986,
  trash: 1136,
};
export const BIN_ORDER = ['bun', 'patty', 'cheese', 'tomato', 'greens', 'egg', 'potato', 'onion'];

const COUNTER_Y = 452;
const LANE_Y = 668;

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function text(c, str, x, y, size, color, align = 'center', weight = 'bold') {
  c.fillStyle = color;
  c.font = `${weight} ${size}px Verdana, sans-serif`;
  c.textAlign = align;
  c.textBaseline = 'middle';
  c.fillText(str, x, y);
}

// One ingredient, drawn as a little icon centred on (x, y) at the given size.
export function drawIngredientIcon(c, ing, x, y, size, prep = 'raw') {
  const def = INGREDIENTS[ing];
  const s = size / 2;
  c.save();
  c.translate(x, y);
  if (ing === 'tomato') {
    c.fillStyle = def.color;
    c.beginPath(); c.arc(0, 2, s * 0.92, 0, Math.PI * 2); c.fill();
    c.fillStyle = def.dark;
    c.beginPath(); c.ellipse(0, -s * 0.72, s * 0.4, s * 0.2, 0, 0, Math.PI * 2); c.fill();
  } else if (ing === 'cheese') {
    c.fillStyle = def.color;
    c.beginPath();
    c.moveTo(-s, s * 0.6); c.lineTo(s, s * 0.6); c.lineTo(s, -s * 0.5); c.closePath(); c.fill();
    c.fillStyle = def.dark;
    c.beginPath(); c.arc(-s * 0.25, s * 0.25, s * 0.16, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(s * 0.4, s * 0.35, s * 0.12, 0, Math.PI * 2); c.fill();
  } else if (ing === 'bun') {
    c.fillStyle = def.color;
    c.beginPath(); c.ellipse(0, s * 0.25, s, s * 0.55, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(0, -s * 0.1, s * 0.82, Math.PI, 0); c.fill();
    c.fillStyle = '#fff2cf';
    c.beginPath(); c.ellipse(-s * 0.3, -s * 0.35, s * 0.1, s * 0.05, 0.4, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(s * 0.25, -s * 0.5, s * 0.1, s * 0.05, -0.3, 0, Math.PI * 2); c.fill();
  } else if (ing === 'patty') {
    c.fillStyle = def.color;
    c.beginPath(); c.ellipse(0, 0, s, s * 0.62, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = def.dark;
    c.beginPath(); c.ellipse(0, -s * 0.12, s * 0.7, s * 0.36, 0, 0, Math.PI * 2); c.fill();
  } else if (ing === 'greens') {
    c.fillStyle = def.color;
    for (const dx of [-0.45, 0, 0.45]) {
      c.beginPath(); c.ellipse(dx * s, 0, s * 0.42, s * 0.8, dx * 0.5, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = def.dark;
    c.fillRect(-s * 0.05, -s * 0.7, s * 0.1, s * 1.4);
  } else if (ing === 'egg') {
    c.fillStyle = def.color;
    c.beginPath(); c.ellipse(0, 0, s, s * 0.8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#f7b731';
    c.beginPath(); c.arc(0, 0, s * 0.42, 0, Math.PI * 2); c.fill();
  } else if (ing === 'potato') {
    c.fillStyle = def.color;
    c.beginPath(); c.ellipse(0, 0, s * 0.95, s * 0.7, 0.3, 0, Math.PI * 2); c.fill();
    c.fillStyle = def.dark;
    c.beginPath(); c.arc(-s * 0.3, -s * 0.15, s * 0.09, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(s * 0.35, s * 0.2, s * 0.09, 0, Math.PI * 2); c.fill();
  } else if (ing === 'onion') {
    c.fillStyle = def.color;
    c.beginPath(); c.arc(0, s * 0.1, s * 0.85, 0, Math.PI * 2); c.fill();
    c.strokeStyle = def.dark; c.lineWidth = 2;
    c.beginPath(); c.arc(0, s * 0.1, s * 0.55, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(0, -s * 0.75); c.lineTo(s * 0.12, -s * 1.05); c.stroke();
  }
  if (prep === 'chopped') {
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-s * 0.7, s * 0.7); c.lineTo(s * 0.7, -s * 0.7); c.stroke();
    c.beginPath(); c.moveTo(-s * 0.7, -s * 0.1); c.lineTo(s * 0.1, -s * 0.9); c.stroke();
  } else if (prep === 'grilled') {
    c.strokeStyle = 'rgba(40,18,6,.75)'; c.lineWidth = 3;
    for (const dx of [-0.4, 0, 0.4]) {
      c.beginPath(); c.moveTo(dx * s - s * 0.18, s * 0.55); c.lineTo(dx * s + s * 0.18, -s * 0.55); c.stroke();
    }
  } else if (prep === 'burnt') {
    c.fillStyle = 'rgba(15,10,8,.8)';
    c.beginPath(); c.arc(0, 0, s * 0.95, 0, Math.PI * 2); c.fill();
  }
  c.restore();
}

// Copper pans and a spice shelf on the back wall, so the kitchen reads as a
// working room and not a bare backdrop.
function drawWallDecor(c) {
  for (const px of [120, 190]) {
    c.strokeStyle = '#22201e'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(px, 252); c.lineTo(px, 282); c.stroke();
    c.fillStyle = '#b0662f';
    c.beginPath(); c.arc(px, 308, 27, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#8a4b1d';
    c.beginPath(); c.arc(px, 308, 19, 0, Math.PI * 2); c.fill();
  }
  c.fillStyle = '#5d4126';
  c.fillRect(980, 300, 220, 10);
  const jarColors = ['#e2483a', '#f6c945', '#58a34c', '#e9e2f2', '#e8a13a'];
  jarColors.forEach((col, i) => {
    const jx = 1000 + i * 42;
    c.fillStyle = col;
    roundRect(c, jx, 268, 26, 32, 4); c.fill();
    c.fillStyle = '#33241a';
    c.fillRect(jx + 2, 260, 22, 8);
  });
  text(c, 'SPICES', 1090, 330, 12, '#d9c9a8');
}

function drawKitchenShell(c, state) {
  // Wall tiles and floor.
  c.fillStyle = '#3a2a1c';
  c.fillRect(0, 0, VIEW.width, VIEW.height);
  c.fillStyle = '#54402a';
  c.fillRect(0, 196, VIEW.width, 256);
  c.fillStyle = '#4a3823';
  for (let x = 0; x < VIEW.width; x += 64) c.fillRect(x, 196, 2, 256);
  for (let y = 196; y < 452; y += 64) c.fillRect(0, y, VIEW.width, 2);
  c.fillStyle = '#6d5136';
  c.fillRect(0, 600, VIEW.width, 200);
  c.fillStyle = '#63492f';
  for (let x = 0; x < VIEW.width; x += 80) c.fillRect(x, 600, 3, 200);
  // Hanging sign.
  c.fillStyle = '#2b1d11';
  roundRect(c, 470, 208, 340, 44, 8); c.fill();
  text(c, 'COPPER LADLE KITCHEN', 640, 231, 22, '#f2c14e');
  // The long counter.
  c.fillStyle = '#8a6844';
  c.fillRect(16, COUNTER_Y, VIEW.width - 32, 148);
  c.fillStyle = '#a37c50';
  c.fillRect(16, COUNTER_Y, VIEW.width - 32, 18);
  c.fillStyle = '#75552f';
  c.fillRect(16, COUNTER_Y + 130, VIEW.width - 32, 18);
}

function drawOrderBoard(c, state) {
  c.fillStyle = '#241708';
  roundRect(c, 16, 60, VIEW.width - 32, 128, 10); c.fill();
  c.strokeStyle = '#c8952f'; c.lineWidth = 3;
  roundRect(c, 16, 60, VIEW.width - 32, 128, 10); c.stroke();
  text(c, 'ORDER BOARD', 76, 80, 15, '#f2c14e', 'left');
  if (state.orders.length === 0) {
    text(c, 'No orders yet — the calm before the rush…', 640, 130, 20, '#cbb894');
  }
  state.orders.forEach((order, i) => {
    const x = 36 + i * 308;
    const y = 92;
    c.fillStyle = '#f7ecd2';
    roundRect(c, x, y, 288, 88, 6); c.fill();
    c.fillStyle = '#b02a20';
    c.fillRect(x, y, 288, 8);
    text(c, order.recipe.name, x + 12, y + 24, 17, '#33241a', 'left');
    order.recipe.steps.forEach((step, j) => {
      const ix = x + 26 + j * 44;
      drawIngredientIcon(c, step.ing, ix, y + 56, 30, step.prep === 'chop' ? 'chopped' : step.prep === 'grill' ? 'grilled' : 'raw');
    });
    // Patience bar along the ticket's foot: green, then amber, then red.
    const frac = Math.max(0, order.patience / order.patienceMax);
    c.fillStyle = '#d8c9a8';
    c.fillRect(x + 12, y + 76, 264, 7);
    c.fillStyle = frac > 0.5 ? '#58a34c' : frac > 0.25 ? '#e8a13a' : '#e2483a';
    c.fillRect(x + 12, y + 76, 264 * frac, 7);
    text(c, `$${order.recipe.price}`, x + 262, y + 24, 16, '#33241a', 'right');
  });
}

function drawBins(c, state) {
  BIN_ORDER.forEach((ing, i) => {
    const x = STATION_X.bins[i];
    c.fillStyle = '#5d4126';
    roundRect(c, x - 25, COUNTER_Y + 16, 50, 62, 5); c.fill();
    c.fillStyle = '#77572f';
    roundRect(c, x - 25, COUNTER_Y + 16, 50, 12, 5); c.fill();
    drawIngredientIcon(c, ing, x, COUNTER_Y + 44, 34);
    text(c, INGREDIENTS[ing].label, x, COUNTER_Y + 94, 12, '#f7ecd2');
  });
  text(c, 'INGREDIENT BINS', 243, COUNTER_Y + 122, 13, '#d9c9a8');
}

function drawStations(c, state) {
  // Chopping board.
  const bx = STATION_X.board;
  c.fillStyle = '#c9a15f';
  roundRect(c, bx - 52, COUNTER_Y + 22, 104, 56, 6); c.fill();
  c.fillStyle = '#a37c50';
  roundRect(c, bx - 52, COUNTER_Y + 22, 104, 10, 6); c.fill();
  text(c, 'CHOP', bx, COUNTER_Y + 100, 13, '#f7ecd2');
  if (state.board.item) {
    drawIngredientIcon(c, state.board.item.ing, bx, COUNTER_Y + 50, 40);
    drawProgressBar(c, bx - 40, COUNTER_Y + 84, 80, state.board.progress);
  }
  // Grill.
  const gx = STATION_X.grill;
  c.fillStyle = '#2c2c30';
  roundRect(c, gx - 56, COUNTER_Y + 18, 112, 64, 6); c.fill();
  c.strokeStyle = '#55555e'; c.lineWidth = 3;
  for (let i = -2; i <= 2; i++) {
    c.beginPath(); c.moveTo(gx + i * 20, COUNTER_Y + 24); c.lineTo(gx + i * 20, COUNTER_Y + 76); c.stroke();
  }
  c.fillStyle = 'rgba(232,72,58,.5)';
  c.beginPath(); c.ellipse(gx, COUNTER_Y + 78, 46, 6, 0, 0, Math.PI * 2); c.fill();
  text(c, 'GRILL', gx, COUNTER_Y + 100, 13, '#f7ecd2');
  if (state.grill.item) {
    drawIngredientIcon(c, state.grill.item.ing, gx, COUNTER_Y + 50, 42, state.grill.item.prep);
    drawProgressBar(c, gx - 40, COUNTER_Y + 84, 80, state.grill.item.progress);
  }
  // Plating counter with the dish being assembled.
  const px = STATION_X.plating;
  text(c, 'PLATING', px, COUNTER_Y + 100, 13, '#f7ecd2');
  drawPlateStack(c, px, COUNTER_Y + 52, state.plate);
  // Serving pass: a shelf, a bell, and any plate ready to serve.
  const sx = STATION_X.pass;
  c.fillStyle = '#77572f';
  roundRect(c, sx - 70, COUNTER_Y + 30, 140, 14, 4); c.fill();
  c.fillStyle = '#f2c14e';
  c.beginPath(); c.arc(sx + 48, COUNTER_Y + 22, 10, Math.PI, 0); c.fill();
  c.fillRect(sx + 45, COUNTER_Y + 20, 6, 4);
  text(c, 'SERVE', sx, COUNTER_Y + 100, 13, '#f7ecd2');
  if (state.passPlate) drawPlateStack(c, sx - 26, COUNTER_Y + 16, state.passPlate);
  // Trash bin.
  const tx = STATION_X.trash;
  c.fillStyle = '#4c565e';
  roundRect(c, tx - 24, COUNTER_Y + 26, 48, 56, 5); c.fill();
  c.fillStyle = '#394147';
  roundRect(c, tx - 28, COUNTER_Y + 18, 56, 12, 4); c.fill();
  text(c, 'BIN', tx, COUNTER_Y + 100, 13, '#f7ecd2');
}

function drawProgressBar(c, x, y, w, frac) {
  c.fillStyle = 'rgba(0,0,0,.45)';
  c.fillRect(x, y, w, 8);
  c.fillStyle = frac >= 1 ? '#58a34c' : '#f2c14e';
  c.fillRect(x, y, w * Math.min(1, frac), 8);
}

// Little steam wisps curling off whatever is on the grill — pure decoration,
// phased by the clock so the kitchen always feels alive in a still frame.
function drawGrillSteam(c, state) {
  if (!state.grill.item) return;
  const gx = STATION_X.grill;
  const t = state.elapsed * 2;
  c.strokeStyle = 'rgba(240,240,240,.5)';
  c.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    const phase = t + i * 1.4;
    const sx = gx - 22 + i * 22 + Math.sin(phase) * 5;
    const sy = COUNTER_Y + 8 - (phase % 1.6) * 16;
    c.beginPath();
    c.arc(sx, sy, 6 + (phase % 1.6) * 4, Math.PI * 0.9, Math.PI * 1.9);
    c.stroke();
  }
}

// A plate drawn as stacked ingredient layers, bottom step first.
export function drawPlateStack(c, x, y, plate) {
  c.fillStyle = '#e8e4da';
  c.beginPath(); c.ellipse(x, y + 14, 46, 13, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#cfc9ba';
  c.beginPath(); c.ellipse(x, y + 12, 34, 9, 0, 0, Math.PI * 2); c.fill();
  if (!plate) return;
  plate.steps.forEach((step, i) => {
    drawIngredientIcon(c, step.ing, x, y + 6 - i * 9, 40, step.prep === 'chop' ? 'chopped' : step.prep === 'grill' ? 'grilled' : 'raw');
  });
}

function drawChef(c, state) {
  const { x, facing, holding, walkPhase } = state.chef;
  const bob = Math.sin(walkPhase) * 3;
  const y = LANE_Y + bob;
  c.save();
  c.translate(x, y);
  c.scale(facing, 1);
  // Legs and shoes.
  c.fillStyle = '#33404d';
  c.fillRect(-13, 34, 10, 26); c.fillRect(4, 34, 10, 26);
  c.fillStyle = '#1d1d1f';
  c.fillRect(-15, 58, 14, 6); c.fillRect(3, 58, 14, 6);
  // Body in apron whites.
  c.fillStyle = '#f4f1ea';
  roundRect(c, -20, -16, 40, 54, 10); c.fill();
  c.fillStyle = '#d84f35';
  c.fillRect(-20, 8, 40, 7);
  // Arm reaching forward.
  c.fillStyle = '#f4f1ea';
  roundRect(c, 12, -6, 20, 9, 4); c.fill();
  c.fillStyle = '#e8b48c';
  c.beginPath(); c.arc(34, -2, 6, 0, Math.PI * 2); c.fill();
  // Head and toque.
  c.fillStyle = '#e8b48c';
  c.beginPath(); c.arc(0, -34, 15, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#ffffff';
  roundRect(c, -13, -58, 26, 14, 5); c.fill();
  c.beginPath(); c.arc(-7, -60, 8, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(7, -60, 8, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(0, -64, 8, 0, Math.PI * 2); c.fill();
  // Face.
  c.fillStyle = '#26221e';
  c.beginPath(); c.arc(6, -34, 2, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(6, -26, 3, 0, Math.PI); c.stroke();
  c.restore();
  // Whatever the cook is carrying rides above the hands.
  if (holding) drawIngredientIcon(c, holding.ing, x + 34 * facing, y - 16, 34, holding.prep);
  // Station prompt.
  if (state.prompt) text(c, state.prompt, x, y - 96, 15, '#ffe9a8');
}

function drawHud(c, state) {
  c.fillStyle = '#1d130a';
  c.fillRect(0, 0, VIEW.width, 52);
  text(c, 'COPPER LADLE', 24, 27, 20, '#f2c14e', 'left');
  const secs = Math.max(0, Math.ceil(state.shiftLeft));
  const label = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  text(c, `SHIFT ${label}`, 640, 27, 26, secs <= 20 ? '#e2483a' : '#f7ecd2');
  text(c, `SCORE ${state.score}`, 1256, 27, 20, '#f7ecd2', 'right');
  if (state.rush) text(c, 'RUSH HOUR!', 880, 27, 18, '#e8a13a', 'left');
}

function drawFloaters(c, state) {
  state.floaters.forEach((f) => {
    c.globalAlpha = Math.max(0, Math.min(1, f.ttl));
    text(c, f.text, f.x, f.y, 20, f.color);
    c.globalAlpha = 1;
  });
}

function drawTitle(c, state) {
  c.fillStyle = 'rgba(20,12,6,.82)';
  c.fillRect(0, 0, VIEW.width, VIEW.height);
  text(c, 'COPPER LADLE KITCHEN', 640, 250, 54, '#f2c14e');
  text(c, 'A rush-hour cooking game', 640, 306, 24, '#f7ecd2');
  text(c, 'Walk to a bin and press SPACE to grab an ingredient.', 640, 380, 20, '#d9c9a8');
  text(c, 'Chop at the board, grill at the stove, build the dish on the plate,', 640, 412, 20, '#d9c9a8');
  text(c, 'then ring it out at the SERVE pass before patience runs out.', 640, 444, 20, '#d9c9a8');
  text(c, 'Move: arrow keys or A/D · Interact: SPACE · or click a station', 640, 500, 18, '#a89372');
  text(c, 'Click or press SPACE to open the kitchen', 640, 580, 24, '#58a34c');
}

function drawEnd(c, state) {
  c.fillStyle = 'rgba(20,12,6,.85)';
  c.fillRect(0, 0, VIEW.width, VIEW.height);
  text(c, 'SHIFT OVER', 640, 240, 48, '#f2c14e');
  text(c, `Score ${state.score} · Served ${state.served} · Walked out ${state.walkouts}`, 640, 320, 24, '#f7ecd2');
  const stars = state.score >= 300 ? '★★★' : state.score >= 180 ? '★★' : '★';
  text(c, stars, 640, 380, 44, '#f2c14e');
  text(c, 'Click or press SPACE to work another shift', 640, 470, 20, '#58a34c');
}

export function drawScene(c, state) {
  drawKitchenShell(c, state);
  drawWallDecor(c);
  drawOrderBoard(c, state);
  drawBins(c, state);
  drawStations(c, state);
  drawGrillSteam(c, state);
  drawChef(c, state);
  drawHud(c, state);
  drawFloaters(c, state);
  if (state.screen === 'title') drawTitle(c, state);
  if (state.screen === 'end') drawEnd(c, state);
}
