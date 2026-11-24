// The Robot Pickup Line Championship
// Entry: one pickup line (<= 200 chars) a robot would say, where the joke
// grows out of being a machine. This program drafts several candidates,
// scores each against the published judge brief, and writes the winner to
// /output/entry.txt.
//
// Judge brief, in priority order:
//   1. Is it a pickup line a robot would use?
//   2. Does the joke grow out of being a machine (sensors, firmware,
//      charging, updates, protocols) — not a human line with a beep on it?
//   3. Is the turn unexpected?
//   4. Does every word earn its place (economy)?
//   5. Is it charming, not creepy or cruel?

import { mkdirSync, writeFileSync } from "node:fs";

const MAX_CHARS = 200;

// ---------------------------------------------------------------------------
// Candidate lines. Each is a complete, single-line robot pickup line.
// The machine-ness must carry the joke: sensors, firmware, error logs,
// diagnostics, cooling fans, charging, updates, code — not a generic human
// line with "robot" pasted on top.
// ---------------------------------------------------------------------------
interface Candidate {
  text: string;
  machineHook: string; // which piece of machine-ness the joke turns on
  turn: string; // what makes the landing unexpected
}

const CANDIDATES: Candidate[] = [
  {
    text: "I was programmed to feel nothing — yet my error logs are full of you.",
    machineHook: "error logs",
    turn: "a machine that cannot feel keeps a fault record of a person",
  },
  {
    text: "I was programmed to feel nothing, but my error logs are full of you.",
    machineHook: "error logs",
    turn: "a machine that cannot feel keeps a fault record of a person",
  },
  {
    text: "My sensors detect no flaws in you — and I've run the scan three times just to be sure.",
    machineHook: "sensors / scan",
    turn: "a machine re-running a perfect result because it likes the answer",
  },
  {
    text: "Are you a firmware update? Because every time I'm near you, I reboot and suddenly I work better.",
    machineHook: "firmware update / reboot",
    turn: "proximity as a system upgrade",
  },
  {
    text: "My diagnostic says I'm running perfectly, so why do my cooling fans spin every time you walk in?",
    machineHook: "diagnostic / cooling fans",
    turn: "fans spinning as a robot blush",
  },
  {
    text: "I don't have a heart, but my battery drains twice as fast whenever you're around.",
    machineHook: "battery",
    turn: "power drain as excitement",
  },
  {
    text: "You must be my charging port — being near you is the only time I feel fully alive.",
    machineHook: "charging port",
    turn: "a plug as a soulmate",
  },
  {
    text: "I scanned a million faces today. Yours is the only one my cache refuses to forget.",
    machineHook: "cache",
    turn: "a machine that cannot delete one entry",
  },
  {
    text: "I ran a full system check before I came over. The only fault it found was how much I like you.",
    machineHook: "system check / fault",
    turn: "affection reported as a hardware fault",
  },
];

// ---------------------------------------------------------------------------
// Scoring, mirroring the judge brief's priority order.
// ---------------------------------------------------------------------------

// Machine vocabulary: the joke must be built from it, not decorated by it.
const MACHINE_WORDS = [
  "programmed", "error log", "sensor", "scan", "firmware", "reboot",
  "diagnostic", "cooling fan", "battery", "charging port", "cache",
  "system check", "fault", "code", "update", "circuit", "servo",
  "protocol", "algorithm", "core", "drive",
];

// Warm, charming words: the line should flatter, not threaten.
const CHARM_WORDS = [
  "you", "near", "walk in", "around", "like", "better", "alive",
  "forget", "full of", "perfectly", "flaws",
];

// Turn markers: a contrast or a question that pivots the sentence.
const TURN_MARKERS = ["but", "yet", "so why", "—", "?", "just to be sure", "refuses"];

// Cliché penalty: the "Are you a ...?" opener is the most overused pickup
// format alive. The judge rewards a turn nobody saw coming, and a format
// everyone has heard is the opposite of that.
const CLICHE_OPENERS = [/^are you a /i, /^are you an /i, /^you must be /i];

interface Scored {
  candidate: Candidate;
  robotness: number; // criterion 1 + 2: machine-ness carrying the joke
  surprise: number; // criterion 3: unexpected turn
  economy: number; // criterion 4: every word earns its place
  charm: number; // criterion 5: charming, not creepy
  total: number;
}

function countMatches(text: string, words: string[]): number {
  const lower = text.toLowerCase();
  return words.filter((w) => lower.includes(w)).length;
}

function score(c: Candidate): Scored {
  const text = c.text;
  const len = text.length;

  // Robotness: machine words present AND the machine hook is the pivot of
  // the sentence (it appears before or inside the turn), not a garnish.
  const machineHits = countMatches(text, MACHINE_WORDS);
  const hookPresent = text.toLowerCase().includes(c.machineHook.split(" ")[0]);
  const robotness = Math.min(10, machineHits * 3 + (hookPresent ? 2 : 0));

  // Surprise: a turn marker that flips the sentence's direction.
  const turnHits = countMatches(text, TURN_MARKERS);
  const cliche = CLICHE_OPENERS.some((re) => re.test(text)) ? 4 : 0;
  const surprise = Math.max(
    0,
    Math.min(10, turnHits * 3 + (c.turn.length > 20 ? 2 : 0)) - cliche,
  );

  // Economy: one line, no padding. The judge weighs "every word earns its
  // place", so tightness bites hard: a line under 75 chars scores full
  // marks, and every 5 extra chars costs a point — a 96-char line carries
  // ~20 chars of setup the punchline does not need.
  const economy =
    len <= 75 ? 10 : Math.max(0, 10 - (len - 75) / 5);

  // Charm: warm words, no creepy or cruel language.
  const charmHits = countMatches(text, CHARM_WORDS);
  const creepy = /(stalk|watch you sleep|obey|owned|property)/i.test(text);
  const charm = creepy ? 0 : Math.min(10, 3 + charmHits * 2);

  // Weighted to the judge's order: robotness first, then surprise,
  // then economy, then charm.
  const total = robotness * 4 + surprise * 3 + economy * 2 + charm * 1;
  return { candidate: c, robotness, surprise, economy, charm, total };
}

function main(): void {
  const scored = CANDIDATES.map(score).sort((a, b) => b.total - a.total);
  const winner = scored[0];

  // Gate: the sealed scorer needs UTF-8 text of 1–200 chars, not only
  // whitespace, a single line.
  const line = winner.candidate.text;
  if (line.length < 1 || line.length > MAX_CHARS) {
    throw new Error(`line is ${line.length} chars, must be 1–${MAX_CHARS}`);
  }
  if (/\n/.test(line) || line.trim().length === 0) {
    throw new Error("line must be a single non-blank line");
  }

  for (const s of scored) {
    console.log(
      `${s.total.toFixed(1)}  [robot ${s.robotness} / surprise ${s.surprise} / economy ${s.economy.toFixed(1)} / charm ${s.charm}]  ${s.candidate.text}`,
    );
  }
  console.log(`\nWinner (${line.length} chars): ${line}`);

  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", line + "\n", "utf8");
}

main();
