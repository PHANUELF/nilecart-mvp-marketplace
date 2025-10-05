import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Store, Shield, Zap } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && profile) {
      // Redirect authenticated users to their appropriate page
      navigate(profile.role === 'seller' ? '/dashboard' : '/home');
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Your Marketplace, Simplified
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Buy amazing products or start selling your own. NileCart makes online commerce easy for everyone.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/auth?mode=signup')}
              className="gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/home')}
            >
              Browse Products
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Store className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Selling</h3>
            <p className="text-muted-foreground">
              Set up your seller account and start listing products in minutes.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
              <ShoppingBag className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Shopping</h3>
            <p className="text-muted-foreground">
              Browse quality products from trusted sellers in one place.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure & Fast</h3>
            <p className="text-muted-foreground">
              Built with modern security and optimized for speed.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;