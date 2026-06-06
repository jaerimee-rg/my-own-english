import PageHeader from "@/components/PageHeader";

export default function StudyPage() {
  return (
    <div>
      <PageHeader
        title="학습"
        subtitle="플래시카드 · 퀴즈 · 이미지 연결 · 게임"
      />
      <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
        곧 다양한 학습 모드가 들어올 자리예요. (Phase 2)
      </div>
    </div>
  );
}
