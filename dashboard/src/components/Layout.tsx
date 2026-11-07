import { useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity, Bell, Building2, CheckSquare, ClipboardList, LayoutDashboard,
  PanelLeftClose, PanelLeftOpen, Search, Settings, UserRound, Users,
} from 'lucide-react'
import { useApp } from '../store/AppContext'
import AnimatedList from './AnimatedList'
import SwipeToast from './SwipeToast'

const RAIL = [
  { section: 'Overview', links: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }] },
  { section: 'Management', links: [
    { to: '/departments', label: 'Employees', icon: Users },
    { to: '/approvals', label: 'Approvals', icon: CheckSquare },
    { to: '/tasks', label: 'Schedule', icon: ClipboardList },
    { to: '/performance', label: 'Performance', icon: Activity },
  ] },
]
const TITLES: Record<string, string> = {
  '/': 'Dashboard', '/approvals': 'Approvals', '/tasks': 'Schedule',
  '/performance': 'Performance', '/departments': 'Employees',
  '/notifications': 'Notifications',
  '/settings': 'Settings', '/profile': 'Profile',
  '/performance/overview': 'Performance · Overview',
  '/performance/academic': 'Performance · Academic',
  '/performance/finance': 'Performance · Finance',
  '/performance/administration': 'Performance · Administration',
  '/performance/departments': 'Performance · Departments',
  '/performance/staff': 'Performance · Staff',
}

export default function Layout() {
  const { notifications, profile, settings, saveSettings, staff, tasks, toasts, dismissToast } = useApp()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const unread = notifications.filter(item => !item.read).length
  const sidebarCollapsed = settings.sidebar === 'collapsed'
  const title = TITLES[location.pathname] || 'Dashboard'
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return []
    const staffResults = staff
      .filter(person => `${person.name} ${person.designation} ${person.email}`.toLowerCase().includes(query))
      .map(person => ({ key: `staff-${person.id}`, title: person.name, detail: `${person.designation} · Employee`, to: `/departments?staff=${encodeURIComponent(person.id)}` }))
    const taskResults = tasks
      .filter(task => {
        const responsible = staff.find(person => person.id === task.responsibleId)?.name || ''
        return `${task.id} ${task.title} ${responsible}`.toLowerCase().includes(query)
      })
      .map(task => ({ key: `task-${task.id}`, title: task.title, detail: `${task.id} · Task`, to: `/tasks?open=${encodeURIComponent(task.id)}` }))
    return [...staffResults, ...taskResults].slice(0, 8)
  }, [searchQuery, staff, tasks])
  const openSearchResult = (to: string) => {
    navigate(to)
    setSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <div className={`app-shell${settings.density === 'compact' ? ' density-compact' : ''}`}>
      <div className={`dashboard-device${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        <aside id="main-navigation" className="device-sidebar" aria-label="Main navigation">
          <Link to="/" className="sidebar-brand">
            <span className="sidebar-brand-icon"><Building2 size={18} /></span>
            <span className="sidebar-brand-copy"><strong>Director’s Office</strong><small>Institute Management</small></span>
          </Link>
          <nav className="sidebar-nav">
            {RAIL.map(group => (
              <div className="sidebar-group" key={group.section}>
                <span className="sidebar-section-label">{group.section}</span>
                <AnimatedList
                  items={group.links}
                  ariaLabel={`${group.section} navigation`}
                  listRole="list"
                  itemRole="listitem"
                  selectOnClick={false}
                  enableArrowNavigation={false}
                  animation="pop"
                  stagger={0.05}
                  className="sidebar-animated-links"
                  renderItem={item => (
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                    >
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </NavLink>
                  )}
                />
              </div>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <AnimatedList
              items={[{ to: '/settings', label: 'Settings', icon: Settings }]}
              ariaLabel="Settings navigation"
              listRole="list"
              itemRole="listitem"
              selectOnClick={false}
              enableArrowNavigation={false}
              animation="pop"
              stagger={0.05}
              className="sidebar-animated-links"
              renderItem={item => <NavLink to={item.to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}><item.icon size={16} /><span>{item.label}</span></NavLink>}
            />
            <Link to="/profile" className="sidebar-profile">
              <span className="sidebar-profile-avatar">{profile.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</span>
              <span className="sidebar-profile-copy"><strong>{profile.name}</strong><small>{profile.designation}</small></span>
            </Link>
          </div>
        </aside>

        <div className="device-workspace">
          <header className="device-topbar">
            <button type="button" className="top-icon sidebar-toggle" title={sidebarCollapsed ? 'Open navigation panel' : 'Close navigation panel'} aria-label={sidebarCollapsed ? 'Open navigation panel' : 'Close navigation panel'} aria-controls="main-navigation" aria-expanded={!sidebarCollapsed} onClick={() => saveSettings({ ...settings, sidebar: sidebarCollapsed ? 'expanded' : 'collapsed' })}>
              {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
            <h1 className="topbar-title">{title}</h1>
            {searchOpen && <div className="global-search">
              <input autoFocus className="device-search" placeholder="Search staff and tasks" aria-label="Search staff and tasks" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} onKeyDown={event => {
                if (event.key === 'Escape') { setSearchOpen(false); setSearchQuery('') }
                if (event.key === 'Enter' && searchResults[0]) openSearchResult(searchResults[0].to)
              }} />
              {searchQuery.trim() && <div className="global-search-results" role="listbox" aria-label="Search results">
                {searchResults.length ? searchResults.map(result => <button key={result.key} type="button" role="option" onClick={() => openSearchResult(result.to)}><span>{result.title}</span><small>{result.detail}</small></button>) : <p>No matching staff or tasks.</p>}
              </div>}
            </div>}
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
        {toasts.map(item => (
          <SwipeToast
            key={item.id}
            title={item.text}
            background={item.kind === 'success' ? '#368b59' : item.kind === 'error' ? '#c84952' : '#383943'}
            color="#fff"
            fuseColor={item.kind === 'success' ? '#a7f3d0' : item.kind === 'error' ? '#fecaca' : '#bfdbfe'}
            width={320}
            radius={12}
            slideMs={280}
            duration={4500}
            fuse="bottom"
            pauseOnHover
            inline
            onClose={() => dismissToast(item.id)}
          />
        ))}
      </div>
    </div>
  )
}
