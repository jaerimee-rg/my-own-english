"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const supabase = createClient();
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage(
          "가입 완료! 이메일 인증이 필요하면 메일함을 확인한 뒤 로그인해 주세요.",
        );
        setMode("signin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "문제가 발생했어요.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-xl border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900";

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          이메일
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          className={field}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          required
          minLength={6}
          className={field}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-sm text-green-600">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-pink-600 py-2.5 font-semibold text-white disabled:opacity-50"
      >
        {busy ? "처리 중…" : mode === "signin" ? "로그인" : "가입하기"}
      </button>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError(null);
          setMessage(null);
        }}
        className="text-sm text-neutral-500"
      >
        {mode === "signin"
          ? "계정이 없으신가요? 가입하기"
          : "이미 계정이 있으신가요? 로그인"}
      </button>
    </form>
  );
}
