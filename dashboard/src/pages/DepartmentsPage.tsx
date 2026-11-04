import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { departments } from '../data/seed'
import { isOverdue } from '../utils'
import { Badge, Btn, Card, Modal, Field, Progress, SearchInput, inputCls } from '../components/ui'
import type { Staff } from '../types'
export default function DepartmentsPage() {
  const { staff, tasks, approvals, updateStaff, toast } = useApp(); const nav = useNavigate(); const [params] = useSearchParams()
  const [deptDetail, setDeptDetail] = useState<typeof departments[0] | null>(null); const [staffDetail, setStaffDetail] = useState<Staff | null>(null); const [editing, setEditing] = useState<Staff | null>(null)
  const [q, setQ] = useState(''); const [dept, setDept] = useState('All'); const [workload, setWorkload] = useState('All')
  useEffect(() => {
    const d = params.get('dept'); if (d) { const dep = departments.find(x => x.id === d); if (dep) setDeptDetail(dep) }
    const s = params.get('staff'); if (s) { const st = staff.find(x => x.id === s); if (st) setStaffDetail(st) }
  }, [params, staff])
  const deptName = (id: string) => departments.find(d => d.id === id)?.name || id
  const filteredStaff = staff.filter(s => (dept === 'All' || s.departmentId === dept) && (workload === 'All' || s.workload === workload) && (s.name.toLowerCase().includes(q.toLowerCase()) || s.designation.toLowerCase().includes(q.toLowerCase())))
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Department directory</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {departments.map(d => { const ts = tasks.filter(t => t.departmentId === d.id); const done = ts.filter(t => t.status === 'Completed').length; const rate = ts.length ? Math.round(done / ts.length * 100) : 0; return (
          <Card key={d.id} className="p-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate text-sm font-semibold">{d.name}</h3><p className="truncate text-xs text-slate-500">Head: {staff.find(s => s.id === d.headId)?.name}</p></div><span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">{d.short}</span></div>
          <div className="mt-3 grid grid-cols-3 gap-1 text-center"><div><p className="text-sm font-bold">{staff.filter(s => s.departmentId === d.id).length}</p><p className="text-[10px] text-slate-500">Staff</p></div><div><p className="text-sm font-bold">{ts.length}</p><p className="text-[10px] text-slate-500">Tasks</p></div><div><p className="text-sm font-bold">{rate}%</p><p className="text-[10px] text-slate-500">Complete</p></div></div>
          <div className="mt-2"><Progress value={rate} /></div><p className="mt-2 text-xs text-slate-500">Performance: {d.achievement}% / {d.target}% target · {d.students} students</p>
          <Btn variant="secondary" className="mt-3 w-full py-1 text-xs" onClick={() => setDeptDetail(d)}>Department details</Btn></Card>) })}
      </div>
      <Card className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">Staff directory</h3><div className="flex flex-wrap gap-3"><div className="w-64"><SearchInput value={q} onChange={setQ} placeholder="Search staff or designation…" /></div><select aria-label="Filter by department" value={dept} onChange={e => setDept(e.target.value)} className={inputCls}><option value="All">All departments</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select><select aria-label="Filter by workload" value={workload} onChange={e => setWorkload(e.target.value)} className={inputCls}><option value="All">All workload levels</option><option>Light</option><option>Balanced</option><option>Heavy</option></select></div></div>
        <p className="mt-1 text-xs text-slate-500">Fictional demonstration contact details only. No sensitive personal or financial information is shown.</p>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead><tr className="text-left text-xs uppercase text-slate-500"><th className="py-2">Staff ID</th><th>Name</th><th>Designation</th><th>Department</th><th>Work email</th><th>Assigned</th><th>Workload</th><th>Performance</th><th>Actions</th></tr></thead><tbody>{filteredStaff.map(s => <tr key={s.id} className="border-t border-slate-100 dark:border-slate-800"><td className="py-3 font-medium">{s.id}</td><td><button className="font-medium text-blue-700 hover:underline" onClick={() => setStaffDetail(s)}>{s.name}</button></td><td>{s.designation}</td><td>{deptName(s.departmentId)}</td><td>{s.email}</td><td>{s.tasksAssigned}</td><td><Badge text={s.workload} tone={s.workload === 'Heavy' ? 'amber' : s.workload === 'Light' ? 'blue' : 'slate'} /></td><td>{s.goal}% goal · {s.onTime}% on-time</td><td><div className="flex gap-1"><Btn variant="ghost" className="px-2 py-1" onClick={() => setEditing(s)}>Edit</Btn><Btn variant="ghost" className="px-2 py-1" onClick={() => nav(`/tasks?new=1&dept=${s.departmentId}`)}>Assign task</Btn><Btn variant="ghost" className="px-2 py-1" onClick={() => nav('/performance')}>Performance</Btn></div></td></tr>)}</tbody></table></div>
        {filteredStaff.length === 0 && <p className="mt-4 text-sm text-slate-500">No staff match these filters.</p>}
      </Card>
      <Modal open={!!deptDetail} onClose={() => setDeptDetail(null)} title={deptDetail?.name || ''} wide>
        {deptDetail && <div className="space-y-4 text-sm">
          <p>Head: {staff.find(s => s.id === deptDetail.headId)?.name} · Students: {deptDetail.students} · Target: {deptDetail.target}% · Achievement: {deptDetail.achievement}%</p>
          <div><p className="font-semibold">Staff in this department</p><ul className="mt-2 space-y-1">{staff.filter(s => s.departmentId === deptDetail.id).map(s => <li key={s.id}>{s.name} — {s.designation}</li>)}</ul></div>
          <div><p className="font-semibold">Tasks</p><p>Active: {tasks.filter(t => t.departmentId === deptDetail.id && t.status !== 'Completed').length} · Completed: {tasks.filter(t => t.departmentId === deptDetail.id && t.status === 'Completed').length} · Overdue: {tasks.filter(t => t.departmentId === deptDetail.id && isOverdue(t)).length}</p></div>
          <div><p className="font-semibold">Pending approvals</p><p>{approvals.filter(a => a.departmentId === deptDetail.id && a.status === 'Pending').length} pending in this department.</p></div>
          <div><p className="font-semibold">Performance history (demo)</p><p>Jun 80% · Jul 83% · Aug 84% · Sep 86% · Oct 87% · Nov {deptDetail.achievement}%</p></div>
          <Btn onClick={() => { setDeptDetail(null); nav(`/performance`) }}>Open in Performance Analytics</Btn>
        </div>}
      </Modal>
      <Modal open={!!staffDetail} onClose={() => setStaffDetail(null)} title={staffDetail?.name || ''}>
        {staffDetail && <div className="space-y-3 text-sm"><p>{staffDetail.designation} · {deptName(staffDetail.departmentId)}</p><p>Work email (demo): {staffDetail.email}</p><div className="grid grid-cols-2 gap-3"><p>Assigned: <strong>{staffDetail.tasksAssigned}</strong></p><p>Completed: <strong>{staffDetail.tasksCompleted}</strong></p><p>On-time: <strong>{staffDetail.onTime}%</strong></p><p>Goal: <strong>{staffDetail.goal}%</strong></p><p>Quality: <strong>{staffDetail.quality}%</strong></p><p>Attendance: <strong>{staffDetail.attendance}%</strong></p><p>Workload: <strong>{staffDetail.workload}</strong></p></div><div className="flex gap-2"><Btn onClick={() => { setStaffDetail(null); nav(`/tasks?new=1&dept=${staffDetail.departmentId}`) }}>Assign task</Btn><Btn variant="secondary" onClick={() => { setStaffDetail(null); nav('/performance') }}>View performance</Btn></div></div>}
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing ? `Edit staff (demo) — ${editing.name}` : ''}>
        {editing && <form onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); updateStaff(editing.id, { name: String(f.get('name')), designation: String(f.get('designation')), email: String(f.get('email')) }); toast('success', 'Staff record updated in this demo.'); setEditing(null) }} className="space-y-4 text-sm">
          <Field label="Name"><input name="name" defaultValue={editing.name} className={inputCls} required /></Field>
          <Field label="Designation"><input name="designation" defaultValue={editing.designation} className={inputCls} required /></Field>
          <Field label="Work email (demo)"><input name="email" defaultValue={editing.email} className={inputCls} type="email" required /></Field>
          <div className="flex justify-end gap-2"><Btn variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn><Btn type="submit">Save changes</Btn></div>
        </form>}
      </Modal>
    </div>
  )
}
