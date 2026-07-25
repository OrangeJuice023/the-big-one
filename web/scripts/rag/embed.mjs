#!/usr/bin/env node
/**
 * policy-layer RAG ingestion — step 2: embed.
 *
 * Reads chunks.json (produced by chunk.py) and computes an embedding vector
 * for every chunk using a small local model via @xenova/transformers
 * (Transformers.js). Runs entirely locally after the first model download —
 * no API key, no per-call cost.
 *
 * NOTE ON WHERE THIS RUNS: this sandbox's network allowlist does not reach
 * huggingface.co, so this script cannot execute here. It is written to run
 * on your own machine or in CI/Vercel build step, where huggingface.co is
 * reachable. Verify with: `node scripts/rag/embed.mjs` after `npm install`.
 *
 * Output: scripts/rag/embeddings.json — an array of
 *   { id, lgu, source_file, is_argument_note, lgu_has_pending_provenance,
 *     lgu_has_failed_verification, lgu_lapse_types, text, embedding }
 * consumed at query time by web/src/app/api/ask/route.ts.
 *
 * Model: Xenova/all-MiniLM-L6-v2 (384-dim, ~90MB, quantized). Small enough to
 * bundle; good enough for a corpus this size (a few hundred chunks). This is
 * the same embedding family commonly used for lightweight semantic search;
 * swap MODEL_NAME below if you want a larger model later.
 */
import { pipeline } from "@xenova/transformers";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHUNKS_PATH = join(__dirname, "chunks.json");
const OUT_PATH = join(__dirname, "embeddings.json");
const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";

async function main() {
  const chunks = JSON.parse(readFileSync(CHUNKS_PATH, "utf-8"));
  console.log(`Loaded ${chunks.length} chunks. Loading embedding model (${MODEL_NAME})…`);

  const extractor = await pipeline("feature-extraction", MODEL_NAME, {
    quantized: true,
  });

  const out = [];
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    const result = await extractor(c.text, { pooling: "mean", normalize: true });
    const embedding = Array.from(result.data);
    out.push({ ...c, embedding });
    if ((i + 1) % 25 === 0 || i === chunks.length - 1) {
      console.log(`  embedded ${i + 1}/${chunks.length}`);
    }
  }

  writeFileSync(OUT_PATH, JSON.stringify(out), "utf-8");
  console.log(`Wrote ${out.length} embedded chunks -> ${OUT_PATH}`);
  console.log(`Embedding dim: ${out[0]?.embedding?.length ?? "unknown"}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
