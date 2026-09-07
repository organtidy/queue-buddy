# 07. Limitações e Itens Não Testados

Em estrito cumprimento das diretrizes de segurança e do modo `STATIC_ONLY` acordado com o proprietário do projeto, as seguintes áreas e controles não foram submetidos a testes dinâmicos ativos:

---

## 1. Testes Dinâmicos em Produção (Excluídos por Definição)
- **Não realizado:** Não foram disparadas requisições ativas contra o banco de dados de produção do Supabase nem testes de carga contra a Edge Function remota.
- **Motivo:** Preservação da integridade do banco de produção, da cota de infraestrutura e da disponibilidade do serviço para os clientes reais da barbearia.

---

## 2. Regras de Firewall e WAF na Cloudflare Pages
- **Não realizado:** A inspeção restringiu-se aos arquivos locais do projeto. Políticas configuradas diretamente no painel web da Cloudflare (como regras de Managed WAF, Rate Limiting de IP, filtros de geolocalização e proteção contra bots) não puderam ser verificadas estaticamente.
- **Impacto:** Caso a Cloudflare já possua regras de rate limiting ativas na borda, o risco de força bruta no endpoint do frontend pode ser parcialmente atenuado em produção.

---

## 3. Segurança Física e Dispositivos dos Barbeiros
- **Não realizado:** A segurança do aparelho celular ou computador utilizado no balcão da barbearia (presença de antivírus, bloqueio de tela com senha, higiene de extensões no navegador) não faz parte do escopo de código.

---

## 4. Rotação de Segredos no Painel do Supabase
- **Não realizado:** Verificação se chaves antigas expostas em commits passados foram de fato rotacionadas (invalidated/regenerated) no console web do Supabase. Essa validação exige ação direta do administrador na plataforma do provedor.
