export function formatNumber(value: number | undefined, decimals: number = 2): string {
  if (value === undefined || isNaN(value)) return '0.00'
  return value.toFixed(decimals)
}

export function formatPercent(value: number | undefined): string {
  if (value === undefined || isNaN(value)) return '0.00%'
  return `${value.toFixed(2)}%`
}

export function formatAmount(value: number): string {
  return (value / 100000000).toFixed(2)
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getTodayString(): string {
  return formatDate(new Date())
}
