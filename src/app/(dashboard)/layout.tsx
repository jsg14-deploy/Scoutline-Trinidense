import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { InteriorGlow } from "@/components/dashboard/InteriorGlow";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const [tenant, user] = session
    ? await Promise.all([
        prisma.tenant.findUnique({ where: { id: session.tenantId } }),
        prisma.user.findUnique({ where: { id: session.userId } }),
      ])
    : [null, null];

  const tenantName = tenant?.name ?? "Scoutline Trinidense";

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Saltar al contenido principal
      </a>

      <Sidebar tenantName={tenantName} userName={user?.fullName ?? "—"} role={session?.role ?? "viewer"} />
      <InteriorGlow />

      <div className="relative z-10 flex min-h-screen flex-col md:pl-60">
        <MobileNav tenantName={tenantName} />
        <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
