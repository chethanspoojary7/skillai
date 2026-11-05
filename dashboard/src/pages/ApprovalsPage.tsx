import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download, Printer } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { departments } from '../data/seed'
import { CATEGORIES } from '../types'
import type { Approval, ApprovalStatus } from '../types'
import { fmt, money, downloadCsv, downloadText } from '../utils'
import { Badge, Btn, Card, DropdownSelect, Empty, Field, Modal, Pagination, RecordRow, SearchInput, inputCls, priorityTone, statusTone } from '../components/ui'
type SortKey = 'date' | 'title' | 'priority'
const priorityOptions = [
  { value: 'All', label: 'All priorities' },
  { value: 'Urgent', label: 'Urgent (High or Critical)' },
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
  { value: 'WaitingOverWeek', label: 'Waiting over a week' },
]
export default function ApprovalsPage() {
  const { approvals, decideApproval, toast, addNotification } = useApp()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(''); const [cat, setCat] = useState('All'); const [dept, setDept] = useState('All'); const [status, setStatus] = useState(params.get('status') || 'All'); const [prio, setPrio] = useState(params.get('priority') || (params.get('waiting') === 'week' ? 'WaitingOverWeek' : 'All')); const [from, setFrom] = useState(''); const [to, setTo] = useState('')
  const [sort, setSort] = useState<SortKey>('date'); const [page, setPage] = useState(1); const [size, setSize] = useState(10)
  const [detail, setDetail] = useState<Approval | null>(null); const [action, setAction] = useState<{ kind: ApprovalStatus; note: string } | null>(null)
  useEffect(() => {
    const requestedDept = params.get('dept')
    setDept(requestedDept && departments.some(department => department.id === requestedDept) ? requestedDept : 'All')
    setStatus(params.get('status') || 'All')
    setPrio(params.get('priority') || (params.get('waiting') === 'week' ? 'WaitingOverWeek' : 'All'))
    setPage(1)
  }, [params])
  useEffect(() => { const open = params.get('open'); if (open) { const a = approvals.find(x => x.id === open); if (a) setDetail(a) } }, [params, approvals])
  const deptName = (id: string) => departments.find(d => d.id === id)?.name || id
  const filtered = useMemo(() => {
    let list = [...approvals]
    const qq = q.toLowerCase()
    if (qq) list = list.filter(a => a.id.toLowerCase().includes(qq) || a.title.toLowerCase().includes(qq) || a.applicant.toLowerCase().includes(qq))
    if (cat !== 'All') list = list.filter(a => a.category === cat)
    if (dept !== 'All') list = list.filter(a => a.departmentId === dept)
    if (status !== 'All') list = list.filter(a => a.status === status)
    if (prio === 'Urgent') list = list.filter(a => a.status === 'Pending' && (a.priority === 'Critical' || a.priority === 'High'))
    else if (prio === 'WaitingOverWeek') list = list.filter(a => a.status === 'Pending' && (Date.now() - new Date(`${a.date}T00:00:00`).getTime()) / 86400000 > 7)
    else if (prio !== 'All') list = list.filter(a => a.priority === prio)
    if (from) list = list.filter(a => a.date >= from)
    if (to) list = list.filter(a => a.date <= to)
    const prioRank: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 }
    list.sort((a, b) => sort === 'date' ? b.date.localeCompare(a.date) : sort === 'title' ? a.title.localeCompare(b.title) : prioRank[a.priority] - prioRank[b.priority])
    return list
  }, [approvals, q, cat, dept, status, prio, from, to, sort])
  const pages = Math.max(1, Math.ceil(filtered.length / size)); const pageItems = filtered.slice((page - 1) * size, page * size)
  const stats = (s: ApprovalStatus) => approvals.filter(a => a.status === s).length
  const doAction = (kind: ApprovalStatus) => {
    if (!detail) return
    if (kind === 'Rejected' && !action?.note.trim()) { toast('error', 'A rejection reason is required.'); return }
    if (kind === 'Returned' && !action?.note.trim()) { toast('error', 'Please describe the corrections required.'); return }
    decideApproval(detail.id, kind, action?.note || '')
    addNotification({ title: `Approval ${kind.toLowerCase()}`, description: `${detail.id} — ${detail.title}`, date: new Date().toISOString(), category: 'Approval', link: '/approvals', recordId: detail.id })
    toast('success', `${detail.id} marked as ${kind}.`); setAction(null); setDetail(null)
  }
  const exportCsv = () => { downloadCsv('approvals.csv', [['ID', 'Title', 'Category', 'Applicant', 'Department', 'Date', 'Priority', 'Amount', 'Status'], ...filtered.map(a => [a.id, a.title, a.category, a.applicant, deptName(a.departmentId), a.date, a.priority, a.amount || '', a.status])]); toast('success', 'CSV exported from the currently filtered records.') }
  const reset = () => { setQ(''); setCat('All'); setDept('All'); setStatus('All'); setPrio('All'); setFrom(''); setTo(''); setPage(1); setParams({}) }
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {([['Pending', stats('Pending')], ['Approved', stats('Approved')], ['Rejected', stats('Rejected')], ['Returned for Correction', stats('Returned')], ['Urgent Requests', approvals.filter(a => a.status === 'Pending' && (a.priority === 'Critical' || a.priority === 'High')).length]] as [string, number][]).map(([label, v]) => <Card key={label as string} className="p-2.5"><p className="text-xs leading-tight text-slate-500">{label}</p><p className="mt-1 text-xl font-bold">{v}</p></Card>)}
      </div>
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">Approval requests</h3><div className="flex gap-2"><Btn variant="secondary" onClick={exportCsv}><Download size={16} /> Export CSV</Btn></div></div>
        <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <SearchInput value={q} onChange={v => { setQ(v); setPage(1) }} placeholder="Search ID, title, applicant…" />
          <DropdownSelect ariaLabel="Filter by approval category" value={cat} onChange={setCat} options={[{ value: 'All', label: 'All categories' }, ...CATEGORIES.map(category => ({ value: category, label: category }))]} />
          <DropdownSelect ariaLabel="Filter by department" value={dept} onChange={setDept} options={[{ value: 'All', label: 'All departments' }, ...departments.map(department => ({ value: department.id, label: department.name }))]} />
          <DropdownSelect ariaLabel="Filter by approval status" value={status} onChange={setStatus} options={[{ value: 'All', label: 'All statuses' }, ...['Pending', 'Approved', 'Rejected', 'Returned'].map(item => ({ value: item, label: item }))]} />
          <DropdownSelect ariaLabel="Filter by priority" value={prio} onChange={value => { setPrio(value); setPage(1) }} options={priorityOptions} />
          <div className="flex gap-2"><input type="date" value={from} onChange={e => setFrom(e.target.value)} className={inputCls} aria-label="From date" /><input type="date" value={to} onChange={e => setTo(e.target.value)} className={inputCls} aria-label="To date" /></div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm"><span>Sort:</span>{(['date', 'title', 'priority'] as SortKey[]).map(k => <button key={k} onClick={() => setSort(k)} className={`rounded-full px-3 py-1 capitalize ${sort === k ? 'bg-[#0F2A4A] text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{k}</button>)}<button onClick={reset} className="font-medium text-blue-700">Reset filters</button><span className="ml-auto flex items-center gap-2">Page size: <DropdownSelect ariaLabel="Page size" value={String(size)} onChange={value => { setSize(Number(value)); setPage(1) }} options={[5, 10, 20].map(value => ({ value: String(value), label: String(value) }))} className="page-size-dropdown" /></span></div>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[850px] text-sm"><thead><tr className="text-left text-xs uppercase text-slate-500"><th className="py-2">ID</th><th>Title</th><th>Category</th><th>Applicant</th><th>Department</th><th>Date</th><th>Priority</th><th>Amount</th><th>Status</th></tr></thead><tbody>
          {pageItems.map(a => <RecordRow key={a.id} label={`Review approval ${a.id}, ${a.title}`} onActivate={() => setDetail(a)} className={`border-t border-slate-100 dark:border-slate-800 ${a.priority === 'Critical' && a.status === 'Pending' ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}><td className="py-3 font-medium">{a.id}</td><td className="font-medium">{a.title}{a.awaitingInfo && <span className="ml-2 text-xs font-normal text-amber-600">· Awaiting info</span>}</td><td>{a.category}</td><td>{a.applicant}</td><td>{deptName(a.departmentId)}</td><td>{fmt(a.date)}</td><td><Badge text={a.priority} tone={priorityTone(a.priority)} /></td><td>{a.amount ? money(a.amount) : '—'}</td><td><Badge text={a.status} tone={statusTone(a.status)} /></td></RecordRow>)}
        </tbody></table></div>
        {filtered.length === 0 ? <div className="mt-4"><Empty title="No approvals match these filters" text="Try clearing a filter or searching a different term." /></div> : <div className="mt-4 flex justify-end"><Pagination page={page} pages={pages} onPage={setPage} total={filtered.length} /></div>}
      </Card>
      <Modal open={!!detail} onClose={() => { setDetail(null); setAction(null) }} title={detail ? `${detail.id} — ${detail.title}` : ''} wide>
        {detail && <div className="space-y-5 text-sm">
          <div className="flex flex-wrap gap-2"><Badge text={detail.status} tone={statusTone(detail.status)} /><Badge text={detail.priority} tone={priorityTone(detail.priority)} /><Badge text={detail.category} tone="blue" />{detail.awaitingInfo && <Badge text="Awaiting additional information" tone="amber" />}</div>
          <div className="grid gap-4 sm:grid-cols-2"><div><p className="text-slate-500">Applicant</p><p className="font-medium">{detail.applicant} · {detail.applicantId}</p></div><div><p className="text-slate-500">Department</p><p className="font-medium">{deptName(detail.departmentId)}</p></div><div><p className="text-slate-500">Submitted</p><p className="font-medium">{fmt(detail.date)}</p></div><div><p className="text-slate-500">Amount</p><p className="font-medium">{detail.amount ? money(detail.amount) : 'Not applicable'}</p></div></div>
          <div><p className="font-semibold">Description</p><p className="mt-1 text-slate-600 dark:text-slate-300">{detail.description}</p></div>
          <div><p className="font-semibold">Justification</p><p className="mt-1 text-slate-600 dark:text-slate-300">{detail.justification}</p></div>
          <div><p className="font-semibold">Supporting documents (demo)</p><ul className="mt-2 space-y-1">{detail.attachments.map((f, i) => <li key={i}><button className="text-blue-700 hover:underline" onClick={() => toast('info', 'Attachment preview is a demo — no real file is opened.')}>{f}</button></li>)}</ul></div>
          <div><p className="font-semibold">Approval timeline & history</p><ul className="mt-2 space-y-1">{detail.history.map((h, i) => <li key={i} className="text-slate-600 dark:text-slate-300">{fmt(h.date)} — {h.action} by {h.actor}</li>)}</ul></div>
          {detail.comments.length > 0 && <div><p className="font-semibold">Comments</p><ul className="mt-2 space-y-2">{detail.comments.map((c, i) => <li key={i} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><strong>{c.author}</strong> · {fmt(c.date)}<br />{c.text}</li>)}</ul></div>}
          {detail.status === 'Pending' ? <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            {!action ? <div className="flex flex-wrap gap-2"><Btn onClick={() => setAction({ kind: 'Approved', note: '' })}>Approve</Btn><Btn variant="danger" onClick={() => setAction({ kind: 'Rejected', note: '' })}>Reject</Btn><Btn variant="secondary" onClick={() => setAction({ kind: 'Returned', note: '' })}>Return for Correction</Btn><Btn variant="ghost" onClick={() => { downloadText(`${detail.id}-summary.txt`, `${detail.id}\n${detail.title}\nApplicant: ${detail.applicant}\nDepartment: ${deptName(detail.departmentId)}\nStatus: ${detail.status}\n${detail.description}`); toast('success', 'Printable summary downloaded as a text file.') }}><Printer size={16} /> Printable summary</Btn></div>
            : <div><Field label={action.kind === 'Approved' ? 'Comment (optional)' : action.kind === 'Rejected' ? 'Rejection reason (required)' : 'Corrections required (required)'}><textarea value={action.note} onChange={e => setAction({ ...action, note: e.target.value })} className={inputCls} rows={3} placeholder="Add a note for the applicant…" /></Field><div className="mt-3 flex gap-2"><Btn variant={action.kind === 'Rejected' ? 'danger' : 'primary'} onClick={() => doAction(action.kind)}>Confirm {action.kind}</Btn><Btn variant="secondary" onClick={() => setAction(null)}>Back</Btn></div></div>}
          </div> : <p className="rounded-xl bg-slate-50 p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">This request has been finalised as <strong>{detail.status}</strong> and can no longer be actioned. It will not appear in the pending list.</p>}
        </div>}
      </Modal>
    </div>
  )
}
