/**
 * Phase 2 - Legacy state migration planner (read-only).
 *
 * Reads a legacy state JSON file, validates it as an object, and produces a
 * deterministic migration plan summarizing ONLY key names, types, and counts.
 * No source values are ever written to the plan. No D1 writes are performed.
 *
 * Usage: npx tsx scripts/migrate-legacy-state.ts <path> [--out plan.json]
 */
import * as fs from 'fs';

type Shape =
  | { kind: 'object'; keys: Record<string, Shape> }
  | { kind: 'array'; length: number; element: Shape | null }
  | { kind: 'primitive'; type: string };

function summarize(value: unknown, depth = 0): Shape {
  if (depth > 32) return { kind: 'primitive', type: 'max-depth' };
  if (value === null) return { kind: 'primitive', type: 'null' };
  if (Array.isArray(value)) {
    return {
      kind: 'array',
      length: value.length,
      element: value.length ? summarize(value[0], depth + 1) : null,
    };
  }
  if (typeof value === 'object') {
    const keys: Record<string, Shape> = {};
    for (const k of Object.keys(value as Record<string, unknown>).sort()) {
      keys[k] = summarize((value as Record<string, unknown>)[k], depth + 1);
    }
    return { kind: 'object', keys };
  }
  return { kind: 'primitive', type: typeof value };
}

function main() {
  const args = process.argv.slice(2);
  const path = args[0];
  const outIdx = args.indexOf('--out');
  const outPath = outIdx >= 0 ? args[outIdx + 1] : null;
  if (!path) {
    console.error('Usage: migrate-legacy-state.ts <path> [--out plan.json]');
    process.exit(2);
  }
  let raw: string;
  try {
    raw = fs.readFileSync(path, 'utf8');
  } catch (e) {
    console.error(`Cannot read file: ${path}`);
    process.exit(1);
  }
  if (!raw.trim()) {
    // Verified: data/app_state.json is 0 bytes / empty in this codebase.
    console.log(JSON.stringify({ status: 'empty_file', plan: null }, null, 2));
    if (outPath) fs.writeFileSync(outPath, JSON.stringify({ status: 'empty_file', plan: null }, null, 2));
    return;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error('Invalid JSON');
    process.exit(1);
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    console.error('Root must be a JSON object');
    process.exit(1);
  }
  const shape = summarize(parsed) as { kind: 'object'; keys: Record<string, Shape> };
  const knownTopLevel = new Set(Object.keys(shape.keys));
  const unmappedFields = knownTopLevel; // placeholder for future mapping table
  const plan = {
    metadata: {
      generatedBy: 'scripts/migrate-legacy-state.ts',
      note: 'Key names/types/counts only; no source values included.',
      rootKeys: Object.keys(shape.keys).sort(),
      unmappedFields: Object.keys(unmappedFields).sort(),
    },
    shape,
  };
  const text = JSON.stringify(plan, null, 2); // JSON.stringify of sorted keys => deterministic
  console.log(text);
  if (outPath) fs.writeFileSync(outPath, text);
}

main();
