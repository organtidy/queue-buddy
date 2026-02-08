

## Exibir tempo de espera como faixa aproximada (quando manual)

### O que muda

Quando o tempo de espera **manual** estiver definido, o tempo estimado sera exibido como uma **faixa**, por exemplo:

- Manual = 180 min (3h) --> exibe **"2 - 3 horas"** (subtrai 1/3 do total)
- Manual = 90 min (1h30) --> exibe **"1 - 1 hora e 30 minutos"** (subtrai 1/3)
- Manual = 30 min --> exibe **"20 - 30 minutos"**

Quando **nao** houver tempo manual, o comportamento atual permanece inalterado (tempo exato calculado automaticamente).

### Logica do calculo

```
totalWaitTime = count * effectiveWaitTime
lowerBound = totalWaitTime - (totalWaitTime / 3)   // arredondado
upperBound = totalWaitTime
```

O lower bound sera formatado de forma simplificada (ex: so "2" em vez de "2 horas") e o upper bound tera o formato completo (ex: "3 horas"), resultando em **"2 - 3 horas"**.

### Arquivos alterados

**1. `src/components/QueueIndicator.tsx`**
- Adicionar prop `isManual: boolean` ao componente
- Criar funcao `formatWaitTimeRange(lower, upper)` que formata a faixa
  - Se ambos estao na mesma unidade (ex: ambos em horas inteiras), exibe "2 - 3 horas"
  - Se sao diferentes (ex: minutos e horas), formata cada um por extenso
- Quando `isManual` for true, calcular o lower bound (total - total/3) e exibir a faixa
- Quando `isManual` for false, manter o formato atual

**2. `src/components/QueueIndicatorWithScene.tsx`**
- Passar `isManual={manualWaitTime != null}` para o `QueueIndicator`

### Exemplos de saida

| Total (min) | Lower (min) | Exibicao |
|---|---|---|
| 180 | 120 | 2 - 3 horas |
| 150 | 100 | 1 hora e 40 minutos - 2 horas e 30 minutos |
| 60 | 40 | 40 minutos - 1 hora |
| 30 | 20 | 20 - 30 minutos |
| 0 | 0 | Sem espera |

