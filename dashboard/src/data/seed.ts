import type { Approval, ActivityItem, Department, NotificationItem, Staff, Task } from '../types'
export const departments: Department[] = [
  { id: 'D01', name: 'Computer Science', short: 'CS', headId: 'S01', students: 642, target: 92, achievement: 89, budget: 4200000, spent: 3180000 },
  { id: 'D02', name: 'Mathematics', short: 'MA', headId: 'S05', students: 388, target: 90, achievement: 93, budget: 1800000, spent: 1210000 },
  { id: 'D03', name: 'Physics', short: 'PH', headId: 'S09', students: 341, target: 88, achievement: 84, budget: 2600000, spent: 2090000 },
  { id: 'D04', name: 'Commerce & Management', short: 'CM', headId: 'S13', students: 517, target: 90, achievement: 87, budget: 2100000, spent: 1450000 },
  { id: 'D05', name: 'Humanities', short: 'HU', headId: 'S17', students: 402, target: 86, achievement: 91, budget: 1500000, spent: 980000 },
  { id: 'D06', name: 'Life Sciences', short: 'LS', headId: 'S21', students: 296, target: 88, achievement: 82, budget: 2300000, spent: 1870000 },
]
export const staff: Staff[] = [
  { id: 'S01', name: 'Dr. Ananya Rao', designation: 'Head, Computer Science', departmentId: 'D01', email: 'ananya.rao@demo.institute', phone: '—', tasksAssigned: 14, tasksCompleted: 11, onTime: 88, attendance: 96, goal: 89, quality: 92, workload: 'Heavy' },
  { id: 'S02', name: 'Prof. Vikram Mehta', designation: 'Professor, CS', departmentId: 'D01', email: 'vikram.mehta@demo.institute', phone: '—', tasksAssigned: 9, tasksCompleted: 8, onTime: 91, attendance: 94, goal: 90, quality: 88, workload: 'Balanced' },
  { id: 'S03', name: 'Ms. Priya Nair', designation: 'Assistant Professor, CS', departmentId: 'D01', email: 'priya.nair@demo.institute', phone: '—', tasksAssigned: 7, tasksCompleted: 5, onTime: 79, attendance: 97, goal: 82, quality: 85, workload: 'Balanced' },
  { id: 'S04', name: 'Mr. Arjun Desai', designation: 'Lab Coordinator, CS', departmentId: 'D01', email: 'arjun.desai@demo.institute', phone: '—', tasksAssigned: 6, tasksCompleted: 6, onTime: 100, attendance: 92, goal: 95, quality: 90, workload: 'Light' },
  { id: 'S05', name: 'Dr. Kavita Sharma', designation: 'Head, Mathematics', departmentId: 'D02', email: 'kavita.sharma@demo.institute', phone: '—', tasksAssigned: 11, tasksCompleted: 10, onTime: 94, attendance: 98, goal: 93, quality: 94, workload: 'Balanced' },
  { id: 'S06', name: 'Mr. Rohan Iyer', designation: 'Associate Professor, Maths', departmentId: 'D02', email: 'rohan.iyer@demo.institute', phone: '—', tasksAssigned: 8, tasksCompleted: 7, onTime: 86, attendance: 95, goal: 87, quality: 86, workload: 'Balanced' },
  { id: 'S07', name: 'Ms. Sneha Kulkarni', designation: 'Assistant Professor, Maths', departmentId: 'D02', email: 'sneha.kulkarni@demo.institute', phone: '—', tasksAssigned: 5, tasksCompleted: 4, onTime: 82, attendance: 93, goal: 84, quality: 83, workload: 'Light' },
  { id: 'S08', name: 'Mr. Daniel D’Souza', designation: 'Tutor, Mathematics', departmentId: 'D02', email: 'daniel.dsouza@demo.institute', phone: '—', tasksAssigned: 4, tasksCompleted: 3, onTime: 75, attendance: 90, goal: 78, quality: 80, workload: 'Light' },
  { id: 'S09', name: 'Dr. Farah Khan', designation: 'Head, Physics', departmentId: 'D03', email: 'farah.khan@demo.institute', phone: '—', tasksAssigned: 12, tasksCompleted: 9, onTime: 81, attendance: 95, goal: 84, quality: 87, workload: 'Heavy' },
  { id: 'S10', name: 'Prof. Nitin Patil', designation: 'Professor, Physics', departmentId: 'D03', email: 'nitin.patil@demo.institute', phone: '—', tasksAssigned: 8, tasksCompleted: 6, onTime: 77, attendance: 91, goal: 80, quality: 84, workload: 'Balanced' },
  { id: 'S11', name: 'Ms. Tara Menon', designation: 'Lab In-charge, Physics', departmentId: 'D03', email: 'tara.menon@demo.institute', phone: '—', tasksAssigned: 6, tasksCompleted: 5, onTime: 88, attendance: 96, goal: 86, quality: 89, workload: 'Balanced' },
  { id: 'S12', name: 'Mr. Kiran Reddy', designation: 'Assistant Professor, Physics', departmentId: 'D03', email: 'kiran.reddy@demo.institute', phone: '—', tasksAssigned: 5, tasksCompleted: 4, onTime: 83, attendance: 89, goal: 81, quality: 82, workload: 'Light' },
  { id: 'S13', name: 'Dr. Meera Joshi', designation: 'Head, Commerce & Management', departmentId: 'D04', email: 'meera.joshi@demo.institute', phone: '—', tasksAssigned: 13, tasksCompleted: 10, onTime: 85, attendance: 97, goal: 87, quality: 90, workload: 'Heavy' },
  { id: 'S14', name: 'Mr. Sanjay Verma', designation: 'Professor, Commerce', departmentId: 'D04', email: 'sanjay.verma@demo.institute', phone: '—', tasksAssigned: 7, tasksCompleted: 6, onTime: 90, attendance: 94, goal: 88, quality: 87, workload: 'Balanced' },
  { id: 'S15', name: 'Ms. Divya Pillai', designation: 'Assistant Professor, Management', departmentId: 'D04', email: 'divya.pillai@demo.institute', phone: '—', tasksAssigned: 6, tasksCompleted: 5, onTime: 84, attendance: 92, goal: 83, quality: 85, workload: 'Balanced' },
  { id: 'S16', name: 'Mr. Amit Bose', designation: 'Placement Officer', departmentId: 'D04', email: 'amit.bose@demo.institute', phone: '—', tasksAssigned: 9, tasksCompleted: 7, onTime: 79, attendance: 93, goal: 82, quality: 84, workload: 'Balanced' },
  { id: 'S17', name: 'Dr. Lakshmi Iyer', designation: 'Head, Humanities', departmentId: 'D05', email: 'lakshmi.iyer@demo.institute', phone: '—', tasksAssigned: 10, tasksCompleted: 9, onTime: 92, attendance: 98, goal: 91, quality: 93, workload: 'Balanced' },
  { id: 'S18', name: 'Prof. George Mathew', designation: 'Professor, English', departmentId: 'D05', email: 'george.mathew@demo.institute', phone: '—', tasksAssigned: 6, tasksCompleted: 6, onTime: 95, attendance: 96, goal: 94, quality: 91, workload: 'Light' },
  { id: 'S19', name: 'Ms. Ritu Singh', designation: 'Assistant Professor, History', departmentId: 'D05', email: 'ritu.singh@demo.institute', phone: '—', tasksAssigned: 5, tasksCompleted: 4, onTime: 81, attendance: 91, goal: 82, quality: 84, workload: 'Light' },
  { id: 'S20', name: 'Mr. Yusuf Sheikh', designation: 'Counsellor, Humanities', departmentId: 'D05', email: 'yusuf.sheikh@demo.institute', phone: '—', tasksAssigned: 4, tasksCompleted: 4, onTime: 100, attendance: 94, goal: 90, quality: 88, workload: 'Light' },
  { id: 'S21', name: 'Dr. Neha Gupta', designation: 'Head, Life Sciences', departmentId: 'D06', email: 'neha.gupta@demo.institute', phone: '—', tasksAssigned: 12, tasksCompleted: 8, onTime: 76, attendance: 93, goal: 82, quality: 86, workload: 'Heavy' },
  { id: 'S22', name: 'Prof. Samuel Thomas', designation: 'Professor, Biology', departmentId: 'D06', email: 'samuel.thomas@demo.institute', phone: '—', tasksAssigned: 7, tasksCompleted: 5, onTime: 80, attendance: 90, goal: 79, quality: 83, workload: 'Balanced' },
  { id: 'S23', name: 'Ms. Aisha Khan', designation: 'Assistant Professor, Botany', departmentId: 'D06', email: 'aisha.khan@demo.institute', phone: '—', tasksAssigned: 6, tasksCompleted: 5, onTime: 87, attendance: 95, goal: 85, quality: 87, workload: 'Balanced' },
  { id: 'S24', name: 'Mr. Rahul Jain', designation: 'Lab Technician, Life Sciences', departmentId: 'D06', email: 'rahul.jain@demo.institute', phone: '—', tasksAssigned: 5, tasksCompleted: 4, onTime: 84, attendance: 92, goal: 83, quality: 81, workload: 'Light' },
]
const ap = (id: string, title: string, category: string, applicant: string, applicantId: string, dept: string, date: string, priority: Approval['priority'], status: Approval['status'], amount: number | undefined, description: string, justification: string, awaitingInfo = false): Approval => ({
  id, title, category, applicant, applicantId, departmentId: dept, date, priority, status, amount, description, justification, awaitingInfo,
  attachments: ['Supporting document (demo).pdf', 'Estimate / note (demo).pdf'],
  comments: status === 'Returned' ? [{ author: 'Director', text: 'Please revise the estimate and resubmit with department sign-off.', date: '2026-10-30' }] : [],
  history: [{ date, action: 'Submitted', actor: applicant }, ...(status !== 'Pending' ? [{ date: '2026-11-01', action: status, actor: 'Director' }] : [])],
  requestedDates: 'As stated in the description',
})
export const approvals: Approval[] = [
  ap('REQ-1042', 'Medical leave — 5 days', 'Staff Leave Requests', 'Ms. Priya Nair', 'S03', 'D01', '2026-11-02', 'High', 'Pending', undefined, 'Medical leave from 10–14 Nov 2026 for a scheduled procedure, with classes covered by Prof. Mehta.', 'Medical certificate attached (demo). Classes already rearranged.'),
  ap('REQ-1041', 'Purchase of 30 lab computers', 'Purchase and Procurement', 'Dr. Ananya Rao', 'S01', 'D01', '2026-11-01', 'Critical', 'Pending', 1425000, 'Replace ageing systems in Lab 2 before the practical examination window.', 'Current machines fail frequently; vendor quote valid until 20 Nov.', true),
  ap('REQ-1040', 'National seminar on AI in Education', 'Event, Seminar and Workshop Proposals', 'Dr. Meera Joshi', 'S13', 'D04', '2026-10-31', 'Medium', 'Pending', 185000, 'Two-day seminar with four external speakers, 180 expected participants.', 'Aligns with the academic calendar and industry linkage target.'),
  ap('REQ-1039', 'Examination duty allowance revision', 'Academic and Examination Requests', 'Dr. Kavita Sharma', 'S05', 'D02', '2026-10-30', 'Medium', 'Pending', 64000, 'Revise invigilation allowance for the December examination cycle.', 'Rates unchanged since 2023; workload has increased with two additional papers.'),
  ap('REQ-1038', 'Annual maintenance — Physics labs', 'Infrastructure and Maintenance', 'Dr. Farah Khan', 'S09', 'D03', '2026-10-29', 'High', 'Pending', 240000, 'Annual service contract for spectrometers and safety equipment.', 'Vendor inspection due before the accreditation visit.'),
  ap('REQ-1037', 'Recruitment: Assistant Professor, Commerce', 'Recruitment and Staff Requests', 'Dr. Meera Joshi', 'S13', 'D04', '2026-10-28', 'High', 'Pending', undefined, 'Fill the vacancy created by retirement, effective January 2027.', 'Student intake in Commerce has grown 12% this year.'),
  ap('REQ-1036', 'Library subscription renewal', 'IT and Equipment Requests', 'Dr. Lakshmi Iyer', 'S17', 'D05', '2026-10-27', 'Low', 'Pending', 95000, 'Renew digital journal access for 2027.', 'Usage rose 31% in the last academic year.'),
  ap('REQ-1035', 'Field visit permission — Life Sciences', 'Official Letters and Permissions', 'Dr. Neha Gupta', 'S21', 'D06', '2026-10-26', 'Medium', 'Pending', 42000, 'Three-day field visit for 48 second-year students with two faculty escorts.', 'Part of the approved field-work component.'),
  ap('REQ-1034', 'Budget reallocation — CS department', 'Department Budget and Expenses', 'Dr. Ananya Rao', 'S01', 'D01', '2026-10-24', 'High', 'Pending', 320000, 'Move unspent workshop funds to lab consumables for this semester.', 'Workshop was merged with the national seminar.'),
  ap('REQ-1033', 'Attendance exception — medical grounds', 'Attendance Exceptions', 'Mr. Rahul Jain', 'S24', 'D06', '2026-10-22', 'Medium', 'Pending', undefined, 'Condone 8 days of absence in October on medical grounds.', 'Certificate and department recommendation attached (demo).'),
  ap('REQ-1032', 'Conference travel — Dr. Sharma', 'Other Administrative Requests', 'Dr. Kavita Sharma', 'S05', 'D02', '2026-10-20', 'Low', 'Pending', 58000, 'Travel to present a paper at the national mathematics conference.', 'Paper accepted; institute visibility benefit.'),
  ap('REQ-1031', 'Leave — Prof. Patil', 'Staff Leave Requests', 'Prof. Nitin Patil', 'S10', 'D03', '2026-10-18', 'Medium', 'Approved', undefined, 'Casual leave, 3 days.', 'Cover arranged.'),
  ap('REQ-1030', 'Purchase of projector units', 'Purchase and Procurement', 'Ms. Tara Menon', 'S11', 'D03', '2026-10-15', 'Medium', 'Approved', 210000, 'Four projectors for seminar rooms.', 'Existing units beyond repair.'),
  ap('REQ-1029', 'Workshop budget — Humanities', 'Event, Seminar and Workshop Proposals', 'Dr. Lakshmi Iyer', 'S17', 'D05', '2026-10-12', 'Medium', 'Rejected', 120000, 'Writing workshop for final-year students.', 'Overlap with an already approved programme.'),
  ap('REQ-1028', 'Server room UPS replacement', 'IT and Equipment Requests', 'Mr. Arjun Desai', 'S04', 'D01', '2026-10-08', 'High', 'Returned', 175000, 'Replace UPS units in the server room.', 'Quotation needs a second vendor comparison.'),
  ap('REQ-1027', 'Examination timetable change', 'Academic and Examination Requests', 'Dr. Farah Khan', 'S09', 'D03', '2026-10-05', 'Low', 'Approved', undefined, 'Swap two papers to avoid a clash for combined electives.', 'Approved by the examination committee.'),
  ap('REQ-1026', 'Hostel repair — Block B', 'Infrastructure and Maintenance', 'Mr. Sanjay Verma', 'S14', 'D04', '2026-10-02', 'Critical', 'Pending', 480000, 'Urgent plumbing and electrical repair in Block B.', 'Safety inspection flagged the work as priority.'),
  ap('REQ-1025', 'Guest lecture series', 'Event, Seminar and Workshop Proposals', 'Prof. George Mathew', 'S18', 'D05', '2026-09-28', 'Low', 'Approved', 45000, 'Six guest lectures across the semester.', 'Funded from the department activity budget.'),
  ap('REQ-1024', 'Research grant matching funds', 'Department Budget and Expenses', 'Dr. Neha Gupta', 'S21', 'D06', '2026-09-24', 'High', 'Pending', 650000, 'Institute matching contribution for an external research grant.', 'Grant conditions require a 20% institutional share.'),
  ap('REQ-1023', 'Leave — Ms. Kulkarni', 'Staff Leave Requests', 'Ms. Sneha Kulkarni', 'S07', 'D02', '2026-09-20', 'Low', 'Approved', undefined, 'Earned leave, 4 days.', 'Cover arranged.'),
  ap('REQ-1022', 'New classroom furniture', 'Purchase and Procurement', 'Dr. Meera Joshi', 'S13', 'D04', '2026-09-16', 'Medium', 'Rejected', 390000, 'Furniture for two new classrooms.', 'Deferred to the next capital budget cycle.'),
]
const tk = (id: string, title: string, category: string, dept: string, resp: string, team: string[], priority: Task['priority'], status: Task['status'], start: string, due: string, progress: number, desc: string, outcome: string): Task => ({
  id, title, category, departmentId: dept, responsibleId: resp, teamIds: team, priority, status, startDate: start, dueDate: due, progress, description: desc, outcome, instructions: 'Follow the institute checklist, keep the director informed of blockers, and file evidence before marking for review.',
  subtasks: [{ id: id + '-a', title: 'Prepare plan and checklist', done: progress >= 30 }, { id: id + '-b', title: 'Complete main deliverable', done: progress >= 70 }, { id: id + '-c', title: 'Review and file evidence', done: progress >= 100 }],
  milestones: ['Plan approved', 'Draft ready', 'Final submission'], dependencies: [], attachments: ['Checklist (demo).pdf'], notes: '', comments: [], createdAt: start,
})
export const tasks: Task[] = [
  tk('TSK-210', 'Accreditation evidence file — Criterion 3', 'Quality Assurance', 'D01', 'S01', ['S02', 'S03'], 'Critical', 'In Progress', '2026-10-20', '2026-11-20', 62, 'Compile teaching-learning evidence, course files and outcome records for the accreditation visit.', 'Complete evidence file accepted by the IQAC.'),
  tk('TSK-209', 'December examination timetable', 'Examinations', 'D02', 'S05', ['S06'], 'High', 'Submitted for Review', '2026-10-25', '2026-11-10', 90, 'Finalise the December timetable avoiding clashes for combined electives.', 'Published timetable with zero unresolved clashes.'),
  tk('TSK-208', 'Lab safety audit — Physics', 'Infrastructure', 'D03', 'S09', ['S11'], 'High', 'In Progress', '2026-10-28', '2026-11-12', 45, 'Audit all Physics labs against the safety checklist and close open items.', 'Signed audit report with all critical items closed.'),
  tk('TSK-207', 'Admissions outreach — Phase 2', 'Admissions', 'D04', 'S13', ['S16'], 'Medium', 'In Progress', '2026-11-01', '2026-11-30', 35, 'Run school outreach visits and the open-day programme for 2027 admissions.', '400 qualified enquiries recorded.'),
  tk('TSK-206', 'Placement drive coordination', 'Academic', 'D04', 'S16', ['S14'], 'High', 'Not Started', '2026-11-05', '2026-11-25', 0, 'Coordinate the November placement drive with 18 partner employers.', 'Placement schedule published and employer slots confirmed.'),
  tk('TSK-205', 'Library digitisation — Phase 1', 'Administration', 'D05', 'S17', ['S18'], 'Medium', 'Blocked', '2026-10-15', '2026-11-05', 40, 'Digitise rare collections and catalogue metadata.', 'First 2,000 items digitised and catalogued.'),
  tk('TSK-204', 'Fee reconciliation — October', 'Finance', 'D04', 'S14', [], 'High', 'In Progress', '2026-10-20', '2026-10-31', 80, 'Reconcile October fee receipts with bank statements.', 'Reconciliation signed off with no unexplained items.'),
  tk('TSK-203', 'Student mentorship roster', 'Student Welfare', 'D05', 'S20', ['S19'], 'Low', 'Completed', '2026-10-01', '2026-10-20', 100, 'Assign mentors to all first-year students.', 'Roster published; every student has a mentor.'),
  tk('TSK-202', 'Research symposium programme', 'Events', 'D06', 'S21', ['S23'], 'Medium', 'Submitted for Review', '2026-10-22', '2026-11-08', 85, 'Finalise speakers, schedule and proceedings for the research symposium.', 'Printed programme and proceedings ready.'),
  tk('TSK-201', 'Course file audit — CS', 'Quality Assurance', 'D01', 'S02', ['S03'], 'Medium', 'In Progress', '2026-10-26', '2026-11-15', 55, 'Audit course files for all CS papers this semester.', 'Audit report with corrective actions.'),
  tk('TSK-200', 'Hostel inspection report', 'Infrastructure', 'D03', 'S10', ['S11'], 'Low', 'Not Started', '2026-11-03', '2026-11-18', 0, 'Quarterly hostel inspection covering safety, hygiene and maintenance.', 'Inspection report with action list.'),
  tk('TSK-199', 'Alumni meet planning', 'Events', 'D04', 'S13', ['S15'], 'Medium', 'In Progress', '2026-10-18', '2026-12-05', 28, 'Plan the annual alumni meet, venue, invitations and programme.', 'Confirmed venue, guest list and programme.'),
  tk('TSK-198', 'Attendance analytics — October', 'Academic', 'D02', 'S06', [], 'Low', 'Completed', '2026-10-25', '2026-11-01', 100, 'Analyse October attendance by department and flag low-attendance cohorts.', 'Analytics note circulated to heads.'),
  tk('TSK-197', 'New faculty induction', 'Administration', 'D01', 'S01', ['S04'], 'Medium', 'In Progress', '2026-11-02', '2026-11-22', 20, 'Run induction for three new faculty members joining in November.', 'Induction completed with feedback collected.'),
  tk('TSK-196', 'Botanical garden upkeep plan', 'Infrastructure', 'D06', 'S23', ['S24'], 'Low', 'Not Started', '2026-11-04', '2026-11-28', 0, 'Seasonal upkeep plan for the botanical garden and field plots.', 'Approved upkeep schedule.'),
]
// fix the intentionally-typed overdue task: keep it In Progress so overdue logic applies
tasks.find(t => t.id === 'TSK-204')!.status = 'In Progress'
tasks.find(t => t.id === 'TSK-205')!.blockedReason = 'Vendor access to the archive room is pending approval from Estates.'
tasks.find(t => t.id === 'TSK-204')!.delayReason = 'Bank statement for the last week of October arrived late.'
export const notifications: NotificationItem[] = [
  { id: 'N12', title: 'New approval request', description: 'REQ-1042 — Medical leave from Ms. Priya Nair needs review.', date: '2026-11-02T09:20:00', category: 'Approval', read: false, link: '/approvals', recordId: 'REQ-1042' },
  { id: 'N11', title: 'Task submitted for review', description: 'TSK-209 — December examination timetable is ready for your review.', date: '2026-11-01T16:40:00', category: 'Task', read: false, link: '/tasks', recordId: 'TSK-209' },
  { id: 'N10', title: 'Deadline approaching', description: 'TSK-208 — Lab safety audit is due in 9 days.', date: '2026-11-01T08:00:00', category: 'Deadline', read: false, link: '/tasks', recordId: 'TSK-208' },
  { id: 'N09', title: 'Task overdue', description: 'TSK-204 — Fee reconciliation is past its due date.', date: '2026-10-31T18:00:00', category: 'Overdue', read: false, link: '/tasks', recordId: 'TSK-204' },
  { id: 'N08', title: 'Performance alert', description: 'Life Sciences achievement (82%) is below its 88% target.', date: '2026-10-30T11:00:00', category: 'Performance', read: true, link: '/performance' },
  { id: 'N07', title: 'Approval returned', description: 'REQ-1028 — Server room UPS replacement was returned for correction.', date: '2026-10-29T14:20:00', category: 'Approval', read: true, link: '/approvals', recordId: 'REQ-1028' },
  { id: 'N06', title: 'Task completed', description: 'TSK-203 — Student mentorship roster is complete.', date: '2026-10-20T10:00:00', category: 'Task', read: true, link: '/tasks', recordId: 'TSK-203' },
  { id: 'N05', title: 'System notice (demo)', description: 'Demo data resets from Settings. No real institute data is stored here.', date: '2026-10-15T09:00:00', category: 'System', read: true, link: '/settings' },
]
export const activity: ActivityItem[] = [
  { id: 'A08', date: '2026-11-02T09:20:00', actor: 'Ms. Priya Nair', action: 'Submitted approval', recordType: 'Approval', recordId: 'REQ-1042', description: 'Medical leave — 5 days' },
  { id: 'A07', date: '2026-11-01T16:40:00', actor: 'Dr. Kavita Sharma', action: 'Submitted task for review', recordType: 'Task', recordId: 'TSK-209', description: 'December examination timetable', from: 'In Progress', to: 'Submitted for Review' },
  { id: 'A06', date: '2026-11-01T10:05:00', actor: 'Director', action: 'Approved approval', recordType: 'Approval', recordId: 'REQ-1031', description: 'Leave — Prof. Patil', from: 'Pending', to: 'Approved' },
  { id: 'A05', date: '2026-10-30T11:30:00', actor: 'Dr. Ananya Rao', action: 'Created task', recordType: 'Task', recordId: 'TSK-210', description: 'Accreditation evidence file — Criterion 3' },
  { id: 'A04', date: '2026-10-29T14:20:00', actor: 'Director', action: 'Returned approval', recordType: 'Approval', recordId: 'REQ-1028', description: 'Server room UPS replacement', from: 'Pending', to: 'Returned' },
  { id: 'A03', date: '2026-10-28T09:00:00', actor: 'Dr. Farah Khan', action: 'Created task', recordType: 'Task', recordId: 'TSK-208', description: 'Lab safety audit — Physics' },
  { id: 'A02', date: '2026-10-20T10:00:00', actor: 'Mr. Yusuf Sheikh', action: 'Completed task', recordType: 'Task', recordId: 'TSK-203', description: 'Student mentorship roster', from: 'Submitted for Review', to: 'Completed' },
  { id: 'A01', date: '2026-10-15T09:00:00', actor: 'System (demo)', action: 'Demo data loaded', recordType: 'System', recordId: '—', description: 'Seed data for demonstration only' },
]
export const monthlyTrend = [
  { month: 'Jun', target: 84, actual: 80, tasks: 42, completed: 34 },
  { month: 'Jul', target: 85, actual: 83, tasks: 48, completed: 40 },
  { month: 'Aug', target: 86, actual: 84, tasks: 51, completed: 43 },
  { month: 'Sep', target: 88, actual: 86, tasks: 55, completed: 47 },
  { month: 'Oct', target: 89, actual: 87, tasks: 58, completed: 50 },
  { month: 'Nov', target: 90, actual: 88, tasks: 44, completed: 31 },
]
export const events = [
  { title: 'Academic Council meeting', date: '2026-11-05', time: '10:00 AM', type: 'Meeting' },
  { title: 'Accreditation mock visit', date: '2026-11-12', time: '09:00 AM', type: 'Review' },
  { title: 'National seminar on AI in Education', date: '2026-11-18', time: '09:30 AM', type: 'Event' },
  { title: 'December examination timetable freeze', date: '2026-11-10', time: '05:00 PM', type: 'Deadline' },
  { title: 'Placement drive — Day 1', date: '2026-11-25', time: '09:00 AM', type: 'Event' },
  { title: 'Department review — Life Sciences', date: '2026-11-20', time: '11:00 AM', type: 'Review' },
]
