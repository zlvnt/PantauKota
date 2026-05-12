'use client';

import { AuthSessionProvider } from '@/hooks/useAuthSession';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}
