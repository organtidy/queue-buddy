# 04. Relatório Detalhado de Vulnerabilidades e Achados

---

## AUD-001 — Vazamento e Manipulação Irrestrita da Base de Assinantes Web Push

- **Status:** CONFIRMADO
- **Confiança:** Alta
- **Severidade Técnica:** ALTA
- **CVSS v4.0:** 7.1 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:L/VA:H/SC:N/SI:N/SA:N`)
- **Onde está:** `supabase/migrations/20260208033525_f48525e5-2c6b-4bb2-a47a-4e6e489d9ebc.sql:10-21`

### CAMADA 1 — ENTENDA A BRECHA

1. **O que encontramos:** A tabela que armazena os registros de notificações de celulares e computadores de todos os clientes da barbearia está com leitura e exclusão liberadas para qualquer pessoa na internet.
2. **Onde está:** No arquivo de migração do banco de dados `supabase/migrations/20260208033525_f48525e5-2c6b-4bb2-a47a-4e6e489d9ebc.sql`, especificamente nas políticas de segurança de linha (RLS) da tabela `push_subscriptions`.
3. **Como deveria funcionar:** Qualquer visitante pode registrar ou desinscrever o seu próprio aparelho, mas nenhum visitante deveria conseguir ver as chaves de aparelhos de outros clientes nem apagar a lista de todos os inscritos.
4. **O que está acontecendo:** Para resolver um problema de cadastro (`upsert`), foram criadas políticas que dizem literalmente ao banco: *"Permita que qualquer usuário anônimo leia (`SELECT`), apague (`DELETE`) ou altere (`UPDATE`) qualquer linha da tabela sem restrição (`USING (true)`)"*.
5. **Por que isso é uma brecha:** As permissões no banco de dados (Row-Level Security - RLS) definem o que cada perfil pode fazer. Ao liberar `SELECT` e `DELETE` com `true` para a role `anon`, o Supabase expõe a tabela inteira na sua API pública.
6. **Como alguém poderia abusar:** Um usuário qualquer abre o console do navegador na página do Filômetro e digita:
   `await supabase.from("push_subscriptions").select("*")`
   Ele receberá imediatamente a lista de todos os endpoints e chaves de segurança dos dispositivos dos clientes. Em seguida, executando:
   `await supabase.from("push_subscriptions").delete().neq("id", "00000000-0000-0000-0000-000000000000")`
   Ele apaga todas as assinaturas do banco, impedindo que os clientes recebam qualquer aviso da barbearia.
7. **O que pode acontecer:** Violação de privacidade de dados (LGPD), exposição de identificadores técnicos dos navegadores dos clientes e destruição do serviço de notificações (Negação de Serviço permanente das mensagens push).
8. **Por que recebeu este nível (ALTA):** É ALTA porque não exige nenhuma senha ou privilégio para ser executado e permite apagar toda a base de assinantes. Não é CRÍTICA apenas porque os endpoints de push não contêm senhas bancárias ou nomes completos dos clientes.
9. **Como corrigir:** Revogar o `SELECT`, `UPDATE` e `DELETE` público irrestrito. Para cadastro/descadastro anônimo seguro, deve-se criar uma função RPC específica (ex: `subscribe_push` e `unsubscribe_push`) com `SECURITY DEFINER` que opera apenas no endpoint do próprio cliente, ou usar RLS restrito.
10. **Como confirmar a correção:** Tentar rodar um `.select('*')` anônimo e verificar se o banco retorna lista vazia ou erro 403 / negação de leitura.

### CAMADA 2 — DETALHES TÉCNICOS

- **CWE:** CWE-284 (Improper Access Control), CWE-200 (Exposure of Sensitive Information)
- **OWASP Top 10 (2025):** A01:2025 — Broken Access Control
- **OWASP API (2023):** API3:2023 — Broken Object Property Level Authorization
- **OWASP ASVS 5.0:** V8.1 (Authorization), V14.1 (Data Protection)
- **Evidência no Código:**
  ```sql
  CREATE POLICY "Allow anonymous select" ON public.push_subscriptions
    FOR SELECT TO anon USING (true);

  CREATE POLICY "Allow anonymous delete" ON public.push_subscriptions
    FOR DELETE TO anon USING (true);
  ```
- **Correção Recomendada (SQL):**
  ```sql
  -- Remove políticas abertas
  DROP POLICY IF EXISTS "Allow anonymous select" ON public.push_subscriptions;
  DROP POLICY IF EXISTS "Allow anonymous delete" ON public.push_subscriptions;
  DROP POLICY IF EXISTS "Allow anonymous update" ON public.push_subscriptions;

  -- Mantém apenas inserção permitida
  CREATE POLICY "Allow insert push subscriptions" ON public.push_subscriptions
    FOR INSERT TO anon WITH CHECK (true);
  ```

---

## AUD-002 — Bypass de Autenticação do Barbeiro via Função `_verify_pin` Sem Rate Limit

- **Status:** CONFIRMADO
- **Confiança:** Alta
- **Severidade Técnica:** ALTA
- **CVSS v4.0:** 7.5 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N`)
- **Onde está:** `supabase/migrations/20260207112405_b5e72a0b-d1e5-411a-91fd-8216587f29f5.sql:3-11`

