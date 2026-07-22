import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";

type Params = Promise<{ id: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  const session = await requireSession();

  const report = await prisma.report.findFirst({
    where: {
      id,
      tenantId: session.tenantId,
      OR: [
        { isPublic: true },
        { createdById: session.userId },
      ],
    },
  });
  if (!report || !report.pdfBase64) notFound();

  const buffer = Buffer.from(report.pdfBase64, "base64");
  const fileName = `${report.title.replace(/[^\w\-]+/g, "_")}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
