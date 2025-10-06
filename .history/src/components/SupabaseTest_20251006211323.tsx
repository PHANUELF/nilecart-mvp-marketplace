import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic connection
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        
        if (error) {
          throw error;
        }
        
        setConnectionStatus('success');
      } catch (err: any) {
        setConnectionStatus('error');
        setError(err.message);
      }
    };

    testConnection();
  }, []);

  return (
    <Card className="fixed top-4 right-4 z-50 max-w-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <strong>Status:</strong>
          {connectionStatus === 'testing' && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Testing...</span>
            </>
          )}
          {connectionStatus === 'success' && (
            <>
              <CheckCircle className="h-3 w-3 text-green-500" />
              <Badge variant="outline" className="text-green-600">Connected</Badge>
            </>
          )}
          {connectionStatus === 'error' && (
            <>
              <XCircle className="h-3 w-3 text-red-500" />
              <Badge variant="destructive">Error</Badge>
            </>
          )}
        </div>
        
        <div>
          <strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
        </div>
        
        <div>
          <strong>Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
        </div>
        
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
