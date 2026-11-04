import { format, parseISO, isBefore, startOfDay } from 'date-fns'
export const fmt = (d: string) => { try { return format(parseISO(d), 'dd MMM yyyy') } catch { return d } }
export const fmtDT = (d: string) => { try { return format(parseISO(d), 'dd MMM yyyy, hh:mm a') } catch { return d } }
export const money = (n: number) => '₹' + n.toLocaleString('en-IN')
export const isOverdue = (t: { dueDate: string; status: string }) => t.status !== 'Completed' && isBefore(startOfDay(parseISO(t.dueDate)), startOfDay(new Date()))
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob); const a = document.createElement('a')
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
}
export function downloadText(filename: string, text: string, type = 'text/plain') {
  const blob = new Blob([text], { type }); const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
}
