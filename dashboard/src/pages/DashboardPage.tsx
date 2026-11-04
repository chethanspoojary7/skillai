import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle, ArrowUpRight, BarChart3, CalendarDays, CheckSquare,
  ClipboardList, Clock3, FileText, Plus, Target, TrendingUp,
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie,
  PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useApp } from '../store/AppContext'
import { departments, events, monthlyTrend, staff } from '../data/seed'
import { fmt, isOverdue, money } from '../utils'
import { Badge, Btn, Card, Progress, priorityTone, statusTone } from '../components/ui'

const chartColors = ['#8884f2', '#62b879', '#f28b97', '#e9a057', '#65a6c5']
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const dateOnly = (value: string) => new Date(`${value}T00:00:00`)
const localDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export default function DashboardPage() {
  const { approvals, tasks, activity, settings } = useApp()
  const navigate = useNavigate()
  const now = new Date()
  const today = startOfDay(now)
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const pending = approvals.filter(item => item.status === 'Pending')
  const urgent = pending.filter(item => item.priority === 'Critical' || item.priority === 'High')
  const overdue = tasks.filter(isOverdue)
  const awaitingReview = tasks.filter(task => task.status === 'Submitted for Review')
  const active = tasks.filter(task => task.status !== 'Completed')
  const completedActions = activity.filter(item => item.recordType === 'Task' && item.to === 'Completed')
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const completedThisMonth = completedActions.filter(item => {
    const date = new Date(item.date)
    return date >= monthStart && date < nextMonthStart
  }).length
  const dueToday = tasks.filter(task => task.status !== 'Completed' && task.dueDate === localDateKey(today))
  const dueThisWeek = tasks.filter(task => {
    if (task.status === 'Completed') return false
    const due = dateOnly(task.dueDate)
    return due >= weekStart && due <= weekEnd
  })
  const achievement = departments.length
    ? Math.round(departments.reduce((sum, department) => sum + department.achievement, 0) / departments.length)
    : 0
  const studentPopulation = departments.reduce((sum, department) => sum + department.students, 0)
  const finalizedApprovals = approvals.flatMap(approval => {
    if (approval.status !== 'Approved' && approval.status !== 'Rejected') return []
    const finished = [...approval.history].reverse().find(item => item.action === approval.status)
    if (!finished) return []
    const days = (dateOnly(finished.date).getTime() - dateOnly(approval.date).getTime()) / 86400000
    return days >= 0 ? [days] : []
  })
  const averageTurnaround = finalizedApprovals.length
    ? finalizedApprovals.reduce((sum, days) => sum + days, 0) / finalizedApprovals.length
    : 0
  const completionRate = tasks.length
    ? Math.round(tasks.filter(task => task.status === 'Completed').length / tasks.length * 100)
    : 0
  const completedTaskRecords = completedActions.flatMap(item => {
    const task = tasks.find(candidate => candidate.id === item.recordId)
    return task ? [{ item, task }] : []
  })
  const onTimeCompletions = completedTaskRecords.filter(({ item, task }) => {
    const dueDateExclusive = dateOnly(task.dueDate)
    dueDateExclusive.setDate(dueDateExclusive.getDate() + 1)
    return new Date(item.date) < dueDateExclusive
  }).length
  const onTimeRate = completedTaskRecords.length
    ? Math.round(onTimeCompletions / completedTaskRecords.length * 100)
    : 0
  const deptName = (id: string) => departments.find(department => department.id === id)?.name || id
  const staffName = (id: string) => staff.find(member => member.id === id)?.name || id
  const statusCounts = ['Not Started', 'In Progress', 'Submitted for Review', 'Completed', 'Blocked']
    .map(status => ({ name: status, value: tasks.filter(task => task.status === status).length }))
    .filter(status => status.value > 0)
  const metrics = [
    { label: 'Pending Approvals', value: pending.length, note: `${urgent.length} urgent requests`, icon: CheckSquare, color: 'violet', to: '/approvals?status=Pending' },
    { label: 'Active Tasks', value: active.length, note: `${awaitingReview.length} awaiting review`, icon: ClipboardList, color: 'green', to: '/tasks' },
    { label: 'Overdue Tasks', value: overdue.length, note: 'Needs attention', icon: AlertTriangle, color: 'coral', to: '/tasks?overdue=1' },
    { label: 'Completed This Month', value: completedThisMonth, note: 'Based on activity records', icon: TrendingUp, color: 'orange', to: '/tasks?status=Completed' },
    { label: 'Institute Target Achievement', value: `${achievement}%`, note: `${studentPopulation.toLocaleString()} students`, icon: Target, color: 'violet', to: '/performance' },
    { label: 'Avg. Approval Turnaround', value: `${averageTurnaround.toFixed(1)} days`, note: 'From finalized demo requests', icon: Clock3, color: 'green', to: '/approvals' },
  ]

  return (
    <div className="director-dashboard">
      <header className="director-heading">
        <div>
          <span className="director-eyebrow">INSTITUTE OVERVIEW</span>
          <h1>Welcome back, Director</h1>
          <p>{settings.instituteName} <span>·</span> Academic year {settings.academicYear} <span>·</span> Demonstration data</p>
        </div>
        <div className="director-actions">
          <Btn onClick={() => navigate('/approvals')}><CheckSquare size={15} /> Review Approvals</Btn>
          <Btn variant="secondary" onClick={() => navigate('/tasks?new=1')}><Plus size={15} /> Create Task</Btn>
          <Btn variant="secondary" onClick={() => navigate('/performance')}><BarChart3 size={15} /> Performance</Btn>
          <Btn variant="secondary" onClick={() => navigate('/reports')}><FileText size={15} /> Generate Report</Btn>
        </div>
      </header>

      <section className="director-metrics" aria-label="Director dashboard metrics">
        {metrics.map(metric => (
          <Link to={metric.to} className="director-metric" key={metric.label}>
            <span className={`director-metric-icon ${metric.color}`}><metric.icon size={17} /></span>
            <span className="director-metric-copy">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.note}</small>
            </span>
            <ArrowUpRight className="director-metric-arrow" size={15} />
          </Link>
        ))}
      </section>

      <div className="director-main-grid">
        <div className="director-primary-column">
          <Card className="director-panel director-approval-panel">
            <div className="director-panel-heading">
              <div><h2>Approval summary</h2><p>Requests that need the director’s attention</p></div>
              <Link to="/approvals" className="director-view-link">View all <ArrowUpRight size={13} /></Link>
            </div>
            <div className="approval-highlights">
              <span><strong>{pending.length}</strong> pending</span>
              <span className="urgent"><strong>{urgent.length}</strong> urgent</span>
              <span><strong>{pending.filter(item => (today.getTime() - dateOnly(item.date).getTime()) / 86400000 > 7).length}</strong> waiting over a week</span>
            </div>
            <div className="director-table-wrap">
              <table className="director-table">
                <thead><tr><th>Request</th><th>Applicant</th><th>Department</th><th>Date</th><th>Priority</th><th>Status</th></tr></thead>
                <tbody>
                  {pending.slice(0, 5).map(approval => (
                    <tr key={approval.id}>
                      <td><button className="director-record-link" onClick={() => navigate(`/approvals?open=${approval.id}`)}><strong>{approval.id}</strong><span>{approval.title}</span></button></td>
                      <td>{approval.applicant}</td>
                      <td>{deptName(approval.departmentId)}</td>
                      <td>{fmt(approval.date)}</td>
                      <td><Badge text={approval.priority} tone={priorityTone(approval.priority)} /></td>
                      <td><Badge text={approval.status} tone={statusTone(approval.status)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pending.length === 0 && <p className="director-empty">No pending approvals. You’re all caught up.</p>}
            </div>
          </Card>

          <Card className="director-panel director-task-panel">
            <div className="director-panel-heading">
              <div><h2>Task summary</h2><p>Current workload and deadlines</p></div>
              <Link to="/tasks" className="director-view-link">Task management <ArrowUpRight size={13} /></Link>
            </div>
            <div className="task-count-grid">
              <Link to="/tasks"><span>Due today</span><strong>{dueToday.length}</strong></Link>
              <Link to="/tasks"><span>Due this week</span><strong>{dueThisWeek.length}</strong></Link>
              <Link to="/tasks?overdue=1"><span>Overdue</span><strong className="warning">{overdue.length}</strong></Link>
              <Link to="/tasks"><span>Awaiting review</span><strong>{awaitingReview.length}</strong></Link>
            </div>
            <div className="task-panel-bottom">
              <div>
                <h3>Department task load</h3>
                <div className="department-load-list">
                  {departments.map(department => {
                    const deptTasks = tasks.filter(task => task.departmentId === department.id)
                    const complete = deptTasks.filter(task => task.status === 'Completed').length
                    const progress = deptTasks.length ? Math.round(complete / deptTasks.length * 100) : 0
                    return <Link to={`/departments?dept=${department.id}`} className="department-load" key={department.id}>
                      <span><strong>{department.short}</strong>{department.name}<small>{deptTasks.length} tasks</small></span>
                      <Progress value={progress} />
                    </Link>
                  })}
                </div>
              </div>
              <div>
                <h3>Recent assignments</h3>
                <ul className="recent-task-list">
                  {tasks.slice(0, 4).map(task => (
                    <li key={task.id}>
                      <Link to={`/tasks?open=${task.id}`}><strong>{task.title}</strong><span>{staffName(task.responsibleId)} · {task.dueDate ? fmt(task.dueDate) : 'No due date'}</span></Link>
                      <Badge text={task.status} tone={statusTone(task.status)} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <div className="director-secondary-column">
          <Card className="director-panel director-performance-panel">
            <div className="director-panel-heading">
              <div><h2>Performance overview</h2><p>Institute targets and completion</p></div>
              <Link to="/performance" className="director-panel-icon" aria-label="Open performance analytics"><BarChart3 size={15} /></Link>
            </div>
            <div className="performance-summary">
              <div><strong>{achievement}%</strong><span>Target achievement</span></div>
              <div><strong>{completionRate}%</strong><span>Task completion</span></div>
              <div><strong>{onTimeRate}%</strong><span>On-time completion</span></div>
            </div>
            <div className="director-chart director-line-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke="#ececf2" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#858796' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[70, 95]} tick={{ fontSize: 9, fill: '#858796' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="actual" name="Actual" stroke="#8884f2" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="target" name="Target" stroke="#62b879" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <h3 className="director-chart-title">Task status distribution</h3>
            <div className="director-chart director-status-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusCounts} dataKey="value" nameKey="name" innerRadius="57%" outerRadius="82%" paddingAngle={3}>
                    {statusCounts.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="director-panel director-activity-panel">
            <div className="director-panel-heading">
              <div><h2>Recent activity</h2><p>Latest institute updates</p></div>
              <Link to="/activity" className="director-view-link">Activity log <ArrowUpRight size={13} /></Link>
            </div>
            <ul className="director-activity-list">
              {activity.slice(0, 4).map(item => (
                <li key={item.id}>
                  <span className="activity-marker" />
                  <div><strong>{item.actor}</strong><span>{item.action.toLowerCase()} · {item.recordId}</span><small>{item.description}</small></div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="director-panel director-events-panel">
            <div className="director-panel-heading">
              <div><h2>Upcoming events & deadlines</h2><p>Next on the institute calendar</p></div>
              <CalendarDays size={16} className="director-muted-icon" />
            </div>
            <ul className="director-events-list">
              {[...events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4).map((event, index) => (
                <li key={event.title}>
                  <span className={`event-date-tile event-${index % 3}`}><strong>{new Date(`${event.date}T12:00:00`).getDate()}</strong><small>{new Date(`${event.date}T12:00:00`).toLocaleDateString('en-IN', { month: 'short' })}</small></span>
                  <Link to="/tasks"><strong>{event.title}</strong><span>{fmt(event.date)} · {event.time}</span></Link>
                </li>
              ))}
            </ul>
            <p className="director-demo-note">Demo finances: {money(10780000)} of {money(14500000)} collected.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
