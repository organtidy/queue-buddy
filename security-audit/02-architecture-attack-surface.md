# 02. Arquitetura e Superfície de Ataque

## 1. Visão Geral da Arquitetura

O sistema é composto por uma aplicação Single Page Application (SPA) com suporte a Progressive Web App (PWA) no frontend e Backend-as-a-Service (BaaS) gerenciado pelo Supabase.

```text
[ Visitante / Cliente ]        [ Barbeiro / Admin ]
         │                              │
         ▼                              ▼
 ┌──────────────────────────────────────────────┐
 │       Frontend React 18 (Cloudflare Pages)   │
 │   - Painel da Fila (/)                       │
 │   - Área do Barbeiro (/admin)                │
 │   - Service Worker (custom-sw.js)            │
 └──────────────────────┬───────────────────────┘
                        │ HTTPS (Supabase JS SDK)
                        ▼
 ┌──────────────────────────────────────────────┐
 │              Supabase Platform               │
 │  ┌────────────────────────────────────────┐  │
 │  │ Edge Function: send-push-notification   │  │
 │  └────────────────────────────────────────┘  │
 │  ┌────────────────────────────────────────┐  │
 │  │ PostgREST API (RPCs & RLS Tables)      │  │
 │  │  - queue_state                         │  │
 │  │  - professionals                       │  │
 │  │  - push_subscriptions                  │  │
 │  │  - admin_credentials                   │  │
 │  └────────────────────────────────────────┘  │
 │  ┌────────────────────────────────────────┐  │
 │  │ PostgreSQL Database Triggers (pg_net)  │  │
 │  └────────────────────────────────────────┘  │
 └──────────────────────┬───────────────────────┘
                        │ Web Push Protocol (RFC 8291)
                        ▼
            [ Servidores Push (Google / Apple / Mozilla) ]
```

---

## 2. Fronteiras de Confiança (Trust Boundaries)

1. **Fronteira Externa (Navegador do Cliente):**
   - Ambiente não confiável. O cliente tem controle total sobre o estado local, localStorage, sessionStorage, chamadas de rede e parâmetros passados ao Supabase SDK.
2. **Fronteira de Autenticação (/admin):**
   - O painel `/admin` exige a digitação de um PIN de 4 dígitos. A validação é enviada à RPC `validate_admin_pin` e as mutações usam `admin_update_queue` e `admin_update_professional`.
3. **Fronteira de Banco de Dados (Supabase RLS & RPC):**
   - Políticas de Row-Level Security e funções com `SECURITY DEFINER`. Este é o ponto crítico onde a autorização DEVE ser imposta de forma estrita.
4. **Fronteira de Funções Serverless (Edge Functions):**
   - Deno Runtime executado no edge com acesso a `SUPABASE_SERVICE_ROLE_KEY` e chaves privadas VAPID.

---

## 3. Inventário de Ativos Críticos ("Crown Jewels")

- **PIN do Barbeiro:** Permite abrir/fechar a barbearia, alterar contagem de clientes e manipular tempos de corte.
- **Base de Assinaturas Web Push (`push_subscriptions`):** Contém endpoints de navegadores e segredos criptográficos de clientes que instalaram o app.
- **Disparador de Push (`send-push-notification`):** Capacidade de emitir alertas visuais e sonoros nos dispositivos móveis dos clientes.
- **Integridade da Fila:** Dados públicos exibidos em tempo real para os clientes da barbearia.

---

## 4. Mapeamento da Superfície de Ataque

| Vetor de Exposição | Descrição | Nível de Exposição |
|---|---|:---:|
| **RPC `_verify_pin`** | Função sem rate limit exposta à role `anon` | **Público (Crítico)** |
| **Tabela `push_subscriptions`** | Leitura (`SELECT`) e Exclusão (`DELETE`) abertas para `anon` | **Público (Crítico)** |
| **Edge Function `send-push-notification`** | Endpoint HTTP sem verificação de JWT ou API Key | **Público (Crítico)** |
| **RPC `reset_admin_pin`** | Redefinição de PIN por frase sem rate limit | **Público (Alto)** |
| **Service Worker `custom-sw.js`** | Tratamento de URLs arbitrárias em notificações | **Local / Indireto** |
