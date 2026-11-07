import type { Approval, ActivityItem, Department, NotificationItem, Staff, Task } from '../types'

export const departments: Department[] = [
  { id: 'D01', name: 'AI', short: 'AI', headId: 'S01', students: 642, target: 92, achievement: 89, budget: 4200000, spent: 3180000 },
  { id: 'D02', name: 'MANAGEMENT', short: 'MGMT', headId: 'S05', students: 388, target: 90, achievement: 93, budget: 1800000, spent: 1210000 },
  { id: 'D03', name: 'UG & PG', short: 'UGPG', headId: 'S09', students: 341, target: 88, achievement: 84, budget: 2600000, spent: 2090000 },
  { id: 'D04', name: 'MULTIMEDIA', short: 'MM', headId: 'S13', students: 517, target: 90, achievement: 87, budget: 2100000, spent: 1450000 },
]

export const staff: Staff[] = [
  { id: 'S01', name: 'Dr. Ananya Rao', designation: 'Head, AI', departmentId: 'D01', email: 'ananya.rao@example.org', phone: '', tasksAssigned: 1, tasksCompleted: 0, onTime: 0, attendance: 96, goal: 89, quality: 92, workload: 'Light' },
]

function demoFeeRequest(input: {
  id: string; applicant: string; applicantId: string; departmentId: string; date: string;
  priority: Approval['priority']; amount: number; status: Approval['status']; course: string;
  totalFees: number; amountPaid: number; courseDuration: string; startingDate: string; justification: string;
}): Approval {
  const balanceAfterDiscount = input.totalFees - input.amount - input.amountPaid
  const formatAmount = (amount: number) => amount.toLocaleString('en-IN')
  return {
    id: input.id, title: 'Tuition fee concession', category: 'Fee Concession', applicant: input.applicant,
    applicantId: input.applicantId, departmentId: input.departmentId, date: input.date,
    priority: input.priority, amount: input.amount, status: input.status,
    studentContact: `+91 98765 ${String(50000 + Number(input.id.slice(-4))).slice(-5)} (demo)`,
    totalFees: input.totalFees, course: input.course, courseDuration: input.courseDuration,
    amountPaid: input.amountPaid, startingDate: input.startingDate, concessionType: 'Need-based fee concession',
    description: `Request a tuition fee concession for the 2026-27 academic year. Total fees: INR ${formatAmount(input.totalFees)}; amount paid: INR ${formatAmount(input.amountPaid)}; requested concession: INR ${formatAmount(input.amount)}; remaining balance if approved: INR ${formatAmount(balanceAfterDiscount)}.`,
    justification: input.justification, attachments: [], comments: [],
    history: [
      { date: input.date, action: 'Submitted', actor: input.applicant },
      ...(input.status === 'Pending' ? [] : [{ date: input.date, action: input.status, actor: 'Director' }]),
    ],
  }
}

