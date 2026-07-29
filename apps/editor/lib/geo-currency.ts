// lib/geo-currency.ts

export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'SGD' | 'AED' | 'JPY' | 'BRL' | 'MXN' | 'CHF' | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'ZAR' | 'KRW'

export type CurrencyConfig = {
  code: CurrencyCode
  symbol: string
  locale: string
  divisor: number       // smallest unit to display unit (100 for most, 1 for JPY/KRW)
  gateway: 'stripe' | 'razorpay'
  approxUsdRate: number // 1 USD = N units of this currency (for display approximation)
}

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$',   locale: 'en-US', divisor: 100, gateway: 'stripe',   approxUsdRate: 1 },
  INR: { code: 'INR', symbol: '₹',   locale: 'en-IN', divisor: 100, gateway: 'razorpay', approxUsdRate: 84 },
  EUR: { code: 'EUR', symbol: '€',   locale: 'de-DE', divisor: 100, gateway: 'stripe',   approxUsdRate: 0.92 },
  GBP: { code: 'GBP', symbol: '£',   locale: 'en-GB', divisor: 100, gateway: 'stripe',   approxUsdRate: 0.79 },
  AUD: { code: 'AUD', symbol: 'A$',  locale: 'en-AU', divisor: 100, gateway: 'stripe',   approxUsdRate: 1.53 },
  CAD: { code: 'CAD', symbol: 'CA$', locale: 'en-CA', divisor: 100, gateway: 'stripe',   approxUsdRate: 1.36 },
  SGD: { code: 'SGD', symbol: 'S$',  locale: 'en-SG', divisor: 100, gateway: 'stripe',   approxUsdRate: 1.35 },
  AED: { code: 'AED', symbol: 'AED ', locale: 'ar-AE', divisor: 100, gateway: 'stripe',  approxUsdRate: 3.67 },
  JPY: { code: 'JPY', symbol: '¥',   locale: 'ja-JP', divisor: 1,   gateway: 'stripe',   approxUsdRate: 150 },
  BRL: { code: 'BRL', symbol: 'R$',  locale: 'pt-BR', divisor: 100, gateway: 'stripe',   approxUsdRate: 4.97 },
  MXN: { code: 'MXN', symbol: 'MX$', locale: 'es-MX', divisor: 100, gateway: 'stripe',  approxUsdRate: 17 },
  CHF: { code: 'CHF', symbol: 'CHF ', locale: 'de-CH', divisor: 100, gateway: 'stripe', approxUsdRate: 0.9 },
  SEK: { code: 'SEK', symbol: 'kr',  locale: 'sv-SE', divisor: 100, gateway: 'stripe',   approxUsdRate: 10.5 },
  NOK: { code: 'NOK', symbol: 'kr',  locale: 'nb-NO', divisor: 100, gateway: 'stripe',   approxUsdRate: 10.7 },
  DKK: { code: 'DKK', symbol: 'kr',  locale: 'da-DK', divisor: 100, gateway: 'stripe',   approxUsdRate: 6.9 },
  PLN: { code: 'PLN', symbol: 'zł',  locale: 'pl-PL', divisor: 100, gateway: 'stripe',   approxUsdRate: 4.0 },
  ZAR: { code: 'ZAR', symbol: 'R',   locale: 'en-ZA', divisor: 100, gateway: 'stripe',   approxUsdRate: 18.5 },
  KRW: { code: 'KRW', symbol: '₩',   locale: 'ko-KR', divisor: 1,   gateway: 'stripe',   approxUsdRate: 1320 },
}

// All EU Euro countries
const EUR_COUNTRIES = new Set([
  'DE','FR','IT','ES','NL','BE','AT','PT','FI','IE','GR','LU',
  'SK','SI','EE','LV','LT','MT','CY','HR',
])

export const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  AU: 'AUD', NZ: 'AUD',
  CA: 'CAD',
  JP: 'JPY',
  KR: 'KRW',
  SG: 'SGD', MY: 'SGD',
  AE: 'AED', SA: 'AED', QA: 'AED', KW: 'AED', BH: 'AED', OM: 'AED',
  BR: 'BRL',
  MX: 'MXN',
  CH: 'CHF',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
  PL: 'PLN',
  ZA: 'ZAR',
}

// Inject EUR countries
for (const cc of EUR_COUNTRIES) {
  if (!COUNTRY_TO_CURRENCY[cc]) COUNTRY_TO_CURRENCY[cc] = 'EUR'
}

export function getCurrencyForCountry(countryCode: string | null | undefined): CurrencyConfig {
  const code = (countryCode ? COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] : undefined) ?? 'USD'
  return CURRENCY_CONFIGS[code] ?? CURRENCY_CONFIGS.USD
}

/**
 * Format a price from its smallest-unit integer (cents/paise/yen) to a display string.
 * If `smallestUnits` is null/undefined, falls back to converting from usdCents using approxUsdRate.
 */
export function formatPrice(
  smallestUnits: number | null | undefined,
  currency: CurrencyConfig,
  usdCents?: number,
): string {
  let amount: number
  if (smallestUnits != null) {
    amount = smallestUnits / currency.divisor
  } else if (usdCents != null) {
    // approximate conversion: usdCents / 100 * rate, then round to nearest sensible value
    const raw = (usdCents / 100) * currency.approxUsdRate
    amount = roundToSensible(raw, currency)
  } else {
    return '—'
  }

  // Use Intl.NumberFormat for locale-aware formatting
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    maximumFractionDigits: currency.divisor === 1 ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(amount)
}

function roundToSensible(amount: number, currency: CurrencyConfig): number {
  if (currency.divisor === 1) return Math.round(amount)      // JPY/KRW — round to whole
  if (amount >= 1000) return Math.round(amount / 50) * 50    // round to nearest 50
  if (amount >= 100) return Math.round(amount / 10) * 10     // round to nearest 10
  if (amount >= 10) return Math.round(amount / 5) * 5        // round to nearest 5
  return Math.round(amount * 100) / 100                      // 2 decimal places
}

export const DEFAULT_CURRENCY = CURRENCY_CONFIGS.USD
