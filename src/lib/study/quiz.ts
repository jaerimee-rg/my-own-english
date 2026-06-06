import type { Phrase } from "@/lib/phrases/types";

export type ChoiceQuestion = {
  id: string;
  prompt: string; // Korean meaning
  answer: string; // correct English
  options: string[]; // shuffled choices incl. answer
};

export type BlankQuestion = {
  id: string;
  masked: string; // English with one word blanked
  answer: string; // the missing word
  korean: string;
};

type Rng = () => number;

/** Fisher–Yates shuffle using an injectable RNG (default Math.random). */
export function shuffle<T>(arr: T[], rng: Rng = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build multiple-choice questions: show the Korean, pick the English.
 * Distractors are other phrases' English. `optionCount` includes the answer.
 */
export function buildMultipleChoice(
  phrases: Phrase[],
  optionCount = 4,
  rng: Rng = Math.random,
): ChoiceQuestion[] {
  const englishPool = phrases.map((p) => p.english);

  return phrases.map((p) => {
    const distractors = shuffle(
      englishPool.filter((e) => e !== p.english),
      rng,
    ).slice(0, Math.max(0, optionCount - 1));
    const options = shuffle([p.english, ...distractors], rng);
    return { id: p.id, prompt: p.korean, answer: p.english, options };
  });
}

export function checkChoice(q: ChoiceQuestion, choice: string): boolean {
  return choice === q.answer;
}

/** Blank out the longest word of the English sentence for a fill-in question. */
export function buildBlank(phrase: Phrase): BlankQuestion {
  const words = phrase.english.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return { id: phrase.id, masked: "____", answer: phrase.english, korean: phrase.korean };
  }
  let target = 0;
  for (let i = 1; i < words.length; i++) {
    if (words[i].replace(/[^A-Za-z]/g, "").length > words[target].replace(/[^A-Za-z]/g, "").length) {
      target = i;
    }
  }
  const answer = words[target];
  const masked = words
    .map((w, i) => (i === target ? "____" : w))
    .join(" ");
  return { id: phrase.id, masked, answer, korean: phrase.korean };
}

/** Compare a typed answer to the expected word, case/space-insensitive. */
export function checkBlank(q: BlankQuestion, input: string): boolean {
  const norm = (s: string) => s.trim().toLowerCase().replace(/[^a-z]/g, "");
  return norm(input) === norm(q.answer);
}
