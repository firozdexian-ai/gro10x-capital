// Currency Rates relative to BDT (Base = 1 BDT)
export const CURRENCY_RATES = {
  BDT: { symbol: '৳', rate: 1, label: 'BDT (৳)', code: 'BDT' },
  USD: { symbol: '$', rate: 1 / 117, label: 'USD ($)', code: 'USD' },
  GBP: { symbol: '£', rate: 1 / 148, label: 'GBP (£)', code: 'GBP' },
  AED: { symbol: 'AED ', rate: 1 / 31.8, label: 'AED (🇦🇪)', code: 'AED' },
};

export function formatCurrency(amountInBdt, currencyCode = 'BDT') {
  const curr = CURRENCY_RATES[currencyCode] || CURRENCY_RATES.BDT;
  const converted = amountInBdt * curr.rate;

  if (currencyCode === 'BDT') {
    if (amountInBdt >= 10000000) {
      return `৳${(amountInBdt / 10000000).toFixed(2)} Crore`;
    } else if (amountInBdt >= 100000) {
      return `৳${(amountInBdt / 100000).toFixed(1)} Lakhs`;
    }
    return `৳${Math.round(amountInBdt).toLocaleString()}`;
  }

  // International formatting (USD, GBP, AED)
  return `${curr.symbol}${Math.round(converted).toLocaleString()}`;
}
