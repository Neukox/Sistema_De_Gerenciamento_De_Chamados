# Sistema de Gerenciamento de Chamados

## TL;DR

**O que é:** sistema educacional colaborativo da Neukox para gerenciamento de chamados e comunicação entre usuário e atendimento.<br>
**Stack:** Node.js, Express, TypeScript, PostgreSQL/Prisma e frontend React/TypeScript.<br>
**Diferencial:** chat em tempo real via WebSocket, com histórico persistido, além de autenticação JWT e BCrypt.<br>
**Contexto profissional:** liderança técnica, desenvolvimento backend e organização do trabalho via GitHub Projects/Kanban.

## Visão rápida

| Área | Implementação |
| --- | --- |
| Backend | Node.js, Express e TypeScript, organizado em rotas, controllers e services |
| Frontend | React 19, TypeScript, Vite, React Router, React Query e Tailwind CSS |
| Dados | PostgreSQL com Prisma; modelos de usuários, chamados e respostas |
| Segurança | JWT, hash de senhas com BCrypt, rotas autenticadas e verificação de role administrativa |
| Tempo real | WebSocket no mesmo servidor HTTP, salas lógicas por chamado e mensagens persistidas |
| Processo | Projeto colaborativo com liderança técnica e organização por GitHub Projects/Kanban |

## Contexto e equipe

Projeto educacional colaborativo da Neukox para gerenciamento de chamados e comunicação entre usuário e atendimento, utilizado como ambiente prático de liderança técnica e desenvolvimento backend.

| Integrante | Atuação |
| --- | --- |
| Gabriel Falcão da Cruz | Líder Técnico e Desenvolvedor Backend |
| Davi Leal | Desenvolvedor Frontend |
| Israel Soares | Desenvolvedor Full Stack |
| Matheus Flores | Desenvolvedor Frontend |

Gabriel atuou na liderança técnica, organização do Kanban, orquestração do trabalho, desenvolvimento backend e integração técnica. O projeto não é apresentado como um help desk comercial em produção.

## Problema

O sistema centraliza a abertura, consulta e atualização de chamados e oferece canais de atendimento por chat ou e-mail. Usuários acompanham seus próprios registros pela interface; administradores têm uma visão consolidada e ações específicas de atendimento.

## Arquitetura

```text
Frontend React
   |-- HTTP/JSON + JWT --> Express --> controllers --> services --> Prisma --> PostgreSQL
   `-- WebSocket --------> servidor HTTP compartilhado --> respostas persistidas
```

- `Frontend/`: SPA React com páginas de autenticação, perfil, dashboards e fluxos distintos para usuário e administrador.
- `Backend/src/server.ts`: inicializa Express e WebSocket no mesmo servidor HTTP.
- `Backend/src/minhaAPI/`: concentra autenticação, chamados, usuários, respostas, e-mail, middlewares, sockets e o experimento RSA.
- `Backend/prisma/schema.prisma`: define `Usuario`, `Chamado` e `Resposta`, com seus relacionamentos.

## Stack

### Backend

- Node.js, Express 4 e TypeScript;
- PostgreSQL e Prisma 6;
- JSON Web Token e BCrypt;
- biblioteca `ws` para WebSocket;
- Nodemailer, Email Templates e Handlebars para notificações por e-mail.

### Frontend

- React 19, TypeScript e Vite;
- React Router e TanStack React Query;
- Axios, React Hook Form e Zod;
- Tailwind CSS 4 e DaisyUI.

## Funcionalidades

- cadastro, login, verificação de token, recuperação e redefinição de senha;
- consulta e atualização dos dados do usuário e alteração de senha;
- criação, listagem, consulta, edição, mudança de status e cancelamento de chamados;
- filtros de chamados por busca, tipo de atendimento e status;
- áreas distintas para usuários e administradores;
- envio de notificações e mensagens relacionadas a chamados por e-mail;
- chat por chamado com carregamento do histórico e persistência de novas mensagens.

## Rotas HTTP

O backend possui **16 rotas HTTP declaradas nos três routers principais**, além de `GET /`, usada como resposta simples de disponibilidade do servidor.

### Autenticação — 5 rotas

| Método | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/login` | Autenticar e emitir JWT |
| `POST` | `/register` | Cadastrar usuário |
| `POST` | `/forgot-password` | Solicitar recuperação por e-mail |
| `POST` | `/reset-password` | Redefinir senha com token |
| `POST` | `/verify-token` | Verificar validade do JWT |

