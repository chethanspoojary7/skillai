import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { departments } from '../data/seed'
import { fmt, money, downloadCsv, downloadText } from '../utils'
import { Btn, Card, DropdownSelect, Field } from '../components/ui'
const CATS = ['Approval Summary Report', 'Task Completion Report', 'Overdue Task Report', 'Department Performance Report', 'Staff Performance Report', 'Academic Performance Report', 'Financial Summary Report', 'Institute Overview Report', 'Activity and Audit Report']
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
export default function ReportsPage() {
  const { approvals, tasks, staff, activity, settings } = useApp()
  const [params] = useSearchParams()
  const [category, setCategory] = useState(CATS[0]); const [period, setPeriod] = useState(settings.reportingPeriod); const [dept, setDept] = useState(() => params.get('dept') || 'All'); const [metrics, setMetrics] = useState<string[]>(['Counts', 'Completion rates']); const [generated, setGenerated] = useState(false); const [loading, setLoading] = useState(false)
  useEffect(() => {
    const requestedDept = params.get('dept')
    setDept(requestedDept && departments.some(department => department.id === requestedDept) ? requestedDept : 'All')
    setGenerated(false)
  }, [params])
  const rows = useMemo(() => {
    const deptTasks = dept === 'All' ? tasks : tasks.filter(t => t.departmentId === dept)
    const deptApprovals = dept === 'All' ? approvals : approvals.filter(a => a.departmentId === dept)
    const departmentRecordIds = new Set([...deptTasks.map(task => task.id), ...deptApprovals.map(approval => approval.id)])
    const now = new Date()
    const months = period === 'Monthly' ? 1 : period === 'Quarterly' ? 3 : period === 'Semester' ? 6 : 12
    const start = dateKey(period === 'Academic year'
      ? new Date(now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1, 6, 1)
      : new Date(now.getFullYear(), now.getMonth() - months + 1, 1))
    const end = dateKey(period === 'Academic year'
      ? new Date(Number(start.slice(0, 4)) + 1, 5, 30)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0))
    const inPeriod = (date: string) => date.slice(0, 10) >= start && date.slice(0, 10) <= end
    switch (category) {
      case 'Approval Summary Report': return deptApprovals.filter(a => inPeriod(a.date)).map(a => [a.id, a.title, a.status, a.priority, a.date])
      case 'Overdue Task Report': return deptTasks.filter(t => t.status !== 'Completed' && t.dueDate < dateKey(now) && inPeriod(t.dueDate)).map(t => [t.id, t.title, `${t.dueDate} ${t.dueTime || ''}`.trim(), t.status])
      case 'Department Performance Report': return (dept === 'All' ? departments : departments.filter(d => d.id === dept)).map(d => [d.name, d.target + '%', d.achievement + '%', money(d.budget), money(d.spent)])
      case 'Staff Performance Report': return staff.filter(s => dept === 'All' || s.departmentId === dept).map(s => [s.id, s.name, s.tasksAssigned, s.tasksCompleted, s.onTime + '%', s.goal + '%'])
      case 'Activity and Audit Report': return activity.filter(item => (dept === 'All' || departmentRecordIds.has(item.recordId)) && inPeriod(item.date)).slice(0, 30).map(a => [a.date, a.actor, a.action, a.recordType, a.recordId])
      default: return deptTasks.filter(t => inPeriod(t.dueDate)).map(t => [t.id, t.title, t.status, t.progress + '%', `${t.dueDate} ${t.dueTime || ''}`.trim()])
    }
  }, [category, dept, period, tasks, approvals, staff, activity])
  const generate = () => { setLoading(true); setTimeout(() => { setLoading(false); setGenerated(true) }, 600) }
  const exportCurrent = () => { if (!generated) return; downloadCsv('report.csv', [['Report', category], ['Period', period], ['Department', dept === 'All' ? 'All departments' : dept], [], ...rows]); }
  return (
    <div className="space-y-5">
      <Card className="p-5"><h3 className="font-semibold">Generate a report</h3><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Report category"><DropdownSelect ariaLabel="Report category" value={category} onChange={value => { setCategory(value); setGenerated(false) }} options={CATS.map(item => ({ value: item, label: item }))} /></Field>
        <Field label="Reporting period"><DropdownSelect ariaLabel="Reporting period" value={period} onChange={value => { setPeriod(value); setGenerated(false) }} options={['Monthly', 'Quarterly', 'Semester', 'Academic year'].map(item => ({ value: item, label: item }))} /></Field>
        <Field label="Department"><DropdownSelect ariaLabel="Department" value={dept} onChange={setDept} options={[{ value: 'All', label: 'All departments' }, ...departments.map(d => ({ value: d.id, label: d.name }))]} /></Field>
        <Field label="Metrics"><div className="flex flex-wrap gap-2">{['Counts', 'Completion rates', 'Overdue items', 'Targets'].map(m => <label key={m} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs ${metrics.includes(m) ? 'border-[#0F2A4A] bg-blue-50 text-blue-800' : 'border-slate-300'}`}><input type="checkbox" className="hidden" checked={metrics.includes(m)} onChange={() => setMetrics(metrics.includes(m) ? metrics.filter(x => x !== m) : [...metrics, m])} />{m}</label>)}</div></Field>
      </div><div className="mt-5 flex flex-wrap gap-2"><Btn onClick={generate} disabled={loading}>{loading ? 'Generating…' : 'Preview report'}</Btn><Btn variant="secondary" onClick={exportCurrent} disabled={!generated}>Export CSV</Btn><Btn variant="secondary" onClick={() => { if (!generated) return; window.print() }}>Print report</Btn><Btn variant="secondary" onClick={() => { if (!generated) return; downloadText('report.txt', `${category}\nPeriod: ${period}\nDepartment: ${dept}\n\n${rows.map(r => r.join(' | ')).join('\n')}\n\nNote: This is a client-side text export from demo data. A formatted PDF export is not included in this build.`); }}>Download text summary (PDF alternative)</Btn></div><p className="mt-3 text-xs text-slate-500">Reports are generated from the frontend demo dataset and respect the filters above. No download notification is shown unless a file is actually generated. A formatted PDF library was deliberately not added, to keep the bundle lean — the text summary export covers the same content.</p></Card>
      {loading && <Card className="p-5"><p className="text-sm text-slate-500">Generating report preview…</p></Card>}
      {generated && !loading && <Card className="p-5"><div className="flex flex-wrap justify-between gap-2"><div><h3 className="font-semibold">{category}</h3><p className="text-sm text-slate-500">{period} · {dept === 'All' ? 'All departments' : departments.find(d => d.id === dept)?.name} · Metrics: {metrics.join(', ') || 'None selected'} · {rows.length} rows · Demo data</p></div><span className="text-xs text-slate-500">Generated {new Date().toLocaleString('en-IN')}</span></div>
        {rows.length === 0 ? <p className="mt-4 text-sm text-slate-500">No records match this report and filter combination.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><tbody>{rows.slice(0, 25).map((r, i) => <tr key={i} className="border-t border-slate-100 dark:border-slate-800">{r.map((c, j) => <td key={j} className={`py-2 pr-4 ${j === 0 ? 'font-medium' : ''}`}>{c}</td>)}</tr>)}</tbody></table></div>}
        <p className="mt-3 text-xs text-slate-500">Preview shows the first 25 rows; the CSV export contains all rows.</p></Card>}
      {!generated && !loading && <Card className="p-5"><p className="text-sm text-slate-500">Choose a category and period, then preview the report. Nothing is generated until you ask for it.</p></Card>}
    </div>
  )
}
