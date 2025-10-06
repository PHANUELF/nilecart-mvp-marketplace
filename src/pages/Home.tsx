import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { ShoppingBanner } from '@/components/ShoppingBanner';
import { CategoryFilter } from '@/components/CategoryFilter';
import { CheckoutDialog } from '@/components/CheckoutDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  seller_id: string;
}

interface Profile {
  whatsapp_number: string | null;
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [sellerWhatsApp, setSellerWhatsApp] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (productId: string) => {
    const newCart = [...cart, productId];
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    toast.success('Added to cart!');
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Get cart products and seller info
    const cartProducts = products.filter(p => cart.includes(p.id));
    
    if (cartProducts.length === 0) {
      toast.error('No products in cart');
      return;
    }

    // Get seller's WhatsApp number (assuming all products from same seller for now)
    const sellerId = cartProducts[0].seller_id;
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('whatsapp_number')
      .eq('user_id', sellerId)
      .single();

    if (error || !profileData?.whatsapp_number) {
      toast.error('Seller WhatsApp not available. Please contact support.');
      return;
    }

    setSellerWhatsApp(profileData.whatsapp_number);
    setCheckoutOpen(true);
  };

  const handleCheckoutComplete = () => {
    // Clear cart after successful order
    setCart([]);
    localStorage.removeItem('cart');
    setCheckoutOpen(false);
  };

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <ShoppingBanner />
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Browse Products</h1>
            <p className="text-muted-foreground">
              Discover amazing products from our sellers
            </p>
          </div>
          
          {cart.length > 0 && (
            <Button onClick={handleCheckout} className="gap-2">
              <ShoppingCart className="h-5 w-5" />
              Checkout ({cart.length})
            </Button>
          )}
        </div>

        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No products yet</h2>
            <p className="text-muted-foreground">
              Check back soon for amazing products!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={() => addToCart(product.id)}
              />
            ))}
          </div>
        )}
      </div>

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={(open) => {
          if (!open) handleCheckoutComplete();
        }}
        products={products.filter(p => cart.includes(p.id))}
        sellerWhatsApp={sellerWhatsApp}
      />
    </div>
  );
};

export default Home;