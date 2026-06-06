// Shared domain vocabulary for classifying phrases (Phase 1).
// Values are stored in the DB; labels are shown in the Korean UI.

export const APPARATUS = [
  { value: "ribbon", label: "리본" },
  { value: "hoop", label: "후프" },
  { value: "ball", label: "공" },
  { value: "clubs", label: "곤봉" },
  { value: "rope", label: "줄" },
  { value: "floor", label: "맨손" },
] as const;

export const SITUATIONS = [
  { value: "greeting", label: "인사" },
  { value: "warmup", label: "워밍업" },
  { value: "instruction", label: "동작 지시" },
  { value: "praise", label: "칭찬" },
  { value: "correction", label: "교정" },
  { value: "closing", label: "정리/마무리" },
] as const;

export const LEVELS = [
  { value: "beginner", label: "초급" },
  { value: "intermediate", label: "중급" },
  { value: "advanced", label: "고급" },
] as const;

export type ApparatusValue = (typeof APPARATUS)[number]["value"];
export type SituationValue = (typeof SITUATIONS)[number]["value"];
export type LevelValue = (typeof LEVELS)[number]["value"];

/** Look up the Korean label for a stored value, falling back to the raw value. */
export function labelFor(
  list: readonly { value: string; label: string }[],
  value: string | null | undefined,
): string {
  if (!value) return "";
  return list.find((o) => o.value === value)?.label ?? value;
}
