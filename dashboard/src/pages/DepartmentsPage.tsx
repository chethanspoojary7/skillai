import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { departments } from '../data/seed'
import { isOverdue } from '../utils'
import { Btn, Card, DoubleClickAction, DropdownSelect, Modal, Progress, RecordRow, RecordSurface, SearchInput } from '../components/ui'
import type { Staff } from '../types'
export default function DepartmentsPage() {
  const { staff, tasks, approvals } = useApp(); const nav = useNavigate(); const [params] = useSearchParams()
  const [deptDetail, setDeptDetail] = useState<typeof departments[0] | null>(null); const [staffDetail, setStaffDetail] = useState<Staff | null>(null)
  const [q, setQ] = useState(''); const [dept, setDept] = useState('All')
  const processedParams = useRef<string | null>(null)
  useEffect(() => {
    const queryKey = `${params.get('dept') || ''}|${params.get('staff') || ''}`
    if (processedParams.current === queryKey) return
    processedParams.current = queryKey
    const requestedDept = params.get('dept')
    const dep = departments.find(department => department.id === requestedDept)
    setDept(dep?.id || 'All')
    setDeptDetail(dep || null)
    const requestedStaff = params.get('staff')
    const selectedStaff = staff.find(person => person.id === requestedStaff)
    setStaffDetail(selectedStaff || null)
  }, [params, staff])
  const deptName = (id: string) => departments.find(d => d.id === id)?.name || id
  const filteredStaff = staff.filter(s => (dept === 'All' || s.departmentId === dept) && (s.name.toLowerCase().includes(q.toLowerCase()) || s.designation.toLowerCase().includes(q.toLowerCase())))
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Department directory</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {departments.map(d => { const ts = tasks.filter(t => t.departmentId === d.id); const done = ts.filter(t => t.status === 'Completed').length; const rate = ts.length ? Math.round(done / ts.length * 100) : 0; return (
          <RecordSurface key={d.id} label={`Open ${d.name} department details`} onActivate={() => setDeptDetail(d)}><Card className="p-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-semibold">{d.name}</p><p className="truncate text-xs text-slate-500">Head: {staff.find(s => s.id === d.headId)?.name || 'Not assigned'}</p></div><span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">{d.short}</span></div>
          <div className="mt-3 grid grid-cols-3 gap-1 text-center"><div><p className="text-sm font-bold">{staff.filter(s => s.departmentId === d.id).length}</p><p className="text-[10px] text-slate-500">Staff</p></div><div><p className="text-sm font-bold">{ts.length}</p><p className="text-[10px] text-slate-500">Tasks</p></div><div><p className="text-sm font-bold">{rate}%</p><p className="text-[10px] text-slate-500">Complete</p></div></div>
          <div className="mt-2"><Progress value={rate} /></div><p className="mt-2 text-xs text-slate-500">Performance: {d.achievement}% / {d.target}% target · {d.students} students</p>
          </Card></RecordSurface>) })}
      </div>
      <Card className="p-4"><div className="staff-directory-header"><h3 className="font-semibold">Staff directory</h3><div className="staff-directory-filters"><SearchInput value={q} onChange={setQ} placeholder="Search staff or designation…" /><DropdownSelect ariaLabel="Filter by department" value={dept} onChange={setDept} options={[{ value: 'All', label: 'All departments' }, ...departments.map(d => ({ value: d.id, label: d.name }))]} /></div></div>
        <p className="mt-1 text-xs text-slate-500">Staff contact details.</p>
        <div className="staff-directory-table-wrap mt-4 overflow-x-auto"><table className="staff-directory-table"><thead><tr className="text-left text-xs uppercase text-slate-500"><th>Staff ID</th><th>Name</th><th>Designation</th><th>Department</th><th>Work email</th></tr></thead><tbody>{filteredStaff.map(s => <RecordRow key={s.id} label={`Open staff profile for ${s.name}`} onActivate={() => setStaffDetail(s)} className="border-t border-slate-100 dark:border-slate-800"><td className="font-medium">{s.id}</td><td className="font-medium">{s.name}</td><td>{s.designation}</td><td>{deptName(s.departmentId)}</td><td>{s.email}</td></RecordRow>)}</tbody></table></div>
        {filteredStaff.length === 0 && <p className="mt-4 text-sm text-slate-500">No staff match these filters.</p>}
      </Card>
      <Modal open={!!deptDetail} onClose={() => setDeptDetail(null)} title={deptDetail?.name || ''} wide>
        {deptDetail && <div className="space-y-4 text-sm">
          <p>Head: {staff.find(s => s.id === deptDetail.headId)?.name || 'Not assigned'} · Students: {deptDetail.students} · Target: {deptDetail.target}% · Achievement: {deptDetail.achievement}%</p>
          <div><p className="font-semibold">Staff in this department</p><ul className="mt-2 space-y-1">{staff.filter(s => s.departmentId === deptDetail.id).map(s => <li key={s.id}><RecordSurface label={`Open staff profile for ${s.name}`} onActivate={() => setStaffDetail(s)} className="inline-block rounded px-1 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800">{s.name} — {s.designation}</RecordSurface></li>)}</ul></div>
          <div><p className="font-semibold">Tasks</p><p>Active: {tasks.filter(t => t.departmentId === deptDetail.id && t.status !== 'Completed').length} · Completed: {tasks.filter(t => t.departmentId === deptDetail.id && t.status === 'Completed').length} · Overdue: {tasks.filter(t => t.departmentId === deptDetail.id && isOverdue(t)).length}</p></div>
          <div><p className="font-semibold">Pending approvals</p><DoubleClickAction label="view pending approvals for this department" onActivate={() => { const departmentId = deptDetail.id; setDeptDetail(null); nav(`/approvals?dept=${departmentId}&status=Pending`) }}>{approvals.filter(a => a.departmentId === deptDetail.id && a.status === 'Pending').length} pending in this department.</DoubleClickAction></div>
          <Btn onClick={() => { setDeptDetail(null); nav(`/performance/departments?dept=${deptDetail.id}`) }}>Open in Performance Analytics</Btn>
        </div>}
      </Modal>
      <Modal open={!!staffDetail} onClose={() => setStaffDetail(null)} title={staffDetail?.name || ''}>
        {staffDetail && <div className="space-y-3 text-sm"><p>{staffDetail.designation} · {deptName(staffDetail.departmentId)}</p><p>Work email: {staffDetail.email}</p><Btn onClick={() => { const person = staffDetail; setStaffDetail(null); nav(`/tasks?new=1&dept=${person.departmentId}&resp=${person.id}&returnTo=employees`) }}>Assign task</Btn></div>}
      </Modal>
    </div>
  )
}
