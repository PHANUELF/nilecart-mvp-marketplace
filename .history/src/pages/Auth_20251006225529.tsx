import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { AuthDebug } from '@/components/AuthDebug';
import { SupabaseTest } from '@/components/SupabaseTest';
import { ShoppingBag, AlertCircle } from 'lucide-react';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'buyer' as 'buyer' | 'seller',
  });

  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      // If we have a profile, redirect based on role
      if (profile) {
        if (profile.role === 'seller') {
          navigate('/dashboard');
        } else {
          navigate('/home');
        }
      } else {
        // If no profile yet, redirect to home as default
        // Profile will load in background and redirect if needed
        navigate('/home');
      }
    }
  }, [user, profile, authLoading, navigate]);

  // Separate effect to handle profile-based redirect after initial redirect
  useEffect(() => {
    if (user && profile && profile.role === 'seller') {
      // If user is on home page but should be on dashboard, redirect
      if (window.location.pathname === '/home') {
        navigate('/dashboard');
      }
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        console.log('🚀 Attempting signup with:', {
          email: formData.email,
          role: formData.role,
          full_name: formData.full_name
        });

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: formData.full_name,
              role: formData.role,
            },
          },
        });

        console.log('📧 Signup response:', { data, error });

        if (error) {
          console.error('❌ Signup error:', error);
          if (error.message.includes('already registered')) {
            setError('An account with this email already exists. Please sign in instead.');
          } else if (error.message.includes('password')) {
            setError('Password must be at least 6 characters long.');
          } else {
            setError(error.message);
          }
          throw error;
        }

        // Check if user needs email confirmation
        if (data.user && !data.session) {
          console.log('📧 User created but needs email confirmation');
          toast.success('Account created! Please check your email to verify your account before signing in.');
          setMode('signin');
        } else if (data.user && data.session) {
          console.log('✅ User created and signed in immediately');
          toast.success('Account created successfully!');
        } else {
          console.log('⚠️ Unexpected signup response:', data);
          toast.success('Account created! Please try signing in.');
          setMode('signin');
        }
        // The redirect will happen automatically via the auth state change
      } else if (mode === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/auth?mode=signin`,
        });

        if (error) {
          setError(error.message);
          throw error;
        }

        toast.success('Password reset email sent! Check your inbox.');
        setMode('signin');
      } else {
        console.log('🔑 Attempting login with:', {
          email: formData.email,
          password: '***' // Don't log the actual password
        });

        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        console.log('🔐 Login response:', { data, error });

        if (error) {
          console.error('❌ Login error:', error);
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message.includes('Email not confirmed')) {
            setError('Please check your email and click the confirmation link before signing in.');
          } else {
            setError(error.message);
          }
          throw error;
        }

        console.log('✅ Login successful!');
        toast.success('Welcome back!');
        // Navigation will happen automatically via useEffect
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      if (!error.message) {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShoppingBag className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </CardTitle>
          <CardDescription>
            {mode === 'signin'
              ? 'Sign in to your NileCart account'
              : mode === 'signup'
              ? 'Join NileCart as a buyer or seller'
              : 'Enter your email to reset your password'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>I want to</Label>
                  <RadioGroup
                    value={formData.role}
                    onValueChange={(value: 'buyer' | 'seller') =>
                      setFormData({ ...formData, role: value })
                    }
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="buyer" id="buyer" />
                      <Label htmlFor="buyer" className="font-normal cursor-pointer">
                        Buy products
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="seller" id="seller" />
                      <Label htmlFor="seller" className="font-normal cursor-pointer">
                        Sell products
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {mode !== 'forgot-password' && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading 
                ? 'Please wait...' 
                : mode === 'signin' 
                ? 'Sign In' 
                : mode === 'signup' 
                ? 'Create Account' 
                : 'Send Reset Email'
              }
            </Button>

            <div className="text-center text-sm space-y-2">
              {mode === 'signin' ? (
                <>
                  <div>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-primary hover:underline"
                    >
                      Sign up
                    </button>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setMode('forgot-password')}
                      className="text-primary hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </>
              ) : mode === 'signup' ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </span>
              ) : (
                <span>
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Debug components - Remove in production */}
      <SupabaseTest />
      <AuthDebug />
    </div>
  );
};

export default Auth;