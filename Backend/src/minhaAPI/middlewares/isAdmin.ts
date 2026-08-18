import { Request, Response, NextFunction } from "express";

export default function verifyAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ message: "Usuário não autenticado" });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({ message: "Não autorizado a acessar esta requisição" });
    return;
  }

  next();
}
