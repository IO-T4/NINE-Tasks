import { db } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { revokeSessionAction } from "@/features/auth/actions";
import { Laptop, Smartphone, Globe, ShieldAlert } from "lucide-react";

export default async function AdminDevicesPage() {
  const activeSessions = await db.select().from(sessions).orderBy(desc(sessions.lastSeenAt));

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-12 md:py-16">
      <header className="mb-12 border-b pb-8 border-border/40">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          Dispositivos <span className="text-muted-foreground font-light">Conectados</span>
        </h1>
        <p className="text-lg text-muted-foreground mt-2 font-light">
          Administra las sesiones activas y revoca el acceso de dispositivos desconocidos.
        </p>
      </header>

      <div className="space-y-4">
        {activeSessions.length === 0 ? (
          <p className="text-muted-foreground">No hay sesiones activas.</p>
        ) : (
          activeSessions.map((session) => {
            const isMobile = session.userAgent?.toLowerCase().includes("mobile");
            const Icon = isMobile ? Smartphone : Laptop;

            return (
              <div
                key={session.id}
                className="p-5 rounded-2xl border bg-card flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:border-primary/30"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-foreground/90">
                    {session.userAgent || "Navegador Desconocido"}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" /> {session.ipAddress || "IP Desconocida"}
                    </span>
                    <span>
                      Última vez: {session.lastSeenAt.toLocaleString("es-ES")}
                    </span>
                  </div>
                </div>

                <form action={async () => {
                  "use server";
                  await revokeSessionAction(session.id);
                  const { revalidatePath } = await import("next/cache");
                  revalidatePath("/admin/devices");
                }}>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors w-full sm:w-auto justify-center"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Revocar Acceso
                  </button>
                </form>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
