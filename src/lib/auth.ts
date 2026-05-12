import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: 'WARGA' | 'ADMIN';
  isActive: boolean;
};

export type CurrentSession = {
  user: CurrentUser;
};

function getMetadataName(authUser: { email?: string; user_metadata?: Record<string, unknown> }) {
  const name = authUser.user_metadata?.name;
  if (typeof name === 'string' && name.trim().length >= 2) {
    return name.trim();
  }

  return authUser.email?.split('@')[0] ?? 'Warga PantauKota';
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) return null;
  const email = authUser.email.toLowerCase();

  let user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) {
    user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: getMetadataName(authUser),
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  }

  if (!user || !user.isActive) return null;

  return user;
}

export async function getCurrentSession(): Promise<CurrentSession | null> {
  const user = await getCurrentUser();
  return user ? { user } : null;
}

export async function getSupabaseAuthUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
