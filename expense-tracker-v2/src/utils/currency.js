export const CURRENCY_SYMBOLS = {
  PHP:'₱', USD:'$', EUR:'€', GBP:'£', JPY:'¥', KRW:'₩', CNY:'¥',
  INR:'₹', AUD:'A$', CAD:'C$', SGD:'S$', HKD:'HK$', MYR:'RM',
  THB:'฿', IDR:'Rp', VND:'₫', BRL:'R$', MXN:'$', ZAR:'R', CHF:'Fr',
}

/** These currencies show no decimal places — e.g. ₩1,000 not ₩1,000.00 */
export const ZERO_DECIMAL = new Set(['JPY','KRW','IDR','VND','CNY'])

export const CURRENCIES = [
  { code:'PHP', sym:'₱' }, { code:'USD', sym:'$' }, { code:'EUR', sym:'€' }, { code:'GBP', sym:'£' },
  { code:'JPY', sym:'¥' }, { code:'KRW', sym:'₩' }, { code:'CNY', sym:'¥' }, { code:'INR', sym:'₹' },
  { code:'AUD', sym:'A$'}, { code:'CAD', sym:'C$'}, { code:'SGD', sym:'S$'}, { code:'HKD', sym:'HK$'},
  { code:'MYR', sym:'RM'}, { code:'THB', sym:'฿' }, { code:'IDR', sym:'Rp'}, { code:'VND', sym:'₫' },
  { code:'BRL', sym:'R$'}, { code:'MXN', sym:'$' }, { code:'ZAR', sym:'R' }, { code:'CHF', sym:'Fr'},
]

/** Full formatted currency e.g. ₱1,200.50 or ₩1,200 */
export function fmt(amount, currency) {
  const sym      = CURRENCY_SYMBOLS[currency] || currency
  const decimals = ZERO_DECIMAL.has(currency) ? 0 : 2
  return `${sym}${parseFloat(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

/** Chart Y-axis ticks — compact with K/M suffix */
export function fmtAxis(value, currency) {
  const sym      = CURRENCY_SYMBOLS[currency] || currency
  const decimals = ZERO_DECIMAL.has(currency) ? 0 : 0  // axis always no decimal
  if (Math.abs(value) >= 1_000_000)
    return `${sym}${(value/1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000)
    return `${sym}${(value/1_000).toFixed(1)}K`
  return `${sym}${value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}
