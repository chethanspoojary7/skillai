import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { fmtDT } from '../utils'
import { Badge, Btn, Card, Confirm, Empty } from '../components/ui'
export default function NotificationsPage() {
  const { notifications, markNotification, markAllNotifications, deleteNotification, toast } = useApp(); const nav = useNavigate()
  const [filter, setFilter] = useState('All'); const [toDelete, setToDelete] = useState<string | null>(null)
  const list = notifications.filter(n => filter === 'All' ? true : filter === 'Unread' ? !n.read : n.category === filter)
  return (
    <div className="space-y-5">
      <Card className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2">{['All', 'Unread', 'Approval', 'Task', 'Deadline', 'Overdue', 'Performance', 'System'].map(f => <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-sm ${filter === f ? 'bg-[#0F2A4A] text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{f}</button>)}</div><Btn variant="secondary" onClick={() => { markAllNotifications(); toast('success', 'All notifications marked as read.') }}>Mark all as read</Btn></div>
        <div className="mt-5 space-y-3">{list.map(n => <div key={n.id} className={`flex flex-wrap items-start justify-between gap-3 rounded-2xl border p-4 ${n.read ? 'border-slate-200 dark:border-slate-700' : 'border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-900/20'}`}>
          <div className="min-w-0"><p className="font-medium">{n.title} {!n.read && <span className="ml-1 text-xs font-bold text-blue-700">· Unread</span>}</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{n.description}</p><p className="mt-1 text-xs text-slate-500">{fmtDT(n.date)} · {n.category}{n.recordId ? ` · ${n.recordId}` : ''}</p></div>
          <div className="flex gap-2"><Badge text={n.category} tone="blue" /><Btn variant="ghost" className="px-2 py-1" onClick={() => nav(n.link)}>Open record</Btn><Btn variant="ghost" className="px-2 py-1" onClick={() => markNotification(n.id, !n.read)}>{n.read ? 'Mark unread' : 'Mark read'}</Btn><Btn variant="ghost" className="px-2 py-1" onClick={() => setToDelete(n.id)}>Delete</Btn></div>
        </div>)}
        {list.length === 0 && <Empty title="No notifications here" text="Try a different filter, or check back after new demo activity." />}</div>
      </Card>
      <Confirm open={!!toDelete} onClose={() => setToDelete(null)} title="Delete this notification?" text="This removes it from the local demo state only." confirmLabel="Delete" onConfirm={() => { if (toDelete) deleteNotification(toDelete); toast('success', 'Notification deleted.') }} />
    </div>
  )
}
