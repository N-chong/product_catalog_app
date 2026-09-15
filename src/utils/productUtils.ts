import type { Product } from '@/interfaces/Product';

export type StockStatus = 'Out of Stock' | 'Low Stock' | 'In Stock';

export function getStockStatus(quantity: number): StockStatus {
  if (quantity === 0) return 'Out of Stock';
  if (quantity <= 5) return 'Low Stock';
  return 'In Stock';
}

export function getStockColor(quantity: number): 'danger' | 'warning' | 'success' {
  if (quantity === 0) return 'danger';
  if (quantity <= 5) return 'warning';
  return 'success';
}

export function formatCurrency(price: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(price);
}

export function formatProductDate(value: Product['createdAt']): string {
  if (!value) return 'Not available';

  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value.toDate());
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
