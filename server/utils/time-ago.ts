/**
 * Server-side time ago utility — แปลงวันเวลาเป็นข้อความภาษาไทย
 */
export function timeAgo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'เมื่อสักครู่'
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(date.getTime())) return 'เมื่อสักครู่'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 30) return 'เมื่อสักครู่'
  if (diffSec < 60) return `${diffSec} วินาทีที่แล้ว`
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`
  if (diffHr < 24) return `${diffHr} ชั่วโมงที่แล้ว`
  if (diffDay === 1) return 'เมื่อวานนี้'
  if (diffDay < 7) return `${diffDay} วันที่แล้ว`
  if (diffWeek < 4) return `${diffWeek} สัปดาห์ที่แล้ว`
  if (diffMonth < 12) return `${diffMonth} เดือนที่แล้ว`
  return `${diffYear} ปีที่แล้ว`
}
