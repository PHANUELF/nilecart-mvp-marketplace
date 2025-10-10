import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, X, MessageCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { CartItem } from './CartItem';
import { CheckoutDialog } from './CheckoutDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { formatCurrency } from '@/lib/currency';

export const CartSidebar = () => {
  const { items, getTotalPrice, getTotalItems, clearCart, getCartBySeller } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [sellerWhatsApp, setSellerWhatsApp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [whatsappLoading, setWhatsappLoading] = useState(false);

  const cartBySeller = getCartBySeller();
  const sellerIds = Object.keys(cartBySeller);

  // Get WhatsApp number for the first seller (assuming single seller checkout for now)
  useEffect(() => {
    if (items.length > 0 && !sellerWhatsApp) {
      // Try to get seller ID from cart items if sellerIds is empty
      const sellerId = sellerIds.length > 0 ? sellerIds[0] : items[0]?.seller_id;
      
      if (sellerId) {
        fetchSellerWhatsApp(sellerId);
      }
    }
  }, [items.length, sellerIds.length, sellerWhatsApp]);

  const fetchSellerWhatsApp = async (sellerId: string) => {
    if (whatsappLoading) return; // Prevent multiple simultaneous requests
    
    setWhatsappLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('whatsapp_number, full_name, role')
        .eq('user_id', sellerId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('Seller profile not found. Please contact support.');
        } else {
          toast.error('Failed to load seller information. Please try again.');
        }
        setSellerWhatsApp(null);
        return;
      }

      if (data?.whatsapp_number) {
        setSellerWhatsApp(data.whatsapp_number);
        toast.success('Seller contact information loaded');
      } else {
        setSellerWhatsApp(null);
        toast.warning('Seller has not provided WhatsApp number. You can still proceed with checkout.');
      }
    } catch (error) {
      toast.error('Failed to load seller information. Please try again.');
      setSellerWhatsApp(null);
    } finally {
      setWhatsappLoading(false);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setCheckoutOpen(true);
  };

  const handleCheckoutComplete = () => {
    clearCart();
    setCheckoutOpen(false);
    toast.success('Order sent successfully!');
  };

  if (items.length === 0) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Cart
            <Badge variant="secondary" className="ml-1">
              {getTotalItems()}
            </Badge>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground">
              Add some products to get started!
            </p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Cart
            <Badge variant="secondary" className="ml-1">
              {getTotalItems()}
            </Badge>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart ({getTotalItems()})
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-full">
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <Separator />

            {/* Cart Summary */}
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Items ({getTotalItems()}):</span>
                  <span>{formatCurrency(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">
                    {formatCurrency(getTotalPrice())}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleCheckout} 
                  className="w-full gap-2"
                  disabled={loading || whatsappLoading}
                >
                  <MessageCircle className="h-4 w-4" />
                  {loading ? 'Processing...' : whatsappLoading ? 'Loading seller info...' : 'Proceed to Checkout'}
                </Button>
                
                {!sellerWhatsApp && !whatsappLoading && items.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const sellerId = sellerIds.length > 0 ? sellerIds[0] : items[0]?.seller_id;
                      if (sellerId) fetchSellerWhatsApp(sellerId);
                    }}
                    className="w-full gap-2"
                    disabled={loading}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Retry Loading Seller Info
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={clearCart}
                  className="w-full gap-2"
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                  Clear Cart
                </Button>
              </div>

            </div>
          </div>
        </SheetContent>
      </Sheet>

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        products={items}
        sellerWhatsApp={sellerWhatsApp}
        onComplete={handleCheckoutComplete}
      />
    </>
  );
};
