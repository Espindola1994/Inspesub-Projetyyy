import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { DocumentsModule } from "@/components/documents/documents-module"

export const metadata = { title: "Documentos" }

export default async function DocumentosPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const isAdmin = ["admin_master", "rh"].includes(session.user.role)

  const documents = isAdmin
    ? await db.document.findMany({
        include: { user: { select: { id: true, name: true, email: true, role: true, status: true } } },
        orderBy: { createdAt: "desc" },
      })
    : await db.document.findMany({
        where: { userId: session.user.id },
        include: { user: { select: { id: true, name: true, email: true, role: true, status: true } } },
        orderBy: { createdAt: "desc" },
      })

  const employees = isAdmin
    ? await db.user.findMany({
        where: { status: "active" },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Documentos</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Central de documentos e certificados</p>
      </div>
      <DocumentsModule
        documents={documents as any}
        isAdmin={isAdmin}
        employees={employees}
        currentUserId={session.user.id}
      />
    </div>
  )
}
