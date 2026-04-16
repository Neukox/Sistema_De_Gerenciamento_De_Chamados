
# Sistema de Gerenciamento de Chamados

Este é um projeto acadêmico desenvolvido para a disciplina de Código de Alta Performance. O objetivo é criar um sistema completo de gerenciamento de chamados ao longo de aproximadamente 2 meses e meio.


## 📚 Sobre o Projeto

O sistema visa permitir que usuários registrem, acompanhem e gerenciem chamados técnicos de forma eficiente. A aplicação será composta por um frontend interativo e um backend robusto, garantindo uma experiência fluida para os usuários e facilitando o trabalho da equipe de suporte.


## Stack utilizada

**Front-end:** Typescript, React, React Router, TailwindCSS

**Back-end:** Typescript, Node, Express

**Banco de Dados:** Postgresql

**Outras Tecnologias:** Websockets

## 📁 Estrutura do Projeto

O repositório está organizado da seguinte forma:

```
Sistema_De_Gerenciameento_De_Chamados/
├── Backend/
│   ├── prisma/
│   ├── emails-templates/
│   ├── src/
│   │   ├── minhaApi
│   │   │   ├── autenticação/
│   │   │   ├── chamados/
│   │   │   ├── controllers/
│   │   │   ├── criptografia/
│   │   │   ├── email/
│   │   │   ├── middlewares/
│   │   │   ├── respostas/
│   │   │   ├── routes/
│   │   │   ├── usuarios/
│   │   │   └── utils/
│   │   ├── server.ts
├── Frontend/
│   ├── public/
│   ├── src/
|   │   ├── assets/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── routes.tsx
│   ├── index.html
└── README.md
```
