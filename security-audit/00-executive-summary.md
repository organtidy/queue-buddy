# Relatório Executivo de Auditoria de Segurança Defensiva
**Projeto:** Filômetro Ásperus (`queue-buddy`)  
**Data:** 07 de Setembro de 2026  
**Veredicto:** RISCO ELEVADO CONDICIONADO (Requer Remediações Imediatas)  
**Nível de Confiança:** ALTO (Inspeção direta e minuciosa do código-fonte, banco de dados e funções serverless)  
**Modo de Autorização:** STATIC_ONLY (Análise estática de código e arquitetura, autorizada pelo proprietário)  
**Ambiente Auditado:** Código-fonte do repositório local (sem testes invasivos em produção)

---

## 1. Visão Geral e Veredicto

A auditoria defensiva identificou que o Filômetro Ásperus adota boas iniciativas de arquitetura moderna (como desacoplamento de credenciais na tabela `admin_credentials` e restrição de escrita direta via Row-Level Security nas tabelas `queue_state` e `professionals`).

Contudo, foram identificadas **brechas de severidade ALTA** que comprometem diretamente a privacidade dos clientes e a integridade da aplicação:
1. **Vazamento e exclusão de assinantes de notificações (Web Push):** As políticas de banco de dados (RLS) da tabela `push_subscriptions` foram configuradas com permissão irrestrita de leitura, alteração e exclusão para qualquer usuário anônimo.
2. **Fragilidade e bypass na autenticação do barbeiro:** A função interna `_verify_pin` foi exposta publicamente sem qualquer limitação de taxa (rate limit). Como o PIN é de apenas 4 dígitos (10.000 combinações), um atacante pode adivinhar o PIN de acesso em minutos via requisições automatizadas.
3. **Disparo não autorizado de notificações push (Spam):** A Edge Function `send-push-notification` possui verificação de JWT desativada e não autentica a origem da requisição, permitindo que qualquer pessoa envie notificações push para todos os aparelhos inscritos.
4. **Negação de Serviço no painel administrativo:** O mecanismo de bloqueio do PIN utiliza uma chave global, permitindo que tentativas maliciosas de terceiros travem o acesso legítimo do barbeiro à loja por 30 minutos.

---

## 2. Estatísticas de Achados por Severidade

| Severidade | Quantidade | Status |
|---|:---:|:---:|
| **Crítica** | 0 | - |
| **Alta** | 4 | Confirmados |
| **Média** | 2 | Confirmados |
| **Baixa** | 2 | Confirmados |
| **Informativa** | 2 | Registrados |
| **Total** | **10** | **100% Triados** |

---

## 3. Os 5 Principais Riscos de Negócio

1. **Vazamento de Privacidade de Clientes (LGPD):** Extração pública dos endpoints e credenciais dos navegadores de todos os clientes inscritos na fila.
2. **Sabotagem Operacional da Barbearia:** Alteração fraudulenta do status da loja (aberta/fechada) e da contagem de clientes por meio da quebra do PIN de 4 dígitos.
3. **Spam e Danos à Marca:** Envio de notificações falsas ou abusivas para os smartphones dos clientes da barbearia por agentes mal-intencionados.
4. **Negação de Serviço do Serviço de Push:** Exclusão em massa de todas as inscrições de push da base de dados por qualquer visitante da página.
5. **Bloqueio Involuntário do Dono da Barbearia:** O sistema de proteção atual contra força bruta bloqueia o barbeiro real se um invasor errar o PIN 5 vezes pela internet.

---

## 4. Controles Fortes Comprovados

- **Separação de Privilégios no Banco:** O PIN e frases de recuperação foram removidos da tabela pública `queue_state` e isolados em `admin_credentials`.
- **Bloqueio de Acesso Direto a Credenciais:** Políticas de RLS `USING (false)` e `WITH CHECK (false)` impedem leitura ou modificação direta da tabela `admin_credentials` pelo cliente.
- **Parametrização de Variáveis de Ambiente:** Eliminação de credenciais estáticas no frontend, delegando a configuração ao runtime via `import.meta.env`.
- **Prevenção de Injeção de SQL:** Todas as consultas no backend utilizam queries estruturadas e tipadas em PL/pgSQL, sem concatenação de strings vulneráveis a SQLi.

---

## 5. Plano de Ação Recomendado

### Imediato (24 a 48 horas)
- [ ] Fechar as políticas de leitura e deleção em massa da tabela `push_subscriptions` no Supabase.
- [ ] Revogar a permissão de execução pública (`REVOKE EXECUTE`) da função `_verify_pin` para a role `anon`.
- [ ] Ativar autenticação por chave secreta de webhook na Edge Function `send-push-notification`.

### Curto Prazo (até 7 dias)
- [ ] Alterar o rate limiting do PIN para considerar o IP ou identificador de sessão em vez de bloquear globalmente.
- [ ] Aplicar hash criptográfico (Argon2id ou bcrypt via extensão `pgcrypto`) no armazenamento do PIN e da frase de segurança.

### Médio Prazo (até 30 dias)
- [ ] Implementar validação de URLs no Service Worker (`custom-sw.js`) para evitar redirecionamentos abertos em notificações.
- [ ] Adicionar testes automatizados de regressão para segurança de RLS e funções RPC.
