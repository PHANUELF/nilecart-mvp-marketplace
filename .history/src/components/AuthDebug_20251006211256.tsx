import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const AuthDebug = () => {
  const { user, profile, loading } = useAuth();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Auth Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2 text-xs">
        <div>
          <strong>Environment:</strong> {import.meta.env.MODE}
        </div>
        
        <div>
          <strong>Supabase URL:</strong> 
          <div className="text-xs text-muted-foreground break-all">
            {supabaseUrl ? '✅ Set' : '❌ Missing'}
          </div>
        </div>
        
        <div>
          <strong>Supabase Key:</strong> 
          <div className="text-xs text-muted-foreground">
            {supabaseKey ? '✅ Set' : '❌ Missing'}
          </div>
        </div>
        
        <div>
          <strong>Loading:</strong> {loading ? '⏳ Yes' : '✅ No'}
        </div>
        
        <div>
          <strong>User:</strong> {user ? '✅ Logged in' : '❌ Not logged in'}
        </div>
        
        {user && (
          <div>
            <strong>Email:</strong> {user.email}
          </div>
        )}
        
        <div>
          <strong>Profile:</strong> {profile ? '✅ Loaded' : '❌ Not loaded'}
        </div>
        
        {profile && (
          <div>
            <strong>Role:</strong> <Badge variant="outline">{profile.role}</Badge>
          </div>
        )}

        {!supabaseUrl || !supabaseKey ? (
          <Alert variant="destructive">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              Environment variables missing! Check Vercel settings.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <CheckCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              Environment variables configured correctly.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
