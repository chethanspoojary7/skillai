import React, { useState } from 'react'
import { X, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Priority } from '../types'
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`app-card rounded-xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(27,65,123,0.05)] dark:border-slate-700 dark:bg-slate-900 ${className}`}>{children}</div>
}
export function Badge({ text, tone }: { text: string; tone: 'green' | 'amber' | 'red' | 'blue' | 'slate' | 'purple' }) {
  const m: Record<string, string> = { green: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300', amber: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300', red: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-300', blue: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300', slate: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300', purple: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-900/30 dark:text-violet-300' }
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${m[tone]}`}>{text}</span>
}
export function statusTone(s: string): 'green' | 'amber' | 'red' | 'blue' | 'slate' | 'purple' {
  if (s === 'Approved' || s === 'Completed') return 'green'
  if (s === 'Pending' || s === 'In Progress' || s === 'Submitted for Review') return 'amber'
  if (s === 'Rejected' || s === 'Blocked') return 'red'
  if (s === 'Returned') return 'purple'
  return 'slate'
}
export function priorityTone(p: Priority): 'red' | 'amber' | 'blue' | 'slate' {
  return p === 'Critical' ? 'red' : p === 'High' ? 'amber' : p === 'Medium' ? 'blue' : 'slate'
}
export function Progress({ value, tone = 'bg-blue-600' }: { value: number; tone?: string }) {
  return <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
}
export function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return <label className="block text-sm"><span className="mb-1 block font-medium text-slate-700 dark:text-slate-200">{label}</span>{children}{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>
}
export const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900'
export function Btn({ children, onClick, variant = 'primary', className = '', type = 'button', disabled }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; className?: string; type?: 'button' | 'submit'; disabled?: boolean }) {
  const v = variant === 'primary' ? 'bg-[#2863C5] text-white hover:bg-[#1F56B0] disabled:opacity-50' : variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' : variant === 'ghost' ? 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800' : 'border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
  return <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${v} ${className}`}>{children}</button>
}
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4" onClick={onClose}><div className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl dark:bg-slate-900 sm:rounded-2xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`} onClick={e => e.stopPropagation()}><div className="mb-3 flex items-center justify-between"><h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3><button aria-label="Close" onClick={onClose} className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button></div>{children}</div></div>
}
export function Confirm({ open, onClose, onConfirm, title, text, confirmLabel = 'Confirm' }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; text: string; confirmLabel?: string }) {
  return <Modal open={open} onClose={onClose} title={title}><p className="text-sm text-slate-600 dark:text-slate-300">{text}</p><div className="mt-5 flex justify-end gap-2"><Btn variant="secondary" onClick={onClose}>Cancel</Btn><Btn variant="danger" onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</Btn></div></Modal>
}
export function Empty({ title, text }: { title: string; text: string }) {
  return <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-600"><p className="font-medium text-slate-800 dark:text-slate-100">{title}</p><p className="mt-1 text-sm text-slate-500">{text}</p></div>
}
export function Skeleton() { return <div className="animate-pulse space-y-3"><div className="h-4 rounded bg-slate-200 dark:bg-slate-700" /><div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" /><div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" /></div> }
export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`${inputCls} pl-9`} /></div>
}
export function Pagination({ page, pages, onPage, total }: { page: number; pages: number; onPage: (p: number) => void; total: number }) {
  if (pages <= 1) return <p className="text-xs text-slate-500">{total} records</p>
  return <div className="flex items-center gap-2 text-sm"><span className="text-xs text-slate-500">{total} records · Page {page} of {pages}</span><button disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-lg border p-1 disabled:opacity-40" aria-label="Previous page"><ChevronLeft size={16} /></button><button disabled={page >= pages} onClick={() => onPage(page + 1)} className="rounded-lg border p-1 disabled:opacity-40" aria-label="Next page"><ChevronRight size={16} /></button></div>
}
export function useDelayed<T>(value: T, ms = 400) { const [v, setV] = useState(value); React.useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t) }, [value, ms]); return v }
