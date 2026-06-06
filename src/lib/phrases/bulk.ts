import type { PhraseInput } from "./types";

const HANGUL = /[가-힣]/;
const hasHangul = (s: string) => HANGUL.test(s);
const hasLatin = (s: string) => /[A-Za-z]/.test(s);

// Separators tried in order (most explicit first).
const SEPARATORS = ["\t", "::", " — ", " – ", " - ", " | ", " / ", " => ", " -> "];

function trySeparator(line: string): [string, string] | null {
  for (const sep of SEPARATORS) {
    const idx = line.indexOf(sep);
    if (idx > 0) {
      const a = line.slice(0, idx).trim();
      const b = line.slice(idx + sep.length).trim();
      if (a && b) return [a, b];
    }
  }
  return null;
}

// Split a single line that mixes Latin + Hangul with no explicit separator.
function tryScriptBoundary(line: string): [string, string] | null {
  if (!hasHangul(line) || !hasLatin(line)) return null;
  // English … Korean
  const en = line.match(/^([^가-힣]*[A-Za-z][^가-힣]*?)\s*([가-힣].*)$/);
  if (en && en[1].trim() && en[2].trim()) return [en[1].trim(), en[2].trim()];
  // Korean … English
  const ko = line.match(/^([가-힣][^A-Za-z]*?)\s*([A-Za-z].*)$/);
  if (ko && ko[1].trim() && ko[2].trim()) return [ko[2].trim(), ko[1].trim()];
  return null;
}

// Decide which side is English vs Korean by Hangul presence.
function assign(a: string, b: string): PhraseInput {
  if (hasHangul(a) && !hasHangul(b)) return { english: b, korean: a };
  return { english: a, korean: b };
}

/**
 * Parse a pasted block of mixed Korean/English text into phrase pairs.
 * Handles: delimited lines (tab / - / | / :: / etc.), single lines that mix
 * both scripts, and alternating English / Korean lines.
 */
export function parseBulkPhrases(text: string): PhraseInput[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const out: PhraseInput[] = [];
  let pending: string[] = [];

  const flushPairs = () => {
    let i = 0;
    while (i < pending.length - 1) {
      const a = pending[i];
      const b = pending[i + 1];
      if (hasHangul(a) !== hasHangul(b)) {
        out.push(assign(a, b));
        i += 2;
      } else {
        i += 1; // unpairable line — skip it
      }
    }
    pending = [];
  };

  for (const line of lines) {
    const sep = trySeparator(line) ?? tryScriptBoundary(line);
    if (sep) {
      flushPairs();
      out.push(assign(sep[0], sep[1]));
    } else {
      pending.push(line);
    }
  }
  flushPairs();

  return out
    .map((p) => ({ english: p.english.trim(), korean: p.korean.trim() }))
    .filter((p) => p.english && p.korean && hasHangul(p.korean));
}
