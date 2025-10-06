-- Add category column to products table
ALTER TABLE public.products 
ADD COLUMN category TEXT DEFAULT 'Other';

-- Add whatsapp_number to profiles table for sellers
ALTER TABLE public.profiles 
ADD COLUMN whatsapp_number TEXT;

-- Create an index on category for better query performance
CREATE INDEX idx_products_category ON public.products(category);