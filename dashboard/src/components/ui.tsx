import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Priority } from '../types'
import AnimatedList from './AnimatedList'
let modalSequence = 0
const modalStack: string[] = []
const modalSubscribers = new Set<() => void>()
const notifyModalStack = () => modalSubscribers.forEach(subscriber => subscriber())
let savedScrollStyles: { body: string; html: string; content: string } | null = null
function lockPageScroll() {
  if (savedScrollStyles) return
  const content = document.querySelector<HTMLElement>('.device-content')
  savedScrollStyles = {
    body: document.body.style.overflow,
    html: document.documentElement.style.overflow,
    content: content?.style.overflow || '',
  }
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
  if (content) content.style.overflow = 'hidden'
}
function unlockPageScroll() {
  if (!savedScrollStyles) return
  document.body.style.overflow = savedScrollStyles.body
  document.documentElement.style.overflow = savedScrollStyles.html
  const content = document.querySelector<HTMLElement>('.device-content')
  if (content) content.style.overflow = savedScrollStyles.content
  savedScrollStyles = null
}
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
    requestAnimationFrame(() => menu.current?.querySelector<HTMLElement>('[role="listbox"]')?.focus({ preventScroll: true }))
  }, [open, options.length])
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
  return (
    <div ref={wrapper} className={`dropdown-select ${variant === 'compact' ? 'compact' : ''} ${className}`}>
      <button ref={trigger} type="button" className="dropdown-select-trigger" role="combobox" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? `dropdown-${ariaLabel.replace(/[^a-z0-9]+/gi, '-')}` : undefined} disabled={disabled} onClick={() => open ? setOpen(false) : openMenu()} onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openMenu() }
        if (event.key === 'Escape') setOpen(false)
      }}>
        <span>{selected?.label || ''}</span><ChevronDown size={15} aria-hidden="true" />
      </button>
      {open && position && createPortal(<div ref={menu} className="dropdown-select-menu" style={{ left: position.left, top: position.top, width: position.width, maxHeight: position.maxHeight, overflow: 'hidden' }} onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); setOpen(false); trigger.current?.focus() }
      }}>
        <AnimatedList
          items={options}
          id={`dropdown-${ariaLabel.replace(/[^a-z0-9]+/gi, '-')}`}
          ariaLabel={`${ariaLabel} options`}
          listRole="listbox"
          itemRole="option"
          initialSelectedIndex={activeIndex}
          loop
          selectOnHover
          animation="pop"
          animateOnce={false}
          stagger={0.05}
          showGradients
          accentColor="var(--purple, #3978df)"
          className="dropdown-select-options"
          maxHeight={position.maxHeight - 12}
          onItemSelect={(_, index) => setActiveIndex(index)}
          onItemActivate={choose}
          activateOnClick
          renderItem={option => <span className="dropdown-select-option">{option.label}</span>}
        />
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
export function Modal({ open, onClose, onBack, title, children, wide, className = '' }: { open: boolean; onClose: () => void; onBack?: () => void; title: string; children: React.ReactNode; wide?: boolean; className?: string }) {
  const [modalId] = useState(() => `modal-${++modalSequence}`)
  const [topModalId, setTopModalId] = useState<string | null>(() => modalStack[modalStack.length - 1] || null)
  useLayoutEffect(() => {
    const updateTopModal = () => setTopModalId(modalStack[modalStack.length - 1] || null)
    modalSubscribers.add(updateTopModal)
    if (open) {
      const currentIndex = modalStack.indexOf(modalId)
      if (currentIndex !== -1) modalStack.splice(currentIndex, 1)
      if (modalStack.length === 0) lockPageScroll()
      modalStack.push(modalId)
    }
    notifyModalStack()
    return () => {
      modalSubscribers.delete(updateTopModal)
      const currentIndex = modalStack.indexOf(modalId)
      if (currentIndex !== -1) modalStack.splice(currentIndex, 1)
      if (modalStack.length === 0) unlockPageScroll()
      notifyModalStack()
    }
  }, [open, modalId])
  if (!open) return null
  const isTopModal = topModalId === modalId
  return createPortal(
    <div aria-hidden={!isTopModal} style={isTopModal ? undefined : { display: 'none' }} className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className={`modal-panel max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl dark:bg-slate-900 sm:rounded-2xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} ${className}`} onClick={e => e.stopPropagation()}>
        <div className="modal-titlebar mb-3 flex min-w-0 items-center gap-2">
          <button type="button" aria-label="Back" onClick={onBack || onClose} className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><ChevronLeft size={18} /><span>Back</span></button>
          <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="shrink-0 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
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
