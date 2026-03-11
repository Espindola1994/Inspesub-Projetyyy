import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const db = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Iniciando seed do banco de dados INSPESUB...")

  // Limpar dados existentes (desenvolvimento)
  await db.auditLog.deleteMany()
  await db.notification.deleteMany()
  await db.announcement.deleteMany()
  await db.document.deleteMany()
  await db.rdoFile.deleteMany()
  await db.rdoRecord.deleteMany()
  await db.payslip.deleteMany()
  await db.attendanceMonthClosing.deleteMany()
  await db.attendanceRecord.deleteMany()
  await db.teamMember.deleteMany()
  await db.team.deleteMany()
  await db.approval.deleteMany()
  await db.employeeProfile.deleteMany()
  await db.account.deleteMany()
  await db.session.deleteMany()
  await db.user.deleteMany()
  await db.setting.deleteMany()

  // ============================================
  // CRIAR USUÁRIOS
  // ============================================

  const adminPassword = await bcrypt.hash("Admin@2024!", 12)
  const userPassword = await bcrypt.hash("Inspesub@2024", 12)

  // Admin Master
  const admin = await db.user.create({
    data: {
      name: "Administrador INSPESUB",
      email: "admin@inspesub.com.br",
      password: adminPassword,
      role: "admin_master",
      status: "active",
      profile: {
        create: {
          registration: "ADM001",
          position: "Administrador do Sistema",
          department: "TI",
          phone: "(21) 99999-0001",
          admissionDate: new Date("2020-01-01"),
        },
      },
    },
  })

  // RH
  const rh = await db.user.create({
    data: {
      name: "Maria Silva",
      email: "rh@inspesub.com.br",
      password: userPassword,
      role: "rh",
      status: "active",
      profile: {
        create: {
          registration: "RH001",
          position: "Gestora de RH",
          department: "Recursos Humanos",
          phone: "(21) 99999-0002",
          admissionDate: new Date("2021-03-01"),
        },
      },
    },
  })

  // Supervisores
  const sup1 = await db.user.create({
    data: {
      name: "João Ferreira",
      email: "joao.ferreira@inspesub.com.br",
      password: userPassword,
      role: "supervisor",
      status: "active",
      profile: {
        create: {
          registration: "SUP001",
          position: "Supervisor ROV",
          department: "Operações",
          phone: "(21) 99999-0003",
          admissionDate: new Date("2019-06-01"),
        },
      },
    },
  })

  const sup2 = await db.user.create({
    data: {
      name: "Carlos Santos",
      email: "carlos.santos@inspesub.com.br",
      password: userPassword,
      role: "supervisor",
      status: "active",
      profile: {
        create: {
          registration: "SUP002",
          position: "Supervisor de Inspeção",
          department: "Inspeções",
          phone: "(21) 99999-0004",
          admissionDate: new Date("2020-02-01"),
        },
      },
    },
  })

  // Colaboradores
  const members = await Promise.all([
    db.user.create({
      data: {
        name: "Pedro Alves",
        email: "pedro.alves@inspesub.com.br",
        password: userPassword,
        role: "member",
        status: "active",
        profile: {
          create: {
            registration: "COL001",
            position: "Piloto ROV",
            department: "Operações",
            phone: "(21) 99999-1001",
            admissionDate: new Date("2022-01-15"),
          },
        },
      },
    }),
    db.user.create({
      data: {
        name: "Lucas Oliveira",
        email: "lucas.oliveira@inspesub.com.br",
        password: userPassword,
        role: "member",
        status: "active",
        profile: {
          create: {
            registration: "COL002",
            position: "Técnico de Mergulho",
            department: "Operações",
            phone: "(21) 99999-1002",
            admissionDate: new Date("2021-08-01"),
          },
        },
      },
    }),
    db.user.create({
      data: {
        name: "Ana Costa",
        email: "ana.costa@inspesub.com.br",
        password: userPassword,
        role: "member",
        status: "active",
        profile: {
          create: {
            registration: "COL003",
            position: "Engenheira de Inspeção",
            department: "Inspeções",
            phone: "(21) 99999-1003",
            admissionDate: new Date("2023-03-01"),
          },
        },
      },
    }),
    db.user.create({
      data: {
        name: "Rafael Lima",
        email: "rafael.lima@inspesub.com.br",
        password: userPassword,
        role: "member",
        status: "active",
        profile: {
          create: {
            registration: "COL004",
            position: "Técnico ROV",
            department: "Operações",
            phone: "(21) 99999-1004",
            admissionDate: new Date("2022-06-01"),
          },
        },
      },
    }),
    // Usuário pendente (para teste)
    db.user.create({
      data: {
        name: "Novo Colaborador",
        email: "novo@inspesub.com.br",
        password: userPassword,
        role: "member",
        status: "pending",
        profile: {
          create: {
            position: "Técnico de Campo",
          },
        },
        approvals: {
          create: { status: "pending" },
        },
      },
    }),
  ])

  console.log("✅ Usuários criados")

  // ============================================
  // CRIAR EQUIPES
  // ============================================

  const team1 = await db.team.create({
    data: {
      name: "Equipe ROV Alpha",
      code: "ROV-01",
      description: "Equipe especializada em operação de ROV para inspeções profundas",
      operation: "Plataforma P-52 – Petrobras/Bacia de Santos",
      supervisorId: sup1.id,
    },
  })

  const team2 = await db.team.create({
    data: {
      name: "Equipe Inspeção Beta",
      code: "INSP-02",
      description: "Equipe de inspeção de integridade estrutural",
      operation: "FPSO Cidade de Paraty – Mero Field",
      supervisorId: sup2.id,
    },
  })

  // Vincular membros às equipes
  await db.teamMember.createMany({
    data: [
      { teamId: team1.id, userId: sup1.id },
      { teamId: team1.id, userId: members[0].id },
      { teamId: team1.id, userId: members[1].id },
      { teamId: team2.id, userId: sup2.id },
      { teamId: team2.id, userId: members[2].id },
      { teamId: team2.id, userId: members[3].id },
    ],
  })

  console.log("✅ Equipes criadas")

  // ============================================
  // CRIAR COMUNICADOS
  // ============================================

  await db.announcement.createMany({
    data: [
      {
        authorId: rh.id,
        title: "Bem-vindo ao INSPESUB Portal!",
        content: "O portal corporativo INSPESUB está disponível! Aqui você pode gerenciar sua presença, visualizar seus contracheques, acessar documentos e muito mais. Em caso de dúvidas, entre em contato com o RH.",
        category: "general",
        isPinned: true,
        isPublished: true,
        publishedAt: new Date(),
        targetRoles: ["admin_master", "rh", "supervisor", "member"],
      },
      {
        authorId: rh.id,
        title: "Procedimento de Marcação de Presença",
        content: "Lembre-se de registrar sua presença diariamente no sistema. O prazo para marcação é até o dia 25 de cada mês. Após o fechamento do mês pelo RH, não será possível realizar alterações.",
        category: "hr",
        isPinned: false,
        isPublished: true,
        publishedAt: new Date(),
        targetRoles: ["admin_master", "rh", "supervisor", "member"],
      },
      {
        authorId: admin.id,
        title: "Treinamento de Segurança – NR-34",
        content: "Informamos que o treinamento de atualização da NR-34 (Trabalho em Casco de Embarcação) será realizado na próxima semana. A participação é obrigatória para toda a equipe operacional.",
        category: "training",
        isPinned: false,
        isPublished: true,
        publishedAt: new Date(),
        targetRoles: ["admin_master", "rh", "supervisor", "member"],
      },
    ],
  })

  console.log("✅ Comunicados criados")

  // ============================================
  // CRIAR CONFIGURAÇÕES PADRÃO
  // ============================================

  await db.setting.createMany({
    data: [
      { key: "company_name", value: "INSPESUB – Tecnologia em Inspeções", group: "company", label: "Nome da empresa" },
      { key: "company_email", value: "contato@inspesub.com.br", group: "company", label: "Email da empresa" },
      { key: "company_phone", value: "(21) 0000-0000", group: "company", label: "Telefone" },
      { key: "company_address", value: "Rio de Janeiro, RJ – Brasil", group: "company", label: "Endereço" },
      { key: "attendance_close_day", value: "25", group: "attendance", label: "Dia de fechamento da presença" },
      { key: "max_file_size_mb", value: "20", group: "files", label: "Tamanho máximo de arquivo (MB)" },
      { key: "document_expiry_alert_days", value: "30", group: "documents", label: "Dias para alerta de vencimento" },
    ],
  })

  // ============================================
  // LOG INICIAL
  // ============================================

  await db.auditLog.create({
    data: {
      userId: admin.id,
      action: "settings_changed",
      description: "Sistema inicializado com dados de seed",
      metadata: { seed: true },
    },
  })

  console.log("✅ Configurações criadas")
  console.log("")
  console.log("═══════════════════════════════════════")
  console.log("✅ Seed concluído com sucesso!")
  console.log("")
  console.log("Usuários criados:")
  console.log("  admin@inspesub.com.br      | Admin@2024!        | admin_master")
  console.log("  rh@inspesub.com.br         | Inspesub@2024      | rh")
  console.log("  joao.ferreira@...          | Inspesub@2024      | supervisor")
  console.log("  carlos.santos@...          | Inspesub@2024      | supervisor")
  console.log("  pedro.alves@...            | Inspesub@2024      | member")
  console.log("  lucas.oliveira@...         | Inspesub@2024      | member")
  console.log("  ana.costa@...              | Inspesub@2024      | member")
  console.log("  rafael.lima@...            | Inspesub@2024      | member")
  console.log("  novo@inspesub.com.br       | Inspesub@2024      | member (pending)")
  console.log("═══════════════════════════════════════")
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
