# Filômetro Ásperus 💈

Sistema de acompanhamento da fila da Barbearia Ásperus em tempo real, com controle de barbeiros, cálculo de tempo estimado e notificações sonoras para celulares e computadores.

## 🚀 Funcionalidades

- **Painel em Tempo Real**: Visualização da quantidade de clientes na fila e tempo médio de espera.
- **Área do Barbeiro**: Painel administrativo protegido por PIN para controle de clientes e cadeiras (João e Jacson).
- **Notificações Sonoras Inteligentes**:
  - Som harmônico ascendente quando entra um cliente na fila.
  - Som suave descendente quando um cliente sai da fila.
  - Desbloqueio automático de áudio para navegadores móveis (iOS Safari e Android Chrome).
- **PWA (Progressive Web App)**: Instalável no celular, suporte offline e ícones dedicados.

## 🛠️ Tecnologias

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Radix UI.
- **PWA**: `vite-plugin-pwa`, Service Workers.
- **Sons**: Web Audio API com síntese harmônica pura (sem dependência de arquivos externos).
- **Hospedagem**: Cloudflare Pages.

## 📦 Como rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Rodar o servidor de desenvolvimento
npm run dev

# 3. Gerar build de produção
npm run build
```
