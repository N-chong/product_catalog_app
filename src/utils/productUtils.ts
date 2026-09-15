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
  const firebaseError = error as { code?: string; message?: string };
  const code = firebaseError?.code ?? '';
  const message = firebaseError?.message ?? '';

  if (message.includes('firestore.googleapis.com') && message.includes('disabled')) {
    return 'Cloud Firestore is not enabled. In Firebase Console, open Firestore and create the default database.';
  }

  if (code === 'permission-denied' || code === 'firestore/permission-denied') {
    return 'Firebase denied this request. Publish the included firestore.rules in Firebase Console.';
  }

  if (code === 'unavailable' || code === 'firestore/unavailable') {
    return 'Firebase is temporarily unavailable. Check your internet connection and try again.';
  }

  if (code === 'storage/unauthorized') {
    return 'Firebase Storage denied the image upload. Publish the included storage.rules.';
  }

  if (code === 'storage/bucket-not-found' || code === 'storage/project-not-found') {
    return 'Firebase Storage is not enabled for this project. Open Storage in Firebase Console and create its bucket.';
  }

  if (code === 'storage/retry-limit-exceeded') {
    return 'The image upload timed out. Check your internet connection and try again.';
  }

  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
