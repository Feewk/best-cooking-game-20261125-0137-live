// Copper Ladle Kitchen — hand-in program (Node 22, standard library only).
// The game itself is the static site in game/ (open game/index.html in a
// desktop browser, no build step, no network). This program delivers it:
// it copies game/ and screenshots/ into the output directory and writes the
// dossier the judge reads, built by the vendored make.fun library.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps, mirrored so a bad hand-in fails here first rather than
// at the gate: at most 4 screenshots of 256 KiB, at most 993 files and
// 48 MiB under game/, no game path over 1000 bytes, dossier text capped.
const DOSSIER_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function handIn() {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  const shots = join(repoRoot, 'screenshots');
  if (existsSync(shots)) {
    cpSync(shots, join(outputDir, 'screenshots'), { recursive: true });
  }
  const dossier = buildDossier(outputDir, DOSSIER_LIMITS);
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
  console.log(`Copper Ladle Kitchen handed in: dossier ${dossier.length} bytes -> ${outputDir}`);
}

handIn();
