import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, CheckCircle, XCircle, Clock, User, Building, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SellerVerification {
  id: string;
  user_id: string;
  business_name: string | null;
  passport_number: string;
  passport_image_url: string;
  verified: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
    role: string;
  };
}

export const AdminVerificationDashboard = () => {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<SellerVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<SellerVerification | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchVerifications();
    }
  }, [user]);

  const fetchVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Now get the profile data for each seller
      const verificationsWithProfiles = await Promise.all(
        (data || []).map(async (seller) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('user_id', seller.user_id)
            .single();

          if (profileError) {
            // Profile not found - use default values
          }

          return {
            ...seller,
            profiles: profileData || { full_name: 'Unknown', role: 'unknown' }
          };
        })
      );

      setVerifications(verificationsWithProfiles);
    } catch (error: any) {
      toast.error('Failed to load verification data');
    } finally {
      setLoading(false);
    }
  };

  const getDocumentUrl = async (imageUrl: string) => {
    try {
      // Extract the file path from the URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex(part => part === 'seller-ids');
      if (bucketIndex === -1) throw new Error('Invalid document URL');
      
      const filePath = pathParts.slice(bucketIndex + 1).join('/');
      
      // Get signed URL
      const { data, error } = await supabase.storage
        .from('seller-ids')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error: any) {
      toast.error('Failed to load document');
      return null;
    }
  };

  const handleViewDocument = async (verification: SellerVerification) => {
    setSelectedVerification(verification);
    const url = await getDocumentUrl(verification.passport_image_url);
    setDocumentUrl(url);
  };

  const updateVerificationStatus = async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(id);
    
    try {
      const { error } = await supabase
        .from('sellers')
        .update({
          verification_status: status,
          verified: status === 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setVerifications(prev => 
        prev.map(v => 
          v.id === id 
            ? { ...v, verification_status: status, verified: status === 'approved' }
            : v
        )
      );

      toast.success(`Verification ${status} successfully`);
    } catch (error: any) {
      toast.error(`Failed to ${status} verification`);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string, verified: boolean) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const pendingVerifications = verifications.filter(v => v.verification_status === 'pending');
  const approvedVerifications = verifications.filter(v => v.verification_status === 'approved');
  const rejectedVerifications = verifications.filter(v => v.verification_status === 'rejected');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Seller Verification Dashboard</h1>
          <p className="text-muted-foreground">Review and manage seller verification requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{pendingVerifications.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedVerifications.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedVerifications.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Verifications */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
          <CardDescription>
            Review these verification requests to approve or reject sellers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingVerifications.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">No pending verifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingVerifications.map((verification) => (
                <div key={verification.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{verification.profiles.full_name}</span>
                        {verification.business_name && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <Building className="h-4 w-4" />
                            <span className="text-sm text-muted-foreground">{verification.business_name}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span>Passport: {verification.passport_number}</span>
                        <span>•</span>
                        <span>Submitted: {new Date(verification.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(verification.verification_status, verification.verified)}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDocument(verification)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Document
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Verification Document</DialogTitle>
                            <DialogDescription>
                              Review the passport document for {verification.profiles.full_name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {documentUrl && (
                              <div className="border rounded-lg p-4">
                                <img
                                  src={documentUrl}
                                  alt="Passport document"
                                  className="max-w-full h-auto rounded"
                                />
                              </div>
                            )}
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                onClick={() => updateVerificationStatus(verification.id, 'rejected')}
                                disabled={processing === verification.id}
                              >
                                {processing === verification.id ? 'Processing...' : 'Reject'}
                              </Button>
                              <Button
                                onClick={() => updateVerificationStatus(verification.id, 'approved')}
                                disabled={processing === verification.id}
                              >
                                {processing === verification.id ? 'Processing...' : 'Approve'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Verifications */}
      <Card>
        <CardHeader>
          <CardTitle>All Verifications</CardTitle>
          <CardDescription>
            Complete history of all verification requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verifications.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No verification requests found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {verifications.map((verification) => (
                <div key={verification.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{verification.profiles.full_name}</span>
                      {verification.business_name && (
                        <span className="text-sm text-muted-foreground">({verification.business_name})</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Submitted: {new Date(verification.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(verification.verification_status, verification.verified)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDocument(verification)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