### CAMADA 1 — ENTENDA A BRECHA

1. **O que encontramos:** Uma função interna do banco de dados criada para checar se o PIN de 4 dígitos está correto foi exposta publicamente sem nenhum controle contra tentativas repetidas (força bruta).
2. **Onde está:** Na função `public._verify_pin(pin_input text)` em `supabase/migrations/20260207112405_b5e72a0b-d1e5-411a-91fd-8216587f29f5.sql`.
3. **Como deveria funcionar:** O sistema deveria limitar estritamente a quantidade de tentativas erradas de PIN por minuto ou bloquear quem tenta adivinhar. Funções internas de verificação nunca devem ser chamáveis diretamente por qualquer visitante.
4. **O que está acontecendo:** A função `validate_admin_pin` tem bloqueio após 5 tentativas, mas o desenvolvedor criou uma segunda função auxiliar chamada `_verify_pin` para uso interno das mutações. No PostgreSQL/Supabase, qualquer função criada no schema `public` pode ser chamada pela internet a menos que seu acesso seja revogado explicitamente.
5. **Por que isso é uma brecha:** Um PIN numérico de 4 dígitos possui apenas 10.000 combinações possíveis (de `0000` a `9999`). Uma máquina comum consegue disparar 10.000 requisições em menos de 60 segundos. Como a função `_verify_pin` não possui proteção nem limite de tentativas, ela responde `true` assim que o invasor acertar o número.
6. **Como alguém poderia abusar:** Um invasor roda um script básico de loop de 0000 a 9999 chamando a API RPC `_verify_pin`. Quando a API retornar `true`, ele descobre o PIN exato do barbeiro e passa a controlar a fila, zerar contagens, alterar mensagens e fechar a barbearia.
7. **O que pode acontecer:** Tomada total de controle da área administrativa do barbeiro (`/admin`).
8. **Por que recebeu este nível (ALTA):** É ALTA porque permite comprometer totalmente o perfil administrativo. Não é CRÍTICA apenas porque este sistema não custodia dados bancários ou infraestrutura de servidores corporativos.
9. **Como corrigir:** Executar um `REVOKE EXECUTE ON FUNCTION public._verify_pin(text) FROM anon, authenticated;` no banco de dados e mover funções internas para um schema privado ou mantê-las estritamente protegidas.
10. **Como confirmar a correção:** Tentar invocar `supabase.rpc('_verify_pin', { pin_input: '1234' })` usando a chave pública (anon) e confirmar o retorno de erro `403 Forbidden` / `permission denied for function _verify_pin`.

### CAMADA 2 — DETALHES TÉCNICOS

- **CWE:** CWE-307 (Improper Restriction of Excessive Authentication Attempts), CWE-284 (Improper Access Control)
- **OWASP Top 10 (2025):** A07:2025 — Authentication Failures
- **OWASP API (2023):** API2:2023 — Broken Authentication
- **OWASP ASVS 5.0:** V6.1 (Credential Rate Limiting)
- **Evidência no Código:**
  ```sql
  -- 1. Internal PIN verification (no rate limiting, for operational RPCs)
  CREATE OR REPLACE FUNCTION public._verify_pin(pin_input text)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $$
    SELECT EXISTS (SELECT 1 FROM admin_credentials WHERE admin_pin = pin_input);
  $$;
  ```
