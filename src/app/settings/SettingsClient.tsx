"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SettingsClient() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (active) {
        setEmail(user?.email ?? null);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    setEmail(null);
    router.refresh();
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="text-sm text-neutral-500">계정 · 표시 옵션 · 데이터 관리</p>
      </header>

      <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900">
        <h2 className="mb-2 font-semibold">계정</h2>
        {loading ? (
          <p className="text-sm text-neutral-400">확인 중…</p>
        ) : email ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">
              {email}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-neutral-500">
              로그인하면 문장이 안전하게 저장돼요.
            </span>
            <Link
              href="/login"
              className="rounded-lg bg-pink-600 px-3 py-1.5 text-sm font-semibold text-white"
            >
              로그인
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
