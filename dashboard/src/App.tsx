import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import ApprovalsPage from './pages/ApprovalsPage'
import TasksPage from './pages/TasksPage'
import PerformancePage from './pages/PerformancePage'
import DepartmentsPage from './pages/DepartmentsPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/approvals" element={<ApprovalsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/performance/:section" element={<PerformancePage />} />
        <Route path="/institute" element={<Navigate to="/" replace />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
