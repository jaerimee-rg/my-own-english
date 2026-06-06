import PageHeader from "@/components/PageHeader";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="설정" subtitle="계정 · 표시 옵션 · 데이터 관리" />
      <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
        곧 계정과 환경설정이 들어올 자리예요.
      </div>
    </div>
  );
}
