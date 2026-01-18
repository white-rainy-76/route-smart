/**
 * Форматирует время в секундах в читаемый формат (часы и минуты)
 * @param seconds - время в секундах
 * @returns отформатированная строка (например, "2ч 30мин" или "45мин")
 */
export function formatDriveTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}ч ${minutes}мин`
  }
  return `${minutes}мин`
}
