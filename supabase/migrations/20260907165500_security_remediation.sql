-- =====================================================================
-- Migração de Remediação de Segurança (Security Audit Fixes)
-- Data: 07 de Setembro de 2026
-- =====================================================================

-- 1. CORREÇÃO AUD-002: Revogar execução pública da função interna de PIN
REVOKE EXECUTE ON FUNCTION public._verify_pin(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._verify_pin(text) TO postgres, service_role;

-- 2. CORREÇÃO AUD-001: Eliminar vazamento e deleção em massa de push_subscriptions
-- Remove políticas abertas que permitiam ler e apagar todas as assinaturas
DROP POLICY IF EXISTS "Allow anonymous select" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Allow anonymous delete" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Allow anonymous update" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can view push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can delete push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can insert push subscriptions" ON public.push_subscriptions;

-- Bloqueia acesso direto por SELECT para anon/authenticated (apenas service_role pode ler tudo)
CREATE POLICY "Block direct select on push_subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  TO anon, authenticated
  USING (false);

-- 3. Funções RPC Seguras para Inscrição e Cancelamento de Push
-- Permite que o cliente inscreva seu próprio dispositivo sem expor a tabela completa
CREATE OR REPLACE FUNCTION public.save_push_subscription(
  endpoint_input text,
  p256dh_input text,
  auth_input text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.push_subscriptions (endpoint, keys_p256dh, keys_auth)
  VALUES (endpoint_input, p256dh_input, auth_input)
  ON CONFLICT (endpoint) DO UPDATE
  SET
    keys_p256dh = EXCLUDED.keys_p256dh,
    keys_auth = EXCLUDED.keys_auth;
  RETURN true;
END;
$$;

-- Permite cancelar inscrição apenas do seu próprio endpoint
CREATE OR REPLACE FUNCTION public.delete_push_subscription(
  endpoint_input text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.push_subscriptions WHERE endpoint = endpoint_input;
  RETURN true;
END;
$$;

-- Garante que as funções RPC seguras possam ser executadas por anon
GRANT EXECUTE ON FUNCTION public.save_push_subscription(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_push_subscription(text) TO anon, authenticated;
