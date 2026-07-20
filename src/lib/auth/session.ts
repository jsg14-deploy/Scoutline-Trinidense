import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "@/generated/prisma/enums";

const COOKIE_NAME = "scout_session";
const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60; // 30 días

export type SessionPayload = {
  userId: string;
  tenantId: string;
  role: UserRole;
};

function getEncodedKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET no está configurado.");
  }
  return new TextEncoder().encode(secret);
}

async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getEncodedKey());
}

async function decrypt(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, getEncodedKey(), {
    algorithms: ["HS256"],
  });
  return payload as unknown as SessionPayload;
}

export async function createSession(payload: SessionPayload) {
  const token = await encrypt(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    return await decrypt(token);
  } catch {
    return null;
  }
}

// Cada server action / page que toque datos por-tenant pasa por acá primero:
// tenantId sale del JWT firmado, nunca de un input del cliente.
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("No autenticado.");
  }
  return session;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
