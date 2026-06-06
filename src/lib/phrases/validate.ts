import type { PhraseInput } from "./types";

export type ValidationResult = {
  valid: boolean;
  errors: Partial<Record<"english" | "korean", string>>;
};

/** Validate phrase input before saving. English and Korean are required. */
export function validatePhraseInput(input: Partial<PhraseInput>): ValidationResult {
  const errors: ValidationResult["errors"] = {};

  if (!input.english || !input.english.trim()) {
    errors.english = "영어 문장을 입력해 주세요.";
  }
  if (!input.korean || !input.korean.trim()) {
    errors.korean = "한국어 뜻을 입력해 주세요.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/** Normalize input for persistence (trim strings, empty → null). */
export function normalizePhraseInput(input: PhraseInput): PhraseInput {
  const clean = (v: string | null | undefined) => {
    const t = (v ?? "").trim();
    return t.length ? t : null;
  };
  return {
    english: input.english.trim(),
    korean: input.korean.trim(),
    note: clean(input.note),
    apparatus: input.apparatus ?? null,
    situation: input.situation ?? null,
    level: input.level ?? null,
    is_favorite: input.is_favorite ?? false,
  };
}
