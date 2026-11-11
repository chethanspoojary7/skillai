import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download, Eye, Printer, X } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { departments } from '../data/seed'
import type { Approval, ApprovalStatus } from '../types'
import { fmt, money, downloadCsv, downloadText } from '../utils'
import { Badge, Btn, Card, DropdownSelect, Empty, Field, Modal, Pagination, RecordRow, SearchInput, inputCls, statusTone } from '../components/ui'
type SortKey = 'date' | 'title'
export default function ApprovalsPage() {
  const { approvals, dismissedApprovalIds, decideApproval, toast, addNotification } = useApp()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(''); const [status, setStatus] = useState(params.get('status') || 'Pending'); const [from, setFrom] = useState(''); const [to, setTo] = useState('')
  const [sort, setSort] = useState<SortKey>('date'); const [page, setPage] = useState(1); const [size, setSize] = useState(10)
  const [detail, setDetail] = useState<Approval | null>(null); const [action, setAction] = useState<{ kind: ApprovalStatus; note: string } | null>(null)
  const dismissedApprovalSet = useMemo(() => new Set(dismissedApprovalIds), [dismissedApprovalIds])
  useEffect(() => {
    setStatus(params.get('status') || 'Pending')
    setPage(1)
  }, [params])
  useEffect(() => { const open = params.get('open'); if (open) { const a = approvals.find(x => x.id === open && x.category === 'Fee Concession'); if (a) setDetail(a) } }, [params, approvals])
  const deptName = (id: string) => departments.find(d => d.id === id)?.name || id
  const filtered = useMemo(() => {
    let list = approvals.filter(a => a.category === 'Fee Concession' && !dismissedApprovalSet.has(a.id))
    const qq = q.toLowerCase()
    if (qq) list = list.filter(a => a.id.toLowerCase().includes(qq) || a.title.toLowerCase().includes(qq) || a.applicant.toLowerCase().includes(qq))
    if (status !== 'All') list = list.filter(a => a.status === status)
    if (from) list = list.filter(a => a.date >= from)
    if (to) list = list.filter(a => a.date <= to)
    list.sort((a, b) => sort === 'date' ? b.date.localeCompare(a.date) : a.title.localeCompare(b.title))
    return list
  }, [approvals, dismissedApprovalSet, q, status, from, to, sort])
  const pages = Math.max(1, Math.ceil(filtered.length / size)); const pageItems = filtered.slice((page - 1) * size, page * size)
  useEffect(() => { if (page > pages) setPage(pages) }, [page, pages])
  const feeConcessionApprovals = approvals.filter(a => a.category === 'Fee Concession' && !dismissedApprovalSet.has(a.id))
  const stats = (s: ApprovalStatus) => feeConcessionApprovals.filter(a => a.status === s).length
  const doAction = (kind: ApprovalStatus) => {
    if (!detail) return
    if (kind === 'Rejected' && !action?.note.trim()) { toast('error', 'A rejection reason is required.'); return }
    if (kind === 'Returned' && !action?.note.trim()) { toast('error', 'Please describe the corrections required.'); return }
    decideApproval(detail.id, kind, action?.note || '')
    addNotification({ title: `Approval ${kind.toLowerCase()}`, description: `${detail.id} — ${detail.title}`, date: new Date().toISOString(), category: 'Approval', link: '/approvals', recordId: detail.id })
    toast('success', `${detail.id} marked as ${kind}.`); setAction(null); setDetail(null)
  }
  const exportCsv = () => { downloadCsv('approvals.csv', [['ID', 'Title', 'Applicant', 'Department', 'Date', 'Amount', 'Status'], ...filtered.map(a => [a.id, a.title, a.applicant, deptName(a.departmentId), a.date, a.amount || '', a.status])]); toast('success', 'CSV exported from the currently filtered records.') }
  const reset = () => { setQ(''); setStatus('Pending'); setFrom(''); setTo(''); setPage(1); setParams({}) }
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {([['Pending', stats('Pending')], ['Approved', stats('Approved')], ['Rejected', stats('Rejected')], ['Returned for Correction', stats('Returned')], ['Total Requests', feeConcessionApprovals.length]] as [string, number][]).map(([label, v]) => <Card key={label as string} className="p-2.5"><p className="text-xs leading-tight text-slate-500">{label}</p><p className="mt-1 text-xl font-bold">{v}</p></Card>)}
      </div>
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">{status === 'Pending' ? 'Pending fee concession requests' : 'Fee concession requests'}</h3><div className="flex gap-2"><Btn variant="secondary" onClick={exportCsv}><Download size={16} /> Export CSV</Btn></div></div>
        <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          <SearchInput value={q} onChange={v => { setQ(v); setPage(1) }} placeholder="Search ID, title, applicant…" />
          <DropdownSelect ariaLabel="Filter by approval status" value={status} onChange={value => { setStatus(value); setPage(1); setParams(value === 'Pending' ? {} : { status: value }) }} options={[{ value: 'All', label: 'All statuses' }, ...['Pending', 'Approved', 'Rejected', 'Returned'].map(item => ({ value: item, label: item }))]} />
          <div className="flex gap-2"><input type="date" value={from} onChange={e => setFrom(e.target.value)} className={inputCls} aria-label="From date" /><input type="date" value={to} onChange={e => setTo(e.target.value)} className={inputCls} aria-label="To date" /></div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm"><span>Sort:</span>{(['date', 'title'] as SortKey[]).map(k => <button key={k} onClick={() => setSort(k)} className={`rounded-full px-3 py-1 capitalize ${sort === k ? 'bg-[#0F2A4A] text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{k}</button>)}<button onClick={reset} className="font-medium text-blue-700">Reset filters</button><span className="ml-auto flex items-center gap-2">Page size: <DropdownSelect ariaLabel="Page size" value={String(size)} onChange={value => { setSize(Number(value)); setPage(1) }} options={[5, 10, 20].map(value => ({ value: String(value), label: String(value) }))} className="page-size-dropdown" /></span></div>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[800px] text-sm"><thead><tr className="text-left text-xs uppercase text-slate-500"><th className="py-2">ID</th><th>Title</th><th>Applicant</th><th>Department</th><th>Date</th><th>Amount</th><th>Status</th><th><span className="sr-only">View</span></th></tr></thead><tbody>
          {pageItems.map(a => <RecordRow key={a.id} label={`Review fee concession ${a.id}, ${a.title}`} onActivate={() => setDetail(a)} className="border-t border-slate-100 dark:border-slate-800"><td className="py-3 font-medium">{a.id}</td><td className="font-medium">{a.title}{a.awaitingInfo && <span className="ml-2 text-xs font-normal text-amber-600">· Awaiting info</span>}</td><td>{a.applicant}</td><td>{deptName(a.departmentId)}</td><td>{fmt(a.date)}</td><td>{a.amount ? money(a.amount) : '—'}</td><td><Badge text={a.status} tone={statusTone(a.status)} /></td><td><button type="button" aria-label={`View ${a.id}`} title="View request" onClick={() => setDetail(a)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-700"><Eye size={17} /></button></td></RecordRow>)}
        </tbody></table></div>
        {filtered.length === 0 ? <div className="mt-4"><Empty title="No fee concession requests match these filters" text="Try clearing a filter or searching a different term." /></div> : <div className="mt-4 flex justify-end"><Pagination page={page} pages={pages} onPage={setPage} total={filtered.length} /></div>}
      </Card>
      <Modal open={!!detail} onClose={() => { setDetail(null); setAction(null) }} title={detail ? `${detail.id} — ${detail.title}` : ''} wide className="approval-review-modal">
        {detail && <div className="approval-modal-content text-sm">
          <div className="approval-form-paper">
            <button type="button" className="approval-modal-close" aria-label="Close approval request" onClick={() => { setDetail(null); setAction(null) }}><X size={18} /></button>
            <div className="skillai-wordmark"><span>Skill</span><strong>AI</strong><small>learn skill get job</small></div>
            <h3 className="approval-document-title">FEE CONCESSION FORM</h3>
            <div className="approval-document-meta">
              <div><strong>CONCESSION NO:</strong><span>{detail.id}</span></div>
              <div><strong>DATE:</strong><span>{fmt(detail.date)}</span></div>
              <Badge text={detail.status} tone={statusTone(detail.status)} />
            </div>
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
              <div><p className="text-xs font-semibold tracking-[0.16em] text-slate-500">FEE CONCESSION FORM</p><p className="mt-1 text-xs text-slate-500">Concession No: {detail.id} <span className="px-2">·</span> Date: {fmt(detail.date)}</p></div>
              <div className="flex flex-wrap gap-2"><Badge text={detail.status} tone={statusTone(detail.status)} /><Badge text="Fee Concession" tone="blue" /></div>
            </header>

            <section>
              <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">01&nbsp; STUDENT &amp; COURSE DETAILS</h4>
              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ['Student Name', detail.applicant],
                  ['Branch / Centre Name', deptName(detail.departmentId)],
                  ['Application No.', detail.applicantId],
                  ['Requested Date', fmt(detail.date)],
                  ['Student Contact No.', detail.studentContact || '—'],
                  ['Total Fees (Incl. GST)', detail.totalFees ? money(detail.totalFees) : '—'],
                  ['Course / Programme', detail.course || '—'],
                  ['Requested Discount', detail.amount ? money(detail.amount) : '—'],
                  ['Course Duration', detail.courseDuration || '—'],
                  ['Amount Already Paid', detail.amountPaid ? money(detail.amountPaid) : '—'],
                  ['Starting Date', detail.startingDate ? fmt(detail.startingDate) : '—'],
                  ['Net Payable After Discount', detail.totalFees ? money(detail.totalFees - (detail.amount || 0)) : '—'],
                ].map(([label, value]) => <div key={label} className="border-b border-slate-100 pb-2 dark:border-slate-700"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{value}</p></div>)}
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-white">02&nbsp; CONCESSION REQUEST</h4>
              <div><p className="text-xs text-slate-500">Concession Type</p><p className="mt-1 font-medium">{detail.concessionType || '—'}</p></div>
              <div><p className="text-xs text-slate-500">Reason for Discount / Supporting Details</p><p className="mt-1 text-slate-700 dark:text-slate-200">{detail.justification}</p><p className="mt-2 text-slate-700 dark:text-slate-200">{detail.description}</p></div>
              <p className="rounded-lg bg-slate-50 p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">Student Declaration: I request consideration of the above concession and confirm that the information provided is true and complete.</p>
              <p className="pt-2 text-slate-500">Student Signature: <span className="ml-2 inline-block w-48 border-b border-slate-300 dark:border-slate-600" /></p>
            </section>

            <section>
              <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">03&nbsp; OFFICE REVIEW &amp; APPROVAL</h4>
              <div className="grid gap-5 sm:grid-cols-3">
                {['Sales Head', 'Manager', 'Director & CEO'].map(role => <div key={role} className="border-b border-slate-200 pb-3 dark:border-slate-700"><p className="font-medium uppercase">{role}</p><p className="mt-6 text-xs text-slate-500">Signature</p></div>)}
              </div>
            </section>

            <section>
              <h4 className="font-semibold text-slate-900 dark:text-white">Approval timeline &amp; history</h4>
              <ul className="mt-2 space-y-1">{detail.history.map((h, i) => <li key={i} className="text-slate-600 dark:text-slate-300">{fmt(h.date)} — {h.action} by {h.actor}</li>)}</ul>
              {detail.comments.length > 0 && <ul className="mt-2 space-y-2">{detail.comments.map((c, i) => <li key={i} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><strong>{c.author}</strong> · {fmt(c.date)}<br />{c.text}</li>)}</ul>}
            </section>
            <p className="text-center text-[10px] font-medium tracking-wider text-slate-500">CONFIDENTIAL · FOR INTERNAL ADMINISTRATIVE USE ONLY</p>
          </div>
          <footer className="approval-workflow-footer sticky bottom-[-1rem] z-10 -mx-4 -mb-4 flex flex-wrap items-center gap-2 border-t p-4">
            {detail.status === 'Pending' && !action && <>
              <Btn onClick={() => setAction({ kind: 'Approved', note: '' })}>Approve</Btn>
              <Btn variant="danger" onClick={() => setAction({ kind: 'Rejected', note: '' })}>Reject</Btn>
              <Btn variant="secondary" onClick={() => setAction({ kind: 'Returned', note: '' })}>Return for Correction</Btn>
            </>}
            {detail.status === 'Pending' && action && <div className="flex w-full flex-wrap items-end gap-2">
              <Field label={action.kind === 'Approved' ? 'Comment (optional)' : action.kind === 'Rejected' ? 'Rejection reason (required)' : 'Corrections required (required)'}><textarea value={action.note} onChange={e => setAction({ ...action, note: e.target.value })} className={inputCls} rows={2} placeholder="Add a note for the applicant…" /></Field>
              <Btn variant={action.kind === 'Rejected' ? 'danger' : 'primary'} onClick={() => doAction(action.kind)}>Confirm {action.kind}</Btn>
              <Btn variant="secondary" onClick={() => setAction(null)}>Back</Btn>
            </div>}
            {detail.status !== 'Pending' && <p className="text-slate-600 dark:text-slate-300">This request has been finalised as <strong>{detail.status}</strong>.</p>}
            <Btn variant="ghost" className="ml-auto" onClick={() => { downloadText(`${detail.id}-summary.txt`, `${detail.id}\n${detail.title}\nApplicant: ${detail.applicant}\nDepartment: ${deptName(detail.departmentId)}\nStatus: ${detail.status}\n${detail.description}`); toast('success', 'Printable summary downloaded as a text file.') }}><Printer size={16} /> Printable summary</Btn>
          </footer>
        </div>}
      </Modal>
    </div>
  )
}
