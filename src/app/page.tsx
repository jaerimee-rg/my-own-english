import Link from "next/link";
import { NAV_ITEMS } from "@/lib/nav";

const QUICK_LINKS = NAV_ITEMS.filter((i) => i.href !== "/");

export default function Home() {
  return (
    <div>
      <header className="mb-8">
        <p className="text-sm font-medium text-pink-600 dark:text-pink-400">
          My Own English
        </p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          안녕하세요 👋
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          리듬체조 수업 영어를 모으고, 익히고, 말해봐요.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3">
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col gap-2 rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition active:scale-[0.98] dark:border-white/10 dark:bg-neutral-900"
          >
            <span aria-hidden className="text-3xl">
              {item.icon}
            </span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-50">
              {item.label}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
