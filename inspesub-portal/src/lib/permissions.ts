import type { UserRole } from "@prisma/client"

// ============================================
// RBAC - Role Based Access Control
// ============================================

export const ROLES = {
  ADMIN_MASTER: "admin_master" as UserRole,
  RH: "rh" as UserRole,
  SUPERVISOR: "supervisor" as UserRole,
  MEMBER: "member" as UserRole,
} as const

export const ROLE_LABELS: Record<UserRole, string> = {
  admin_master: "Administrador Master",
  rh: "Recursos Humanos",
  supervisor: "Supervisor",
  member: "Colaborador",
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin_master: 4,
  rh: 3,
  supervisor: 2,
  member: 1,
}

// Verifica se um role tem acesso a outro (hierarquia)
export function hasHigherRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

// Verifica se o usuário tem um dos roles permitidos
export function hasPermission(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}

// ============================================
// Definição de permissões por módulo
// ============================================

export const PERMISSIONS = {
  // Usuários
  users: {
    view: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
    create: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
    edit: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
    delete: [ROLES.ADMIN_MASTER] as UserRole[],
    approve: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
  },

  // Equipes
  teams: {
    view: [ROLES.ADMIN_MASTER, ROLES.RH, ROLES.SUPERVISOR, ROLES.MEMBER] as UserRole[],
    create: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
    edit: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
    delete: [ROLES.ADMIN_MASTER] as UserRole[],
    manageMembers: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
  },

  // Presença
  attendance: {
    viewOwn: [ROLES.ADMIN_MASTER, ROLES.RH, ROLES.SUPERVISOR, ROLES.MEMBER] as UserRole[],
    viewAll: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
    viewTeam: [ROLES.ADMIN_MASTER, ROLES.RH, ROLES.SUPERVISOR] as UserRole[],
    mark: [ROLES.ADMIN_MASTER, ROLES.RH, ROLES.SUPERVISOR, ROLES.MEMBER] as UserRole[],
    edit: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
    close: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
    export: [ROLES.ADMIN_MASTER, ROLES.RH, ROLES.SUPERVISOR] as UserRole[],
  },

  // Contracheques
  payslips: {
    viewOwn: [ROLES.ADMIN_MASTER, ROLES.RH, ROLES.SUPERVISOR, ROLES.MEMBER] as UserRole[],
    viewAll: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
    upload: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
    delete: [ROLES.ADMIN_MASTER] as UserRole[],
  },

  // RDO
  rdo: {
    viewOwn: [ROLES.ADMIN_MASTER, ROLES.RH, ROLES.SUPERVISOR, ROLES.MEMBER] as UserRole[],
    viewAll: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
    viewTeam: [ROLES.ADMIN_MASTER, ROLES.RH, ROLES.SUPERVISOR] as UserRole[],
    create: [ROLES.ADMIN_MASTER, ROLES.RH, ROLES.SUPERVISOR, ROLES.MEMBER] as UserRole[],
    review: [ROLES.ADMIN_MASTER, ROLES.RH, ROLES.SUPERVISOR] as UserRole[],
    approve: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
  },

  // Documentos
  documents: {
    viewOwn: [ROLES.ADMIN_MASTER, ROLES.RH, ROLES.SUPERVISOR, ROLES.MEMBER] as UserRole[],
    viewAll: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
    upload: [ROLES.ADMIN_MASTER, ROLES.RH, ROLES.SUPERVISOR, ROLES.MEMBER] as UserRole[],
    uploadForOthers: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
    delete: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
  },

  // Comunicados
  announcements: {
    view: [ROLES.ADMIN_MASTER, ROLES.RH, ROLES.SUPERVISOR, ROLES.MEMBER] as UserRole[],
    create: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
    edit: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
    delete: [ROLES.ADMIN_MASTER] as UserRole[],
  },

  // Relatórios
  reports: {
    view: [ROLES.ADMIN_MASTER, ROLES.RH, ROLES.SUPERVISOR] as UserRole[],
    export: [ROLES.ADMIN_MASTER, ROLES.RH, ROLES.SUPERVISOR] as UserRole[],
  },

  // Auditoria
  audit: {
    view: [ROLES.ADMIN_MASTER] as UserRole[],
  },

  // Configurações
  settings: {
    view: [ROLES.ADMIN_MASTER, ROLES.RH] as UserRole[],
    edit: [ROLES.ADMIN_MASTER] as UserRole[],
  },
} as const
