import type { Timestamp } from 'firebase/firestore';

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Food',
  'Accessories',
  'Home',
  'Others',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface Product {
  id?: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  quantity: number;
  imageUrl?: string;
  imagePath?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export type ProductFormData = Pick<
  Product,
  'name' | 'category' | 'price' | 'description' | 'quantity'
>;
