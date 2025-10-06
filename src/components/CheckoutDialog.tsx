import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MessageCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  seller_id: string;
}

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  sellerWhatsApp: string | null;
}

export const CheckoutDialog = ({ open, onOpenChange, products, sellerWhatsApp }: CheckoutDialogProps) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const handleCheckout = () => {
    if (!customerName || !customerPhone || !customerAddress) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!sellerWhatsApp) {
      toast.error('Seller WhatsApp number not available');
      return;
    }

    // Format order details
    const orderDetails = products.map((p, i) => 
      `${i + 1}. ${p.name} - $${p.price.toFixed(2)}`
    ).join('\n');
    
    const total = products.reduce((sum, p) => sum + p.price, 0);
    
    const message = `*New Order from NileCart*\n\n` +
      `*Customer Details:*\n` +
      `Name: ${customerName}\n` +
      `Phone: ${customerPhone}\n` +
      `Address: ${customerAddress}\n\n` +
      `*Order Items:*\n${orderDetails}\n\n` +
      `*Total: $${total.toFixed(2)}*`;

    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/${sellerWhatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success('Opening WhatsApp...');
    onOpenChange(false);
    
    // Clear form
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
  };

  const total = products.reduce((sum, p) => sum + p.price, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Your Order</DialogTitle>
          <DialogDescription>
            Enter your details to send order to seller via WhatsApp
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
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
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address *</Label>
            <Textarea
              id="address"
              placeholder="Enter your full delivery address"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              rows={3}
            />
          </div>

          <div className="border-t pt-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold">Order Summary:</p>
              {products.map((product, i) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span>{i + 1}. {product.name}</span>
                  <span>${product.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCheckout} className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Send to WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
