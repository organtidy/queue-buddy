

# Corrigir Realtime na Cloudflare + Botao de Refresh

## Problema
O realtime funciona no preview do Lovable mas nao no site hospedado na Cloudflare. Causa provavel: o Service Worker esta cacheando ou interferindo nas conexoes WebSocket/API do Supabase.

## Solucao em 2 partes

### Parte 1: Botao de Refresh na pagina publica

Adicionar um botao discreto na pagina `/` que refaz a consulta ao banco. Um simples SELECT em 1 linha da tabela `queue_state` tem custo praticamente zero -- nao ha risco de consumo excessivo.

- Botao com icone de refresh no header ou no footer
- Ao clicar, refaz o fetch de `queue_state` e `professionals`
- Feedback visual sutil (icone girando por 1 segundo)
- Sem cooldown necessario -- a query e muito leve

**Arquivo:** `src/pages/Index.tsx`

### Parte 2: Excluir WebSocket do cache do Service Worker

Ajustar a configuracao do Workbox no `vite.config.ts` para garantir que as conexoes realtime do Supabase nao sejam interceptadas pelo Service Worker.

- Adicionar `navigateFallbackDenylist` para URLs do Supabase realtime
- Refinar o `runtimeCaching` para excluir rotas `/realtime/` do cache
- Garantir que apenas chamadas REST sejam cacheadas, nunca WebSocket

**Arquivo:** `vite.config.ts`

---

## Detalhes tecnicos

### Index.tsx
- Expor uma funcao `refetch` no hook `useQueueState` que re-executa o fetch inicial
- Adicionar botao `RefreshCw` do lucide-react no header
- Estado `isRefreshing` para animar o icone durante o fetch

### vite.config.ts
- Alterar o `urlPattern` do runtimeCaching para excluir paths com `/realtime/`
- Padrão atualizado: `/^https:\/\/rwwwxrfxxgpcmegljjcw\.supabase\.co\/rest\/.*/i` (apenas REST)

### useQueueState.ts
- Adicionar funcao `refetch` que chama `fetchQueueState` manualmente
- Retornar `refetch` no objeto de retorno do hook

