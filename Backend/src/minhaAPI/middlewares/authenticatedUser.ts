export interface AuthenticatedUser {
  id: number;
  email: string;
  role: string;
  name?: string;
}
