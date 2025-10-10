import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { ProductForm } from '@/components/ProductForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SellerVerificationForm } from '@/components/SellerVerificationForm';
import { UserDebugInfo } from '@/components/UserDebugInfo';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Package, MessageCircle, Shield, CheckCircle, Clock, XCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  seller_id: string;
}

interface VerificationStatus {
  id: string;
  verified: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [savingWhatsApp, setSavingWhatsApp] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [showVerificationForm, setShowVerificationForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchWhatsAppNumber();
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchWhatsAppNumber = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('whatsapp_number')
      .eq('user_id', user.id)
      .single();

    if (!error && data?.whatsapp_number) {
      setWhatsappNumber(data.whatsapp_number);
    }
  };

  const fetchVerificationStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('id, verified, verification_status, created_at')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setVerificationStatus(data);
    } catch (error: any) {
      // Error handled silently
    }
  };

  const getVerificationBadge = () => {
    if (!verificationStatus) {
      return <Badge variant="outline">Not Verified</Badge>;
    }

    switch (verificationStatus.verification_status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const saveWhatsAppNumber = async () => {
    if (!user) return;

    setSavingWhatsApp(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ whatsapp_number: whatsappNumber })
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('WhatsApp number saved!');
    } catch (error: any) {
      toast.error('Failed to save WhatsApp number');
    } finally {
      setSavingWhatsApp(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(products.filter((p) => p.id !== id));
      toast.success('Product deleted');
    } catch (error: any) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
                <p className="text-muted-foreground">
                  Manage your products and track your sales
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Verification Status:</span>
                {getVerificationBadge()}
              </div>
            </div>
          </div>

          {/* Verification Status Alert */}
          {verificationStatus && verificationStatus.verification_status === 'rejected' && (
            <Alert className="mb-6" variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Your verification was rejected. Please review your documents and submit a new verification request.
              </AlertDescription>
            </Alert>
          )}

          {verificationStatus && verificationStatus.verification_status === 'pending' && (
            <Alert className="mb-6">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Your verification is under review. We will notify you once the review is complete.
              </AlertDescription>
            </Alert>
          )}

          {!verificationStatus && (
            <Alert className="mb-6">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Complete your seller verification to build trust with buyers and access all seller features.
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={() => setShowVerificationForm(true)}
                >
                  Verify Now
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp Settings
                  </CardTitle>
                  <CardDescription>
                    Add your WhatsApp number to receive orders
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="+1234567890"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Include country code (e.g., +1 for US)
                    </p>
                  </div>
                  <Button 
                    onClick={saveWhatsAppNumber} 
                    disabled={savingWhatsApp}
                    className="w-full"
                  >
                    {savingWhatsApp ? 'Saving...' : 'Save WhatsApp Number'}
                  </Button>
                </CardContent>
              </Card>
              
              <ProductForm onSuccess={fetchProducts} />
            </div>

            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold mb-4">Your Products</h2>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No products yet</h3>
                  <p className="text-muted-foreground">
                    Add your first product using the form on the left
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      {...product}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verification Form Modal */}
        {showVerificationForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Seller Verification</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVerificationForm(false)}
                  >
                    ×
                  </Button>
                </div>
                <SellerVerificationForm />
              </div>
            </div>
          </div>
        )}
        
        {/* Debug Info - Remove after getting user ID */}
        <UserDebugInfo />
      </div>
      
      <Footer />
    </ProtectedRoute>
  );
};

export default Dashboard;