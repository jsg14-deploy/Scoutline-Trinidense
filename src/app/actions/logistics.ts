"use server";

import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";

// --- PROVEEDORES ---

export async function createLogisticsProvider(data: {
  name: string;
  category: string;
  contactInfo?: string;
  notes?: string;
}) {
  const session = await requireSession();
  
  await prisma.logisticsProvider.create({
    data: {
      tenantId: session.tenantId,
      name: data.name,
      category: data.category,
      contactInfo: data.contactInfo,
      notes: data.notes,
    },
  });

  revalidatePath("/logistica/proveedores");
  revalidatePath("/logistica/gastos");
  return { success: true };
}

export async function deleteLogisticsProvider(id: string) {
  const session = await requireSession();
  
  await prisma.logisticsProvider.delete({
    where: { id, tenantId: session.tenantId },
  });

  revalidatePath("/logistica/proveedores");
  revalidatePath("/logistica/gastos");
  return { success: true };
}

// --- VIAJES ---

export async function createLogisticsTrip(data: {
  destination: string;
  departureDate: string;
  returnDate?: string;
  notes?: string;
  status: string;
}) {
  const session = await requireSession();
  
  await prisma.logisticsTrip.create({
    data: {
      tenantId: session.tenantId,
      destination: data.destination,
      departureDate: new Date(data.departureDate),
      returnDate: data.returnDate ? new Date(data.returnDate) : null,
      notes: data.notes,
      status: data.status,
    },
  });

  revalidatePath("/logistica/viajes");
  revalidatePath("/logistica/gastos");
  revalidatePath("/logistica");
  return { success: true };
}

export async function deleteLogisticsTrip(id: string) {
  const session = await requireSession();
  
  await prisma.logisticsTrip.delete({
    where: { id, tenantId: session.tenantId },
  });

  revalidatePath("/logistica/viajes");
  revalidatePath("/logistica/gastos");
  revalidatePath("/logistica");
  return { success: true };
}

// --- GASTOS ---

export async function createLogisticsExpense(data: {
  tripId?: string;
  providerId?: string;
  amount: number;
  category: string;
  description: string;
  status: string;
}) {
  const session = await requireSession();
  
  await prisma.logisticsExpense.create({
    data: {
      tenantId: session.tenantId,
      createdById: session.userId,
      tripId: data.tripId || null,
      providerId: data.providerId || null,
      amount: new Prisma.Decimal(data.amount),
      category: data.category,
      description: data.description,
      status: data.status,
    },
  });

  revalidatePath("/logistica/gastos");
  revalidatePath("/logistica/viajes");
  revalidatePath("/logistica");
  return { success: true };
}

export async function deleteLogisticsExpense(id: string) {
  const session = await requireSession();
  
  await prisma.logisticsExpense.delete({
    where: { id, tenantId: session.tenantId },
  });

  revalidatePath("/logistica/gastos");
  revalidatePath("/logistica/viajes");
  revalidatePath("/logistica");
  return { success: true };
}
