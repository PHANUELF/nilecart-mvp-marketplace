import { Button } from '@/components/ui/button';
import { ShoppingBag, TrendingUp, Zap } from 'lucide-react';

export const ShoppingBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-accent p-8 md:p-12 mb-8">
      <div className="relative z-10 max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-6 w-6 text-primary-foreground" />
          <span className="text-sm font-semibold text-primary-foreground uppercase tracking-wider">
            Featured Collection
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
          Discover Amazing Products
        </h1>
        <p className="text-lg text-primary-foreground/90 mb-6">
          Browse through our curated collection of quality products from trusted sellers
        </p>
        <div className="flex gap-4">
          <Button size="lg" variant="secondary" className="gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shop Now
          </Button>
          <Button size="lg" variant="outline" className="gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20">
            <TrendingUp className="h-5 w-5" />
            Trending
          </Button>
        </div>
      </div>
      <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
        <ShoppingBag className="h-full w-full" />
      </div>
    </div>
  );
};
