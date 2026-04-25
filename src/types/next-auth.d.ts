import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: { id: string; role: 'WARGA' | 'ADMIN' } & DefaultSession['user'];
  }
  interface User extends DefaultUser {
    role: 'WARGA' | 'ADMIN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: 'WARGA' | 'ADMIN';
  }
}
