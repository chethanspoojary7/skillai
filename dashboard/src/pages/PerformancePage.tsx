import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { departments, monthlyTrend, staff } from '../data/seed'
import { fmt, money, isOverdue } from '../utils'
import { Badge, Btn, Card, DoubleClickAction, DropdownSelect, Modal, Progress, RecordRow, SearchInput, statusTone } from '../components/ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts'
const COLORS = ['#0F2A4A', '#2563eb', '#f59e0b', '#10b981', '#ef4444']
export default function PerformancePage() {
  const { tasks, approvals, settings } = useApp(); const nav = useNavigate(); const location = useLocation(); const [params] = useSearchParams()
  const requestedSection = location.pathname.split('/')[2] || 'overview'
  const activeSection = ['overview', 'academic', 'finance', 'administration', 'departments', 'staff'].includes(requestedSection) ? requestedSection : 'overview'
  const [period, setPeriod] = useState(settings.reportingPeriod); const [dept, setDept] = useState(() => params.get('dept') || 'All'); const [staffFilter, setStaffFilter] = useState('All')
  const [selectedStaff, setSelectedStaff] = useState<typeof staff[0] | null>(null); const [selectedDept, setSelectedDept] = useState<typeof departments[0] | null>(null); const [q, setQ] = useState('')
  useEffect(() => {
    const requestedDept = params.get('dept')
    setDept(requestedDept && departments.some(department => department.id === requestedDept) ? requestedDept : 'All')
  }, [params])
  const deptTasks = (id: string) => tasks.filter(t => t.departmentId === id)
  const analysisTasksForDept = (id: string) => filteredTasks.filter(task => task.departmentId === id)
  const filteredDepts = dept === 'All' ? departments : departments.filter(d => d.id === dept)
  const filteredStaff = useMemo(() => staff.filter(s => (dept === 'All' || s.departmentId === dept) && (staffFilter === 'All' || s.id === staffFilter) && s.name.toLowerCase().includes(q.toLowerCase())), [dept, staffFilter, q])
  const filteredTasks = tasks.filter(task => (dept === 'All' || task.departmentId === dept) && (staffFilter === 'All' || task.responsibleId === staffFilter))
  const filteredApprovals = approvals.filter(approval => dept === 'All' || approval.departmentId === dept)
  const completed = filteredTasks.filter(t => t.status === 'Completed').length; const overdue = filteredTasks.filter(isOverdue).length
  const onTimeRate = filteredStaff.length ? Math.round(filteredStaff.reduce((total, member) => total + member.onTime, 0) / filteredStaff.length) : 0
  const achievementAverage = filteredDepts.length ? Math.round(filteredDepts.reduce((total, department) => total + department.achievement, 0) / filteredDepts.length) : 0
  const targetAverage = filteredDepts.length ? Math.round(filteredDepts.reduce((total, department) => total + department.target, 0) / filteredDepts.length) : 0
  const statusData = [{ name: 'Not Started', value: filteredTasks.filter(t => t.status === 'Not Started').length }, { name: 'In Progress', value: filteredTasks.filter(t => t.status === 'In Progress').length }, { name: 'Review', value: filteredTasks.filter(t => t.status === 'Submitted for Review').length }, { name: 'Completed', value: completed }, { name: 'Blocked', value: filteredTasks.filter(t => t.status === 'Blocked').length }]
  const trendData = period === 'Monthly' ? monthlyTrend.slice(-1) : period === 'Quarterly' ? monthlyTrend.slice(-3) : monthlyTrend
  const belowTarget = filteredDepts.filter(d => d.achievement < d.target)
  return (
    <div className="space-y-4">
      <Card className="p-3"><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <DropdownSelect ariaLabel="Reporting period" value={period} onChange={setPeriod} options={['Monthly', 'Quarterly', 'Semester', 'Academic year'].map(item => ({ value: item, label: item }))} />
        <DropdownSelect ariaLabel="Filter by department" value={dept} onChange={setDept} options={[{ value: 'All', label: 'All departments' }, ...departments.map(d => ({ value: d.id, label: d.name }))]} />
        <DropdownSelect ariaLabel="Filter by staff" value={staffFilter} onChange={setStaffFilter} options={[{ value: 'All', label: 'All staff' }, ...staff.map(s => ({ value: s.id, label: s.name }))]} />
      </div><p className="mt-2 text-xs text-slate-500">Showing: {period}{dept !== 'All' ? ` · ${departments.find(d => d.id === dept)?.name}` : ''}. Department and staff filters apply to the analysis below; the trend shows the available institute-wide monthly history for this period.</p></Card>
      <nav aria-label="Performance sections" className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex min-w-max gap-1">
          {[['Overview', 'overview'], ['Academic', 'academic'], ['Finance', 'finance'], ['Administration', 'administration'], ['Departments', 'departments'], ['Staff', 'staff']].map(([label, section]) => <NavLink key={section} to={`/performance/${section}${dept === 'All' ? '' : `?dept=${dept}`}`} end className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive || (section === 'overview' && location.pathname === '/performance') ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'}`}>{label}</NavLink>)}
        </div>
      </nav>
      {activeSection === 'overview' && <section className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-6">
        {[['Overall Institute Performance', `${achievementAverage}%`, `Target ${targetAverage}%`], ['Target Achievement', `${achievementAverage}%`, `${filteredDepts.filter(d => d.achievement >= d.target).length} of ${filteredDepts.length} departments at target`], ['Task Completion Rate', `${Math.round(completed / Math.max(1, filteredTasks.length) * 100)}%`, `${completed} of ${filteredTasks.length} tasks completed`], ['On-Time Completion Rate', `${onTimeRate}%`, 'Average reported rate for matching staff'], ['Department Performance Average', `${achievementAverage}%`, 'Mean of selected department achievement scores'], ['Approval Turnaround Time', '—', `${filteredApprovals.filter(a => a.status === 'Pending').length} pending in selected scope`]].map(([l, v, n]) => <Card key={l} className="p-3"><p className="text-xs leading-tight text-slate-500">{l}</p><p className="mt-1 text-xl font-bold">{v}</p><p className="mt-1 text-xs leading-tight text-slate-500">{n}</p></Card>)}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5 xl:col-span-2"><h3 className="font-semibold">Performance trend — actual vs target</h3><div className="mt-4 h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis domain={[70, 95]} /><Tooltip /><Legend /><Line type="monotone" dataKey="actual" name="Actual %" stroke="#0F2A4A" strokeWidth={2} /><Line type="monotone" dataKey="target" name="Target %" stroke="#f59e0b" strokeWidth={2} /></LineChart></ResponsiveContainer></div></Card>
        <Card className="p-5"><h3 className="font-semibold">Task status distribution</h3><div className="mt-4 h-72"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" outerRadius={100} label>{statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div></Card>
        <Card className="p-5"><h3 className="font-semibold">Department comparison</h3><div className="mt-4 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={filteredDepts.map(d => ({ name: d.short, achievement: d.achievement, target: d.target }))}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis domain={[0, 100]} /><Tooltip /><Legend /><Bar dataKey="achievement" name="Achievement %" fill="#0F2A4A" radius={[6, 6, 0, 0]} /><Bar dataKey="target" name="Target %" fill="#94a3b8" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
      </div>
      </section>}
      {activeSection === 'academic' && <section>
      <Card className="p-5"><h3 className="font-semibold">Academic performance</h3><p className="mt-2 text-sm text-slate-500">No academic performance records are available.</p></Card>
      </section>}
      {activeSection === 'finance' && <section>
      <Card className="p-5"><h3 className="font-semibold">Finance & resource performance</h3>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead><tr className="text-left text-xs uppercase text-slate-500"><th className="py-2">Department</th><th>Allocation</th><th>Spent</th><th>Remaining</th><th>Utilisation</th><th>Variance</th></tr></thead><tbody>{filteredDepts.map(d => <RecordRow key={d.id} label={`View ${d.name} department performance details`} onActivate={() => setSelectedDept(d)} className="border-t border-slate-100 dark:border-slate-800"><td className="py-2.5 font-medium">{d.name}</td><td>{money(d.budget)}</td><td>{money(d.spent)}</td><td>{money(d.budget - d.spent)}</td><td>{Math.round(d.spent / d.budget * 100)}%</td><td>{money(d.spent - d.budget)}</td></RecordRow>)}</tbody></table></div></Card>
      </section>}
      {activeSection === 'administration' && <section>
      <Card className="p-5"><h3 className="font-semibold">Administrative performance</h3><div className="mt-3 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3"><p><DoubleClickAction label="view pending approvals" onActivate={() => nav(`/approvals?status=Pending${dept === 'All' ? '' : `&dept=${dept}`}`)}>{filteredApprovals.filter(a => a.status === 'Pending').length}</DoubleClickAction><br />Pending requests</p><p><strong>{overdue}</strong><br />Overdue tasks</p><p><strong>{filteredTasks.filter(task => task.status !== 'Completed').length}</strong><br />Open tasks</p></div></Card>
      </section>}
      {activeSection === 'departments' && <section className="space-y-4">
      {belowTarget.length > 0 && <Card className="border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900 dark:bg-amber-900/20"><h3 className="font-semibold">Improvement actions — below target</h3><div className="mt-3 space-y-3">{belowTarget.map(d => <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 dark:bg-slate-900"><div><p className="font-medium">{d.name}</p><p className="text-sm text-slate-500">Achievement {d.achievement}% vs target {d.target}% — gap {d.target - d.achievement} points. Related tasks: {analysisTasksForDept(d.id).filter(t => t.status !== 'Completed').length} open.</p></div><Btn onClick={() => nav(`/tasks?new=1&dept=${d.id}&issue=${encodeURIComponent(d.name + ' performance gap')}&target=${d.target}%`)}>Create Improvement Task</Btn></div>)}</div></Card>}
      <Card className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">Department performance — double-click a department for detail</h3><span className="text-sm text-slate-500">Institute → Department → Staff → Task drill-down</span></div>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[800px] text-sm"><thead><tr className="text-left text-xs uppercase text-slate-500"><th className="py-2">Department</th><th>Head</th><th>Tasks</th><th>Completed</th><th>Overdue</th><th>Target %</th><th>Next task due</th></tr></thead><tbody>{filteredDepts.map(d => { const ts = analysisTasksForDept(d.id); return <RecordRow key={d.id} label={`View ${d.name} department performance details`} onActivate={() => setSelectedDept(d)} className="border-t border-slate-100 dark:border-slate-800"><td className="font-medium">{d.name}</td><td>{staff.find(s => s.id === d.headId)?.name}</td><td>{ts.length}</td><td>{ts.filter(t => t.status === 'Completed').length}</td><td>{ts.filter(isOverdue).length}</td><td>{d.achievement}%</td><td>{ts[0] ? fmt(ts[0].dueDate) : '—'}</td></RecordRow> })}</tbody></table></div></Card>
      </section>}
      {activeSection === 'staff' && <section>
      <Card className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">Staff performance</h3><div className="w-64"><SearchInput value={q} onChange={setQ} placeholder="Search staff…" /></div></div><p className="mt-1 text-xs text-slate-500">Staff are not ranked by task count alone — the table shows role targets, timeliness and quality together. Double-click a name for a profile.</p>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[850px] text-sm"><thead><tr className="text-left text-xs uppercase text-slate-500"><th className="py-2">Staff</th><th>Department</th><th>Assigned</th><th>Completed</th><th>On-time</th><th>Goal</th><th>Quality</th><th>Attendance</th></tr></thead><tbody>{filteredStaff.map(s => <RecordRow key={s.id} label={`View performance profile for ${s.name}`} onActivate={() => setSelectedStaff(s)} className="border-t border-slate-100 dark:border-slate-800"><td className="font-medium">{s.name}<br /><span className="text-xs font-normal text-slate-500">{s.designation}</span></td><td>{departments.find(d => d.id === s.departmentId)?.name}</td><td>{s.tasksAssigned}</td><td>{s.tasksCompleted}</td><td>{s.onTime}%</td><td>{s.goal}%</td><td>{s.quality}%</td><td>{s.attendance}%</td></RecordRow>)}</tbody></table></div>
        {filteredStaff.length === 0 && <div className="mt-4"><p className="text-sm text-slate-500">No staff match these filters.</p></div>}
      </Card>
      </section>}
      <Modal open={!!selectedStaff} onClose={() => setSelectedStaff(null)} title={selectedStaff?.name || ''}>
        {selectedStaff && <div className="space-y-3 text-sm"><p>{selectedStaff.designation} · {departments.find(d => d.id === selectedStaff.departmentId)?.name}</p><p>Email: {selectedStaff.email}</p><div className="grid grid-cols-2 gap-3"><p>Assigned tasks: <strong>{selectedStaff.tasksAssigned}</strong></p><p>Completed: <strong>{selectedStaff.tasksCompleted}</strong></p><p>On-time: <strong>{selectedStaff.onTime}%</strong></p><p>Goal achievement: <strong>{selectedStaff.goal}%</strong></p><p>Quality: <strong>{selectedStaff.quality}%</strong></p><p>Attendance: <strong>{selectedStaff.attendance}%</strong></p><p>Workload: <strong>{selectedStaff.workload}</strong></p></div><div className="flex gap-2"><Btn onClick={() => { setSelectedStaff(null); nav(`/tasks?resp=${selectedStaff.id}`) }}>View tasks</Btn><Btn variant="secondary" onClick={() => { setSelectedStaff(null); nav(`/tasks?new=1&dept=${selectedStaff.departmentId}`) }}>Assign task</Btn></div></div>}
      </Modal>
      <Modal open={!!selectedDept} onClose={() => setSelectedDept(null)} title={selectedDept?.name || ''}>
        {selectedDept && <div className="space-y-3 text-sm"><p>Head: {staff.find(s => s.id === selectedDept.headId)?.name || 'Not assigned'} · Students: {selectedDept.students}</p><p>Target: {selectedDept.target}% · Achievement: {selectedDept.achievement}%</p><p>Tasks: {analysisTasksForDept(selectedDept.id).length} · Completed: {analysisTasksForDept(selectedDept.id).filter(t => t.status === 'Completed').length} · Overdue: {analysisTasksForDept(selectedDept.id).filter(isOverdue).length}</p><p>Budget: {money(selectedDept.budget)} · Spent: {money(selectedDept.spent)}</p><Btn onClick={() => { setSelectedDept(null); nav(`/departments?dept=${selectedDept.id}`) }}>Open department detail</Btn><Btn variant="secondary" onClick={() => { setSelectedDept(null); nav(`/performance/departments?dept=${selectedDept.id}`) }}>View filtered analysis</Btn></div>}
      </Modal>
    </div>
  )
}
