# Chat por chamado

O backend implementa o chat com `ws` no mesmo servidor HTTP do Express. Cada conexão autenticada pode ser registrada em um chamado e recebe o histórico persistido em PostgreSQL pela tabela `Resposta`.

## Fluxo de conexão

O cliente do navegador envia o JWT na query string da URL do WebSocket, por compatibilidade com a API `WebSocket` nativa:

```text
ws://localhost:5000/?token=<JWT>
```

O servidor valida o token antes de aceitar mensagens. O token não deve ser escrito em logs, e a query string deve ser tratada como um trade-off do transporte no navegador.

Depois da conexão, o cliente solicita o chamado sem enviar sua identidade:

```json
{
  "type": "register",
  "chamado_id": "1"
}
```

O servidor consulta o chamado e permite o registro somente ao proprietário ou a um administrador. O usuário da conexão é sempre derivado do JWT.

## Mensagens

Para enviar uma mensagem, o cliente usa o chamado já registrado:

```json
{
  "type": "chat_message",
  "chamado_id": "1",
  "conteudo": "Olá, como posso ajudar?"
}
```

O backend valida novamente o acesso, grava a mensagem com o ID do usuário autenticado e só então transmite o evento aos clientes registrados no chamado. O evento `unregister` e o fechamento da conexão removem o cliente da sala lógica:

```json
{
  "type": "unregister",
  "chamado_id": "1"
}
```

O histórico contém autor, conteúdo e data de envio. As mensagens passam pelo servidor em formato legível; este chat não é E2EE. O módulo RSA existente é um experimento separado e não participa do protocolo WebSocket.
