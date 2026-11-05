import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Priority } from '../types'
let modalSequence = 0
const modalStack: string[] = []
const modalSubscribers = new Set<() => void>()
const notifyModalStack = () => modalSubscribers.forEach(subscriber => subscriber())
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
export interface DropdownOption { value: string; label: string }
export function DropdownSelect({ value, onChange, options, ariaLabel, className = '', variant = 'default', disabled = false }: { value: string; onChange: (value: string) => void; options: DropdownOption[]; ariaLabel: string; className?: string; variant?: 'default' | 'compact'; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(Math.max(0, options.findIndex(option => option.value === value)))
  const [position, setPosition] = useState<{ left: number; top: number; width: number; maxHeight: number } | null>(null)
  const wrapper = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value))
  const selected = options[selectedIndex]
  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node) && !menu.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnViewportChange = () => setOpen(false)
    const closeOnPageScroll = (event: Event) => {
      if (!menu.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    window.addEventListener('resize', closeOnViewportChange)
    window.addEventListener('scroll', closeOnPageScroll, true)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      window.removeEventListener('resize', closeOnViewportChange)
      window.removeEventListener('scroll', closeOnPageScroll, true)
    }
  }, [open])
  useLayoutEffect(() => {
    if (!open) return
    const rect = trigger.current?.getBoundingClientRect()
    if (!rect) return
    const width = Math.min(Math.max(rect.width, 190), 280, window.innerWidth - 16)
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8)
    const estimatedHeight = Math.min(options.length * 36 + 10, 260)
    const below = window.innerHeight - rect.bottom - 8
    const above = rect.top - 8
    const placeAbove = below < estimatedHeight && above > below
    const maxHeight = Math.max(80, Math.min(260, placeAbove ? above : below))
    const top = placeAbove ? Math.max(8, rect.top - Math.min(estimatedHeight, maxHeight) - 4) : Math.min(rect.bottom + 4, window.innerHeight - maxHeight - 8)
    setPosition({ left, top, width, maxHeight })
    requestAnimationFrame(() => optionRefs.current[activeIndex]?.focus({ preventScroll: true }))
  }, [open, activeIndex, options.length])
  const openMenu = () => {
    if (disabled) return
    setActiveIndex(selectedIndex)
    setPosition(null)
    setOpen(true)
  }
  const choose = (option: DropdownOption) => {
    onChange(option.value)
    setOpen(false)
    trigger.current?.focus()
  }
  const moveActive = (index: number) => {
    const next = (index + options.length) % options.length
    setActiveIndex(next)
    optionRefs.current[next]?.focus({ preventScroll: true })
  }
  return (
    <div ref={wrapper} className={`dropdown-select ${variant === 'compact' ? 'compact' : ''} ${className}`}>
      <button ref={trigger} type="button" className="dropdown-select-trigger" role="combobox" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? `dropdown-${ariaLabel.replace(/[^a-z0-9]+/gi, '-')}` : undefined} disabled={disabled} onClick={() => open ? setOpen(false) : openMenu()} onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openMenu() }
        if (event.key === 'Escape') setOpen(false)
      }}>
        <span>{selected?.label || ''}</span><ChevronDown size={15} aria-hidden="true" />
      </button>
      {open && position && createPortal(<div ref={menu} id={`dropdown-${ariaLabel.replace(/[^a-z0-9]+/gi, '-')}`} className="dropdown-select-menu" role="listbox" aria-label={`${ariaLabel} options`} style={{ left: position.left, top: position.top, width: position.width, maxHeight: position.maxHeight }} onKeyDown={event => {
        if (event.key === 'ArrowDown') { event.preventDefault(); moveActive(activeIndex + 1) }
        if (event.key === 'ArrowUp') { event.preventDefault(); moveActive(activeIndex - 1) }
        if (event.key === 'Home') { event.preventDefault(); moveActive(0) }
        if (event.key === 'End') { event.preventDefault(); moveActive(options.length - 1) }
        if (event.key === 'Escape') { event.preventDefault(); setOpen(false); trigger.current?.focus() }
      }}>
        {options.map((option, index) => <button ref={element => { optionRefs.current[index] = element }} key={option.value} type="button" role="option" aria-selected={value === option.value} tabIndex={activeIndex === index ? 0 : -1} className="dropdown-select-option" onFocus={() => setActiveIndex(index)} onClick={() => choose(option)}>{option.label}</button>)}
      </div>, document.body)}
    </div>
  )
}
export function Btn({ children, onClick, variant = 'primary', className = '', type = 'button', disabled }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; className?: string; type?: 'button' | 'submit'; disabled?: boolean }) {
  const v = variant === 'primary' ? 'bg-[#2863C5] text-white hover:bg-[#1F56B0] disabled:opacity-50' : variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' : variant === 'ghost' ? 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800' : 'border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
  return <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${v} ${className}`}>{children}</button>
}
export function DoubleClickAction({ children, onActivate, className = '', label }: { children: React.ReactNode; onActivate: () => void; className?: string; label: string }) {
  return <button type="button" aria-label={label} onDoubleClick={onActivate} onKeyDown={event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onActivate() }
  }} className={`cursor-default rounded-sm text-left text-inherit focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${className}`}>{children}</button>
}
export function RecordRow({ children, onActivate, label, className = '' }: { children: React.ReactNode; onActivate?: () => void; label: string; className?: string }) {
  const activateFromKeyboard = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    onActivate?.()
  }
  const activateFromDoubleClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    if ((event.target as HTMLElement).closest('button, a, input, select, textarea, [role="button"]')) return
    onActivate?.()
  }
  return <tr tabIndex={onActivate ? 0 : undefined} aria-label={onActivate ? label : undefined} onKeyDown={activateFromKeyboard} onDoubleClick={activateFromDoubleClick} className={`${onActivate ? 'record-row' : ''} ${className}`}>{children}</tr>
}
export function RecordSurface({ children, onActivate, label, className = '' }: { children: React.ReactNode; onActivate: () => void; label: string; className?: string }) {
  const activateFromKeyboard = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    onActivate()
  }
  const activateFromDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button, a, input, select, textarea, [role="button"]')) return
    onActivate()
  }
  return <div role="group" tabIndex={0} aria-label={label} onKeyDown={activateFromKeyboard} onDoubleClick={activateFromDoubleClick} className={`record-surface ${className}`}>{children}</div>
}
export function Modal({ open, onClose, onBack, title, children, wide }: { open: boolean; onClose: () => void; onBack?: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  const [modalId] = useState(() => `modal-${++modalSequence}`)
  const [topModalId, setTopModalId] = useState<string | null>(() => modalStack[modalStack.length - 1] || null)
  useLayoutEffect(() => {
    const updateTopModal = () => setTopModalId(modalStack[modalStack.length - 1] || null)
    modalSubscribers.add(updateTopModal)
    if (open) {
      const currentIndex = modalStack.indexOf(modalId)
      if (currentIndex !== -1) modalStack.splice(currentIndex, 1)
      modalStack.push(modalId)
    }
    notifyModalStack()
    return () => {
      modalSubscribers.delete(updateTopModal)
      const currentIndex = modalStack.indexOf(modalId)
      if (currentIndex !== -1) modalStack.splice(currentIndex, 1)
      notifyModalStack()
    }
  }, [open, modalId])
  if (!open) return null
  const isTopModal = topModalId === modalId
  return <div aria-hidden={!isTopModal} style={isTopModal ? undefined : { display: 'none' }} className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4" onClick={onClose}><div className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl dark:bg-slate-900 sm:rounded-2xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`} onClick={e => e.stopPropagation()}><div className="mb-3 flex min-w-0 items-center gap-2"><button type="button" aria-label="Back" onClick={onBack || onClose} className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><ChevronLeft size={18} /><span>Back</span></button><h3 className="min-w-0 flex-1 truncate text-base font-semibold text-slate-900 dark:text-white">{title}</h3><button type="button" aria-label="Close" onClick={onClose} className="shrink-0 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button></div>{children}</div></div>
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
