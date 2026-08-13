// Currency Rates relative to BDT (Base = 1 BDT)
export const CURRENCY_RATES = {
  BDT: { symbol: '৳', rate: 1, label: 'BDT (৳)', code: 'BDT' },
  USD: { symbol: '$', rate: 1 / 117, label: 'USD ($)', code: 'USD' },
  GBP: { symbol: '£', rate: 1 / 148, label: 'GBP (£)', code: 'GBP' },
  AED: { symbol: 'AED ', rate: 1 / 31.8, label: 'AED (🇦🇪)', code: 'AED' },
};

/**
 * Safely parse any input value to a number.
 * Returns 0 if invalid or unparseable.
 */
export function parseAmount(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Get currency symbol for a given currency code.
 */
export function getCurrencySymbol(currencyCode = 'BDT') {
  const curr = CURRENCY_RATES[currencyCode] || CURRENCY_RATES.BDT;
  return curr.symbol;
}

/**
 * Convert an amount from BDT to target currency.
 */
export function convertFromBDT(amountInBdt, targetCurrency = 'BDT') {
  const num = parseAmount(amountInBdt);
  const curr = CURRENCY_RATES[targetCurrency] || CURRENCY_RATES.BDT;
  return num * curr.rate;
}

/**
 * Convert an amount from source currency back to BDT.
 */
export function convertToBDT(amountInSource, sourceCurrency = 'BDT') {
  const num = parseAmount(amountInSource);
  const curr = CURRENCY_RATES[sourceCurrency] || CURRENCY_RATES.BDT;
  if (curr.rate === 0) return 0;
  return num / curr.rate;
}

/**
 * Formats monetary amounts safely with support for Bangladeshi Lakh/Crore notation
 * and international currency conversions.
 *
 * @param {number|string} amountInBdt - Amount in BDT
 * @param {string} currencyCode - Target currency code ('BDT', 'USD', 'GBP', 'AED')
 * @param {boolean} [compact=true] - Whether to use compact notation (Lakhs/Crore for BDT, k/M for others)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amountInBdt, currencyCode = 'BDT', compact = true) {
  const num = parseAmount(amountInBdt);
  const curr = CURRENCY_RATES[currencyCode] || CURRENCY_RATES.BDT;
  const isNegative = num < 0;
  const absAmount = Math.abs(num);

  const prefix = isNegative ? '-' : '';

  if (currencyCode === 'BDT') {
    if (compact) {
      if (absAmount >= 10000000) {
        return `${prefix}৳${(absAmount / 10000000).toFixed(2)} Crore`;
      } else if (absAmount >= 100000) {
        return `${prefix}৳${(absAmount / 100000).toFixed(1)} Lakhs`;
      }
    }
    return `${prefix}৳${Math.round(absAmount).toLocaleString('en-IN')}`;
  }

  // International formatting (USD, GBP, AED)
  const converted = absAmount * curr.rate;
  if (compact && converted >= 1000000) {
    return `${prefix}${curr.symbol}${(converted / 1000000).toFixed(2)}M`;
  } else if (compact && converted >= 1000) {
    return `${prefix}${curr.symbol}${(converted / 1000).toFixed(1)}k`;
  }

  return `${prefix}${curr.symbol}${Math.round(converted).toLocaleString('en-US')}`;
}

/**
 * Formats full currency with exact commas and optional decimals.
 */
export function formatFullCurrency(amountInBdt, currencyCode = 'BDT', decimals = 0) {
  const num = parseAmount(amountInBdt);
  const curr = CURRENCY_RATES[currencyCode] || CURRENCY_RATES.BDT;
  const isNegative = num < 0;
  const absAmount = Math.abs(num);
  const converted = absAmount * curr.rate;
  const prefix = isNegative ? '-' : '';

  const locale = currencyCode === 'BDT' ? 'en-IN' : 'en-US';
  const formattedNum = decimals > 0 
    ? converted.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(converted).toLocaleString(locale);

  return `${prefix}${curr.symbol}${formattedNum}`;
}
