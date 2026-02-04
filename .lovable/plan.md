
# Plano: Sistema de Cadeiras Clicaveis por Profissional e Login por PIN

## Visao Geral

Este plano implementa um sistema onde cada cliente na fila esta associado a um profissional especifico, com visualizacao dinamica mostrando o nome do barbeiro acima de cada boneco. O login sera simplificado para usar PIN de 4 digitos com recuperacao via frase secreta.

---

## 1. Mudancas no Banco de Dados

Adicionar novas colunas na tabela `queue_state`:

```sql
ALTER TABLE queue_state 
ADD COLUMN admin_pin TEXT DEFAULT '1234',
ADD COLUMN secret_phrase TEXT DEFAULT 'barbearia';
```

Adicionar coluna `clients_queue` na tabela `professionals` para armazenar a lista de clientes de cada barbeiro:

```sql
ALTER TABLE professionals 
ADD COLUMN clients_queue INTEGER DEFAULT 0;
```

A coluna `clients_queue` armazena quantos clientes estao na fila de cada profissional (incluindo o que esta na cadeira).

---

## 2. Logica de Atribuicao de Clientes por Profissional

### Fluxo no Admin (/admin):

```text
1. Barbeiro clica no botao [+] para adicionar cliente
2. current_count incrementa em 1
3. Sistema aguarda clique em uma cadeira de profissional
4. Barbeiro clica na cadeira do Jacson (por exemplo)
5. professionals.clients_queue do Jacson incrementa em 1
6. Visualizacao em / atualiza automaticamente via Realtime
```

### Fluxo para Remover Cliente:

```text
1. Barbeiro clica no botao [-] para remover cliente
2. current_count decrementa em 1
3. Sistema aguarda clique em uma cadeira de profissional
4. Barbeiro clica na cadeira cujo cliente saiu
5. professionals.clients_queue daquele profissional decrementa em 1
```

### Componente de Cadeiras Clicaveis no Admin:

Novo componente `AdminChairSelector`:
- Exibe todas as cadeiras dos profissionais
- Cada cadeira mostra o nome do profissional acima
- Cadeiras sao sempre clicaveis (nao ficam esmaecidas no admin)
- Ao clicar, executa a acao pendente (adicionar ou remover cliente daquele profissional)

---

## 3. Visualizacao em / (Pagina Publica)

### BarbershopScene Atualizado:

Para cada profissional:
- Se `clients_queue >= 1`: cadeira fica **esmaecida** com texto "OCUPADO" abaixo
- Se `clients_queue == 0`: cadeira fica com **cor normal** e texto "DISPONIVEL" abaixo
- Boneco sentado na cadeira tem o **nome do profissional** acima da cabeca

### Banco de Espera:

Para cada profissional com `clients_queue > 1`:
- Os clientes extras (clients_queue - 1) aparecem no banco de espera
- Cada boneco no banco mostra o **nome do profissional** que ele aguarda

Exemplo com 4 clientes (3 para Jacson, 1 para Joao):
- Cadeira Jacson: esmaecida, boneco sentado com "Jacson" na cabeca
- Cadeira Joao: esmaecida, boneco sentado com "Joao" na cabeca
- Banco de espera: 2 bonecos com "Jacson" na cabeca

---

## 4. Sistema de Login por PIN

### Tela de Login Simplificada:

- Campo de PIN (4 digitos, type="password", inputMode="numeric")
- Botao "Entrar"
- Link "Esqueci meu PIN"

### Validacao:

```text
1. Usuario digita PIN
2. Busca queue_state.admin_pin do banco
3. Compara valores
4. Se igual: setIsAuthenticated(true)
5. Se diferente: mostra erro "PIN incorreto"
```

### Recuperacao por Frase Secreta:

- Ao clicar "Esqueci meu PIN":
  - Exibe campo para digitar frase secreta
  - Valida contra queue_state.secret_phrase
  - Se correta: exibe campos para novo PIN + confirmacao
  - Se incorreta: mostra erro

### Alterar PIN (dentro do painel admin):

- Novo botao "Alterar PIN" nas configuracoes
- Campos: PIN atual, Novo PIN, Confirmar Novo PIN
- Validacao do PIN atual antes de permitir alteracao

---

## 5. Indicador Visual Simplificado

### QueueIndicator:

- Remover texto "pessoa/pessoas" de dentro do circulo
- Manter apenas o numero grande centralizado
- Texto "N pessoas na fila" fica FORA do circulo, abaixo

---

## Arquivos a Modificar

### Banco de Dados:
- Nova migracao SQL para adicionar colunas

### Hooks:
- `src/hooks/useProfessionals.ts`
  - Adicionar funcoes `addClientToProfessional()` e `removeClientFromProfessional()`
  - Atualizar interface Professional com `clients_queue`

- `src/hooks/useQueueState.ts`
  - Adicionar `validatePin()`, `updatePin()`, `validateSecretPhrase()`, `updateSecretPhrase()`
  - Atualizar interface QueueState com `admin_pin`, `secret_phrase`

### Componentes:
- `src/components/BarbershopScene.tsx`
  - Adicionar prop `isAdmin` para diferenciar visualizacao
  - Adicionar prop `onChairClick` para callback de clique
  - Exibir nome do profissional acima dos bonecos
  - Esmaecimento condicional das cadeiras em /

- `src/components/admin/LoginForm.tsx`
  - Reescrever para usar PIN em vez de email/senha
  - Adicionar fluxo de recuperacao por frase secreta

- `src/components/admin/QueueControlCard.tsx`
  - Adicionar estado para "acao pendente" (adicionar/remover)
  - Exibir cadeiras clicaveis apos clicar +/-

- `src/components/QueueIndicator.tsx`
  - Remover "pessoa/pessoas" de dentro do circulo

### Paginas:
- `src/pages/Admin.tsx`
  - Remover logica de Supabase Auth
  - Usar validacao local por PIN
  - Adicionar opcao de alterar PIN nas configuracoes

---

## Fluxo Visual do Sistema

```text
ADMIN (/admin)                           PUBLICO (/)
+------------------------+               +------------------------+
|  [+] Adicionar Cliente |               |                        |
|  [-] Remover Cliente   |               |    JACSON      JOAO    |
|                        |               |    [boneco]   [boneco] |
|  Clique na cadeira:    |               |    [cadeira]  [cadeira]|
|                        |               |    esmaecida  normal   |
|   JACSON      JOAO     |               |    OCUPADO    DISPONIV.|
|   [cadeira]  [cadeira] |               |                        |
|   clicavel   clicavel  |               |  --- Banco Espera ---  |
|                        |               |  [Jacson] [Jacson]     |
+------------------------+               +------------------------+
```

---

## Sequencia de Implementacao

1. Criar migracao SQL para adicionar colunas `admin_pin`, `secret_phrase` e `clients_queue`
2. Atualizar `useProfessionals.ts` com novas funcoes e interface
3. Atualizar `useQueueState.ts` com funcoes de PIN
4. Reescrever `LoginForm.tsx` para usar PIN com recuperacao por frase secreta
5. Atualizar `BarbershopScene.tsx` com visualizacao por profissional
6. Atualizar `QueueControlCard.tsx` com cadeiras clicaveis
7. Simplificar `QueueIndicator.tsx` removendo texto do circulo
8. Atualizar `Admin.tsx` removendo Supabase Auth e integrando novo sistema
9. Adicionar opcao de alterar PIN nas configuracoes

