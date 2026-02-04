
# Plano: Cadeiras ao Lado do Numero + Calculo Automatico de Tempo Medio

## Resumo

Implementar duas mudancas principais:
1. Redesign do QueueControlCard para ter cadeiras clicaveis de cada profissional ao lado do numero da fila
2. Sistema de calculo automatico do tempo medio por corte baseado nos timestamps de remocao de clientes

---

## 1. Novo Layout do QueueControlCard

### Visual Proposto:

```text
+------------------------------------------+
|           Pessoas na Fila                |
|                                          |
|  [Cadeira]      6      [Cadeira]        |
|   Joao                   Jacson          |
|                                          |
|    [+]                    [-]            |
|                                          |
|         [Zerar Fila]                     |
+------------------------------------------+
```

### Comportamento:
- Cadeiras ficam sempre visiveis ao lado do numero
- Ao clicar [+], o proximo clique deve ser em uma cadeira
- Ao clicar [-], o proximo clique deve ser em uma cadeira com clientes
- Cadeira selecionada fica destacada durante a acao pendente
- Botoes [+] e [-] ficam abaixo de cada cadeira

### Arquivos a Modificar:
- `src/components/admin/QueueControlCard.tsx` - Redesign completo do layout

---

## 2. Calculo Automatico do Tempo Medio

### Banco de Dados:
Nova coluna na tabela `queue_state`:

```sql
ALTER TABLE queue_state 
ADD COLUMN cut_durations JSONB DEFAULT '[]';
```

Estrutura do JSON:
```json
[
  { "duration": 25, "timestamp": "2026-02-04T10:30:00Z" },
  { "duration": 32, "timestamp": "2026-02-04T11:05:00Z" }
]
```

### Logica de Captura:
- Quando um cliente e **adicionado** a uma cadeira: salvar timestamp inicial no profissional
- Quando um cliente e **removido**: calcular duracao = agora - timestamp
- Adicionar duracao ao array `cut_durations` (manter ultimos 10)
- Recalcular media automaticamente

### Filtro de Outliers:
- Ignorar duracoes menores que 5 minutos (cliques acidentais)
- Ignorar duracoes maiores que 120 minutos (esquecimento)
- Usar apenas os ultimos 10 cortes validos

### Formula:
```
tempo_medio = soma(duracoes_validas) / quantidade
```

### Prioridade do Tempo Exibido:
1. Se `manual_wait_time` definido: usar esse valor
2. Senao: usar `avg_wait_time` calculado automaticamente

---

## 3. Mudancas na Tabela Professionals

Adicionar coluna para armazenar o timestamp de inicio do atendimento atual:

```sql
ALTER TABLE professionals 
ADD COLUMN current_client_start TIMESTAMPTZ DEFAULT NULL;
```

---

## Arquivos a Modificar

### Banco de Dados:
- Nova migracao SQL para adicionar `cut_durations` em queue_state
- Nova migracao SQL para adicionar `current_client_start` em professionals

### Hooks:
- `src/hooks/useProfessionals.ts`
  - Adicionar logica para registrar `current_client_start` ao adicionar cliente
  - Adicionar funcao para calcular duracao ao remover cliente
  
- `src/hooks/useQueueState.ts`
  - Adicionar funcao `addCutDuration(duration)` para registrar novo corte
  - Adicionar funcao `recalculateAvgTime()` para recalcular media

### Componentes:
- `src/components/admin/QueueControlCard.tsx`
  - Redesign completo: cadeiras de Joao (esquerda) e Jacson (direita) ao lado do numero
  - Botoes [+] embaixo de cada cadeira
  - Botao [-] que aparece ao clicar na cadeira com cliente

### Types:
- `src/integrations/supabase/types.ts`
  - Atualizar interface com novos campos

---

## Fluxo de Adicao de Cliente

```text
1. Barbeiro clica em [+] embaixo da cadeira do Joao
2. current_count incrementa
3. professionals[Joao].clients_queue incrementa
4. professionals[Joao].current_client_start = agora (se era 0)
5. Visualizacao em / atualiza via Realtime
```

## Fluxo de Remocao de Cliente

```text
1. Barbeiro clica em [-] embaixo da cadeira do Jacson
2. Calcula duracao = agora - current_client_start
3. Se duracao entre 5 e 120 min: adiciona ao array cut_durations
4. Mantem apenas ultimos 10 registros
5. Recalcula avg_wait_time = media dos valores validos
6. current_count decrementa
7. professionals[Jacson].clients_queue decrementa
8. Se clients_queue > 0: current_client_start = agora (proximo cliente)
9. Se clients_queue == 0: current_client_start = null
```

---

## Sequencia de Implementacao

1. Criar migracao SQL para adicionar `cut_durations` e `current_client_start`
2. Atualizar types do Supabase
3. Atualizar `useProfessionals.ts` com logica de timestamp
4. Atualizar `useQueueState.ts` com funcoes de calculo de media
5. Redesenhar `QueueControlCard.tsx` com novo layout
6. Testar fluxo completo
