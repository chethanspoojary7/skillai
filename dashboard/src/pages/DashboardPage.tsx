import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle, ArrowUpRight, BarChart3, Building2, CalendarDays, CheckSquare,
  ClipboardList, Mail, MapPin, Plus, TrendingUp,
} from 'lucide-react'
import { useApp } from '../store/AppContext'
import { departments, events, staff } from '../data/seed'
import { fmt, isOverdue, money } from '../utils'
import { Badge, Card, DoubleClickAction, Progress, RecordRow, RecordSurface, priorityTone, statusTone } from '../components/ui'

const statusColors = ['#2f8074', '#91aa69', '#d69a62', '#8987ad', '#bd756e']
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const dateOnly = (value: string) => new Date(`${value}T00:00:00`)
const localDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export default function DashboardPage() {
  const { approvals, tasks, activity, profile } = useApp()
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
  const achievementTarget = departments.length
    ? Math.round(departments.reduce((sum, department) => sum + department.target, 0) / departments.length)
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
  ]

  return (
    <div className="director-dashboard">
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
              <DoubleClickAction label="view pending approvals" onActivate={() => navigate('/approvals?status=Pending')}><strong>{pending.length}</strong> pending</DoubleClickAction>
              <DoubleClickAction label="view urgent pending approvals" className="urgent" onActivate={() => navigate('/approvals?status=Pending&priority=Urgent')}><strong>{urgent.length}</strong> urgent</DoubleClickAction>
              <DoubleClickAction label="view pending approvals waiting over a week" onActivate={() => navigate('/approvals?status=Pending&priority=WaitingOverWeek')}><strong>{pending.filter(item => (today.getTime() - dateOnly(item.date).getTime()) / 86400000 > 7).length}</strong> waiting over a week</DoubleClickAction>
            </div>
            <div className="director-table-wrap">
              <table className="director-table">
                <thead><tr><th>Request</th><th>Applicant</th><th>Department</th><th>Date</th><th>Priority</th><th>Status</th></tr></thead>
                <tbody>
                  {pending.slice(0, 5).map(approval => (
                    <RecordRow key={approval.id} label={`Open approval ${approval.id}, ${approval.title}`} onActivate={() => navigate(`/approvals?open=${approval.id}`)}>
                      <td><span className="director-record-action"><strong>{approval.id}</strong><span>{approval.title}</span></span></td>
                      <td>{approval.applicant}</td>
                      <td>{deptName(approval.departmentId)}</td>
                      <td>{fmt(approval.date)}</td>
                      <td><Badge text={approval.priority} tone={priorityTone(approval.priority)} /></td>
                      <td><Badge text={approval.status} tone={statusTone(approval.status)} /></td>
                    </RecordRow>
                  ))}
                </tbody>
              </table>
              {pending.length === 0 && <p className="director-empty">No pending approvals. You’re all caught up.</p>}
            </div>
          </Card>

          <Card className="director-panel director-task-panel">
            <div className="director-panel-heading">
              <div><h2>Task summary</h2><p>Current workload and deadlines</p></div>
              <div className="director-task-heading-actions">
                <Link to="/tasks?new=1" className="director-view-link"><Plus size={13} /> Create task</Link>
                <Link to="/tasks" className="director-view-link">Task management <ArrowUpRight size={13} /></Link>
              </div>
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
                    return                           <div className="department-load" key={department.id}>
                            <RecordSurface label={`Open ${department.name} department analysis`} onActivate={() => navigate(`/performance/departments?dept=${department.id}`)} className="department-load">
                              <div className="department-load-name"><strong>{department.short}</strong><span>{department.name}</span><small>{deptTasks.length} tasks</small></div>
                              <Progress value={progress} />
                            </RecordSurface>
                          </div>
                  })}
                </div>
              </div>
              <div>
                <h3>Recent assignments</h3>
                <ul className="recent-task-list">
                  {tasks.slice(0, 4).map(task => (
                    <li key={task.id}>
                      <RecordSurface label={`Open task ${task.id}, ${task.title}`} onActivate={() => navigate(`/tasks?open=${task.id}`)} className="recent-task-link"><span className="recent-task-copy"><strong>{task.title}</strong><span>{staffName(task.responsibleId)} · {task.dueDate ? fmt(task.dueDate) : 'No due date'}</span></span><Badge text={task.status} tone={statusTone(task.status)} /></RecordSurface>
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
            <div className="performance-target">
              <div className="performance-target-heading">
                <div><strong>Institute achievement</strong><span>Average across departments</span></div>
                <strong>{achievement}%</strong>
              </div>
              <div
                className="performance-target-track"
                role="img"
                aria-label={`${achievement}% achievement against a ${achievementTarget}% target`}
              >
                <span style={{ width: `${Math.min(100, achievement)}%` }} />
                <i style={{ left: `${Math.min(100, achievementTarget)}%` }} />
              </div>
              <div className="performance-target-labels"><span>Current achievement</span><span>Target {achievementTarget}%</span></div>
            </div>
            <h3 className="director-chart-title">Task status</h3>
            <ul className="status-distribution-list">
              {statusCounts.map((status, index) => {
                const share = tasks.length ? Math.round(status.value / tasks.length * 100) : 0
                return (
                  <li className={`status-distribution-item tone-${index % statusColors.length}`} key={status.name}>
                    <div className="status-distribution-label"><span>{status.name}</span><strong>{status.value}</strong></div>
                    <div className="status-distribution-track"><span style={{ width: `${share}%` }} /></div>
                  </li>
                )
              })}
              {statusCounts.length === 0 && <li className="status-distribution-empty">No tasks to report yet.</li>}
            </ul>
          </Card>

          <div className="director-side-panels">
            <Card className="director-panel director-events-panel">
              <div className="director-panel-heading">
                <div><h2>Upcoming events & deadlines</h2><p>Next on the institute calendar</p></div>
                <CalendarDays size={16} className="director-muted-icon" />
              </div>
              <ul className="director-events-list">
                {[...events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4).map((event, index) => (
                  <li key={event.title}>
                    <RecordSurface label={`Open task schedule for ${event.title}`} onActivate={() => navigate('/tasks')} className="dashboard-event-action">
                    <span className={`event-date-tile event-${index % 3}`}><strong>{new Date(`${event.date}T12:00:00`).getDate()}</strong><small>{new Date(`${event.date}T12:00:00`).toLocaleDateString('en-IN', { month: 'short' })}</small></span>
                    <span className="dashboard-event-copy"><strong>{event.title}</strong><span>{fmt(event.date)} · {event.time}</span></span>
                    </RecordSurface>
                  </li>
                ))}
              </ul>
              <p className="director-demo-note">Department budget: {money(departments[0]?.budget ?? 0)} · Spent: {money(departments[0]?.spent ?? 0)}</p>
            </Card>

            <Card className="director-panel director-activity-panel">
              <div className="director-panel-heading">
                <div><h2>Recent activity</h2><p>Latest institute updates</p></div>
              </div>
              <ul className="director-activity-list">
                {activity.slice(0, 2).map(item => (
                  <li key={item.id}>
                    <span className="activity-marker" />
                    <div><strong>{item.actor} · {item.action.toLowerCase()}</strong><span>{item.recordId} · {item.description}</span></div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          <Card className="director-panel director-profile-panel">
            <div className="director-profile-card">
              <span className="director-profile-avatar" aria-hidden="true">
                {profile.name.split(' ').map(part => part[0]).slice(0, 2).join('')}
              </span>
              <strong className="director-profile-name">{profile.name}</strong>
              <span className="director-profile-role">{profile.designation}</span>
              <span className="director-profile-detail"><Mail size={13} />{profile.email}</span>
              <span className="director-profile-detail"><MapPin size={13} />{profile.office}</span>
              <div className="director-profile-stats">
                <span><strong>{departments.length}</strong>Departments</span>
                <span><strong>{staff.length}</strong>Staff</span>
              </div>
              <Link to="/profile" className="director-profile-link"><Building2 size={13} /> Institute profile</Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
