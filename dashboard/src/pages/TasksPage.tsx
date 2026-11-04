import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AlertTriangle, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight,
  Clock3, LayoutGrid, List, Plus, SlidersHorizontal, Trash2,
} from 'lucide-react'
import { useApp } from '../store/AppContext'
import { departments, staff } from '../data/seed'
import { TASK_CATEGORIES } from '../types'
import type { Priority, Task, TaskStatus } from '../types'
import { fmt, isOverdue } from '../utils'
import { Badge, Btn, Card, Confirm, Empty, Field, Modal, Pagination, Progress, SearchInput, inputCls, priorityTone, statusTone } from '../components/ui'
const STATUSES: TaskStatus[] = ['Not Started', 'In Progress', 'Submitted for Review', 'Completed', 'Blocked']
const NEXT: Record<TaskStatus, TaskStatus[]> = { 'Not Started': ['In Progress', 'Blocked'], 'In Progress': ['Submitted for Review', 'Blocked'], 'Submitted for Review': ['Completed', 'In Progress'], 'Completed': [], 'Blocked': ['In Progress'] }
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
interface FormState { title: string; category: string; departmentId: string; responsibleId: string; teamIds: string[]; priority: Priority; startDate: string; dueDate: string; outcome: string; description: string; instructions: string; subtasks: string[]; milestones: string[]; dependencies: string[]; notes: string; blockedReason: string }
const blankForm = (dept = 'D01'): FormState => {
  const today = new Date()
  return { title: '', category: 'Academic', departmentId: dept, responsibleId: staff.find(s => s.departmentId === dept)?.id || 'S01', teamIds: [], priority: 'Medium', startDate: dateKey(today), dueDate: dateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14)), outcome: '', description: '', instructions: '', subtasks: [''], milestones: [''], dependencies: [], notes: '', blockedReason: '' }
}
export default function TasksPage() {
  const { tasks, upsertTask, updateTask, deleteTask, toast, addNotification } = useApp()
  const [params, setParams] = useSearchParams()
  const [view, setView] = useState<'table' | 'kanban' | 'calendar'>('calendar')
  const [q, setQ] = useState(''); const [dept, setDept] = useState('All'); const [resp, setResp] = useState(params.get('resp') || 'All'); const [prio, setPrio] = useState('All'); const [status, setStatus] = useState(params.get('status') || 'All'); const [overdueOnly, setOverdueOnly] = useState(params.get('overdue') === '1')
  const [page, setPage] = useState(1); const [size] = useState(10)
  const [detail, setDetail] = useState<Task | null>(null)
  const [formOpen, setFormOpen] = useState(false); const [editing, setEditing] = useState<Task | null>(null); const [form, setForm] = useState<FormState>(blankForm()); const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [comment, setComment] = useState(''); const [blockReason, setBlockReason] = useState(''); const [showBlock, setShowBlock] = useState(false); const [confirmDelete, setConfirmDelete] = useState<Task | null>(null); const [confirmComplete, setConfirmComplete] = useState<Task | null>(null)
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const deptName = (id: string) => departments.find(d => d.id === id)?.name || id
  const staffName = (id: string) => staff.find(s => s.id === id)?.name || id
  const today = new Date()
  const todayKey = dateKey(today)
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7))
  const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7)
  const dueTodayCount = tasks.filter(task => task.status !== 'Completed' && task.dueDate === todayKey).length
  const dueThisWeekCount = tasks.filter(task => task.status !== 'Completed' && task.dueDate >= dateKey(weekStart) && task.dueDate < dateKey(weekEnd)).length
  const reviewCount = tasks.filter(task => task.status === 'Submitted for Review').length
  const overdueCount = tasks.filter(isOverdue).length
  useEffect(() => {
    const open = params.get('open'); if (open) { const t = tasks.find(x => x.id === open); if (t) setDetail(t) }
    if (params.get('new') === '1') { const d = params.get('dept') || 'D01'; const f = blankForm(d); if (params.get('issue')) f.title = `Improvement task — ${params.get('issue')}`; if (params.get('target')) f.outcome = `Reach the target of ${params.get('target')} for ${deptName(d)}.`; setForm(f); setFormOpen(true) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])
  const filtered = useMemo(() => {
    let list = [...tasks]; const qq = q.toLowerCase()
    if (qq) list = list.filter(t => t.title.toLowerCase().includes(qq) || t.id.toLowerCase().includes(qq))
    if (dept !== 'All') list = list.filter(t => t.departmentId === dept)
    if (resp !== 'All') list = list.filter(t => t.responsibleId === resp)
    if (prio !== 'All') list = list.filter(t => t.priority === prio)
    if (status !== 'All') list = list.filter(t => t.status === status)
    if (overdueOnly) list = list.filter(isOverdue)
    return list.sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  }, [tasks, q, dept, resp, prio, status, overdueOnly])
  const pages = Math.max(1, Math.ceil(filtered.length / size)); const pageItems = filtered.slice((page - 1) * size, page * size)
  const counts = (s: TaskStatus) => tasks.filter(t => t.status === s).length
  const openForm = (t?: Task) => {
    setEditing(t || null)
    if (t) setForm({ title: t.title, category: t.category, departmentId: t.departmentId, responsibleId: t.responsibleId, teamIds: t.teamIds, priority: t.priority, startDate: t.startDate, dueDate: t.dueDate, outcome: t.outcome, description: t.description, instructions: t.instructions, subtasks: t.subtasks.map(s => s.title), milestones: t.milestones, dependencies: t.dependencies, notes: t.notes, blockedReason: t.blockedReason || '' })
    else setForm(blankForm())
    setFormErrors({}); setFormOpen(true)
  }
  const deptStaff = staff.filter(s => s.departmentId === form.departmentId)
  const submitForm = () => {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = 'Task title is required.'
    if (!form.responsibleId) errs.responsible = 'A responsible person is required.'
    if (!form.dueDate) errs.due = 'Due date is required.'
    if (form.startDate && form.dueDate && form.dueDate < form.startDate) errs.due = 'Due date cannot be earlier than the start date.'
    setFormErrors(errs); if (Object.keys(errs).length) return
    const base = (editing || { id: `TSK-${211 + tasks.length}`, status: 'Not Started', progress: 0, attachments: ['Checklist (demo).pdf'], comments: [], createdAt: dateKey(new Date()) }) as Task
    const saved: Task = { ...base, title: form.title.trim(), category: form.category, departmentId: form.departmentId, responsibleId: form.responsibleId, teamIds: form.teamIds, priority: form.priority, startDate: form.startDate, dueDate: form.dueDate, outcome: form.outcome, description: form.description, instructions: form.instructions, subtasks: form.subtasks.filter(Boolean).map((title, i) => ({ id: `${base.id}-${i}`, title, done: editing?.subtasks[i]?.done || false })), milestones: form.milestones.filter(Boolean), dependencies: form.dependencies, notes: form.notes, blockedReason: form.blockedReason || undefined }
    upsertTask(saved); toast('success', editing ? 'Task updated.' : 'Task created and assigned.'); setFormOpen(false); setDetail(saved); setParams({})
    if (!editing) addNotification({ title: 'Task assigned', description: `${saved.title} assigned to ${staffName(saved.responsibleId)}.`, date: new Date().toISOString(), category: 'Task', link: '/tasks', recordId: saved.id })
  }
  const move = (t: Task, next: TaskStatus, note?: string) => {
    if (next === 'Completed') { setConfirmComplete(t); return }
    updateTask(t.id, { status: next, progress: next === 'Submitted for Review' ? Math.max(t.progress, 85) : t.progress }, note)
    toast('success', `${t.id} moved to ${next}.`)
    if (next === 'Submitted for Review') addNotification({ title: 'Task submitted for review', description: `${t.title} is ready for your review.`, date: new Date().toISOString(), category: 'Task', link: '/tasks', recordId: t.id })
  }
  const calDays = useMemo(() => { const y = calMonth.getFullYear(), m = calMonth.getMonth(); const first = new Date(y, m, 1); const start = new Date(y, m, 1 - ((first.getDay() + 6) % 7)); return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)) }, [calMonth])
  const monthTaskCount = tasks.filter(task => task.dueDate.startsWith(`${calMonth.getFullYear()}-${String(calMonth.getMonth() + 1).padStart(2, '0')}`)).length
  const viewOptions = [
    { id: 'calendar' as const, label: 'Calendar', icon: CalendarDays },
    { id: 'table' as const, label: 'List', icon: List },
    { id: 'kanban' as const, label: 'Board', icon: LayoutGrid },
  ]
  return (
    <div className="schedule-page">
      <header className="schedule-heading">
        <div>
          <span className="schedule-eyebrow">INSTITUTE PLANNER</span>
          <h1>Schedule</h1>
          <p>Keep deadlines, reviews, and department work moving on time.</p>
        </div>
        <Btn onClick={() => openForm()}><Plus size={16} /> Create task</Btn>
      </header>

      <section className="schedule-overview" aria-label="Schedule overview">
        {[
          { label: 'Due today', value: dueTodayCount, note: 'Open tasks', icon: CalendarDays, tone: 'violet' },
          { label: 'Due this week', value: dueThisWeekCount, note: 'Across all departments', icon: Clock3, tone: 'blue' },
          { label: 'Awaiting review', value: reviewCount, note: 'Ready for your decision', icon: CheckCircle2, tone: 'green' },
          { label: 'Overdue', value: overdueCount, note: 'Needs attention', icon: AlertTriangle, tone: 'coral' },
        ].map(item => (
          <Card className="schedule-stat" key={item.label}>
            <span className={`schedule-stat-icon ${item.tone}`}><item.icon size={17} /></span>
            <span className="schedule-stat-copy"><span>{item.label}</span><strong>{item.value}</strong><small>{item.note}</small></span>
          </Card>
        ))}
      </section>

      <Card className="schedule-board">
        <div className="schedule-board-heading">
          <div>
            <h2>Plan your work</h2>
            <p>{filtered.length} tasks in view <span>·</span> {monthTaskCount} deadlines in {calMonth.toLocaleDateString('en-IN', { month: 'long' })}</p>
          </div>
          <div className="schedule-view-switch" role="tablist" aria-label="Schedule view">
            {viewOptions.map(option => <button key={option.id} type="button" role="tab" aria-selected={view === option.id} onClick={() => setView(option.id)} className={view === option.id ? 'active' : ''}><option.icon size={15} /><span>{option.label}</span></button>)}
          </div>
        </div>
        <div className="schedule-toolbar">
          <SearchInput value={q} onChange={setQ} placeholder="Search ID or title…" />
          <label className="schedule-filter"><SlidersHorizontal size={14} /><select aria-label="Department filter" value={dept} onChange={e => setDept(e.target.value)}><option value="All">All departments</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
          <label className="schedule-filter"><select aria-label="Responsible staff filter" value={resp} onChange={e => setResp(e.target.value)}><option value="All">All responsible staff</option>{staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label className="schedule-filter"><select aria-label="Priority filter" value={prio} onChange={e => setPrio(e.target.value)}><option value="All">All priorities</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></label>
          <label className="schedule-filter"><select aria-label="Status filter" value={status} onChange={e => setStatus(e.target.value)}><option value="All">All statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></label>
          <label className="schedule-overdue-toggle"><input type="checkbox" checked={overdueOnly} onChange={e => setOverdueOnly(e.target.checked)} /> Overdue only</label>
        </div>
        {view === 'table' && <>
          <div className="schedule-list-wrap"><table className="schedule-list-table"><thead><tr className="text-left text-xs uppercase text-slate-500"><th className="py-2">ID</th><th>Title</th><th>Department</th><th>Responsible</th><th>Priority</th><th>Start</th><th>Due</th><th>Progress</th><th>Status</th><th>Actions</th></tr></thead><tbody>
            {pageItems.map(t => <tr key={t.id} className="border-t border-slate-100 dark:border-slate-800"><td className="py-3 font-medium">{t.id}</td><td><button className="text-left font-medium text-blue-700 hover:underline" onClick={() => setDetail(t)}>{t.title}</button>{isOverdue(t) && <span className="ml-2 text-xs font-medium text-red-600">OVERDUE</span>}</td><td>{deptName(t.departmentId)}</td><td>{staffName(t.responsibleId)}</td><td><Badge text={t.priority} tone={priorityTone(t.priority)} /></td><td>{fmt(t.startDate)}</td><td>{fmt(t.dueDate)}</td><td><div className="w-24"><Progress value={t.progress} /><span className="text-xs">{t.progress}%</span></div></td><td><Badge text={t.status} tone={statusTone(t.status)} /></td><td><div className="flex gap-1"><Btn variant="ghost" className="px-2 py-1" onClick={() => setDetail(t)}>Open</Btn><Btn variant="ghost" className="px-2 py-1" onClick={() => openForm(t)}>Edit</Btn></div></td></tr>)}
          </tbody></table></div>
          {filtered.length === 0 ? <div className="mt-4"><Empty title="No tasks match these filters" text="Adjust a filter, or create a new task." /></div> : <div className="mt-4 flex justify-end"><Pagination page={page} pages={pages} onPage={setPage} total={filtered.length} /></div>}
        </>}
        {view === 'kanban' && <div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {STATUSES.map(s => <div key={s} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50"><h4 className="text-sm font-semibold">{s} ({tasks.filter(t => t.status === s).length})</h4><div className="mt-3 space-y-3">
            {filtered.filter(t => t.status === s).map(t => <Card key={t.id} className="p-3"><button className="text-left text-sm font-medium text-blue-700 hover:underline" onClick={() => setDetail(t)}>{t.title}</button><p className="mt-1 text-xs text-slate-500">{t.id} · {staffName(t.responsibleId)} · Due {fmt(t.dueDate)}</p><div className="mt-2"><Progress value={t.progress} /></div><div className="mt-2 flex flex-wrap gap-1">{NEXT[s].map(nxt => <button key={nxt} onClick={() => move(t, nxt)} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium dark:bg-slate-700">→ {nxt}</button>)}</div></Card>)}
            {filtered.filter(t => t.status === s).length === 0 && <p className="text-xs text-slate-500">No tasks here.</p>}
          </div></div>)}
        </div>}
        {view === 'calendar' && <div className="schedule-calendar">
          <div className="schedule-month-heading">
            <div><h3>{calMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h3><span>{monthTaskCount} scheduled deadlines</span></div>
            <div className="schedule-month-actions">
              <button type="button" onClick={() => setCalMonth(new Date(today.getFullYear(), today.getMonth(), 1))}>Today</button>
              <button type="button" aria-label="Previous month" onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}><ChevronLeft size={17} /></button>
              <button type="button" aria-label="Next month" onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}><ChevronRight size={17} /></button>
            </div>
          </div>
          <div className="schedule-calendar-scroll">
            <div className="schedule-weekdays"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
            <div className="schedule-calendar-grid">{calDays.map((d, i) => {
              const dayTasks = filtered.filter(task => task.dueDate === dateKey(d))
              const inMonth = d.getMonth() === calMonth.getMonth()
              const isToday = dateKey(d) === todayKey
              return <div key={i} className={`schedule-day${inMonth ? '' : ' outside-month'}${isToday ? ' today' : ''}`} aria-label={`${d.toLocaleDateString('en-IN', { dateStyle: 'full' })}, ${dayTasks.length} tasks due`}>
                <span className="schedule-day-number">{d.getDate()}</span>
                {dayTasks.slice(0, 3).map(task => <button key={task.id} type="button" onClick={() => setDetail(task)} className={`schedule-event ${task.status === 'Completed' ? 'complete' : task.status === 'Submitted for Review' ? 'review' : isOverdue(task) ? 'late' : ''}`} title={`${task.title} · ${task.status}`}><span />{task.title}</button>)}
                {dayTasks.length > 3 && <span className="schedule-more-events">+{dayTasks.length - 3} more</span>}
              </div>
            })}</div>
          </div>
          <div className="schedule-calendar-foot"><span><i className="scheduled-dot" /> Task deadline</span><span><i className="scheduled-dot review" /> Awaiting review</span><span><i className="scheduled-dot complete" /> Completed</span></div>
        </div>}
      </Card>
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? `${detail.id} — ${detail.title}` : ''} wide>
        {detail && <div className="space-y-5 text-sm">
          <div className="flex flex-wrap gap-2"><Badge text={detail.status} tone={statusTone(detail.status)} /><Badge text={detail.priority} tone={priorityTone(detail.priority)} />{isOverdue(detail) && <Badge text="Overdue" tone="red" />}{detail.blockedReason && <Badge text={`Blocked: ${detail.blockedReason}`} tone="red" />}</div>
          <div className="grid gap-4 sm:grid-cols-2"><div><p className="text-slate-500">Department / Responsible</p><p className="font-medium">{deptName(detail.departmentId)} / {staffName(detail.responsibleId)}</p></div><div><p className="text-slate-500">Timeline</p><p className="font-medium">{fmt(detail.startDate)} → {fmt(detail.dueDate)}</p></div><div><p className="text-slate-500">Category</p><p className="font-medium">{detail.category}</p></div><div><p className="text-slate-500">Team</p><p className="font-medium">{detail.teamIds.map(staffName).join(', ') || '—'}</p></div></div>
          <div><p className="font-semibold">Description</p><p className="mt-1 text-slate-600 dark:text-slate-300">{detail.description}</p><p className="mt-2 font-semibold">Expected outcome</p><p className="mt-1 text-slate-600 dark:text-slate-300">{detail.outcome}</p><p className="mt-2 font-semibold">Instructions</p><p className="mt-1 text-slate-600 dark:text-slate-300">{detail.instructions}</p></div>
          <div><p className="font-semibold">Progress</p><div className="mt-2 flex items-center gap-3"><div className="flex-1"><Progress value={detail.progress} /></div><span>{detail.progress}%</span><input type="range" min={0} max={100} value={detail.progress} onChange={e => updateTask(detail.id, { progress: Number(e.target.value) })} aria-label="Update progress" className="w-32" /></div></div>
          <div><p className="font-semibold">Subtasks</p><ul className="mt-2 space-y-2">{detail.subtasks.map(s => <li key={s.id}><label className="flex items-center gap-2"><input type="checkbox" checked={s.done} onChange={() => { const subs = detail.subtasks.map(x => x.id === s.id ? { ...x, done: !x.done } : x); const done = subs.filter(x => x.done).length; updateTask(detail.id, { subtasks: subs, progress: Math.round(done / Math.max(1, subs.length) * 100) }); setDetail({ ...detail, subtasks: subs, progress: Math.round(done / Math.max(1, subs.length) * 100) }) }} className="h-4 w-4 accent-[#0F2A4A]" /> <span className={s.done ? 'line-through text-slate-400' : ''}>{s.title}</span></label></li>)}</ul></div>
          <div><p className="font-semibold">Milestones</p><ul className="mt-1 list-disc pl-5">{detail.milestones.map((m, i) => <li key={i}>{m}</li>)}</ul><p className="mt-2 font-semibold">Attachments (demo)</p><p className="text-slate-600 dark:text-slate-300">{detail.attachments.join(', ')}</p>{detail.delayReason && <p className="mt-2"><strong>Delay reason:</strong> {detail.delayReason}</p>}{detail.notes && <p className="mt-1"><strong>Notes:</strong> {detail.notes}</p>}</div>
          <div><p className="font-semibold">Comments & updates</p><ul className="mt-2 space-y-2">{detail.comments.map((c, i) => <li key={i} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><strong>{c.author}</strong> · {fmt(c.date)}<br />{c.text}</li>)}</ul><div className="mt-3 flex gap-2"><input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment or update…" className={inputCls} /><Btn onClick={() => { if (!comment.trim()) return; updateTask(detail.id, {}, comment); setDetail({ ...detail, comments: [...detail.comments, { author: 'Director', text: comment, date: new Date().toISOString().slice(0, 10) }] }); setComment(''); toast('success', 'Comment added.') }}>Add</Btn></div></div>
          <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
            {NEXT[detail.status].map(nxt => <Btn key={nxt} variant={nxt === 'Completed' ? 'primary' : 'secondary'} onClick={() => { move(detail, nxt); if (nxt !== 'Completed') setDetail({ ...detail, status: nxt }) }}>{nxt === 'In Progress' && detail.status === 'Submitted for Review' ? 'Return for Correction' : `Move to ${nxt}`}</Btn>)}
            <Btn variant="secondary" onClick={() => { setDetail(null); openForm(detail) }}>Edit / Reassign</Btn>
            <Btn variant="secondary" onClick={() => { setShowBlock(true) }}>Mark Blocked</Btn>
            <Btn variant="secondary" onClick={() => { const copy: Task = { ...detail, id: `TSK-${211 + tasks.length}`, title: detail.title + ' (copy)', status: 'Not Started', progress: 0, subtasks: detail.subtasks.map(s => ({ ...s, done: false })) }; upsertTask(copy); toast('success', 'Task duplicated.'); setDetail(copy) }}>Duplicate</Btn>
            <button onClick={() => setConfirmDelete(detail)} className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"><Trash2 size={16} /> Cancel task</button>
          </div>
          {detail.status === 'Submitted for Review' && <p className="rounded-xl bg-amber-50 p-3 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">This task is awaiting your review. Approve its completion, or return it for correction using the workflow buttons above.</p>}
        </div>}
      </Modal>
      <Modal open={showBlock} onClose={() => setShowBlock(false)} title="Mark task as blocked">
        <Field label="Blocked reason (required)"><textarea value={blockReason} onChange={e => setBlockReason(e.target.value)} className={inputCls} rows={3} placeholder="Why is this task blocked?" /></Field>
        <div className="mt-4 flex justify-end gap-2"><Btn variant="secondary" onClick={() => setShowBlock(false)}>Cancel</Btn><Btn variant="danger" onClick={() => { if (!detail || !blockReason.trim()) { toast('error', 'A blocked reason is required.'); return } updateTask(detail.id, { status: 'Blocked', blockedReason: blockReason }); toast('success', 'Task marked as blocked.'); setShowBlock(false); setDetail(null); setBlockReason('') }}>Confirm blocked</Btn></div>
      </Modal>
      <Confirm open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Cancel this task?" text="This removes the task from the demo dataset. This cannot be undone in this demo." confirmLabel="Cancel task" onConfirm={() => { if (confirmDelete) { deleteTask(confirmDelete.id); toast('success', 'Task cancelled.'); setDetail(null) } }} />
      <Confirm open={!!confirmComplete} onClose={() => setConfirmComplete(null)} title="Mark task as completed?" text="Completed tasks are no longer counted as overdue. Confirm that the work and evidence have been reviewed." confirmLabel="Mark completed" onConfirm={() => { if (confirmComplete) { updateTask(confirmComplete.id, { status: 'Completed', progress: 100 }); toast('success', 'Task completed.'); setDetail(null) } }} />
      <Modal open={formOpen} onClose={() => { setFormOpen(false); setParams({}) }} title={editing ? 'Edit task' : 'Create task'} wide>
        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <div className="sm:col-span-2"><Field label="Task title *" error={formErrors.title}><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="e.g. Finalise the December examination timetable" /></Field></div>
          <Field label="Detailed description"><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputCls} rows={3} /></Field>
          <Field label="Expected outcome"><textarea value={form.outcome} onChange={e => setForm({ ...form, outcome: e.target.value })} className={inputCls} rows={3} /></Field>
          <Field label="Task category"><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls}>{TASK_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Department"><select value={form.departmentId} onChange={e => { const d = e.target.value; setForm({ ...form, departmentId: d, responsibleId: staff.find(s => s.departmentId === d)?.id || '', teamIds: [] }) }} className={inputCls}>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
          <Field label="Responsible department head / person *" error={formErrors.responsible}><select value={form.responsibleId} onChange={e => setForm({ ...form, responsibleId: e.target.value })} className={inputCls}>{deptStaff.map(s => <option key={s.id} value={s.id}>{s.name} — {s.designation}</option>)}</select></Field>
          <Field label="Priority"><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Priority })} className={inputCls}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></Field>
          <Field label="Start date"><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className={inputCls} /></Field>
          <Field label="Due date *" error={formErrors.due}><input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className={inputCls} /></Field>
          <div className="sm:col-span-2"><Field label="Supporting team members"><div className="flex flex-wrap gap-2">{deptStaff.filter(s => s.id !== form.responsibleId).map(s => <label key={s.id} className={`cursor-pointer rounded-full border px-3 py-1.5 ${form.teamIds.includes(s.id) ? 'border-[#0F2A4A] bg-blue-50 text-blue-800' : 'border-slate-300'}`}><input type="checkbox" className="hidden" checked={form.teamIds.includes(s.id)} onChange={() => setForm({ ...form, teamIds: form.teamIds.includes(s.id) ? form.teamIds.filter(x => x !== s.id) : [...form.teamIds, s.id] })} />{s.name}</label>)}</div></Field></div>
          <div className="sm:col-span-2"><Field label="Subtasks"><div className="space-y-2">{form.subtasks.map((s, i) => <div key={i} className="flex gap-2"><input value={s} onChange={e => { const a = [...form.subtasks]; a[i] = e.target.value; setForm({ ...form, subtasks: a }) }} className={inputCls} placeholder={`Subtask ${i + 1}`} /><Btn variant="ghost" onClick={() => setForm({ ...form, subtasks: form.subtasks.filter((_, j) => j !== i) })}>Remove</Btn></div>)}<Btn variant="secondary" onClick={() => setForm({ ...form, subtasks: [...form.subtasks, ''] })}>+ Add subtask</Btn></div></Field></div>
          <div className="sm:col-span-2"><Field label="Milestones"><div className="space-y-2">{form.milestones.map((s, i) => <div key={i} className="flex gap-2"><input value={s} onChange={e => { const a = [...form.milestones]; a[i] = e.target.value; setForm({ ...form, milestones: a }) }} className={inputCls} placeholder={`Milestone ${i + 1}`} /><Btn variant="ghost" onClick={() => setForm({ ...form, milestones: form.milestones.filter((_, j) => j !== i) })}>Remove</Btn></div>)}<Btn variant="secondary" onClick={() => setForm({ ...form, milestones: [...form.milestones, ''] })}>+ Add milestone</Btn></div></Field></div>
          <Field label="Task instructions"><textarea value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} className={inputCls} rows={2} /></Field>
          <Field label="Additional notes"><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputCls} rows={2} /></Field>
          <div className="sm:col-span-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800">Supporting attachments are represented as demo files in this frontend build. Dependencies are tracked as free text in the task notes for this demo.</div>
        </div>
        <div className="mt-5 flex justify-end gap-2"><Btn variant="secondary" onClick={() => { setFormOpen(false); setParams({}) }}>Cancel</Btn><Btn onClick={submitForm}>{editing ? 'Save changes' : 'Create Task'}</Btn></div>
      </Modal>
    </div>
  )
}
