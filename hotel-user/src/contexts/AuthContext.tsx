import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Types for database authentication
export type UserRole = 'admin' | 'front_desk' | 'guest';

export interface GuestUser {
  guest_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  contact_number: string | null;
  street: string | null;
  city: string | null;
  state_province: string | null;
  zip_code: string | null;
  country: string | null;
  created_at: string;
}

interface AuthContextType {
  user: GuestUser | null;
  role: UserRole;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (username: string, password: string, email: string, firstName: string, lastName: string) => Promise<{ error: Error | null }>;
  signOut: () => void;
  isGuest: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage key for session persistence
const STORAGE_KEY = 'hotel_guest_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GuestUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedSession = localStorage.getItem(STORAGE_KEY);
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string): Promise<{ error: Error | null }> => {
    try {
      // Query the guests table directly
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error || !data) {
        return { error: new Error('Invalid username or password') };
      }

      // Store user in state and localStorage
      setUser(data as GuestUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (
    username: string, 
    password: string, 
    email: string, 
    firstName: string, 
    lastName: string
  ): Promise<{ error: Error | null }> => {
    try {
      // Insert new guest into the database
      const { data, error } = await supabase
        .from('guests')
        .insert({
          username,
          password,
          email,
          first_name: firstName,
          last_name: lastName,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return { error: new Error('Username or email already exists') };
        }
        return { error: new Error(error.message) };
      }

      // Auto-login after signup
      setUser(data as GuestUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value: AuthContextType = {
    user,
    role: 'guest',
    loading,
    signIn,
    signUp,
    signOut,
    isGuest: !!user,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
