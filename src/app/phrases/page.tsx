import PageHeader from "@/components/PageHeader";

export default function PhrasesPage() {
  return (
    <div>
      <PageHeader
        title="문장집"
        subtitle="수업에 쓰는 영어 문장과 단어를 모아요"
      />
      <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
        곧 문장 추가 · 검색 · 분류 기능이 들어올 자리예요. (Phase 1)
      </div>
    </div>
  );
}
