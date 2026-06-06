export type Badge = { threshold: number; emoji: string; label: string };

/** Streak milestones that award a badge. */
export const BADGES: Badge[] = [
  { threshold: 3, emoji: "🥉", label: "3연속" },
  { threshold: 5, emoji: "🥈", label: "5연속" },
  { threshold: 10, emoji: "🥇", label: "10연속" },
  { threshold: 20, emoji: "👑", label: "20연속" },
];

/** Badges earned for reaching a given best streak. */
export function badgesForStreak(bestStreak: number): Badge[] {
  return BADGES.filter((b) => bestStreak >= b.threshold);
}

/** Points for a correct answer: base 10 + streak bonus (capped). */
export function pointsForAnswer(streakAfter: number): number {
  return 10 + Math.min(streakAfter - 1, 5) * 2;
}
