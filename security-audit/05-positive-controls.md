# 05. Controles Positivos e Forças Comprovadas

A auditoria defensiva identificou controles de segurança bem estruturados no projeto, evidenciando preocupação arquitetural com a integridade das operações e dados:

---

## 1. Eliminação de Mutações Diretas via RLS no Banco de Dados
- **Evidência:** `supabase/migrations/20260207112405_b5e72a0b-d1e5-411a-91fd-8216587f29f5.sql:62-69`
- **Controle Aprovado:** As políticas públicas permissivas de escrita (`UPDATE`, `INSERT`, `DELETE`) nas tabelas `queue_state` e `professionals` foram completamente revogadas. Nenhum cliente pode alterar o estado da fila chamando `supabase.from('queue_state').update(...)`. Toda e qualquer alteração de estado é obrigada a passar pelas funções RPC `admin_update_queue` e `admin_update_professional`, garantindo centralização da lógica de negócios.

---

## 2. Isolamento Efetivo da Tabela de Credenciais (`admin_credentials`)
- **Evidência:** `supabase/migrations/20260207021937_e0a07f6c-e407-4c29-8edf-d7dbe76d8451.sql:2-23`
- **Controle Aprovado:** Foram estabelecidas políticas de RLS explícitas com `USING (false)` e `WITH CHECK (false)` para todas as operações (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) em `admin_credentials`. Mesmo que um atacante obtenha a chave anônima ou token JWT de usuário comum, o Supabase PostgREST bloqueia qualquer acesso direto à tabela de senhas. O acesso só ocorre por meio de funções `SECURITY DEFINER` autorizadas.

---

## 3. Parametrização e Abstração de Credenciais de Ambiente no Frontend
- **Evidência:** `src/integrations/supabase/client.ts:5-18` e `.env.example:1-8`
- **Controle Aprovado:** As chaves de acesso ao Supabase foram desvinculadas do código-fonte e migradas para `import.meta.env.VITE_SUPABASE_URL` e `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY`. O arquivo `.gitignore` foi configurado para ignorar `.env` e variantes locais, e `.env.example` fornece apenas placeholders seguros sem credenciais reais.

---

## 4. Prevenção Nativa Contra Injeções SQL (SQL Injection)
- **Evidência:** `supabase/migrations/20260207112405_b5e72a0b-d1e5-411a-91fd-8216587f29f5.sql:26-34`
- **Controle Aprovado:** As funções de atualização de fila no banco utilizam queries estáticas compiladas em PL/pgSQL com extração segura de campos de objetos JSONB (`updates->>'current_count'` convertido para `integer`). Não há concatenação de strings do usuário em comandos dinâmicos `EXECUTE`, eliminando o risco de SQLi clássico.

---

## 5. Captura Segura de Exceções no Frontend (Error Boundary)
- **Evidência:** `src/components/ErrorBoundary.tsx:1-50`
- **Controle Aprovado:** A aplicação encapsula as rotas em um componente de barreira de erros React (`ErrorBoundary`), impedindo que falhas de renderização exponham a tela preta com stack traces internos do código aos usuários comuns em produção.
