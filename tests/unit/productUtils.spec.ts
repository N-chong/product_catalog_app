import { describe, expect, test } from 'vitest';
import { getErrorMessage, getStockColor, getStockStatus } from '@/utils/productUtils';

describe('product stock helpers', () => {
  test.each([
    [0, 'Out of Stock', 'danger'],
    [1, 'Low Stock', 'warning'],
    [5, 'Low Stock', 'warning'],
    [6, 'In Stock', 'success'],
    [25, 'In Stock', 'success'],
  ] as const)('quantity %i maps to %s', (quantity, status, color) => {
    expect(getStockStatus(quantity)).toBe(status);
    expect(getStockColor(quantity)).toBe(color);
  });
});

describe('Firebase error messages', () => {
  test('explains a disabled Firestore API', () => {
    const error = Object.assign(
      new Error('Cloud Firestore API firestore.googleapis.com is disabled'),
      { code: 'permission-denied' },
    );
    expect(getErrorMessage(error)).toContain('Cloud Firestore is not enabled');
  });

  test('explains Firestore rules errors', () => {
    const error = Object.assign(new Error('Missing permissions'), { code: 'permission-denied' });
    expect(getErrorMessage(error)).toContain('firestore.rules');
  });

  test('explains Storage rules errors', () => {
    const error = Object.assign(new Error('Unauthorized'), { code: 'storage/unauthorized' });
    expect(getErrorMessage(error)).toContain('storage.rules');
  });
});
