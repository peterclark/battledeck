#!/usr/bin/env node
// Generate original grimdark fantasy artwork for BattleDeck using the
// OpenAI Images API. The app currently ships with hand-drawn SVG art
// (src/Artwork.jsx); run this to produce painted replacements.
//
// Usage:
//   OPENAI_API_KEY=sk-... node scripts/generate-art.mjs
//
// Output lands in src/assets/art/. All prompts describe generic fantasy
// wargame imagery only — never reference Battleground: Fantasy Warfare,
// Your Move Games, or their card art, so the results stay original.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) {
  console.error("Set OPENAI_API_KEY to run art generation.");
  process.exit(1);
}

const STYLE =
  "Dark oil painting, grimdark fantasy battlefield mood, near-black charcoal " +
  "and iron tones with ember-orange rim light, heavy chiaroscuro, painterly " +
  "brushwork, no text, no watermark, original artwork.";

const PIECES = [
  {
    file: "banner.png",
    size: "1536x1024",
    prompt:
      `${STYLE} A wide banner scene: silhouetted ranks of spearmen on a ` +
      "ridge at dusk, tattered war banners, a low burning sun behind smoke.",
  },
  {
    file: "emblem-swords.png",
    size: "1024x1024",
    prompt:
      `${STYLE} A small circular emblem of two crossed medieval swords ` +
      "over a battered iron shield, centered on plain black.",
  },
  {
    file: "emblem-horn.png",
    size: "1024x1024",
    prompt:
      `${STYLE} A small circular emblem of a carved war horn with ember ` +
      "glow, centered on plain black.",
  },
];

const OUT_DIR = path.join(process.cwd(), "src", "assets", "art");
await mkdir(OUT_DIR, { recursive: true });

for (const piece of PIECES) {
  console.log(`Generating ${piece.file}...`);
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: piece.prompt,
      size: piece.size,
      quality: "high",
    }),
  });
  if (!res.ok) {
    console.error(`Failed (${res.status}): ${await res.text()}`);
    process.exit(1);
  }
  const json = await res.json();
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) {
    console.error("No image data in response.");
    process.exit(1);
  }
  await writeFile(path.join(OUT_DIR, piece.file), Buffer.from(b64, "base64"));
  console.log(`Saved src/assets/art/${piece.file}`);
}

console.log("Done. Swap the images into src/Artwork.jsx / index.html.");
