import { Request } from "express";

export function canAccessUser(req: Request, userId: number): boolean {
  return req.user?.role === "admin" || req.user?.id === userId;
}

export function canAccessTicket(req: Request, ownerId: number): boolean {
  return req.user?.role === "admin" || req.user?.id === ownerId;
}
