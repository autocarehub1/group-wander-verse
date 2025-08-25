// Travel app authentication client - replaces Supabase
import type { User } from "@shared/schema";

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

class AuthClient {
  private currentUser: AuthUser | null = null;
  private session: AuthSession | null = null;
  private authStateCallbacks: Array<(event: string, session: AuthSession | null) => void> = [];

  constructor() {
    // Check for existing session in localStorage
    const savedSession = localStorage.getItem('auth_session');
    if (savedSession) {
      try {
        this.session = JSON.parse(savedSession);
        this.currentUser = this.session?.user || null;
      } catch (error) {
        localStorage.removeItem('auth_session');
      }
    }
  }

  private notifyAuthStateChange(event: string, session: AuthSession | null) {
    this.authStateCallbacks.forEach(callback => {
      try {
        callback(event, session);
      } catch (error) {
        console.error('Auth state callback error:', error);
      }
    });
  }

  async signUp({ email, password, options }: { 
    email: string; 
    password: string; 
    options?: { data?: { full_name?: string } } 
  }) {
    try {
      // Create user via our API
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          full_name: options?.data?.full_name || email.split('@')[0],
          // In a real app, password would be hashed server-side
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      const user = await response.json();
      
      // Create session
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.full_name,
          avatar_url: user.avatar_url,
        }
      };

      this.session = {
        user: authUser,
        access_token: `auth_token_${user.id}`, // Simple token for demo
      };

      this.currentUser = authUser;
      localStorage.setItem('auth_session', JSON.stringify(this.session));
      
      // Notify auth state change
      this.notifyAuthStateChange('SIGNED_UP', this.session);

      return { data: { user: authUser, session: this.session }, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    try {
      // In a real app, this would validate credentials
      const response = await fetch(`/api/users/email/${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const user = await response.json();
      
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.full_name,
          avatar_url: user.avatar_url,
        }
      };

      this.session = {
        user: authUser,
        access_token: `auth_token_${user.id}`,
      };

      this.currentUser = authUser;
      localStorage.setItem('auth_session', JSON.stringify(this.session));
      
      // Notify auth state change
      this.notifyAuthStateChange('SIGNED_IN', this.session);

      return { data: { user: authUser, session: this.session }, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  async signOut() {
    this.currentUser = null;
    this.session = null;
    localStorage.removeItem('auth_session');
    
    // Notify auth state change
    this.notifyAuthStateChange('SIGNED_OUT', null);
    
    return { error: null };
  }

  async getUser() {
    return { 
      data: { user: this.currentUser }, 
      error: this.currentUser ? null : { message: 'No user logged in' } 
    };
  }

  async getSession() {
    return { 
      data: { session: this.session }, 
      error: this.session ? null : { message: 'No session found' } 
    };
  }

  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void) {
    // Store the callback
    this.authStateCallbacks.push(callback);
    
    // Immediately call with current state
    callback(this.session ? 'SIGNED_IN' : 'SIGNED_OUT', this.session);
    
    // Return unsubscribe function
    return {
      data: { 
        subscription: { 
          unsubscribe: () => {
            const index = this.authStateCallbacks.indexOf(callback);
            if (index > -1) {
              this.authStateCallbacks.splice(index, 1);
            }
          } 
        } 
      }
    };
  }
}

// Export the auth client
export const supabase = {
  auth: new AuthClient(),
  
  // Mock storage methods that might be used
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        // For demo purposes, return a mock URL
        const mockUrl = URL.createObjectURL(file);
        return { 
          data: { path, fullPath: `${bucket}/${path}` }, 
          error: null 
        };
      },
      getPublicUrl: (path: string) => {
        return { 
          data: { publicUrl: `/storage/${path}` } 
        };
      }
    })
  }
};