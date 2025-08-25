import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface AuthSession {
  user: AuthUser;
  access_token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('auth_user');
    const savedSession = localStorage.getItem('auth_session');
    
    if (savedUser && savedSession) {
      const parsedUser = JSON.parse(savedUser);
      const parsedSession = JSON.parse(savedSession);
      
      // Ensure user exists in database
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: parsedUser.id,
          email: parsedUser.email,
          full_name: parsedUser.user_metadata?.full_name || ''
        })
      }).catch(() => {}); // Ignore errors - user might already exist
      
      setUser(parsedUser);
      setSession(parsedSession);
    } else {
      // Create a mock user for migration purposes
      const mockUser: AuthUser = {
        id: 'ebb7ab9c-ffc7-444b-b499-4ca8796b4a27',
        email: 'user@example.com',
        user_metadata: {
          full_name: 'Test User'
        }
      };
      const mockSession: AuthSession = {
        user: mockUser,
        access_token: 'mock_token'
      };
      
      setUser(mockUser);
      setSession(mockSession);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_session', JSON.stringify(mockSession));
    }
    
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    // Simplified for migration - create mock user and ensure it exists in database
    try {
      const newUser: AuthUser = {
        id: crypto.randomUUID(),
        email,
        user_metadata: { full_name: userData?.full_name || '' }
      };
      
      // Create user in database to avoid foreign key constraint violations
      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newUser.id,
            email: newUser.email,
            full_name: newUser.user_metadata?.full_name || ''
          })
        });
      } catch (dbError) {
        console.warn('Failed to create user in database:', dbError);
      }
      
      const newSession: AuthSession = {
        user: newUser,
        access_token: 'mock_token'
      };
      
      setUser(newUser);
      setSession(newSession);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      localStorage.setItem('auth_session', JSON.stringify(newSession));
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    // Simplified for migration - accept any credentials
    try {
      const mockUser: AuthUser = {
        id: 'ebb7ab9c-ffc7-444b-b499-4ca8796b4a27',
        email,
        user_metadata: { full_name: 'Test User' }
      };
      const mockSession: AuthSession = {
        user: mockUser,
        access_token: 'mock_token'
      };
      
      setUser(mockUser);
      setSession(mockSession);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_session', JSON.stringify(mockSession));
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    setSession(null);
    setUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_session');
    return { error: null };
  };

  const resetPassword = async (email: string) => {
    // For now, just return success - implement password reset later
    return { error: null };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};