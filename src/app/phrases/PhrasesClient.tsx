"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  listPhrases,
  createPhrase,
  createPhrases,
  updatePhrase,
  deletePhrase,
  toggleFavorite,
} from "@/lib/phrases/repo";
import { filterPhrases, type PhraseFilter } from "@/lib/phrases/filter";
import type { Phrase, PhraseInput } from "@/lib/phrases/types";
import { APPARATUS, SITUATIONS, LEVELS } from "@/lib/phrases/constants";
import PhraseCard from "@/components/phrases/PhraseCard";
import PhraseForm from "@/components/phrases/PhraseForm";
import BulkImport from "@/components/phrases/BulkImport";

type Status = "loading" | "ready" | "error";

export default function PhrasesClient() {
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState<Status>("loading");
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [filter, setFilter] = useState<PhraseFilter>({});
  const [editing, setEditing] = useState<Phrase | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    // No synchronous setState here: the await defers updates out of the
    // effect tick (initial status is already "loading").
    try {
      setPhrases(await listPhrases(supabase));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [supabase]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await listPhrases(supabase);
        if (active) {
          setPhrases(data);
          setStatus("ready");
        }
      } catch {
        if (active) setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  const visible = useMemo(
    () => filterPhrases(phrases, filter),
    [phrases, filter],
  );

  async function handleBulkSave(items: PhraseInput[]) {
    await createPhrases(supabase, items);
    await load();
  }

  async function handleSubmit(input: PhraseInput) {
    setSaving(true);
    try {
      if (editing) await updatePhrase(supabase, editing.id, input);
      else await createPhrase(supabase, input);
      setShowForm(false);
      setEditing(null);
      await load();
    } catch {
      alert("저장에 실패했어요. 연결 상태를 확인해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: Phrase) {
    if (!confirm("이 문장을 삭제할까요?")) return;
    try {
      await deletePhrase(supabase, p.id);
      await load();
    } catch {
      alert("삭제에 실패했어요.");
    }
  }

  async function handleToggleFavorite(p: Phrase) {
    try {
      await toggleFavorite(supabase, p.id, !p.is_favorite);
      setPhrases((list) =>
        list.map((x) =>
          x.id === p.id ? { ...x, is_favorite: !x.is_favorite } : x,
        ),
      );
    } catch {
      /* ignore */
    }
  }

  const select =
    "rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900";

  return (
    <div>
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">문장집</h1>
          <p className="text-sm text-neutral-500">
            수업에 쓰는 영어 문장과 단어를 모아요
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => {
              setShowBulk(true);
              setShowForm(false);
            }}
            className="rounded-xl border border-pink-300 px-3 py-2 text-sm font-semibold text-pink-700 active:scale-95 dark:border-pink-800 dark:text-pink-300"
          >
            일괄
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
              setShowBulk(false);
            }}
            className="rounded-xl bg-pink-600 px-4 py-2 font-semibold text-white active:scale-95"
          >
            + 추가
          </button>
        </div>
      </header>

      <div className="mb-4 flex flex-col gap-2">
        <input
          aria-label="검색"
          placeholder="검색 (영어/한국어/메모)"
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          value={filter.query ?? ""}
          onChange={(e) => setFilter((f) => ({ ...f, query: e.target.value }))}
        />
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="소도구 필터"
            className={select}
            value={filter.apparatus ?? ""}
            onChange={(e) =>
              setFilter((f) => ({ ...f, apparatus: e.target.value || null }))
            }
          >
            <option value="">소도구 전체</option>
            {APPARATUS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            aria-label="상황 필터"
            className={select}
            value={filter.situation ?? ""}
            onChange={(e) =>
              setFilter((f) => ({ ...f, situation: e.target.value || null }))
            }
          >
            <option value="">상황 전체</option>
            {SITUATIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            aria-label="난이도 필터"
            className={select}
            value={filter.level ?? ""}
            onChange={(e) =>
              setFilter((f) => ({ ...f, level: e.target.value || null }))
            }
          >
            <option value="">난이도 전체</option>
            {LEVELS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showBulk && (
        <div className="mb-4 rounded-2xl border border-pink-200 bg-pink-50/50 p-4 dark:border-pink-900 dark:bg-pink-950/20">
          <BulkImport
            onSave={handleBulkSave}
            onClose={() => setShowBulk(false)}
          />
        </div>
      )}

      {showForm && (
        <div className="mb-4 rounded-2xl border border-pink-200 bg-pink-50/50 p-4 dark:border-pink-900 dark:bg-pink-950/20">
          <h2 className="mb-3 font-semibold">
            {editing ? "문장 수정" : "새 문장"}
          </h2>
          <PhraseForm
            initial={editing ?? undefined}
            submitting={saving}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      {status === "loading" && (
        <p className="py-8 text-center text-sm text-neutral-400">불러오는 중…</p>
      )}
      {status === "error" && (
        <p className="py-8 text-center text-sm text-neutral-400">
          아직 데이터에 연결되지 않았어요. Supabase 연결 후 문장이 표시됩니다.
        </p>
      )}
      {status === "ready" && visible.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
          아직 문장이 없어요. “+ 추가”로 첫 문장을 만들어 보세요.
        </div>
      )}

      {status === "ready" && visible.length > 0 && (
        <ul className="flex flex-col gap-3">
          {visible.map((p) => (
            <li key={p.id}>
              <PhraseCard
                phrase={p}
                onToggleFavorite={handleToggleFavorite}
                onEdit={(ph) => {
                  setEditing(ph);
                  setShowForm(true);
                }}
                onDelete={handleDelete}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
