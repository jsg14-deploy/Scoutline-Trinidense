"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { createSession, deleteSession } from "@/lib/auth/session";

export type FormState = { error?: string } | undefined;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Email o contraseña inválidos." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return { error: "Credenciales incorrectas." };
  }

  const passwordOk = await bcrypt.compare(parsed.data.password, user.hashedPassword);
  if (!passwordOk) {
    return { error: "Credenciales incorrectas." };
  }

  await createSession({ userId: user.id, tenantId: user.tenantId, role: user.role });
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

const registerSchema = z.object({
  tenantName: z.string().min(2, "Nombre de club/organización requerido."),
  fullName: z.string().min(2, "Tu nombre completo es requerido."),
  email: z.string().email("Email inválido."),
  password: z.string().min(8, "Mínimo 8 caracteres."),
});

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "club"
  );
}

export async function register(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    tenantName: formData.get("tenant_name"),
    fullName: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese email." };
  }

  const baseSlug = slugify(parsed.data.tenantName);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.tenant.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++suffix}`;
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  const tenant = await prisma.tenant.create({
    data: {
      slug,
      name: parsed.data.tenantName,
      users: {
        create: {
          email: parsed.data.email,
          fullName: parsed.data.fullName,
          hashedPassword,
          role: "admin",
        },
      },
    },
    include: { users: true },
  });

  const user = tenant.users[0];
  await createSession({ userId: user.id, tenantId: tenant.id, role: user.role });
  redirect("/dashboard");
}
