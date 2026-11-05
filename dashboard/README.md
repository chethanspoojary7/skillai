# Institute Director Management Dashboard — Frontend Only

A complete, interactive React frontend for an institute director. No backend,
no database, no server APIs. All data is realistic mock data kept in the
browser (localStorage, key `idd-demo-v1`) so demo changes survive a refresh.
Delete that key, or use **Settings → Reset Demo Data**, to restore the seed.

The dashboard opens directly without a sign-in screen. It is a frontend-only
demo and does not provide authentication or access control.

## Run

```bash
npm install
npm run dev
```

Then open the address Vite prints (usually http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## What is included

- **Director Dashboard** — summary cards, approval summary, task summary,
  performance charts, recent activity, upcoming events, quick actions.
- **Approval Center** — stats, 11 categories, search / filters / sorting /
  pagination / page size, CSV export, detail view, approve / reject (reason
  required) / return for correction (comment required), bulk approval,
  printable summary. Finalised requests never return to the pending list.
- **Task Management** — overview cards, create/edit form with validation
  (due date cannot precede start date, staff options follow the department),
  subtasks, table / Kanban / calendar views, workflow
  Not Started → In Progress → Submitted for Review → Completed, blocked
  tasks with a reason, overdue warnings (completed tasks are never overdue),
  comments, progress updates, duplicate, reassign, cancel with confirmation.
- **Performance Analytics** — filters, summary cards, academic / staff /
  department / finance / administrative views, Recharts line / bar / donut
  charts, Institute → Department → Staff drill-down, and
  "Create Improvement Task" actions that prefill the task form.
- **Institute Overview, Departments & Staff** — directory, department detail,
  staff search/filters, staff detail, demo staff editing, assign-task and
  performance shortcuts. Contact details are fictional demo data only.
- **Reports** — 9 report categories, period/department/metric filters,
  preview, print, CSV export and a text-summary export. A formatted PDF
  library was deliberately not added; the text export carries the same rows.
- **Notifications** — filters, read/unread, mark all as read, delete, and
  navigation to the related record. The top-bar badge updates on read.
- **Activity & Audit Log** — chronological demo log with search, filters and
  CSV export. Clearly labelled as *not* a secure or tamper-proof audit trail.
- **Settings & Permissions** — institute settings, light/dark mode, sidebar
  and density preferences, notification toggles, role-visibility preview
  (frontend only — real access control must be enforced by a future backend),
  and Reset Demo Data.
- **Profile** — editable demo profile and appearance shortcut.

## Notes and limits

- Institute name, figures, staff and finances are sample data, clearly
  labelled as demo data in the interface.
- Attachment previews, PDF formatting and email sending are honest frontend
  demonstrations, not real services.
- The project is organised so a backend can be added later: all state flows
  through `src/store/AppContext.tsx` and all seed data lives in
  `src/data/seed.ts`.

## Stack

React 18 + Vite + TypeScript + Tailwind CSS v4 + React Router + Lucide icons
+ Recharts + Framer Motion (available; animations in this build are kept
subtle via CSS transitions) + React Hook Form + Zod + date-fns.
