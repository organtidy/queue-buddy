# 01. Escopo e Metodologia da Auditoria

## 1. Identificação do Escopo

- **Nome do Projeto:** Filômetro Ásperus (`queue-buddy`)
- **Raiz do Projeto (PROJECT_ROOT):** `c:\Users\Escola\Downloads\product_for_asperustech\queue-buddy`
- **Modo de Autorização:** `STATIC_ONLY`
- **Autorização Formal:** Concedida pelo proprietário do projeto em 07/09/2026.
- **Alvos Permitidos (ALLOWED_TARGETS):** Arquivos locais do repositório no workspace.
- **Alvos Excluídos (EXCLUDED_TARGETS):** Ambientes de produção, infraestrutura de nuvem remota sem credencial dedicada de teste, serviços de terceiros (Supabase SaaS, Cloudflare, Web Push Endpoints reais).

## 2. Metodologia e Padrões de Referência

A auditoria foi guiada pelos padrões internacionais de segurança defensiva:
- **OWASP ASVS 5.0 (Application Security Verification Standard):** Nível 2 de rigor para aplicações web/SaaS.
- **OWASP Top 10 (2025):** Taxonomia e mapeamento de categorias de risco.
- **OWASP API Security Top 10 (2023):** Avaliação de endpoints e funções RPC do Supabase.
- **NIST SP 800-63B-4:** Padrões para autenticação e gestão de senhas e PINs.
- **MITRE CWE (Common Weakness Enumeration):** Identificação padronizada de fraquezas de software.
- **RFC 8291 / RFC 8292:** Padrões criptográficos de Web Push e VAPID.

## 3. Classificação de Certeza dos Achados

Cada apontamento segue rigorosamente uma das seguintes classificações:
- **CONFIRMADO:** A vulnerabilidade foi comprovada mediante rastreamento determinístico do código-fonte ou configuração observada no repositório.
- **PROVÁVEL:** Há forte evidência no código, mas o impacto real depende de configuração ativa no painel do Supabase/Cloudflare.
- **HIPÓTESE:** Risco conceitual ou teórico identificado na arquitetura que exige teste dinâmico para comprovação empírica.
- **NÃO TESTADO:** Área do sistema que não pôde ser avaliada devido às restrições do modo `STATIC_ONLY` (ex: configurações do painel Cloudflare WAF, infraestrutura física).
- **CONTROLE VALIDADO:** Mecanismo de segurança avaliado e comprovadamente eficaz contra a classe de ameaça correspondente.

## 4. Ferramentas Utilizadas

- **Análise Manual Especializada de Código:** Inspeção linha a linha de componentes React, hooks, funções PL/pgSQL e Edge Functions.
- **Rastreamento de Fluxo de Dados (Data Flow Tainting):** Do input do usuário até as chamadas de banco e RPCs.
- **Inspeção de Migrações de Banco de Dados:** Análise cronológica e cumulativa de políticas RLS em `supabase/migrations/`.
- **Git History & Secret Scanning:** Verificação de histórico de commits e buscas por padrões de credenciais expostas.
