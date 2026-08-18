# PROMPT V5 — SISTEMA DE GERENCIAMENTO DE CHAMADOS
## README FINAL PADRONIZADO COM TL;DR

Você está com `Neukox/Sistema_De_Gerenciamento_De_Chamados` aberto no Antigravity/Codex.

## OBJETIVO

Atualizar SOMENTE o `README.md` para seguir o padrão final aprovado:

- TL;DR no topo;
- visão rápida;
- fidelidade ao código;
- WebSocket como diferencial real;
- RSA tratado corretamente como experimento;
- imagens agrupadas e explicadas;
- sem métricas artificiais.

Leia README e código antes de editar.

---

# TL;DR — OBRIGATÓRIO

Inserir logo após o título.

No máximo 4–5 linhas úteis.

Formato esperado:

## TL;DR

**O que é:** sistema educacional de gerenciamento de chamados desenvolvido colaborativamente na Neukox.  
**Stack:** Node.js, Express, TypeScript, PostgreSQL/Prisma e frontend React/TypeScript.  
**Diferencial:** comunicação em tempo real via WebSocket com histórico persistido, além de autenticação JWT/BCrypt.  
**Contexto profissional:** liderança técnica, backend e organização do trabalho via GitHub Projects/Kanban.

Ajustar conforme estado atual.

Não inserir métricas sem medição.

---

# POSICIONAMENTO

Apresentar como:

> Projeto educacional colaborativo da Neukox para gerenciamento de chamados e comunicação entre usuário e atendimento, utilizado como ambiente prático de liderança técnica e desenvolvimento backend.

Não apresentar como help desk comercial em produção.

---

# EQUIPE

- Gabriel Falcão da Cruz — Líder Técnico e Desenvolvedor Backend;
- Davi Leal — Desenvolvedor Frontend;
- Israel Soares — Desenvolvedor Full Stack;
- Matheus Flores — Desenvolvedor Frontend.

Gabriel atuou em:

- liderança técnica;
- Kanban;
- organização/orquestração;
- backend;
- integração técnica.

Não atribuir issues específicas sem evidência.

---

# VISÃO RÁPIDA

Criar tabela curta com:

- Backend;
- Frontend;
- Dados;
- Segurança;
- Tempo real;
- Processo.

---

# FATOS A VALIDAR

Confirmar:

- Node.js;
- Express;
- TypeScript;
- PostgreSQL;
- Prisma;
- JWT;
- BCrypt;
- cadastro;
- login;
- recuperação de senha;
- atualização de usuário;
- chamados;
- roles/admin;
- WebSocket;
- histórico persistido;
- frontend;
- número atual de rotas.

Recontar as rotas.

Se continuar 16 nos routers principais, pode informar:

> 16 rotas HTTP declaradas.

---

# WEBSOCKET

Explicar de forma curta:

- mesmo servidor HTTP do Express;
- conexão registrada por chamado;
- histórico carregado;
- mensagem persistida;
- broadcast;
- desconexão.

Não afirmar:

- <100ms;
- 99,9% uptime;
- escala de produção.

---

# RSA — TRATAMENTO FINAL

Confirmar no código:

- RSA 2048 bits;
- geração de chaves;
- criptografia/descriptografia;
- geração durante cadastro.

Apresentar como:

> Experimento de criptografia assimétrica RSA.

NÃO afirmar E2EE.

Explicar uma vez:

> O chat atual não é E2EE, pois as mensagens passam pelo servidor em formato legível e o módulo RSA não está integrado ao fluxo WebSocket.

Sem repetir em várias seções.

---

# AUTORIZAÇÃO

Se o gap `/user/:id` continuar:

colocar em limitações/roadmap:

> reforçar autorização em nível de objeto derivando identidade do token e validando propriedade do recurso.

Não afirmar que já está resolvido.

---

# MÉTRICAS PROIBIDAS

Não manter:

- +30%;
- <100ms;
- 99,9%;
- qualquer SLA/percentual não medido.

---

# IMAGENS — PADRÃO FINAL

Preserve todas as screenshots válidas.

Nota única:

> As capturas registram estados funcionais da interface e são complementadas pelo código do backend. Elas não representam métricas de latência, disponibilidade ou segurança além do que está implementado.

## Fluxo 1 — Entrada e autenticação

Agrupar:

- login;
- registro;
- recuperação de senha.

Explicar JWT/BCrypt e recuperação.

RSA no cadastro somente como experimento.

## Fluxo 2 — Dashboard e gestão de chamados

Agrupar:

- dashboards;
- listagens;
- detalhes.

Explicar estados, ações e role/admin quando confirmado.

## Fluxo 3 — Chat em tempo real

Dar destaque.

Explicar:

- WebSocket;
- histórico;
- persistência;
- broadcast.

Uma única observação de que não é E2EE.

## Fluxo 4 — Outros estados

Agrupar demais screenshots válidas.

---

# RENDER.YAML

Se existir:

- analisar;
- não alterar;
- não vender deploy como validado se manifesto estiver incompleto;
- mencionar no roadmap apenas se necessário.

---

# ESTRUTURA

1. Título.
2. TL;DR.
3. Visão rápida.
4. Contexto/equipe/Kanban.
5. Problema.
6. Arquitetura.
7. Stack.
8. Funcionalidades.
9. Rotas.
10. WebSocket.
11. Segurança.
12. RSA experimental.
13. Demonstração visual agrupada.
14. Execução.
15. Limitações.
16. Roadmap.
17. O que demonstra profissionalmente.
18. Contato/licença.

---

# LIMITAÇÕES

Aproximadamente 4–6:

- autorização em nível de objeto, se ainda houver gap;
- testes;
- RSA não integrado;
- Render, se obsoleto;
- `.history`, se aplicável.

---

# ROADMAP

Agrupar:

1. Segurança/autorização;
2. Testes;
3. Observabilidade/rate limiting;
4. Higiene/documentação;
5. Deploy.

---

# CHECKLIST

- [ ] TL;DR criado.
- [ ] Rotas recontadas.
- [ ] WebSocket validado.
- [ ] RSA tratado como experimento.
- [ ] E2EE não afirmado.
- [ ] Métricas artificiais removidas.
- [ ] Imagens agrupadas.
- [ ] Equipe correta.
- [ ] Somente README.md alterado.

Ao terminar informe:

1. TL;DR criado;
2. rotas confirmadas;
3. imagens preservadas;
4. fluxos criados;
5. tratamento do RSA;
6. confirmação de somente README.md alterado.
