import { describe, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listPhrases,
  createPhrase,
  createPhrases,
  updatePhrase,
  deletePhrase,
  toggleFavorite,
} from "./repo";

// Minimal chainable mock of the Supabase query builder.
function mockClient(result: { data?: unknown; error?: { message: string } | null }) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {};
  const chain = () => builder;
  builder.from = vi.fn(chain);
  // select() may be terminal (createPhrases) or chained into .single()/.order();
  // return a value that is both awaitable and chainable.
  builder.select = vi.fn(() => Object.assign(Promise.resolve(result), builder));
  builder.insert = vi.fn(chain);
  builder.update = vi.fn(chain);
  builder.delete = vi.fn(chain);
  builder.eq = vi.fn(chain);
  builder.order = vi.fn(() => Promise.resolve(result));
  builder.single = vi.fn(() => Promise.resolve(result));
  // delete().eq() resolves directly
  builder.eq = vi.fn(() =>
    Object.assign(Promise.resolve(result), builder),
  );
  return { client: builder as unknown as SupabaseClient, builder };
}

describe("phrases repo", () => {
  it("listPhrases orders by created_at desc and returns rows", async () => {
    const rows = [{ id: "1" }, { id: "2" }];
    const { client, builder } = mockClient({ data: rows, error: null });
    const out = await listPhrases(client);
    expect(builder.from).toHaveBeenCalledWith("phrases");
    expect(builder.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(out).toEqual(rows);
  });

  it("createPhrase normalizes input and returns the row", async () => {
    const { client, builder } = mockClient({ data: { id: "9" }, error: null });
    const out = await createPhrase(client, { english: "  Hi  ", korean: "안녕" });
    const inserted = builder.insert.mock.calls[0][0];
    expect(inserted.english).toBe("Hi");
    expect(inserted.is_favorite).toBe(false);
    expect(out).toEqual({ id: "9" });
  });

  it("createPhrases normalizes and bulk-inserts rows", async () => {
    const { client, builder } = mockClient({ data: [{ id: "1" }, { id: "2" }], error: null });
    const out = await createPhrases(client, [
      { english: " A ", korean: "가" },
      { english: "B", korean: "나" },
    ]);
    const inserted = builder.insert.mock.calls[0][0];
    expect(Array.isArray(inserted)).toBe(true);
    expect(inserted).toHaveLength(2);
    expect(inserted[0].english).toBe("A");
    expect(out).toHaveLength(2);
  });

  it("createPhrases returns [] for empty input without calling insert", async () => {
    const { client, builder } = mockClient({ data: [], error: null });
    const out = await createPhrases(client, []);
    expect(out).toEqual([]);
    expect(builder.insert).not.toHaveBeenCalled();
  });

  it("updatePhrase targets the id", async () => {
    const { client, builder } = mockClient({ data: { id: "5" }, error: null });
    await updatePhrase(client, "5", { english: "A", korean: "가" });
    expect(builder.update).toHaveBeenCalled();
  });

  it("throws on error", async () => {
    const { client } = mockClient({ data: null, error: { message: "boom" } });
    await expect(listPhrases(client)).rejects.toThrow("boom");
  });

  it("deletePhrase and toggleFavorite resolve without throwing", async () => {
    const { client } = mockClient({ data: null, error: null });
    await expect(deletePhrase(client, "1")).resolves.toBeUndefined();
    await expect(toggleFavorite(client, "1", true)).resolves.toBeUndefined();
  });
});
