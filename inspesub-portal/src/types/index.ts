import type {
  User,
  EmployeeProfile,
  Team,
  TeamMember,
  AttendanceRecord,
  Payslip,
  RdoRecord,
  Document,
  Announcement,
  Notification,
  AuditLog,
} from "@prisma/client"

export type { User, EmployeeProfile, Team, TeamMember, AttendanceRecord, Payslip, RdoRecord, Document, Announcement, Notification, AuditLog }

export type UserWithProfile = User & {
  profile: EmployeeProfile | null
  teamMemberships: (TeamMember & { team: Team })[]
}

export type SafeUser = Omit<User, "password"> & {
  profile: EmployeeProfile | null
}

export type TeamWithMembers = Team & {
  members: (TeamMember & { user: SafeUser })[]
  supervisor: SafeUser | null
  _count: { members: number; rdoRecords: number }
}

export type AttendanceWithUser = AttendanceRecord & {
  user: SafeUser
  team: Team | null
}

export type PayslipWithEmployee = Payslip & {
  employee: SafeUser
  uploadedBy: SafeUser
}

export type RdoWithRelations = RdoRecord & {
  team: Team
  author: SafeUser
  reviewer: SafeUser | null
  files: { id: string; fileName: string; fileUrl: string; fileSize: number | null }[]
}

export type DocumentWithUser = Document & {
  user: SafeUser
}

export type AnnouncementWithAuthor = Announcement & {
  author: SafeUser
}

// ============================================
// API Response types
// ============================================

export type ApiResponse<T = unknown> = {
  data?: T
  error?: string
  message?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================
// Dashboard types
// ============================================

export type MemberDashboardData = {
  currentMonth: {
    worked: number
    dayOff: number
    embarked: number
    vacation: number
    notInformed: number
    total: number
  }
  team: Team | null
  latestPayslip: Payslip | null
  pendingCount: number
  recentDocuments: Document[]
  unreadNotifications: number
  announcements: Announcement[]
}

export type AdminDashboardData = {
  totalEmployees: number
  pendingApprovals: number
  totalTeams: number
  activeTeams: number
  monthAttendanceClosed: number
  payslipsThisMonth: number
  rdoPending: number
  expiringDocuments: number
  recentAuditLogs: AuditLog[]
  announcements: Announcement[]
}