### Chamados — 8 rotas

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/chamados/` | Listar chamados; requer admin |
| `GET` | `/chamados/:id` | Consultar chamado por ID |
| `GET` | `/chamados/usuario/:id` | Listar chamados de um usuário |
| `POST` | `/chamados/` | Criar chamado |
| `POST` | `/chamados/mensagem/:id` | Enviar mensagem por e-mail; requer admin |
| `PUT` | `/chamados/:id` | Atualizar título e descrição |
| `PATCH` | `/chamados/status/:id` | Alterar status; requer admin |
| `PATCH` | `/chamados/cancelar/:id` | Cancelar chamado |

### Usuário — 3 rotas

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/user/:id` | Consultar dados do usuário |
| `PUT` | `/user/:id` | Atualizar nome e e-mail |
| `PATCH` | `/user/change-password/:id` | Alterar senha |

## WebSocket

O servidor WebSocket utiliza o mesmo servidor HTTP do Express. O cliente abre a conexão com o JWT na query string (`?token=...`) e, depois da validação, envia um evento `register` apenas com o ID do chamado. O backend deriva o usuário do token, valida a propriedade do chamado (ou a role administrativa), registra a conexão e consulta no PostgreSQL o histórico armazenado em `Resposta`. A query string é usada por compatibilidade com o cliente WebSocket do navegador; URLs com token não devem ser registradas em logs.

Cada evento `chat_message` é persistido antes de o backend recuperar a última mensagem e fazer broadcast para as conexões registradas naquele chamado. No evento `unregister` ou ao fechar a conexão, o cliente é removido do registro em memória.

## Segurança

- senhas são armazenadas com hash BCrypt e fator de custo 10;
- tokens JWT assinados protegem as rotas privadas e expiram conforme o fluxo — quatro horas para sessão e quinze minutos para recuperação de senha;
- middleware específico verifica a role `admin` nas operações administrativas;
- a identidade HTTP é derivada do JWT, com validação de ownership para usuários e chamados;
- o handshake WebSocket exige JWT válido e o acesso ao chamado é conferido antes do registro;
- CORS aceita uma origem configurável por variável de ambiente;
- parâmetros numéricos e filtros conhecidos passam por middlewares de validação.

Esses controles representam o estado do código, não uma certificação ou garantia de segurança em produção.

## Experimento de criptografia assimétrica RSA

O backend contém um experimento que gera pares de chaves RSA de **2048 bits** durante o cadastro, armazena as chaves pública e privada no registro do usuário e disponibiliza funções de criptografia e descriptografia.

O chat atual não é E2EE, pois as mensagens passam pelo servidor em formato legível e o módulo RSA não está integrado ao fluxo WebSocket.

## Demonstração visual

As capturas registram estados funcionais da interface e são complementadas pelo código do backend. Elas não representam métricas de latência, disponibilidade ou segurança além do que está implementado.

### Fluxo 1 — Entrada e autenticação

As telas cobrem login, cadastro e recuperação de senha. O backend usa JWT para sessão, BCrypt para senha e um token temporário enviado por e-mail no fluxo de recuperação. A geração das chaves RSA ocorre no cadastro apenas como experimento.

<p align="center">
  <img src="docs/images/login.jpg" alt="Tela de login" width="90%">
  <img src="docs/images/register.jpg" alt="Tela de cadastro" width="90%">
  <img src="docs/images/recuperarSenha.jpg" alt="Tela de recuperação de senha" width="90%">
</p>

### Fluxo 2 — Dashboard e gestão de chamados

Os dashboards e a tela de detalhes apresentam listagens, filtros, estados do chamado e ações condicionadas ao perfil de usuário ou administrador.

<p align="center">
  <img src="docs/images/dashboard1.jpg" alt="Dashboard de chamados" width="90%">
  <img src="docs/images/dashboard2.jpg" alt="Dashboard com navegação lateral" width="90%">
  <img src="docs/images/detalhes.jpg" alt="Detalhes de um chamado" width="90%">
</p>

### Fluxo 3 — Chat em tempo real

O chat abre uma conexão WebSocket vinculada ao chamado, recebe o histórico persistido e transmite novas mensagens aos participantes conectados depois de salvá-las no banco.

<p align="center">
  <img src="docs/images/chat.jpg" alt="Chat em tempo real de um chamado" width="90%">
</p>

## Execução local

