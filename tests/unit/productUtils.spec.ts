import { describe, expect, test } from 'vitest';
import { getStockColor, getStockStatus } from '@/utils/productUtils';

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
