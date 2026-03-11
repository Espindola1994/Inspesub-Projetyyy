-- ==================================================
-- INSPESUB Portal — Storage Buckets
-- Execute no Supabase SQL Editor (em ordem)
-- ==================================================

-- Bucket principal: portal-files (privado)
-- Contém contracheques, documentos e arquivos de RDO
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portal-files',
  'portal-files',
  false,  -- privado: URLs assinadas ou service_role para acesso
  20971520, -- 20MB
  ARRAY[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ==================================================
-- STORAGE POLICIES — portal-files
-- ==================================================

-- 1. SERVICE ROLE tem acesso total (usado pelas API routes)
-- (já garantido pelo service_role key — não precisa de policy)

-- 2. Colaboradores podem visualizar seus próprios contracheques
--    via URL pública gerada pelo servidor (getPublicUrl)
--    O bucket é privado mas o servidor usa service_role para gerar a URL

-- NOTA: como o projeto usa service_role key no servidor para todas as
-- operações de storage, não precisamos de policies complexas no bucket.
-- O controle de acesso acontece nas API Routes (autenticação NextAuth).
-- Se quiser adicionar uma camada extra de segurança, habilite as policies abaixo:

/*
-- Policy: admins e rh podem fazer upload de contracheques
CREATE POLICY "admins_upload_payslips"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portal-files'
  AND (storage.foldername(name))[1] = 'payslips'
  AND EXISTS (
    SELECT 1 FROM public."User"
    WHERE id::text = auth.uid()::text
    AND role IN ('admin_master', 'rh')
  )
);

-- Policy: usuários acessam apenas seus próprios contracheques
CREATE POLICY "member_read_own_payslips"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'portal-files'
  AND (storage.foldername(name))[1] = 'payslips'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: admins e rh acessam todos os contracheques
CREATE POLICY "admins_read_all_payslips"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'portal-files'
  AND (storage.foldername(name))[1] = 'payslips'
  AND EXISTS (
    SELECT 1 FROM public."User"
    WHERE id::text = auth.uid()::text
    AND role IN ('admin_master', 'rh')
  )
);
*/
