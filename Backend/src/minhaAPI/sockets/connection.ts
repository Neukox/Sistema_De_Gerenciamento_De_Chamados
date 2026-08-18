import { Server as WebSocketServer, WebSocket } from "ws";
import http from "http";
import { URL } from "url";
import RespostaServices from "../respostas/services";
import ChamadoServices from "../chamados/services";
import { decodeToken } from "../utils/JWT";
import { AuthenticatedUser } from "../middlewares/authenticatedUser";
import {
  registerClient,
  sendMessageToChamado,
  unregisterClient,
} from "./privateMessageHandler";
import formatDate from "../utils/dateConverter";

interface AuthenticatedSocket extends WebSocket {
  user: AuthenticatedUser;
  chamadoId?: string;
}

function authenticateSocket(request: http.IncomingMessage): AuthenticatedUser | null {
  try {
    const requestUrl = new URL(request.url ?? "/", "http://localhost");
    const token = requestUrl.searchParams.get("token");
    if (!token) return null;

    const decoded = decodeToken(token);
    if (
      typeof decoded.id !== "number" ||
      typeof decoded.email !== "string" ||
      typeof decoded.role !== "string"
    ) {
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      ...(typeof decoded.name === "string" ? { name: decoded.name } : {}),
    };
  } catch {
    return null;
  }
}

function canAccessTicket(user: AuthenticatedUser, ownerId: number): boolean {
  return user.role === "admin" || user.id === ownerId;
}

export function setupWebSocketServer(server: http.Server): void {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (rawSocket, request) => {
    const user = authenticateSocket(request);
    const socket = rawSocket as AuthenticatedSocket;

    if (!user) {
      socket.close(1008, "Token inválido ou ausente");
      return;
    }

    socket.user = user;
    socket.send(JSON.stringify({ type: "connection_established" }));

    socket.on("message", async (data) => {
      try {
        const message: unknown = JSON.parse(data.toString());
        if (!message || typeof message !== "object") throw new Error("Mensagem inválida");
        const payload = message as Record<string, unknown>;
        const chamadoId = Number(payload.chamado_id);

        if (payload.type === "register") {
          if (!Number.isInteger(chamadoId) || chamadoId <= 0) {
            throw new Error("Chamado inválido");
          }

          const chamado = await ChamadoServices.getById(chamadoId);
          if (!chamado || !canAccessTicket(user, chamado.usuario_id)) {
            socket.send(JSON.stringify({ type: "error", error: "Acesso negado ao chamado" }));
            return;
          }

          if (socket.chamadoId) unregisterClient(socket.chamadoId, String(user.id));
          socket.chamadoId = String(chamadoId);
          registerClient(socket, socket.chamadoId, String(user.id));

          const historico = await RespostaServices.getAllByChamadoId(chamadoId);
          socket.send(JSON.stringify({
            type: "historico",
            chamado_id: socket.chamadoId,
            historico: historico.map((msg) => ({
              usuario_id: msg.usuario_id,
              de: msg.usuario?.nome || "Desconhecido",
              conteudo: msg.mensagem,
              data_envio: formatDate(msg.data_envio),
            })),
          }));
          return;
        }

        if (payload.type === "unregister") {
          if (socket.chamadoId) {
            unregisterClient(socket.chamadoId, String(user.id));
            socket.chamadoId = undefined;
          }
          return;
        }

        if (payload.type === "chat_message") {
          if (!socket.chamadoId || String(chamadoId) !== socket.chamadoId) {
            throw new Error("Conexão não registrada neste chamado");
          }

          const chamado = await ChamadoServices.getById(chamadoId);
          if (!chamado || !canAccessTicket(user, chamado.usuario_id)) {
            throw new Error("Acesso negado ao chamado");
          }

          if (typeof payload.conteudo !== "string" || !payload.conteudo.trim()) {
            throw new Error("Mensagem vazia");
          }

          await RespostaServices.save({
            chamado_id: chamadoId,
            usuario_id: user.id,
            mensagem: payload.conteudo,
          });

          const ultimaMensagem = await RespostaServices.lastByChamadoId(chamadoId);
          sendMessageToChamado(socket.chamadoId, {
            type: "chat_message",
            usuario_id: user.id,
            de: ultimaMensagem?.usuario?.nome || user.name || "Desconhecido",
            conteudo: ultimaMensagem?.mensagem,
            data_envio: formatDate(ultimaMensagem?.data_envio as Date),
          });
          return;
        }

        throw new Error("Tipo de mensagem desconhecido");
      } catch (error) {
        socket.send(JSON.stringify({
          type: "error",
          error: error instanceof Error ? error.message : "Erro ao utilizar WebSocket",
        }));
      }
    });

    socket.on("close", () => {
      if (socket.chamadoId) {
        unregisterClient(socket.chamadoId, String(user.id));
        socket.chamadoId = undefined;
      }
    });
  });
}
