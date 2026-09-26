export function formatMoney(sum: number): string {
  const abs = Math.round(Math.abs(sum))
  const grouped = abs.toLocaleString('ru-RU').replace(/,/g, ' ')
  const sign = sum < 0 ? '−' : ''
  return `${sign}${grouped} so'm`
}

export function formatSignedMoney(sum: number): string {
  const sign = sum > 0 ? '+' : sum < 0 ? '−' : ''
  const abs = Math.round(Math.abs(sum)).toLocaleString('ru-RU').replace(/,/g, ' ')
  return `${sign}${abs} so'm`
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(date: Date): string {
  const months = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek']
  return `${date.getDate()} ${months[date.getMonth()]}`
}

export function formatDuration(startIso: string, endIso?: string): string {
  const start = new Date(startIso)
  const end = endIso ? new Date(endIso) : new Date()
  const ms = end.getTime() - start.getTime()
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return `${h} soat ${m} daq`
}

export function initialsName(first: string, lastInitial?: string): string {
  return lastInitial ? `${first} ${lastInitial}.` : first
}
