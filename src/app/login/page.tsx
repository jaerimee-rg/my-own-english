import LoginForm from "./LoginForm";
import PageHeader from "@/components/PageHeader";

export default function LoginPage() {
  return (
    <div>
      <PageHeader title="로그인" subtitle="My Own English 계정으로 시작해요" />
      <LoginForm />
    </div>
  );
}
