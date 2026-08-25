#!/usr/bin/env node
/**
 * Turn `coverage/coverage-summary.json` into a shields.io endpoint badge.
 *
 * shields.io renders a badge from any publicly readable JSON matching its
 * endpoint schema, which lets us publish a coverage badge without a
 * third-party coverage service. CI writes the output to the `badges` branch;
 * the badge URL then points at that file's raw URL.
 *
 * Usage: node scripts/coverage-badge.mjs [outDir]   (default: badges/)
 *
 * @see https://shields.io/badges/endpoint-badge
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const SUMMARY_PATH = "coverage/coverage-summary.json";
const outDir = process.argv[2] ?? "badges";

/** shields.io's named colours, best to worst. */
const SCALE = [
  { min: 90, color: "brightgreen" },
  { min: 80, color: "green" },
  { min: 70, color: "yellowgreen" },
  { min: 60, color: "yellow" },
  { min: 50, color: "orange" },
  { min: 0, color: "red" },
];

const colorFor = (pct) => SCALE.find((step) => pct >= step.min).color;

let summary;
try {
  summary = JSON.parse(readFileSync(SUMMARY_PATH, "utf8"));
} catch (err) {
  console.error(
    `Could not read ${SUMMARY_PATH}. Run \`npm run test:coverage\` first ` +
      `(the 'json-summary' reporter must be enabled in vite.config.js).`
  );
  console.error(err.message);
  process.exit(1);
}

const { lines, statements, branches, functions } = summary.total;
const pct = Math.round(lines.pct * 10) / 10;

mkdirSync(outDir, { recursive: true });

const badge = {
  schemaVersion: 1,
  label: "coverage",
  message: `${pct}%`,
  color: colorFor(pct),
};
writeFileSync(join(outDir, "coverage.json"), JSON.stringify(badge, null, 2) + "\n");

// Full numbers alongside the badge, for anyone who wants the detail.
const detail = {
  lines: lines.pct,
  statements: statements.pct,
  branches: branches.pct,
  functions: functions.pct,
  coveredLines: lines.covered,
  totalLines: lines.total,
};
writeFileSync(join(outDir, "coverage-detail.json"), JSON.stringify(detail, null, 2) + "\n");

console.log(`coverage badge: ${badge.message} (${badge.color}) -> ${outDir}/coverage.json`);
