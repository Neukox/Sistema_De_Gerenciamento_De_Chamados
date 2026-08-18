import { Request, Response } from "express";
import ChamadoServices from "../chamados/services";
import UsuarioServices from "../usuarios/services";
import formatDate from "../utils/dateConverter";
import {
  sendMessageEmail,
  sendNotificationToAdmins,
  sendStatusChangeEmail,
} from "../email/send";
import { canAccessTicket } from "../middlewares/authorization";

/**
 * Controller para gerenciar chamados.
 * Contém funções para buscar, criar, atualizar e cancelar chamados.
 *
 * @module ChamadosController
 * @requires express
 * @requires ../bancodedados/chamadoRepo
 * @requires ../utils/dateConverter
 * */

/**
 * Busca todos os chamados com base nos parâmetros de consulta fornecidos.
 *
 * @function getAll
 * @param {Request} req - Objeto de solicitação do Express.
 * @param {Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} - Retorna uma Promise que resolve quando a resposta é enviada.
 * @throws {Error} - Lança um erro se ocorrer um problema ao buscar os chamados.
 * */
const getAll = async (req: Request, res: Response): Promise<void> => {
  const { type, search, status } = req.query;

  try {
    const chamados = await ChamadoServices.getAll({
      type: type as string,
      search: search as string,
      status: status as string,
    });

    // Verifica se existem chamados
    if (!chamados || chamados.length === 0) {
      res.status(200).json({ message: "Nenhum chamado encontrado" });
      return;
    }

    res.status(200).json({
      chamados: chamados.map((chamado) => ({
        id: chamado.id,
        titulo: chamado.titulo,
        descricao: chamado.descricao,
        status: chamado.status,
        usuario_id: chamado.usuario_id,
        tipo_atendimento: chamado.tipo_atendimento,
        data_criacao: formatDate(chamado.criado_em),
        data_encerramento: formatDate(chamado.encerrado_em),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Houve um erro ao buscar chamados" });
    console.error("Erro ao buscar chamados:", error);
  }
};

/**
 * Busca um chamado específico com base no ID fornecido.
 *
 * @function getById
 * @param {Request} req - Objeto de solicitação do Express.
 * @param {Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} - Retorna uma Promise que resolve quando a resposta é enviada.
 * @throws {Error} - Lança um erro se ocorrer um problema ao buscar o chamado.
 * */
async function getById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  try {
    const chamado = await ChamadoServices.getById(id);

    if (chamado && !canAccessTicket(req, chamado.usuario_id)) {
      res.status(403).json({ message: "Não autorizado a acessar este chamado" });
      return;
    }

    // Verifica se o chamado foi encontrado
    if (!chamado) {
      res.status(404).json({ message: "Chamado não encontrado" });
      return;
    }

    res.status(200).json({
      id: chamado.id,
      titulo: chamado.titulo,
      descricao: chamado.descricao,
      status: chamado.status,
      usuario_id: chamado.usuario_id,
      usuario_nome: chamado.usuario?.nome,
      tipo_atendimento: chamado.tipo_atendimento,
      data_criacao: formatDate(chamado.criado_em),
      data_encerramento: formatDate(chamado.encerrado_em),
    });
  } catch (error) {
    res.status(500).json({ message: "Houve um erro ao buscar chamado" });
    console.error("Erro ao buscar chamado:", error);
  }
}

/**
 * Busca chamados de um usuário específico com base no ID fornecido.
 *
 * @function getByUserId
 * @param {Request} req - Objeto de solicitação do Express.
 * @param {Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} - Retorna uma Promise que resolve quando a resposta é enviada.
 * @throws {Error} - Lança um erro se ocorrer um problema ao buscar os chamados.
 * */

async function getByUserId(req: Request, res: Response): Promise<void> {
  const requestedUserId = Number(req.params.id);
  const usuarioId = req.user?.role === "admin" ? requestedUserId : req.user?.id;
  const { search, type, status } = req.query;

  if (!usuarioId || !canAccessTicket(req, usuarioId)) {
    res.status(403).json({ message: "Não autorizado a acessar estes chamados" });
    return;
  }

  try {
    const chamados = await ChamadoServices.getAllByUserId(usuarioId, {
      search: search as string,
      type: type as string,
      status: status as string,
    });

    // Verifica se existem chamados
    if (!chamados || chamados.length === 0) {
      res.status(200).json({ message: "Nenhum chamado encontrado" });
      return;
    }

    res.status(200).json({
      chamados: chamados.map((chamado) => ({
        id: chamado.id,
        titulo: chamado.titulo,
        descricao: chamado.descricao,
        status: chamado.status,
        usuario_id: chamado.usuario_id,
        tipo_atendimento: chamado.tipo_atendimento,
        data_criacao: formatDate(chamado.criado_em),
        data_encerramento: formatDate(chamado.encerrado_em),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Houve um erro ao buscar chamados" });
    console.error("Erro ao buscar chamados:", error);
  }
}

/**
 * Cria um novo chamado com base nos dados fornecidos.
 *
 * @function create
 * @param {Request} req - Objeto de solicitação do Express.
 * @param {Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} - Retorna uma Promise que resolve quando a resposta é enviada.
 * @throws {Error} - Lança um erro se ocorrer um problema ao criar o chamado.
 * */

async function create(req: Request, res: Response): Promise<void> {
  const {
    titulo,
    descricao,
    tipo_atendimento: tipoAtendimento,
  } = req.body;
  const usuarioId = req.user?.id;

  // Validação dos dados recebidos
  if (!titulo || !descricao || !usuarioId || !tipoAtendimento) {
    res.status(400).json({ message: "Dados inválidos" });
    return;
  }

  try {
    const createdChamado = await ChamadoServices.create({
      titulo,
      descricao,
      usuario_id: usuarioId,
      tipo_atendimento: tipoAtendimento,
    });

    // Verifica se o chamado foi criado com sucesso
    if (!createdChamado) {
      res.status(500).json({ message: "Houve um erro ao criar chamado" });
      return;
    }

    // Enviar notificação para os administradores
    await sendNotificationToAdmins({
      title: createdChamado.titulo,
      type_service: createdChamado.tipo_atendimento,
      url: `${process.env.CLIENT_URL}/admin/chamado/${createdChamado.id}`,
    });

    res.status(201).json({
      message: "Chamado criado com sucesso",
      chamado_id: createdChamado.id,
    });
  } catch (error) {
    res.status(500).json({ message: "Houve um erro ao criar chamado" });
    console.error("Erro ao criar chamado:", error);
  }
}

/**
 * Atualiza um chamado existente com base no ID fornecido e nos dados atualizados.
 *
 * @function update
 * @param {Request} req - Objeto de solicitação do Express.
 * @param {Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} - Retorna uma Promise que resolve quando a resposta é enviada.
 * @throws {Error} - Lança um erro se ocorrer um problema ao atualizar o chamado.
 * */

async function update(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { titulo, descricao } = req.body;

  // Validação dos dados recebidos
  if (!titulo || !descricao) {
    res.status(400).json({ message: "Dados inválidos" });
    return;
  }

  try {
    const chamado = await ChamadoServices.getById(id);

    if (chamado && !canAccessTicket(req, chamado.usuario_id)) {
      res.status(403).json({ message: "Não autorizado a atualizar este chamado" });
      return;
    }

    if (!chamado) {
      res.status(404).json({ message: "Chamado não encontrado" });
      return;
    }

    // Verifica se o chamado já está encerrado ou cancelado
    if (["fechado", "cancelado"].includes(chamado.status as string)) {
      res.status(400).json({ message: "Chamado já encerrado ou cancelado" });
      return;
    }

    // Atualiza o chamado
    await ChamadoServices.update(id, {
      titulo,
      descricao,
    });

    res.status(200).json({ message: "Chamado atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Houve um erro ao atualizar chamado" });
    console.error("Erro ao atualizar chamado:", error);
  }
}

/**
 * Atualiza o status de um chamado existente com base no ID fornecido e no novo status.
 *
 * @function updateStatus
 * @param {Request} req - Objeto de solicitação do Express.
 * @param {Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} - Retorna uma Promise que resolve quando a resposta é enviada.
 * @throws {Error} - Lança um erro se ocorrer um problema ao atualizar o status do chamado.
 * */

async function updateStatus(req: Request, res: Response): Promise<void> {
  const chamadoID = Number(req.params.id);
  const { status, mensagem } = req.body;

  // Validação dos dados recebidos
  if (
    !status ||
    ![
      "aberto",
      "em andamento",
      "pendente",
      "resolvido",
      "fechado",
      "cancelado",
    ].includes(status as string)
  ) {
    res.status(400).json({ message: "Status inválido" });
    return;
  }

  try {
    const chamado = await ChamadoServices.getById(chamadoID);

    // Verifica se o chamado foi encontrado
    if (!chamado) {
      res.status(404).json({ message: "Chamado não encontrado" });
      return;
    }

    // Verifica se o chamado já está encerrado ou cancelado
    if (["fechado", "cancelado"].includes(chamado.status)) {
      res.status(400).json({ message: "Chamado já encerrado ou cancelado" });
      return;
    }

    await ChamadoServices.updateStatus(chamadoID, status);

    // Busca o usuário associado ao chamado
    const usuario = await UsuarioServices.getById(chamado.usuario_id);

    // Busca o administrador que está atualizando o status
    const admin = req.user ? await UsuarioServices.getAdminById(req.user.id) : null;

    // Verifica se o usuário e o administrador existem
    if (usuario && admin) {
      await sendStatusChangeEmail(admin.email, usuario.email, {
        user_name: usuario.nome,
        ticket_title: chamado.titulo,
        ticket_status: status as string,
        ...(mensagem && { message: mensagem }),
      });
    }

    res
      .status(200)
      .json({ message: "Status de chamado atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar status de chamado" });
    console.error("Erro ao atualizar chamado:", error);
  }
}

/**
 * Cancela um chamado existente com base no ID fornecido.
 *
 * @function cancel
 * @param {Request} req - Objeto de solicitação do Express.
 * @param {Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} - Retorna uma Promise que resolve quando a resposta é enviada.
 * @throws {Error} - Lança um erro se ocorrer um problema ao cancelar o chamado.
 * */

async function cancel(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  try {
    const chamado = await ChamadoServices.getById(id);

    if (chamado && !canAccessTicket(req, chamado.usuario_id)) {
      res.status(403).json({ message: "Não autorizado a cancelar este chamado" });
      return;
    }

    // Verifica se o chamado foi encontrado
    if (!chamado) {
      res.status(404).json({ message: "Chamado não encontrado" });
      return;
    }

    // Verifica se o chamado já está encerrado ou cancelado
    if (["fechado", "cancelado"].includes(chamado.status)) {
      res.status(400).json({ message: "Chamado já encerrado ou cancelado" });
      return;
    }

    await ChamadoServices.cancel(id);

    res.status(200).json({ message: "Chamado cancelado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Houve um erro ao cancelar chamado" });
    console.error("Erro ao cancelar chamado:", error);
  }
}

/**
 * Envia uma mensagem de e-mail para o usuário associado ao chamado.
 *
 * @function sendMessage
 * @param {Request} req - Objeto de solicitação do Express.
 * @param {Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} - Retorna uma Promise que resolve quando a resposta é enviada.
 * @throws {Error} - Lança um erro se ocorrer um problema ao enviar a mensagem.
 * */

async function sendMessage(req: Request, res: Response): Promise<void> {
  const { mensagem } = req.body;
  const chamadoID = Number(req.params.id);

  // Validação dos dados recebidos
  if (!mensagem) {
    res.status(400).json({ message: "Dados inválidos" });
    return;
  }

  try {
    const chamado = await ChamadoServices.getById(chamadoID);

    const usuarioID = chamado?.usuario_id;

    // Verifica se o chamado foi encontrado
    if (!chamado) {
      res.status(404).json({ message: "Chamado não encontrado" });
      return;
    }

    // Verifica se o tipo de atendimento é "email"
    if (chamado.tipo_atendimento !== "email") {
      res.status(403).json({
        message:
          "Este chamado não têm permissão para enviar mensagens de email.",
      });
      return;
    }

    // Verifica se o chamado já está encerrado ou cancelado
    if (["fechado", "cancelado"].includes(chamado.status)) {
      res.status(400).json({ message: "Chamado já encerrado ou cancelado" });
      return;
    }

    // Busca o usuário associado ao chamado
    const usuario = await UsuarioServices.getById(usuarioID as number);

    // Verifica se o usuário existe
    if (!usuario) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }

    // Busca o administrador que está enviando a mensagem
    const admin = req.user ? await UsuarioServices.getAdminById(req.user.id) : null;

    // Verifica se o administrador existe
    if (!admin || admin.id === undefined) {
      res.status(403).json({ message: "Admin não autorizado" });
      return;
    }

    // Enviar mensagem por e-mail
    await sendMessageEmail(admin.email, usuario.email, {
      user_name: usuario.nome,
      ticket_title: chamado.titulo,
      message: mensagem,
    });

    res.status(200).json({ message: "Mensagem enviada com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "houve um erro ao enviar mensagem" });
    console.error("Erro ao enviar mensagem:", error);
  }
}

export default {
  getAll,
  getById,
  getByUserId,
  create,
  update,
  updateStatus,
  cancel,
  sendMessage,
};
