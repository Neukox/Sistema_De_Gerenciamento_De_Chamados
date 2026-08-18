import type { AuthenticatedUser } from "../minhaAPI/middlewares/authenticatedUser";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
