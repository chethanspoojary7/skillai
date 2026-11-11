# Dashboard Pages & Features

This is a quick guide to the Institute Director dashboard. All records are
sample data stored in the browser; this frontend does not connect to a server.

## Pages

| Page | What it does |
| --- | --- |
| [Dashboard](./src/pages/DashboardPage.tsx) (`/`) | Gives a summary of pending and urgent approvals, active and overdue tasks, and monthly completions. Includes approval and task summaries, department task load, recent assignments and activity, performance charts, upcoming events, and shortcuts to common actions. |
| [Employees](./src/pages/DepartmentsPage.tsx) (`/departments`) | Shows department summary cards and a searchable, department-filterable staff directory. Open a department or staff profile for more detail, then jump to analytics or create a task for a staff member. |
| [Approvals](./src/pages/ApprovalsPage.tsx) (`/approvals`) | Reviews fee-concession requests. Search, filter by status and date, sort, paginate, export the filtered list to CSV, and open a request to approve, reject with a reason, or return it for corrections. |
| [Schedule](./src/pages/TasksPage.tsx) (`/tasks`) | Creates, edits, filters, and tracks tasks. Switch between calendar, board, and table views; review deadlines and workload; update task status; and open a task for its details and actions. |
| [Performance](./src/pages/PerformancePage.tsx) (`/performance`) | Reviews performance with reporting-period, department, and staff filters. Sections cover overview charts, academic data, finance and resource use, administration, department performance, and staff performance. Department insights can lead to improvement tasks. |
| [Notifications](./src/pages/NotificationsPage.tsx) (`/notifications`) | Filters notifications by read state or category. Mark one or all as read, delete an item, or open its related page or record. |
| [Settings](./src/pages/SettingsPage.tsx) (`/settings`) | Changes institute details, academic year, default reporting period, theme, sidebar preference, density, and notification preferences. Can also restore the initial sample data. |
| [Profile](./src/pages/ProfilePage.tsx) (`/profile`) | Edits the director's sample name, contact details, designation, and office information. |

## Shared features

- **Navigation:** The sidebar links to the main pages. On phones it opens as a
  drawer; on wider screens it can be expanded or collapsed.
- **Search:** The top-bar search finds staff and tasks and opens the selected
  result.
- **Responsive layout:** Content adjusts to desktop, tablet, and phone widths.
  Tables and other wide content scroll within their own area where needed.
- **Feedback and motion:** Actions show toast messages; page and dashboard
  metric animations respect the device's reduced-motion preference.
- **Local demo data:** Changes persist in this browser only. Clearing browser
  storage or restoring initial data resets the demo. This is not a live,
  authenticated institute system.
