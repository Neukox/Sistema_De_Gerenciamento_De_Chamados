import { Request, Response, NextFunction } from "express";
import { decodeToken } from "../utils/JWT";
import { AuthenticatedUser } from "./authenticatedUser";

export default function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : undefined;

  if (!token) {
    res.status(401).json({ message: "Token não fornecido" });
    return;
  }

  try {
    const decoded = decodeToken(token);
    if (
      typeof decoded.id !== "number" ||
      typeof decoded.email !== "string" ||
      typeof decoded.role !== "string"
    ) {
      res.status(403).json({ message: "Token sem identidade válida" });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      ...(typeof decoded.name === "string" ? { name: decoded.name } : {}),
    } satisfies AuthenticatedUser;
    next();
  } catch {
    res.status(403).json({ message: "Token inválido" });
  }
}
