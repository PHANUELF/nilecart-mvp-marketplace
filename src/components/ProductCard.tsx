import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProductCardProps {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  seller_id: string;
  onDelete?: (id: string) => void;
  onAddToCart?: () => void;
}

export const ProductCard = ({
  id,
  name,
  description,
  price,
  image_url,
  seller_id,
  onDelete,
  onAddToCart,
}: ProductCardProps) => {
  const { user } = useAuth();
  const isOwner = user?.id === seller_id;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-square overflow-hidden bg-muted">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{name}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {description}
          </p>
        )}
        <p className="text-xl font-bold text-primary">${price.toFixed(2)}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {isOwner && onDelete ? (
          <Button
            variant="destructive"
            size="sm"
            className="w-full gap-2"
            onClick={() => onDelete(id)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        ) : onAddToCart ? (
          <Button
            size="sm"
            className="w-full gap-2"
            onClick={onAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
};