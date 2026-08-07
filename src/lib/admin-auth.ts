import { cookies } from "next/headers";
import { verifySession } from "./auth";

export const ADMIN_COOKIE = "sed_admin";

export interface AdminSession {
  username: string;
  role: "ROLE_PILOT_ADMIN";
}

// Verifica la sesion de administrador desde la cookie firmada (RBAC).
export function requireAdmin(): AdminSession | null {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  const payload = verifySession<AdminSession>(token);
  if (!payload || payload.role !== "ROLE_PILOT_ADMIN") return null;
  return payload;
}