- **Correção Recomendada (SQL):**
  ```sql
  -- Revoga execução pública da função interna
  REVOKE EXECUTE ON FUNCTION public._verify_pin(text) FROM PUBLIC, anon, authenticated;
  GRANT EXECUTE ON FUNCTION public._verify_pin(text) TO postgres, service_role;
  ```

---

## AUD-003 — Invocação Não Autenticada da Edge Function `send-push-notification` (Spam em Massa)

- **Status:** CONFIRMADO
- **Confiança:** Alta
- **Severidade Técnica:** ALTA
- **CVSS v4.0:** 7.2 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:H/VA:H/SC:N/SI:N/SA:N`)
- **Onde está:** `supabase/config.toml:3-4` e `supabase/functions/send-push-notification/index.ts:225-242`

### CAMADA 1 — ENTENDA A BRECHA

1. **O que encontramos:** O servidor que envia notificações push para os celulares dos clientes pode ser acionado livremente por qualquer pessoa sem autenticação.
2. **Onde está:** Na configuração `supabase/config.toml` (onde consta `verify_jwt = false`) e no código da Edge Function `supabase/functions/send-push-notification/index.ts`.
3. **Como deveria funcionar:** O envio de notificações só deveria ser autorizado quando disparado pelo gatilho interno do banco de dados (após uma alteração legítima de fila pelo barbeiro) ou mediante um token/segredo de webhook exclusivo.
4. **O que está acontecendo:** A verificação automática de token (JWT) foi desligada na configuração e a função não confere nenhuma senha ou chave secreta no corpo ou cabeçalho da requisição.
5. **Por que isso é uma brecha:** Qualquer requisição HTTP POST para a URL pública da Edge Function contendo um valor numérico `new_count` fará com que o servidor processe e envie notificações imediatamente para todos os inscritos.
6. **Como alguém poderia abusar:** Um usuário envia requisições em loop para a URL da Edge Function com contagens alternadas. Os telefones de todos os clientes começarão a tocar e vibrar repetidamente com alertas de *"Nova pessoa na fila!"*, sem que nada tenha ocorrido.
7. **O que pode acontecer:** Assédio/perturbação aos clientes, cancelamento em massa de notificações, perda de credibilidade do estabelecimento e esgotamento da cota de processamento do Supabase.
8. **Por que recebeu este nível (ALTA):** Permite acionar recursos da barbearia para atingir os dispositivos pessoais de terceiros sem necessidade de credenciais.
9. **Como corrigir:** Proteger a função exigindo um segredo compartilhado (ex: cabeçalho `X-Webhook-Secret`) configurado no trigger do banco de dados e conferido no início da função, ou reativar `verify_jwt = true` e usar chamadas assinadas pela `service_role`.
10. **Como confirmar a correção:** Fazer um POST na Edge Function sem o cabeçalho secreto e receber resposta `401 Unauthorized`.

### CAMADA 2 — DETALHES TÉCNICOS

- **CWE:** CWE-306 (Missing Authentication for Critical Function)
- **OWASP Top 10 (2025):** A01:2025 — Broken Access Control
- **OWASP API (2023):** API2:2023 — Broken Authentication
- **OWASP ASVS 5.0:** V4.1 (Endpoint Authentication)
- **Evidência no Código:**
  ```toml
  [functions.send-push-notification]
  verify_jwt = false
  ```
  ```typescript
  Deno.serve(async (req) => {
    // Nenhuma checagem de req.headers.get("Authorization") ou segredo customizado
    const { old_count, new_count } = await req.json();
    ...
  ```
- **Correção Recomendada (TypeScript / Deno):**
  ```typescript
  const WEBHOOK_SECRET = Deno.env.get("INTERNAL_WEBHOOK_SECRET");
  const authHeader = req.headers.get("X-Webhook-Secret");
  if (WEBHOOK_SECRET && authHeader !== WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  ```

---

## AUD-004 — Negação de Serviço no Acesso Administrativo por Bloqueio Global (`global_pin`)

- **Status:** CONFIRMADO
- **Confiança:** Alta
- **Severidade Técnica:** MÉDIA
- **CVSS v4.0:** 5.3 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:H/SC:N/SI:N/SA:N`)
- **Onde está:** `supabase/migrations/20260207023146_71a29391-b856-4693-b391-7d785a3fed37.sql:18-51`

### CAMADA 1 — ENTENDA A BRECHA

1. **O que encontramos:** Quando alguém digita o PIN errado 5 vezes, o sistema bloqueia o acesso de todos os barbeiros e administradores da barbearia por 30 minutos.
2. **Onde está:** Na função `public.validate_admin_pin(pin_input text)` em `supabase/migrations/20260207023146_71a29391-b856-4693-b391-7d785a3fed37.sql`.
3. **Como deveria funcionar:** O bloqueio por tentativas erradas deve afetar apenas quem errou (pelo endereço IP ou sessão do navegador), e nunca travar o sistema inteiro para todos.
4. **O que está acontecendo:** O código registra as tentativas sob uma chave única e fixa chamada `'global_pin'`. Ou seja, o contador de erros é compartilhado entre o mundo inteiro.
5. **Por que isso é uma brecha:** Qualquer pessoa de qualquer lugar pode propositalmente digitar 5 PINs aleatórios no site para deixar a barbearia sem conseguir usar o painel durante 30 minutos inteiros.
6. **Como alguém poderia abusar:** Um concorrente ou usuário entediado envia 5 requisições com PIN errado a cada 30 minutos. Os barbeiros na loja ficam permanentemente bloqueados de entrar no sistema.
7. **O que pode acontecer:** Parada operacional do filômetro na barbearia, forçando os profissionais a abandonar o uso da ferramenta durante o horário de pico.
8. **Por que recebeu este nível (MÉDIA):** É MÉDIA porque afeta a disponibilidade (DoS), mas não vaza dados nem corrompe informações do banco de dados.
9. **Como corrigir:** Armazenar as tentativas vinculadas ao IP do solicitante ou implementar captcha/desaceleração exponencial (throttling progressivo) em vez de bloqueio global permanente.
10. **Como confirmar a correção:** Realizar 5 tentativas inválidas de um cliente e verificar que outro cliente continua conseguindo se autenticar com o PIN correto.

### CAMADA 2 — DETALHES TÉCNICOS

- **CWE:** CWE-400 (Uncontrolled Resource Consumption), CWE-307 (Improper Restriction of Excessive Authentication Attempts)
- **OWASP Top 10 (2025):** A10:2025 — Mishandling of Exceptional Conditions
- **OWASP ASVS 5.0:** V15.1 (Denial of Service Protections)
- **Evidência no Código:**
  ```sql
  attempt_key_val := 'global_pin';
  ...
  locked_until = CASE
    WHEN pin_attempts.attempt_count >= 4 THEN now() + interval '30 minutes'
    ELSE NULL
  END;
  ```

---

## AUD-005 — Armazenamento de Credenciais em Texto Claro (`admin_credentials`)

- **Status:** CONFIRMADO
- **Confiança:** Alta
- **Severidade Técnica:** MÉDIA
- **CVSS v4.0:** 4.8 (`CVSS:4.0/AV:N/AC:H/AT:N/PR:N/UI:N/VC:H/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Onde está:** `supabase/migrations/20260207014059_a87711e5-7335-4abb-b3f9-3e62203a233d.sql:3-7`

### CAMADA 1 — ENTENDA A BRECHA

1. **O que encontramos:** O PIN do barbeiro e a frase secreta de recuperação estão guardados em texto comum no banco, sem criptografia (hash).
2. **Onde está:** Na tabela `admin_credentials` em `supabase/migrations/20260207014059_a87711e5-7335-4abb-b3f9-3e62203a233d.sql`.
3. **Como deveria funcionar:** Senhas e segredos devem ser armazenados usando funções de hash criptográfico unidirecionais com salt (como bcrypt ou Argon2), de modo que ninguém (nem mesmo quem acessa o banco) consiga ler o valor original.
4. **O que está acontecendo:** O PIN `'1234'` e a frase `'barbearia'` ficam gravados exatamente como texto puro.
5. **Por que isso é uma brecha:** Em caso de visualização inadvertida de logs, backup vazado ou acesso concedido a suporte técnico, as credenciais originais ficam visíveis de imediato.
6. **Como alguém poderia abusar:** Quem tiver acesso ao painel do Supabase ou a um dump/backup do banco lê o PIN e a frase imediatamente.
7. **O que pode acontecer:** Comprometimento duradouro das credenciais de acesso caso haja vazamento de backup.
8. **Por que recebeu este nível (MÉDIA):** A tabela possui políticas RLS que impedem leitura direta via API cliente, o que atenua a vulnerabilidade, tornando o risco dependente de acesso administrativo ao banco.
9. **Como corrigir:** Utilizar a extensão `pgcrypto` do PostgreSQL (`crypt(pin_input, gen_salt('bf'))`) para validar o PIN por comparação de hash.
10. **Como confirmar a correção:** Inspecionar os registros da tabela `admin_credentials` e comprovar que as colunas contêm apenas hashes iniciados por `$2a$` ou formato equivalente.

### CAMADA 2 — DETALHES TÉCNICOS

- **CWE:** CWE-256 (Unprotected Storage of Credentials), CWE-312 (Cleartext Storage of Sensitive Information)
- **OWASP Top 10 (2025):** A04:2025 — Cryptographic Failures
- **OWASP ASVS 5.0:** V6.2 (Credential Storage)
- **Evidência no Código:**
  ```sql
  CREATE TABLE public.admin_credentials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_pin text NOT NULL DEFAULT '1234',
    secret_phrase text NOT NULL DEFAULT 'barbearia'
  );
  ```

---

## AUD-006 — Ausência de Validação de Destino no Redirecionamento de Notificações (`custom-sw.js`)

- **Status:** CONFIRMADO
- **Confiança:** Alta
- **Severidade Técnica:** BAIXA
- **CVSS v4.0:** 3.5 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Onde está:** `public/custom-sw.js:40-54`

### CAMADA 1 — ENTENDA A BRECHA

1. **O que encontramos:** Quando o usuário clica em uma notificação recebida no celular, o aplicativo abre a URL fornecida na notificação sem checar se ela pertence ao site da barbearia.
2. **Onde está:** No evento `notificationclick` em `public/custom-sw.js`.
3. **Como deveria funcionar:** O aplicativo só deve redirecionar o usuário para rotas internas do próprio app (ex: `/`, `/admin`), rejeitando URLs externas desconhecidas.
4. **O que está acontecendo:** O código executa `clients.openWindow(urlToOpen)` passando diretamente o valor que veio da notificação.
5. **Por que isso é uma brecha:** Se o sistema de notificações for abusado (como apontado no achado AUD-003), o invasor pode mandar uma notificação que leva a vítima para um site malicioso externo (Open Redirect / Phishing).
6. **Como alguém poderia abusar:** Um invasor dispara um push com `url: "https://site-falso-de-golpe.com"`. O cliente clica no aviso da barbearia e é direcionado para a página do golpe.
7. **O que pode acontecer:** Usuários da barbearia expostos a páginas de phishing acreditando ser um link oficial do estabelecimento.
8. **Por que recebeu este nível (BAIXA):** Depende do abuso prévio do disparador de push ou de manipulação de payload.
9. **Como corrigir:** Garantir que `urlToOpen` comece estritamente com `/` e não contenha protocolo absoluto (`http://` ou `https://`).
10. **Como confirmar a correção:** Enviar payload com URL externa e verificar que o Service Worker abre apenas a página inicial `/`.

### CAMADA 2 — DETALHES TÉCNICOS

- **CWE:** CWE-601 (URL Redirection to Untrusted Site)
- **OWASP Top 10 (2025):** A01:2025 — Broken Access Control
- **OWASP ASVS 5.0:** V3.1 (Web Frontend Security)
- **Evidência no Código:**
  ```javascript
  const urlToOpen = event.notification.data?.url || "/";
  ...
  if (clients.openWindow) {
    return clients.openWindow(urlToOpen);
  }
  ```
