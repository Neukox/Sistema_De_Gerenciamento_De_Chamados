import { Request, Response } from "express";
import UserServices from "../usuarios/services";
import bycrypt from "bcrypt";
import { canAccessUser } from "../middlewares/authorization";

/**
 * Controlador para gerenciar as informações do usuário.
 * Inclui funções para obter informações do usuário, atualizar informações e alterar senha.
 */
async function getUserInfo(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  if (!canAccessUser(req, id)) {
    res.status(403).json({ message: "Não autorizado a acessar este usuário" });
    return;
  }

  try {
    const usuario = await UserServices.getById(id);

    // Verifica se o usuário existe
    if (!usuario) {
      res.status(404).json({
        message: "Usuário não encontrado",
      });
      return;
    }

    res.status(200).json({
      id: usuario.id,
      name: usuario.nome,
      email: usuario.email,
      role: usuario.tipo,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Erro ao buscar informações do usuário",
    });
    console.error("Erro ao buscar informações do usuário:", error);
  }
}

/**
 * Controlador para atualizar as informações do usuário.
 * Recebe o nome e email do usuário e atualiza no banco de dados.
 * */
async function updateUserInfo(req: Request, res: Response): Promise<void> {
  const { nome, email } = req.body;
  const id = Number(req.params.id);

  if (!canAccessUser(req, id)) {
    res.status(403).json({ message: "Não autorizado a atualizar este usuário" });
    return;
  }

  // Valida os dados recebidos
  if (!nome || !email) {
    res.status(400).json({
      message: "Dados inválidos",
    });
    return;
  }

  try {
    const usuario = await UserServices.getById(id);

    // Verifica se o usuário existe
    if (!usuario) {
      res.status(404).json({
        message: "Usuário não encontrado",
      });
      return;
    }

    await UserServices.updateInfo(id, {
      nome,
      email,
    });

    res.status(200).json({
      message: "Informações atualizadas com sucesso",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Erro ao atualizar informações do usuário",
    });
    console.error("Erro ao atualizar informações do usuário:", error);
  }
}

/**
 * Controlador para alterar a senha do usuário.
 * Recebe a nova senha e o ID do usuário, valida os dados e atualiza a senha no banco de dados.
 * */
async function changePassword(req: Request, res: Response): Promise<void> {
  const { nova_senha } = req.body;
  const id = Number(req.params.id);

  if (!canAccessUser(req, id)) {
    res.status(403).json({ message: "Não autorizado a alterar esta senha" });
    return;
  }

  // Valida os dados recebidos
  if (!nova_senha) {
    res.status(400).json({
      message: "Dados inválidos",
    });
    return;
  }

  try {
    const usuario = await UserServices.getById(id);

    // Verifica se o usuário existe
    if (!usuario) {
      res.status(404).json({
        message: "Usuário não encontrado",
      });
      return;
    }

    const hashedPassword = await bycrypt.hash(nova_senha, 10);

    await UserServices.updatePassword(id, hashedPassword);

    res.status(200).json({
      message: "Senha alterada com sucesso",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Erro ao alterar senha do usuário",
    });
    console.error("Erro ao alterar senha do usuário:", error);
  }
}

export default {
  getUserInfo,
  updateUserInfo,
  changePassword,
};
