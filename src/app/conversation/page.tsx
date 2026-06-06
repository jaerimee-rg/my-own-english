import PageHeader from "@/components/PageHeader";

export default function ConversationPage() {
  return (
    <div>
      <PageHeader
        title="대화 연습"
        subtitle="AI와 상황별 · 자유 영어 대화"
      />
      <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
        곧 AI 대화 연습이 들어올 자리예요. (Phase 3)
      </div>
    </div>
  );
}
