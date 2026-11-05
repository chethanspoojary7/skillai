import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { fmtDT, downloadCsv } from '../utils'
import { Btn, Card, DropdownSelect, Empty, RecordRow, SearchInput } from '../components/ui'
export default function ActivityPage() {
  const { activity, toast } = useApp(); const nav = useNavigate(); const [q, setQ] = useState(''); const [type, setType] = useState('All')
  const list = useMemo(() => activity.filter(a => (type === 'All' || a.recordType === type) && (a.action.toLowerCase().includes(q.toLowerCase()) || a.recordId.toLowerCase().includes(q.toLowerCase()) || a.actor.toLowerCase().includes(q.toLowerCase()))), [activity, q, type])
  return (
    <div className="space-y-5">
      <Card className="p-5"><div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"><strong>Demonstration activity log.</strong> This frontend-only log is not a secure or tamper-proof audit trail. Real audit history must be kept by a future backend.</div>
        <div className="mt-4 flex flex-wrap gap-3"><div className="w-72"><SearchInput value={q} onChange={setQ} placeholder="Search actor, action or record…" /></div><DropdownSelect ariaLabel="Filter by record type" value={type} onChange={setType} options={[{ value: 'All', label: 'All record types' }, ...['Approval', 'Task', 'System'].map(item => ({ value: item, label: item }))]} className="activity-type-filter" /><Btn variant="secondary" onClick={() => { downloadCsv('activity-log.csv', [['Timestamp', 'Actor', 'Action', 'Record type', 'Record ID', 'Description', 'From', 'To'], ...list.map(a => [a.date, a.actor, a.action, a.recordType, a.recordId, a.description, a.from || '', a.to || ''])]); toast('success', 'Activity log exported as CSV.') }}>Export CSV</Btn></div>
        <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[850px] text-sm"><thead><tr className="text-left text-xs uppercase text-slate-500"><th className="py-2">Timestamp</th><th>Actor</th><th>Action</th><th>Record</th><th>Description</th><th>Change</th></tr></thead><tbody>{list.map(a => {
          const canOpen = a.recordType === 'Approval' || a.recordType === 'Task'
          const onActivate = () => nav(`/${a.recordType === 'Approval' ? 'approvals' : 'tasks'}?open=${encodeURIComponent(a.recordId)}`)
          const cells = <><td className="py-3">{fmtDT(a.date)}</td><td>{a.actor}</td><td className="font-medium">{a.action}</td><td>{a.recordType} {a.recordId}</td><td>{a.description}</td><td>{a.from && a.to ? `${a.from} → ${a.to}` : '—'}</td></>
          return canOpen ? <RecordRow key={a.id} label={`Open ${a.recordType.toLowerCase()} ${a.recordId}`} onActivate={onActivate} className="border-t border-slate-100 dark:border-slate-800">{cells}</RecordRow> : <tr key={a.id} className="border-t border-slate-100 dark:border-slate-800">{cells}</tr>
        })}</tbody></table></div>
        {list.length === 0 && <div className="mt-4"><Empty title="No activity matches" text="Try a different search or filter." /></div>}
      </Card>
    </div>
  )
}
