export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

/** Bottom navigation destinations (mobile-first). */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/phrases", label: "문장집", icon: "📒" },
  { href: "/study", label: "학습", icon: "🎯" },
  { href: "/conversation", label: "대화", icon: "💬" },
  { href: "/settings", label: "설정", icon: "⚙️" },
];
