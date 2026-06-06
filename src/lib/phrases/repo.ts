import type { SupabaseClient } from "@supabase/supabase-js";
import type { Phrase, PhraseInput } from "./types";
import { normalizePhraseInput } from "./validate";

const TABLE = "phrases";

/**
 * Data-access layer for phrases. Functions take a Supabase client so they can
 * run on the server or client and be unit-tested with a mock client.
 */
export async function listPhrases(supabase: SupabaseClient): Promise<Phrase[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Phrase[];
}

export async function createPhrase(
  supabase: SupabaseClient,
  input: PhraseInput,
): Promise<Phrase> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(normalizePhraseInput(input))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Phrase;
}

export async function createPhrases(
  supabase: SupabaseClient,
  inputs: PhraseInput[],
): Promise<Phrase[]> {
  if (inputs.length === 0) return [];
  const rows = inputs.map(normalizePhraseInput);
  const { data, error } = await supabase.from(TABLE).insert(rows).select();
  if (error) throw new Error(error.message);
  return (data ?? []) as Phrase[];
}

export async function updatePhrase(
  supabase: SupabaseClient,
  id: string,
  input: PhraseInput,
): Promise<Phrase> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(normalizePhraseInput(input))
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Phrase;
}

export async function deletePhrase(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function toggleFavorite(
  supabase: SupabaseClient,
  id: string,
  isFavorite: boolean,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ is_favorite: isFavorite })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
