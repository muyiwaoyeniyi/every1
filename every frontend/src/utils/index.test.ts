import { fmtMoney } from './index';

describe('Utility Functions', () => {
  describe('fmtMoney', () => {
    it('formats USD currency correctly', () => {
      expect(fmtMoney(1000, 'USD')).toBe('$1,000.00');
      expect(fmtMoney(5000.50, 'USD')).toBe('$5,000.50');
    });

    it('formats EUR currency correctly', () => {
      expect(fmtMoney(1000, 'EUR')).toBe('€1,000.00');
    });

    it('defaults to USD when no currency provided', () => {
      expect(fmtMoney(1000)).toBe('$1,000.00');
    });

    it('handles zero amount', () => {
      expect(fmtMoney(0, 'USD')).toBe('$0.00');
    });

    it('handles negative amounts', () => {
      expect(fmtMoney(-1000, 'USD')).toBe('-$1,000.00');
    });

    it('handles large amounts', () => {
      expect(fmtMoney(1000000, 'USD')).toBe('$1,000,000.00');
    });

    it('handles decimal amounts', () => {
      expect(fmtMoney(123.45, 'USD')).toBe('$123.45');
    });
  });
});
