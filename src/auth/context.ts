import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';

export type AuthState = {
  user: User | null;
  loading: boolean;
  available: boolean;
  recovery: boolean;
  notice: string;
  providers: { google: boolean; facebook: boolean };
  signOut: () => Promise<void>;
};
export const AuthContext = createContext<AuthState>({
  user: null, loading: true, available: false, recovery: false, notice: '',
  providers: { google: false, facebook: false }, signOut: async () => {},
});
export const useAuth = () => useContext(AuthContext);
