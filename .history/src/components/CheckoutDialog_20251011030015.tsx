import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MessageCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface CartItem {
  id: string;
  name: string;
  price: number;
  seller_id: string;
  quantity: number;
  image_url: string | null;
}

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: CartItem[];
  sellerWhatsApp: string | null;
  onComplete?: () => void;
}

export const CheckoutDialog = ({ open, onOpenChange, products, sellerWhatsApp, onComplete }: CheckoutDialogProps) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!sellerWhatsApp) {
      toast.error('Seller WhatsApp number not available. Please contact the seller directly.');
      return;
    }

    setLoading(true);

    try {
      // Format order details with quantities
      const orderDetails = products.map((p, i) => 
        `${i + 1}. ${p.name} (Qty: ${p.quantity}) - ${formatCurrency(p.price * p.quantity)}`
      ).join('\n');
      
      const total = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      
      const message = `🛒 *NEW ORDER - NileCart Marketplace*\n\n` +
        `👤 *Customer Information:*\n` +
        `Name: ${customerName.trim()}\n` +
        `Phone: ${customerPhone.trim()}\n` +
        `Email: ${customerEmail.trim() || 'Not provided'}\n` +
        `Address: ${customerAddress.trim()}\n` +
        `${deliveryInstructions.trim() ? `Delivery Notes: ${deliveryInstructions.trim()}\n` : ''}\n` +
        `📦 *Order Items:*\n${orderDetails}\n\n` +
        `💰 *Order Summary:*\n` +
        `Subtotal: ${formatCurrency(total)}\n` +
        `Total Items: ${products.reduce((sum, p) => sum + p.quantity, 0)}\n` +
        `*TOTAL: ${formatCurrency(total)}*\n\n` +
        `📅 Order Date: ${new Date().toLocaleDateString()}\n` +
        `⏰ Order Time: ${new Date().toLocaleTimeString()}\n\n` +
        `Please confirm this order and provide delivery details. Thank you! 🙏`;

      // Open WhatsApp with pre-filled message
      const whatsappUrl = `https://wa.me/${sellerWhatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      toast.success('Opening WhatsApp to complete your order...');
      onOpenChange(false);
      
      // Clear form
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerAddress('');
      setDeliveryInstructions('');
      
      // Call completion callback
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      toast.error('Failed to process checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const total = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Your Order</DialogTitle>
          <DialogDescription>
            Enter your details to send order to seller via WhatsApp
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address *</Label>
            <Textarea
              id="address"
              placeholder="Enter your full delivery address including street, city, state, and postal code"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              placeholder="Any special delivery instructions, building access codes, preferred delivery times, etc."
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              rows={2}
            />
          </div>

          <div className="border-t pt-4">
            <div className="space-y-3">
              <p className="text-sm font-semibold">Order Summary:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {products.map((product, i) => (
                  <div key={product.id} className="flex justify-between items-center text-sm bg-muted/50 p-2 rounded">
                    <div className="flex-1">
                      <span className="font-medium">{i + 1}. {product.name}</span>
                      <span className="text-muted-foreground ml-2">(Qty: {product.quantity})</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">{formatCurrency(product.price)} each</div>
                      <div className="font-semibold">{formatCurrency(product.price * product.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-1 pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span>Total Items:</span>
                  <span>{products.reduce((sum, p) => sum + p.quantity, 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount:</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCheckout} className="gap-2" disabled={loading}>
            <MessageCircle className="h-4 w-4" />
            {loading ? 'Processing...' : 'Send to WhatsApp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
