import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { PayslipsModule } from "@/components/payslips/payslips-module"

export const metadata = { title: "Contracheques" }

export default async function ContracheiquesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const isAdmin = ["admin_master", "rh"].includes(session.user.role)

  let payslips
  let employees: { id: string; name: string }[] = []

  if (isAdmin) {
    payslips = await db.payslip.findMany({
      include: {
        employee: {
          select: { id: true, name: true, email: true, role: true, status: true, profile: true },
        },
        uploadedBy: {
          select: { id: true, name: true, email: true, role: true, status: true },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    })

    employees = await db.user.findMany({
      where: { status: "active" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })
  } else {
    payslips = await db.payslip.findMany({
      where: { employeeId: session.user.id },
      include: {
        employee: {
          select: { id: true, name: true, email: true, role: true, status: true, profile: true },
        },
        uploadedBy: {
          select: { id: true, name: true, email: true, role: true, status: true },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Contracheques</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          {isAdmin ? "Gerenciar e enviar contracheques" : "Seus holerites"}
        </p>
      </div>
      <PayslipsModule
        payslips={payslips as any}
        isAdmin={isAdmin}
        employees={employees}
        currentUserId={session.user.id}
      />
    </div>
  )
}
