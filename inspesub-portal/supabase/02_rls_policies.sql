-- ==================================================
-- INSPESUB Portal — Row Level Security (RLS)
-- Execute no Supabase SQL Editor após criar as tabelas
-- via: npx prisma migrate deploy
-- ==================================================
--
-- ARQUITETURA DE SEGURANÇA:
-- O projeto usa NextAuth (JWT) para autenticação, não Supabase Auth.
-- Portanto, auth.uid() NÃO está disponível diretamente nas policies.
--
-- ESTRATÉGIA:
-- 1. Toda leitura/escrita pública: BLOQUEADA por padrão (RLS ON sem policy = deny all)
-- 2. As API Routes do Next.js usam Prisma com service_role (admin bypass)
-- 3. O controle de acesso acontece no nível da aplicação (NextAuth + RBAC)
-- 4. RLS serve como camada adicional: bloqueia acesso direto ao banco
--
-- RESULTADO: nenhum dado vaza mesmo que alguém obtenha a anon key do Supabase.
-- ==================================================

-- Habilitar RLS em todas as tabelas sensíveis
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmployeeProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Approval" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PasswordReset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Team" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeamMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AttendanceRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AttendanceMonthClosing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payslip" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RdoRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RdoFile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Announcement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Setting" ENABLE ROW LEVEL SECURITY;

-- Tabelas do NextAuth (não expor via anon key)
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;

-- ==================================================
-- NENHUMA POLICY PÚBLICA
-- Sem policy = deny all para conexões anon/authenticated via Supabase
-- O acesso é feito exclusivamente via Prisma com service_role (API Routes)
-- ==================================================

-- ==================================================
-- VERIFICAÇÃO
-- Execute para confirmar que RLS está ativo em todas as tabelas:
-- ==================================================
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;

-- ==================================================
-- OPTIONAL: Se quiser usar Supabase Auth no futuro,
-- adicione policies usando auth.uid() aqui.
-- Exemplo para Notification (usuário vê só as suas):
-- ==================================================
/*
CREATE POLICY "users_read_own_notifications"
ON "Notification" FOR SELECT
TO authenticated
USING (
  "userId" = (
    SELECT id FROM "User"
    WHERE email = auth.jwt() ->> 'email'
  )
);
*/
