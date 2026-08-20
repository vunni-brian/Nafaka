export const fmt = (n: number, currency = 'UGX') => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M ${currency}`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k ${currency}`
  return `${n} ${currency}`
}

export const fmtFull = (n: number, currency = 'UGX') =>
  `${n.toLocaleString('en-US')} ${currency}`.replace(/\$/g, '')