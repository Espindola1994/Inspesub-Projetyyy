import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { formatDateTime } from "@/lib/utils"
import { ShieldCheck } from "lucide-react"

export const metadata = { title: "Auditoria" }

export default async function AuditoriaPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  if (session.user.role !== "admin_master") redirect("/dashboard")

  const logs = await db.auditLog.findMany({
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const ACTION_LABELS: Record<string, string> = {
    account_created: "Conta criada",
    account_approved: "Conta aprovada",
    account_rejected: "Conta rejeitada",
    login: "Login",
    logout: "Logout",
    upload: "Upload",
    download: "Download",
    attendance_marked: "Presença marcada",
    attendance_edited: "Presença editada",
    attendance_closed: "Mês fechado",
    profile_updated: "Perfil atualizado",
    team_changed: "Equipe alterada",
    rdo_submitted: "RDO criado",
    rdo_approved: "RDO aprovado",
    rdo_rejected: "RDO rejeitado",
    document_uploaded: "Documento enviado",
    document_deleted: "Documento excluído",
    announcement_created: "Comunicado criado",
    settings_changed: "Configurações alteradas",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Auditoria</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Registro de todas as ações do sistema</p>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Data/Hora</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Usuário</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Ação</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Descrição</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {logs.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-[#6B7280]">
                <ShieldCheck className="w-10 h-10 text-[#D1D5DB] mx-auto mb-2" />
                Nenhum log registrado.
              </td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="px-5 py-3 text-xs text-[#6B7280] whitespace-nowrap">
                  {formatDateTime(log.createdAt)}
                </td>
                <td className="px-5 py-3">
                  {log.user ? (
                    <div>
                      <p className="text-xs font-medium text-[#1F2937]">{log.user.name}</p>
                      <p className="text-xs text-[#9CA3AF]">{log.user.email}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-[#9CA3AF]">Sistema</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-[#0059A0] rounded-full font-medium">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-[#6B7280] max-w-[300px] truncate">
                  {log.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
