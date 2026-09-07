# 06. Roteiro Prático de Correções (Remediation Roadmap)

Este plano de ação prioriza a eliminação das brechas com base na severidade real e facilidade de implementação, sem interromper as operações diárias da barbearia.

---

## Fase 1: Correções Críticas e Imediatas (24 a 48 Horas)

### 1.1 Fechar o Acesso Indevido a `push_subscriptions`
- **Ação:** Remover as políticas que permitem `SELECT`, `UPDATE` e `DELETE` anônimos irrestritos na tabela `push_subscriptions`.
- **Implementação:** Criar migração SQL:
  ```sql
  -- Remove brechas de vazamento e deleção em massa
  DROP POLICY IF EXISTS "Allow anonymous select" ON public.push_subscriptions;
  DROP POLICY IF EXISTS "Allow anonymous delete" ON public.push_subscriptions;
  DROP POLICY IF EXISTS "Allow anonymous update" ON public.push_subscriptions;

  -- Permite apenas cadastrar ou atualizar o próprio endpoint
  CREATE POLICY "Allow anonymous insert" ON public.push_subscriptions
    FOR INSERT TO anon
    WITH CHECK (true);
  ```
- **Esforço:** Muito Baixo (5 minutos).
- **Risco Residual:** Mínimo.

---

### 1.2 Proteger a Função Interna `_verify_pin`
- **Ação:** Impedir que visitantes anônimos chamem `_verify_pin` diretamente via API.
- **Implementação:** Criar migração SQL:
  ```sql
  REVOKE EXECUTE ON FUNCTION public._verify_pin(text) FROM PUBLIC, anon, authenticated;
  GRANT EXECUTE ON FUNCTION public._verify_pin(text) TO postgres, service_role;
  ```
- **Esforço:** Muito Baixo (5 minutos).
- **Risco Residual:** Zero. A função continuará funcionando normalmente para as RPCs internas como `admin_update_queue`.

---

### 1.3 Adicionar Segredo de Autenticação na Edge Function `send-push-notification`
- **Ação:** Exigir um token secreto compartilhado para disparar notificações.
- **Implementação:**
  1. Configurar variável de ambiente no Supabase Edge: `WEBHOOK_SECRET="seu-segredo-aleatorio-forte"`.
  2. Ajustar `supabase/functions/send-push-notification/index.ts`:
     ```typescript
     const expectedSecret = Deno.env.get("WEBHOOK_SECRET");
     const incomingSecret = req.headers.get("X-Webhook-Secret");
     if (expectedSecret && incomingSecret !== expectedSecret) {
       return new Response(JSON.stringify({ error: "Unauthorized" }), {
         status: 401,
         headers: corsHeaders,
       });
     }
     ```
  3. Atualizar a função SQL `notify_queue_change()` para enviar o cabeçalho `X-Webhook-Secret`.
- **Esforço:** Baixo (20 minutos).
- **Risco Residual:** Baixo.

---

## Fase 2: Correções Estruturais (Até 7 Dias)

### 2.1 Sanear Redirecionamento no Service Worker (`custom-sw.js`)
- **Ação:** Validar que URLs de notificação pertençam exclusivamente à rota interna da barbearia.
- **Implementação em `public/custom-sw.js`:**
  ```javascript
  let urlToOpen = event.notification.data?.url || "/";
  // Bloqueia qualquer tentativa de link externo ou javascript:
  if (!urlToOpen.startsWith("/") || urlToOpen.startsWith("//") || urlToOpen.includes(":")) {
    urlToOpen = "/";
  }
  ```
- **Esforço:** Baixo (10 minutos).

### 2.2 Migrar Bloqueio Global de PIN para Chave de IP/Sessão
- **Ação:** Evitar que erros de terceiros bloqueiem o barbeiro legítimo na barbearia.
- **Implementação:** Obter o IP do cliente via `request.headers` do PostgREST ou usar chave baseada no navegador do cliente em vez de `'global_pin'`.

---

## Fase 3: Modernização Criptográfica (Até 30 Dias)

### 3.1 Armazenamento de PIN com Hashing via `pgcrypto`
- **Ação:** Substituir o armazenamento de texto puro por `crypt(pin, gen_salt('bf'))`.
- **Implementação:** Habilitar extensão `pgcrypto` no Supabase e migrar as consultas de validação para conferência por hash.
