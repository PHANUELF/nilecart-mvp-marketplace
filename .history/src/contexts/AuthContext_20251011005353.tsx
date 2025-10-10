import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  user_id: string;
  role: 'buyer' | 'seller';
  full_name: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const createProfile = async (userId: string, userMetadata: any) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          role: userMetadata?.role || 'buyer',
          full_name: userMetadata?.full_name || 'User'
        })
        .select()
        .single();
      
      if (error) {
        return null;
      }
      
      return profileData;
    } catch (error) {
      return null;
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          return null; // Will be handled by the calling function
        }
        
        return null;
      }
      
      return profileData;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setLoading(false);
          // Fetch profile in background without blocking
          fetchProfile(session.user.id).then(async (profileData) => {
            if (!profileData) {
              // If no profile found, create one using user metadata
              const newProfile = await createProfile(session.user.id, session.user.user_metadata);
              setProfile(newProfile);
            } else {
              setProfile(profileData);
            }
          });
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(async (profileData) => {
          if (!profileData) {
            // If no profile found, create one using user metadata
            const newProfile = await createProfile(session.user.id, session.user.user_metadata);
            setProfile(newProfile);
          } else {
            setProfile(profileData);
          }
        });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
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