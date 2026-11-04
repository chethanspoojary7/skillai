import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ActivityItem, Approval, ApprovalStatus, NotificationItem, Profile, Settings, Staff, Task } from '../types'
import { activity as seedActivity, approvals as seedApprovals, notifications as seedNotifications, staff as seedStaff, tasks as seedTasks } from '../data/seed'
const KEY = 'idd-demo-v1'
export interface Toast { id: number; kind: 'success' | 'error' | 'info'; text: string }
interface State { approvals: Approval[]; tasks: Task[]; staff: Staff[]; notifications: NotificationItem[]; activity: ActivityItem[]; settings: Settings; profile: Profile; authed: boolean }
const defaultSettings: Settings = { instituteName: 'Institute of Applied Sciences', academicYear: '2026–27', reportingPeriod: 'Monthly', theme: 'light', sidebar: 'expanded', density: 'comfortable', notifyApprovals: true, notifyDeadlines: true, notifyOverdue: true, notifyPerformance: true, rolePreview: 'Director' }
const defaultProfile: Profile = { name: 'Dr. Rajesh Menon', designation: 'Director', email: 'director@demo.institute', phone: '+91 98765 00000 (demo)', office: "Director's Office, Main Block" }
function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) { const p = JSON.parse(raw); if (p && Array.isArray(p.approvals) && Array.isArray(p.tasks)) return { ...p, staff: Array.isArray(p.staff) ? p.staff : seedStaff, authed: false } }
  } catch {}
  return { approvals: seedApprovals, tasks: seedTasks, staff: seedStaff, notifications: seedNotifications, activity: seedActivity, settings: defaultSettings, profile: defaultProfile, authed: false }
}
interface Ctx extends State {
  toasts: Toast[]; toast: (kind: Toast['kind'], text: string) => void; dismissToast: (id: number) => void
  login: () => void; logout: () => void
  decideApproval: (id: string, status: ApprovalStatus, note: string) => void
  bulkApprove: (ids: string[]) => void
  upsertTask: (t: Task) => void; updateTask: (id: string, patch: Partial<Task>, note?: string) => void; deleteTask: (id: string) => void
  addNotification: (n: Omit<NotificationItem, 'id' | 'read'>) => void; markNotification: (id: string, read: boolean) => void; markAllNotifications: () => void; deleteNotification: (id: string) => void
  log: (a: Omit<ActivityItem, 'id' | 'date'>) => void
  saveSettings: (s: Settings) => void; saveProfile: (p: Profile) => void; updateStaff: (id: string, patch: Partial<import('../types').Staff>) => void
  resetDemo: () => void
}
const C = createContext<Ctx | null>(null)
export const useApp = () => { const v = useContext(C); if (!v) throw new Error('AppContext missing'); return v }
let n = 0
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(load)
  const [toasts, setToasts] = useState<Toast[]>([])
  useEffect(() => { try { const { authed, ...rest } = state; localStorage.setItem(KEY, JSON.stringify(rest)) } catch {} }, [state])
  useEffect(() => { document.documentElement.classList.toggle('dark', state.settings.theme === 'dark') }, [state.settings.theme])
  const toast = (kind: Toast['kind'], text: string) => { const id = ++n; setToasts(t => [...t, { id, kind, text }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500) }
  const log = (a: Omit<ActivityItem, 'id' | 'date'>) => setState(s => ({ ...s, activity: [{ id: 'A' + Date.now(), date: new Date().toISOString(), ...a }, ...s.activity] }))
  const value: Ctx = useMemo(() => ({
    ...state, toasts, toast, dismissToast: (id) => setToasts(t => t.filter(x => x.id !== id)),
    login: () => setState(s => ({ ...s, authed: true })), logout: () => setState(s => ({ ...s, authed: false })),
    decideApproval: (id, status, note) => setState(s => {
      const old = s.approvals.find(a => a.id === id); if (!old || old.status !== 'Pending') return s
      const updated = { ...old, status, comments: note ? [...old.comments, { author: 'Director', text: note, date: new Date().toISOString().slice(0, 10) }] : old.comments, history: [...old.history, { date: new Date().toISOString().slice(0, 10), action: status, actor: 'Director' }] }
      return { ...s, approvals: s.approvals.map(a => a.id === id ? updated : a), activity: [{ id: 'A' + Date.now(), date: new Date().toISOString(), actor: 'Director', action: status === 'Approved' ? 'Approved approval' : status === 'Rejected' ? 'Rejected approval' : 'Returned approval', recordType: 'Approval', recordId: id, description: old.title, from: 'Pending', to: status }, ...s.activity] }
    }),
    bulkApprove: (ids) => setState(s => ({ ...s, approvals: s.approvals.map(a => ids.includes(a.id) && a.status === 'Pending' ? { ...a, status: 'Approved' as const, history: [...a.history, { date: new Date().toISOString().slice(0, 10), action: 'Approved', actor: 'Director' }] } : a) })),
    upsertTask: (t) => setState(s => { const exists = s.tasks.some(x => x.id === t.id); return { ...s, tasks: exists ? s.tasks.map(x => x.id === t.id ? t : x) : [t, ...s.tasks], activity: [{ id: 'A' + Date.now(), date: new Date().toISOString(), actor: 'Director', action: exists ? 'Updated task' : 'Created task', recordType: 'Task', recordId: t.id, description: t.title }, ...s.activity] } }),
    updateTask: (id, patch, note) => setState(s => { const old = s.tasks.find(t => t.id === id); if (!old) return s; const updated = { ...old, ...patch, comments: note ? [...old.comments, { author: 'Director', text: note, date: new Date().toISOString().slice(0, 10) }] : old.comments }; return { ...s, tasks: s.tasks.map(t => t.id === id ? updated : t), activity: patch.status && patch.status !== old.status ? [{ id: 'A' + Date.now(), date: new Date().toISOString(), actor: 'Director', action: 'Changed task status', recordType: 'Task', recordId: id, description: old.title, from: old.status, to: patch.status }, ...s.activity] : s.activity } }),
    deleteTask: (id) => setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) })),
    addNotification: (nn) => setState(s => ({ ...s, notifications: [{ id: 'N' + Date.now(), read: false, ...nn }, ...s.notifications] })),
    markNotification: (id, read) => setState(s => ({ ...s, notifications: s.notifications.map(x => x.id === id ? { ...x, read } : x) })),
    markAllNotifications: () => setState(s => ({ ...s, notifications: s.notifications.map(x => ({ ...x, read: true })) })),
    deleteNotification: (id) => setState(s => ({ ...s, notifications: s.notifications.filter(x => x.id !== id) })),
    log, saveSettings: (settings) => setState(s => ({ ...s, settings })), saveProfile: (profile) => setState(s => ({ ...s, profile })),
    updateStaff: (id, patch) => setState(s => ({ ...s, staff: s.staff.map(x => x.id === id ? { ...x, ...patch } : x) })),
    resetDemo: () => { try { localStorage.removeItem(KEY) } catch {}; setState({ approvals: seedApprovals, tasks: seedTasks, staff: seedStaff, notifications: seedNotifications, activity: seedActivity, settings: defaultSettings, profile: defaultProfile, authed: true }) },
  }), [state, toasts])
  return <C.Provider value={value}>{children}</C.Provider>
}