const additionalFeeRequests: Approval[] = [
  demoFeeRequest({ id: 'REQ-1046', applicant: 'Meera Nair', applicantId: 'STU-26-1046', departmentId: 'D02', date: '2026-11-05', priority: 'High', amount: 18000, status: 'Pending', course: 'MBA', totalFees: 90000, amountPaid: 30000, courseDuration: '2 years', startingDate: '2026-08-01', justification: 'The student is requesting need-based support after a recent household income reduction and wants to continue the programme without interrupting studies.' }),
  demoFeeRequest({ id: 'REQ-1047', applicant: 'Rohan Das', applicantId: 'STU-26-1047', departmentId: 'D03', date: '2026-11-05', priority: 'Medium', amount: 15000, status: 'Pending', course: 'M.Sc. Psychology', totalFees: 75000, amountPaid: 25000, courseDuration: '2 years', startingDate: '2026-08-01', justification: 'The applicant has requested partial tuition assistance to manage a short-term financial difficulty while remaining enrolled.' }),
  demoFeeRequest({ id: 'REQ-1048', applicant: 'Sana Iqbal', applicantId: 'STU-26-1048', departmentId: 'D04', date: '2026-11-04', priority: 'High', amount: 22000, status: 'Approved', course: 'B.Sc. Multimedia', totalFees: 110000, amountPaid: 50000, courseDuration: '3 years', startingDate: '2026-08-01', justification: 'The family has requested need-based assistance to cover part of the remaining programme fees following an unexpected change in household circumstances.' }),
  demoFeeRequest({ id: 'REQ-1049', applicant: 'Vihaan Shah', applicantId: 'STU-26-1049', departmentId: 'D01', date: '2026-11-04', priority: 'Medium', amount: 24000, status: 'Pending', course: 'B.Sc. Artificial Intelligence', totalFees: 120000, amountPaid: 60000, courseDuration: '3 years', startingDate: '2026-08-01', justification: 'The student is seeking a partial concession to make the remaining tuition balance manageable and continue the course.' }),
  demoFeeRequest({ id: 'REQ-1050', applicant: 'Kavya Menon', applicantId: 'STU-26-1050', departmentId: 'D02', date: '2026-11-03', priority: 'Critical', amount: 30000, status: 'Pending', course: 'BBA', totalFees: 150000, amountPaid: 45000, courseDuration: '3 years', startingDate: '2026-08-01', justification: 'The applicant has reported an urgent financial hardship and requests timely consideration so the next fee payment does not interrupt attendance.' }),
  demoFeeRequest({ id: 'REQ-1051', applicant: 'Arjun Pillai', applicantId: 'STU-26-1051', departmentId: 'D03', date: '2026-11-03', priority: 'Medium', amount: 12000, status: 'Returned', course: 'B.Com', totalFees: 60000, amountPaid: 20000, courseDuration: '3 years', startingDate: '2026-08-01', justification: 'The student is requesting partial support because current household expenses make it difficult to pay the remaining tuition at once.' }),
  demoFeeRequest({ id: 'REQ-1052', applicant: 'Isha Kapoor', applicantId: 'STU-26-1052', departmentId: 'D04', date: '2026-11-02', priority: 'Low', amount: 18000, status: 'Pending', course: 'Diploma in Graphic Design', totalFees: 90000, amountPaid: 30000, courseDuration: '2 years', startingDate: '2026-08-01', justification: 'The applicant has requested need-based assistance to help meet the programme fee while managing a temporary reduction in family income.' }),
  demoFeeRequest({ id: 'REQ-1053', applicant: 'Dev Mehta', applicantId: 'STU-26-1053', departmentId: 'D01', date: '2026-11-02', priority: 'High', amount: 24000, status: 'Approved', course: 'B.Sc. Data Science', totalFees: 120000, amountPaid: 50000, courseDuration: '3 years', startingDate: '2026-08-01', justification: 'The student requested partial tuition assistance after a change in household income. The concession supports continued enrolment.' }),
  demoFeeRequest({ id: 'REQ-1054', applicant: 'Tara Bose', applicantId: 'STU-26-1054', departmentId: 'D03', date: '2026-11-01', priority: 'Medium', amount: 20000, status: 'Rejected', course: 'M.A. English', totalFees: 100000, amountPaid: 40000, courseDuration: '2 years', startingDate: '2026-08-01', justification: 'The applicant is seeking a partial fee concession to manage current financial commitments and complete the programme.' }),
  demoFeeRequest({ id: 'REQ-1055', applicant: 'Neel Joshi', applicantId: 'STU-26-1055', departmentId: 'D04', date: '2026-10-31', priority: 'Low', amount: 16000, status: 'Pending', course: 'B.A. Animation', totalFees: 80000, amountPaid: 25000, courseDuration: '3 years', startingDate: '2026-08-01', justification: 'The student has requested need-based support to reduce the remaining balance and continue the course without delay.' }),
]

export const approvals: Approval[] = [
  {
    id: 'REQ-1045',
    title: 'Tuition fee concession',
    category: 'Fee Concession',
    applicant: 'Aarav Kulkarni',
    applicantId: 'STU-26-1045',
    departmentId: 'D01',
    date: '2026-11-06',
    priority: 'High',
    amount: 24000,
    studentContact: '+91 98765 43210 (demo)',
    totalFees: 120000,
    course: 'B.Sc. Artificial Intelligence',
    courseDuration: '3 years',
    amountPaid: 48000,
    startingDate: '2026-08-01',
    concessionType: 'Need-based fee concession',
    status: 'Pending',
    description: 'Request a 20% tuition fee concession for the 2026-27 academic year. The annual tuition fee is INR 120,000; INR 48,000 has been paid, and the requested concession is INR 24,000, leaving INR 48,000 payable if approved.',
    justification: 'Need-based request: the household has experienced a reduction in income, making the remaining tuition cost difficult to meet. The student is seeking partial assistance to continue the programme.',
    attachments: [],
    comments: [],
    history: [{ date: '2026-11-06', action: 'Submitted', actor: 'Aarav Kulkarni' }],
  },
  ...additionalFeeRequests,
]

export const tasks: Task[] = [
  {
    id: 'TSK-210',
    title: 'Accreditation evidence file',
    category: 'Quality Assurance',
    departmentId: 'D01',
    responsibleId: 'S01',
    teamIds: [],
    priority: 'High',
    status: 'In Progress',
    startDate: '2026-11-01',
    dueDate: '2026-11-20',
    dueTime: '17:00',
    progress: 50,
    description: 'Compile the evidence file for the institute accreditation review.',
    outcome: 'Evidence file ready for review.',
    instructions: '',
    dependencies: [],
    attachments: [],
    notes: '',
    comments: [],
    createdAt: '2026-11-01',
  },
]

export const notifications: NotificationItem[] = [
  {
    id: 'N01',
    title: 'Fee concession request received',
    description: 'REQ-1045 is awaiting review.',
    date: '2026-11-06T09:00:00',
    category: 'Approval',
    read: false,
    link: '/approvals',
    recordId: 'REQ-1045',
  },
]

export const activity: ActivityItem[] = [
  {
    id: 'A01',
    date: '2026-11-06T09:00:00',
    actor: 'Aarav Kulkarni',
    action: 'Submitted approval',
    recordType: 'Approval',
    recordId: 'REQ-1045',
    description: 'Tuition fee concession',
  },
]

export const monthlyTrend = [
  { month: 'Nov', target: 92, actual: 89, tasks: 1, completed: 0 },
]

export const events = [
  { title: 'Accreditation evidence file due', date: '2026-11-20', time: '05:00 PM', type: 'Deadline' },
]
