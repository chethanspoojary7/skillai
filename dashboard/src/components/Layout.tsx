import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Activity, Bell, Building2, CheckSquare, ClipboardList, FileText,
  LayoutDashboard, Search, Settings, UserRound, Users,
} from 'lucide-react'
import { useApp } from '../store/AppContext'

const RAIL = [
  { section: 'Overview', links: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }] },
  { section: 'Management', links: [
    { to: '/departments', label: 'Employees', icon: Users },
    { to: '/approvals', label: 'Approvals', icon: CheckSquare },
    { to: '/tasks', label: 'Schedule', icon: ClipboardList },
    { to: '/performance', label: 'Performance', icon: Activity },
  ] },
  { section: 'Insights', links: [
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/activity', label: 'Activity', icon: Activity },
  ] },
]
const TITLES: Record<string, string> = {
  '/': 'Dashboard', '/approvals': 'Approvals', '/tasks': 'Schedule',
  '/performance': 'Performance', '/institute': 'Company', '/departments': 'Employees',
  '/reports': 'Reports', '/notifications': 'Notifications', '/activity': 'Activity',
  '/settings': 'Settings', '/profile': 'Profile',
}

export default function Layout() {
  const { notifications, profile, toasts, dismissToast } = useApp()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const unread = notifications.filter(item => !item.read).length
  const title = TITLES[location.pathname] || 'Dashboard'

  return (
    <div className="app-shell">
      <div className="dashboard-device">
        <aside className="device-sidebar" aria-label="Main navigation">
          <Link to="/" className="sidebar-brand">
            <span className="sidebar-brand-icon"><Building2 size={18} /></span>
            <span className="sidebar-brand-copy"><strong>Director’s Office</strong><small>Institute Management</small></span>
          </Link>
          <nav className="sidebar-nav">
            {RAIL.map(group => (
              <div className="sidebar-group" key={group.section}>
                <span className="sidebar-section-label">{group.section}</span>
                {group.links.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <NavLink to="/settings" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}><Settings size={16} /><span>Settings</span></NavLink>
            <Link to="/profile" className="sidebar-profile">
              <span className="sidebar-profile-avatar">{profile.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</span>
              <span className="sidebar-profile-copy"><strong>{profile.name}</strong><small>{profile.designation}</small></span>
            </Link>
          </div>
        </aside>

        <div className="device-workspace">
          <header className="device-topbar">
            <h1 className="topbar-title">{title}</h1>
            {searchOpen && <input autoFocus className="device-search" placeholder="Search staff and tasks" aria-label="Search staff and tasks" onKeyDown={event => { if (event.key === 'Escape') setSearchOpen(false) }} />}
            <div className="top-actions">
              <button type="button" className="top-icon" title="Search" aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}><Search size={15} /></button>
              <Link to="/notifications" className="top-icon notification-action" title="Notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
                <Bell size={15} />{unread > 0 && <span className="notification-dot" />}
              </Link>
              <div className="profile-wrap">
                <button type="button" className="profile-avatar" aria-label="Open profile menu" onClick={() => setProfileOpen(!profileOpen)}>
                  {profile.name.split(' ').map(part => part[0]).slice(0, 2).join('')}
                </button>
                {profileOpen && <div className="profile-menu">
                  <Link to="/profile" onClick={() => setProfileOpen(false)}><UserRound size={14} /> Profile</Link>
                  <Link to="/settings" onClick={() => setProfileOpen(false)}><Settings size={14} /> Settings</Link>
                </div>}
              </div>
            </div>
          </header>
          <main className="device-content" aria-label={title}>
            <Outlet />
          </main>
        </div>
      </div>
      <div className="toast-stack">
        {toasts.map(item => <button type="button" key={item.id} onClick={() => dismissToast(item.id)} className={`dashboard-toast ${item.kind}`} role="status">{item.text}</button>)}
      </div>
    </div>
  )
}
