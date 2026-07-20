import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

const PUBLIC_PATHS = new Set(["/", "/login", "/register"]);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  const isAuthenticated = session !== null;
  const isPublicPath = PUBLIC_PATHS.has(request.nextUrl.pathname);

  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Un usuario logueado que visita la landing o las páginas de auth va directo a su panel.
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Excluye rutas internas de Next y cualquier archivo estático servido desde
  // /public (imágenes, íconos, etc. identificados por tener extensión) para
  // que el optimizador de imágenes y el navegador siempre puedan leerlos sin
  // pasar por el chequeo de sesión.
  matcher: ["/((?!api/cron|_next/static|_next/image|.*\\..*).*)"],
};