### Pré-requisitos

- Node.js e npm;
- uma instância PostgreSQL acessível;
- credenciais SMTP para testar os fluxos de e-mail.

### 1. Clonar

```bash
git clone https://github.com/Neukox/Sistema_De_Gerenciamento_De_Chamados.git
cd Sistema_De_Gerenciamento_De_Chamados
```

### 2. Configurar o backend

Use `Backend/.env.example` como referência. As variáveis consumidas pelo código incluem:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/chamados"
JWT_SECRET="troque-por-um-segredo"
CLIENT_URL="http://localhost:5173"
CORS_ORIGIN="http://localhost:5173"
PORT=5000
SMTP_HOST="seu-host-smtp"
SMTP_PORT=587
SMTP_USER="seu-usuario-smtp"
SMTP_PASS="sua-senha-smtp"
```

Depois, execute:

```bash
cd Backend
npm install
npx prisma generate
npx prisma generate
npm run dev
```

Por padrão, o servidor HTTP e o WebSocket usam `http://localhost:5000` e `ws://localhost:5000`. O repositório ainda não contém migrations versionadas; crie uma migration deliberadamente quando o ambiente de banco estiver pronto e aplique migrations existentes com `npm run prisma:migrate`.

### 3. Configurar o frontend

Use `Frontend/.env.example` como referência:

```env
VITE_API_URL="http://localhost:5000"
VITE_WS_URL="ws://localhost:5000"
```

Em outro terminal:

```bash
cd Frontend
npm install
npm run dev
```

O Vite disponibiliza a interface em `http://localhost:5173` por padrão.

### Scripts úteis

| Projeto | Comando | Ação |
| --- | --- | --- |
| Backend | `npm run dev` | Executa o servidor TypeScript em modo watch |
| Backend | `npm run build` | Compila para `dist/` |
| Backend | `npm start` | Executa o build compilado |
| Backend | `npm run prisma:generate` | Gera o Prisma Client |
| Backend | `npm run prisma:migrate` | Aplica migrations existentes |
| Frontend | `npm run dev` | Inicia o Vite |
| Frontend | `npm run build` | Verifica o TypeScript e gera o build |
| Frontend | `npm run lint` | Executa o ESLint |

## Limitações atuais

- a autorização em nível de objeto foi mitigada nas rotas de usuário e chamados por identidade derivada do JWT e validação de propriedade; uma revisão futura pode ampliar a cobertura para novos recursos;
- não há suíte de testes automatizados nem scripts de teste configurados nos pacotes;
- o RSA não participa do fluxo WebSocket e a chave privada continua armazenada no banco pelo experimento; ela não é mais gravada automaticamente em arquivo;
- `Backend/render.yaml` é uma configuração preparada, mas o deploy no Render não foi comprovado neste ambiente;
- não há suíte de testes automatizados configurada.

## Roadmap

1. **Segurança e autorização:** ampliar a validação de propriedade para novos recursos e revisar o armazenamento da chave privada RSA.
2. **Testes:** cobrir services, controllers, middlewares, rotas HTTP e o ciclo de vida do chat.
3. **Observabilidade e proteção:** adicionar logs estruturados, tratamento centralizado de erros e rate limiting HTTP/WebSocket.
4. **Higiene e documentação:** remover artefatos de histórico local, adicionar instruções de contribuição e manter exemplos de ambiente sincronizados com o código.
5. **Deploy:** corrigir e validar o manifesto do Render e documentar uma estratégia compatível para o frontend.

## O que o projeto demonstra profissionalmente

- organização de uma aplicação full-stack com separação de responsabilidades;
- modelagem relacional e persistência com PostgreSQL e Prisma;
- autenticação, autorização por role e recuperação de senha;
- integração de HTTP, WebSocket e e-mail no mesmo domínio de negócio;
- liderança técnica e coordenação colaborativa por Kanban;
- capacidade de avaliar limites do código sem transformar experimentos em promessas de produção.

## Contato e licença

**Gabriel Falcão da Cruz**

- [Portfólio](https://www.gabrielfalcaodacruz.tech/)
- [LinkedIn](https://www.linkedin.com/in/gabrielfalcaodev/)
- [GitHub](https://github.com/GabrielF0900)
- [E-mail](mailto:falcaocruz.tech@gmail.com)

O repositório não contém um arquivo de licença no estado atual. Consulte o responsável antes de reutilizar ou redistribuir o código.
