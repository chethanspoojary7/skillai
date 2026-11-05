import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { departments } from '../data/seed'
import { isOverdue } from '../utils'
import { Badge, Btn, Card, DoubleClickAction, DropdownSelect, Modal, Progress, RecordRow, RecordSurface, SearchInput } from '../components/ui'
import type { Staff } from '../types'
export default function DepartmentsPage() {
  const { staff, tasks, approvals } = useApp(); const nav = useNavigate(); const [params] = useSearchParams()
  const [deptDetail, setDeptDetail] = useState<typeof departments[0] | null>(null); const [staffDetail, setStaffDetail] = useState<Staff | null>(null); const [staffPerformance, setStaffPerformance] = useState<Staff | null>(null); const [attendanceStaff, setAttendanceStaff] = useState<Staff | null>(null); const [attendanceMonth, setAttendanceMonth] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1) })
  const [q, setQ] = useState(''); const [dept, setDept] = useState('All'); const [workload, setWorkload] = useState('All')
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
  const filteredStaff = staff.filter(s => (dept === 'All' || s.departmentId === dept) && (workload === 'All' || s.workload === workload) && (s.name.toLowerCase().includes(q.toLowerCase()) || s.designation.toLowerCase().includes(q.toLowerCase())))
  const attendanceCalendar = useMemo(() => {
    if (!attendanceStaff) return null
    const year = attendanceMonth.getFullYear()
    const month = attendanceMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const workingDays = Array.from({ length: daysInMonth }, (_, index) => index + 1).filter(day => {
      const weekday = new Date(year, month, day).getDay()
      return weekday !== 0
    })
    const absentCount = Math.min(workingDays.length, Math.max(attendanceStaff.attendance < 100 ? 1 : 0, Math.round((100 - attendanceStaff.attendance) / 100 * workingDays.length)))
    const absentDays = new Set(Array.from({ length: absentCount }, (_, index) => workingDays[Math.floor((index + 1) * workingDays.length / (absentCount + 1))]))
    return { year, month, daysInMonth, workingDays, absentDays, leadingEmptyDays: (new Date(year, month, 1).getDay() + 6) % 7 }
  }, [attendanceStaff, attendanceMonth])
  const openStaffAttendance = (person: Staff) => {
    setAttendanceMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    setAttendanceStaff(person)
  }
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Department directory</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {departments.map(d => { const ts = tasks.filter(t => t.departmentId === d.id); const done = ts.filter(t => t.status === 'Completed').length; const rate = ts.length ? Math.round(done / ts.length * 100) : 0; return (
          <RecordSurface key={d.id} label={`Open ${d.name} department details`} onActivate={() => setDeptDetail(d)}><Card className="p-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-semibold">{d.name}</p><p className="truncate text-xs text-slate-500">Head: {staff.find(s => s.id === d.headId)?.name}</p></div><span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">{d.short}</span></div>
          <div className="mt-3 grid grid-cols-3 gap-1 text-center"><div><p className="text-sm font-bold">{staff.filter(s => s.departmentId === d.id).length}</p><p className="text-[10px] text-slate-500">Staff</p></div><div><p className="text-sm font-bold">{ts.length}</p><p className="text-[10px] text-slate-500">Tasks</p></div><div><p className="text-sm font-bold">{rate}%</p><p className="text-[10px] text-slate-500">Complete</p></div></div>
          <div className="mt-2"><Progress value={rate} /></div><p className="mt-2 text-xs text-slate-500">Performance: {d.achievement}% / {d.target}% target · {d.students} students</p>
          </Card></RecordSurface>) })}
      </div>
      <Card className="p-4"><div className="staff-directory-header"><h3 className="font-semibold">Staff directory</h3><div className="staff-directory-filters"><SearchInput value={q} onChange={setQ} placeholder="Search staff or designation…" /><DropdownSelect ariaLabel="Filter by department" value={dept} onChange={setDept} options={[{ value: 'All', label: 'All departments' }, ...departments.map(d => ({ value: d.id, label: d.name }))]} /><DropdownSelect ariaLabel="Filter by workload" value={workload} onChange={setWorkload} options={[{ value: 'All', label: 'All workload levels' }, ...['Light', 'Balanced', 'Heavy'].map(item => ({ value: item, label: item }))]} /></div></div>
        <p className="mt-1 text-xs text-slate-500">Fictional demonstration contact details only. No sensitive personal or financial information is shown.</p>
        <div className="staff-directory-table-wrap mt-4 overflow-x-auto"><table className="staff-directory-table"><thead><tr className="text-left text-xs uppercase text-slate-500"><th>Staff ID</th><th>Name</th><th>Designation</th><th>Department</th><th>Work email</th><th>Assigned</th><th>Workload</th><th>Performance</th></tr></thead><tbody>{filteredStaff.map(s => <RecordRow key={s.id} label={`Open staff profile for ${s.name}`} onActivate={() => setStaffDetail(s)} className="border-t border-slate-100 dark:border-slate-800"><td className="font-medium">{s.id}</td><td className="font-medium">{s.name}</td><td>{s.designation}</td><td>{deptName(s.departmentId)}</td><td>{s.email}</td><td>{s.tasksAssigned}</td><td><Badge text={s.workload} tone={s.workload === 'Heavy' ? 'amber' : s.workload === 'Light' ? 'blue' : 'slate'} /></td><td>{s.goal}% goal · {s.onTime}% on-time</td></RecordRow>)}</tbody></table></div>
        {filteredStaff.length === 0 && <p className="mt-4 text-sm text-slate-500">No staff match these filters.</p>}
      </Card>
      <Modal open={!!deptDetail} onClose={() => setDeptDetail(null)} title={deptDetail?.name || ''} wide>
        {deptDetail && <div className="space-y-4 text-sm">
          <p>Head: {staff.find(s => s.id === deptDetail.headId)?.name} · Students: {deptDetail.students} · Target: {deptDetail.target}% · Achievement: {deptDetail.achievement}%</p>
          <div><p className="font-semibold">Staff in this department</p><ul className="mt-2 space-y-1">{staff.filter(s => s.departmentId === deptDetail.id).map(s => <li key={s.id}><RecordSurface label={`Open staff profile for ${s.name}`} onActivate={() => setStaffDetail(s)} className="inline-block rounded px-1 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800">{s.name} — {s.designation}</RecordSurface></li>)}</ul></div>
          <div><p className="font-semibold">Tasks</p><p>Active: {tasks.filter(t => t.departmentId === deptDetail.id && t.status !== 'Completed').length} · Completed: {tasks.filter(t => t.departmentId === deptDetail.id && t.status === 'Completed').length} · Overdue: {tasks.filter(t => t.departmentId === deptDetail.id && isOverdue(t)).length}</p></div>
          <div><p className="font-semibold">Pending approvals</p><DoubleClickAction label="view pending approvals for this department" onActivate={() => { const departmentId = deptDetail.id; setDeptDetail(null); nav(`/approvals?dept=${departmentId}&status=Pending`) }}>{approvals.filter(a => a.departmentId === deptDetail.id && a.status === 'Pending').length} pending in this department.</DoubleClickAction></div>
          <div><p className="font-semibold">Performance history (demo)</p><p>Jun 80% · Jul 83% · Aug 84% · Sep 86% · Oct 87% · Nov {deptDetail.achievement}%</p></div>
          <Btn onClick={() => { setDeptDetail(null); nav(`/performance/departments?dept=${deptDetail.id}`) }}>Open in Performance Analytics</Btn>
        </div>}
      </Modal>
      <Modal open={!!staffDetail} onClose={() => setStaffDetail(null)} title={staffDetail?.name || ''}>
        {staffDetail && <div className="space-y-3 text-sm"><p>{staffDetail.designation} · {deptName(staffDetail.departmentId)}</p><p>Work email (demo): {staffDetail.email}</p><div className="grid grid-cols-2 gap-3"><p>Assigned: <strong>{staffDetail.tasksAssigned}</strong></p><p>Completed: <strong>{staffDetail.tasksCompleted}</strong></p><p>On-time: <strong>{staffDetail.onTime}%</strong></p><p>Goal: <strong>{staffDetail.goal}%</strong></p><p>Quality: <strong>{staffDetail.quality}%</strong></p><p>Attendance: <strong>{staffDetail.attendance}%</strong></p><p>Workload: <strong>{staffDetail.workload}</strong></p></div><div className="flex flex-wrap gap-2"><Btn onClick={() => { const person = staffDetail; setStaffDetail(null); nav(`/tasks?new=1&dept=${person.departmentId}&resp=${person.id}&returnTo=employees`) }}>Assign task</Btn><Btn variant="secondary" onClick={() => setStaffPerformance(staffDetail)}>View performance</Btn><Btn variant="secondary" onClick={() => openStaffAttendance(staffDetail)}>View full month attendance</Btn></div></div>}
      </Modal>
      <Modal open={!!attendanceStaff} onClose={() => setAttendanceStaff(null)} title={attendanceStaff ? `${attendanceStaff.name} — Full month attendance` : ''} wide>
        {attendanceStaff && attendanceCalendar && <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold">{attendanceMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p><div className="flex gap-2"><Btn variant="secondary" onClick={() => setAttendanceMonth(month => new Date(month.getFullYear(), month.getMonth() - 1, 1))}>Previous month</Btn><Btn variant="secondary" onClick={() => setAttendanceMonth(month => new Date(month.getFullYear(), month.getMonth() + 1, 1))}>Next month</Btn></div></div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day} className="py-2 font-semibold text-slate-500">{day}</div>)}{Array.from({ length: attendanceCalendar.leadingEmptyDays }, (_, index) => <div key={`empty-${index}`} />)}{Array.from({ length: attendanceCalendar.daysInMonth }, (_, index) => {
            const day = index + 1
            const date = new Date(attendanceCalendar.year, attendanceCalendar.month, day)
            const isWeekend = date.getDay() === 0
            const isAbsent = attendanceCalendar.absentDays.has(day)
            return <div key={day} aria-label={`${date.toLocaleDateString('en-IN', { dateStyle: 'long' })}: ${isWeekend ? 'Weekend' : isAbsent ? 'Absent' : 'Present'}`} className={`min-h-16 rounded-lg border p-2 ${isWeekend ? 'border-slate-100 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800' : isAbsent ? 'border-red-100 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300' : 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300'}`}><span className="block font-semibold">{day}</span><span className="mt-1 block text-[10px]">{isWeekend ? 'Weekend' : isAbsent ? 'Absent' : 'Present'}</span></div>
          })}</div>
          <div className="flex flex-wrap gap-3"><Badge text={`${attendanceCalendar.workingDays.length - attendanceCalendar.absentDays.size} Present`} tone="green" /><Badge text={`${attendanceCalendar.absentDays.size} Absent`} tone="red" /><Badge text={`${attendanceStaff.attendance}% profile attendance`} tone="blue" /></div>
          <p className="text-xs text-slate-500">Demo view: daily marks are estimated from the staff profile’s aggregate attendance rate. Individual day-by-day attendance records are not stored in this demo.</p>
        </div>}
      </Modal>
      <Modal open={!!staffPerformance} onClose={() => setStaffPerformance(null)} title={staffPerformance ? `${staffPerformance.name} — Performance` : ''}>
        {staffPerformance && <div className="space-y-4 text-sm">
          <p className="text-slate-500">{staffPerformance.designation} · {deptName(staffPerformance.departmentId)}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {([['Goal achievement', staffPerformance.goal], ['On-time delivery', staffPerformance.onTime], ['Quality', staffPerformance.quality], ['Attendance', staffPerformance.attendance]] as const).map(([label, value]) => <div key={label} className="rounded-lg border border-slate-100 p-3 dark:border-slate-700"><div className="mb-2 flex items-center justify-between gap-2"><span className="text-slate-600 dark:text-slate-300">{label}</span><strong>{value}%</strong></div><Progress value={value} /></div>)}
            <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-700"><p className="text-slate-600 dark:text-slate-300">Tasks completed</p><p className="mt-1 text-lg font-semibold">{staffPerformance.tasksCompleted} <span className="text-sm font-normal text-slate-500">of {staffPerformance.tasksAssigned}</span></p><div className="mt-2"><Progress value={staffPerformance.tasksAssigned ? staffPerformance.tasksCompleted / staffPerformance.tasksAssigned * 100 : 0} /></div></div>
            <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-700"><p className="text-slate-600 dark:text-slate-300">Current workload</p><p className="mt-1 text-lg font-semibold">{staffPerformance.workload}</p></div>
          </div>
        </div>}
      </Modal>
    </div>
  )
}
