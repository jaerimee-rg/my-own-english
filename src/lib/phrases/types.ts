import type { ApparatusValue, SituationValue, LevelValue } from "./constants";

/** A saved phrase (mirrors the `phrases` table). */
export type Phrase = {
  id: string;
  user_id: string;
  english: string;
  korean: string;
  note: string | null;
  apparatus: ApparatusValue | null;
  situation: SituationValue | null;
  level: LevelValue | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

/** Fields supplied when creating or editing a phrase. */
export type PhraseInput = {
  english: string;
  korean: string;
  note?: string | null;
  apparatus?: ApparatusValue | null;
  situation?: SituationValue | null;
  level?: LevelValue | null;
  is_favorite?: boolean;
};

export type Tag = {
  id: string;
  user_id: string;
  name: string;
};
