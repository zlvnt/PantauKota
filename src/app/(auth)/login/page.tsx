import AuthScreen from "@/components/auth/AuthScreen";

type LoginPageProps = {
  searchParams?: {
    error?: string;
    notice?: string;
  };
};

const errorMessages: Record<string, string> = {
  'invalid-confirmation': 'Link konfirmasi tidak valid. Silakan daftar ulang atau minta link baru dari Supabase.',
  'confirmation-failed': 'Konfirmasi email gagal atau link sudah kedaluwarsa. Silakan coba masuk atau daftar ulang.',
};

const noticeMessages: Record<string, string> = {
  'email-confirmed': 'Email berhasil dikonfirmasi. Silakan masuk.',
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <AuthScreen
      defaultIsLogin={true}
      initialError={searchParams?.error ? errorMessages[searchParams.error] ?? '' : ''}
      initialNotice={searchParams?.notice ? noticeMessages[searchParams.notice] ?? '' : ''}
    />
  );
}
