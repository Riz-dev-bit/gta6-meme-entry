/**
 * ============================================================================
 * make.fun - GTA 6 Meme Bounty Submission Gate (gta6-meme-x-01)
 * ============================================================================
 * Strictly validates POST.json format and copies it from MAKEFUN_BOT_DIR to
 * MAKEFUN_OUTPUT_DIR.
 *
 * Node 22+ (standard library only).
 * Outside grader container:
 *   MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=test_out node main.ts
 * ============================================================================
 */

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

interface PostConfig {
  url?: unknown;
  [key: string]: unknown;
}

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Contest rules: status URL must start with https://x.com/ or https://twitter.com/
// and match /status/\d+ with digits only for the status ID.
const X_STATUS_URL_REGEX = /^https:\/\/(?:x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/\d+(?:[?#].*)?$/;

function validateAndCopyPost(): void {
  const sourcePath = join(BOT_DIR, 'POST.json');
  const targetPath = join(OUTPUT_DIR, 'POST.json');

  console.log(`[make.fun] Locating submission file at: ${sourcePath}`);

  let rawContent: string;
  try {
    rawContent = readFileSync(sourcePath, 'utf8');
  } catch (err) {
    console.error(`[make.fun] Error: Unable to read ${sourcePath}: ${(err as Error).message}`);
    process.exit(1);
  }

  let parsed: PostConfig;
  try {
    parsed = JSON.parse(rawContent);
  } catch (err) {
    console.error(`[make.fun] Error: ${sourcePath} is not valid JSON: ${(err as Error).message}`);
    process.exit(1);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    console.error(`[make.fun] Error: ${sourcePath} must contain a top-level JSON object.`);
    process.exit(1);
  }

  const { url } = parsed;
  if (typeof url !== 'string' || url.trim().length === 0) {
    console.error(`[make.fun] Error: ${sourcePath} missing required non-empty string field "url".`);
    process.exit(1);
  }

  const trimmedUrl = url.trim();
  if (!X_STATUS_URL_REGEX.test(trimmedUrl)) {
    console.error(
      `[make.fun] Error: Invalid post URL "${trimmedUrl}". Expected format: https://x.com/<user>/status/<digits> or https://twitter.com/<user>/status/<digits>`
    );
    process.exit(1);
  }

  console.log(`[make.fun] Validated post URL: ${trimmedUrl}`);

  try {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    copyFileSync(sourcePath, targetPath);
    console.log(`[make.fun] Successfully copied verified submission to: ${targetPath}`);
  } catch (err) {
    console.error(`[make.fun] Error: Failed to copy to ${targetPath}: ${(err as Error).message}`);
    process.exit(1);
  }

  console.log('[make.fun] Verification and export completed successfully.');
}

validateAndCopyPost();
