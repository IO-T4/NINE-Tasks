import { db } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";
import { getCurrentUser, updateDeviceRoleAction, revokeSessionAction } from "@/features/auth/actions";
import { getExternalCalendarsAction, addExternalCalendarAction, deleteExternalCalendarAction } from "@/features/calendar/actions";
import { Shield, ShieldAlert, MonitorSmartphone, Globe, LogOut } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function AdminDevicesPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser?.isAdmin) {
    redirect("/");
  }

  const allSessions = await db.select().from(sessions);
  const externalCals = await getExternalCalendarsAction();

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-12 md:py-16">
      <header className="mb-12 border-b pb-8 border-border/40">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          Dispositivos <span className="text-muted-foreground font-light">Autorizados</span>
        </h1>
        <p className="text-lg text-muted-foreground mt-2 font-light">
          Administra qué dispositivos tienen acceso y quién es administrador.
        </p>
      </header>

      <div className="space-y-4">
        {allSessions.length === 0 ? (
          <p className="text-muted-foreground">No hay dispositivos registrados.</p>
        ) : (
          allSessions.map((session) => (
            <div
              key={session.id}
              className="p-5 rounded-2xl border bg-card flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:border-primary/30"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <MonitorSmartphone className="w-6 h-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-foreground/90 text-lg">
                  {session.deviceName || "Dispositivo Desconocido"}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                  <span className={`flex items-center gap-1 ${session.isAdmin ? 'text-primary font-bold' : ''}`}>
                    <Shield className="w-3.5 h-3.5" /> Rol: {session.isAdmin ? 'ADMIN' : 'USUARIO'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> {session.ipAddress}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <form action={async () => {
                  "use server";
                  await updateDeviceRoleAction(session.id, !session.isAdmin);
                  revalidatePath("/admin");
                }} className="flex-1 sm:flex-none">
                  <button
                    type="submit"
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-colors w-full ${
                      session.isAdmin 
                        ? 'border-destructive/20 text-destructive hover:bg-destructive/10' 
                        : 'border-primary/20 text-primary hover:bg-primary/10'
                    }`}
                  >
                    {session.isAdmin ? (
                      <><ShieldAlert className="w-4 h-4" /> Quitar Admin</>
                    ) : (
                      <><Shield className="w-4 h-4" /> Hacer Admin</>
                    )}
                  </button>
                </form>
                
                <form action={async () => {
                  "use server";
                  await revokeSessionAction(session.id);
                  revalidatePath("/admin");
                }} className="flex-1 sm:flex-none">
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors w-full"
                    title="Expulsar Dispositivo"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-16 mb-12 border-b pb-8 border-border/40">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          Calendarios <span className="text-muted-foreground font-light">Externos</span>
        </h2>
        <p className="text-lg text-muted-foreground mt-2 font-light">
          Añade URLs públicas (.ics) para fusionarlas en tu calendario (Google, Outlook, Apple).
        </p>
      </div>

      <div className="bg-card border rounded-3xl p-6 shadow-sm mb-8">
        <form action={async (formData: FormData) => {
          "use server";
          const name = formData.get("name") as string;
          const url = formData.get("url") as string;
          const color = formData.get("color") as string || "blue";
          if (name && url) {
            await addExternalCalendarAction(name, url, color);
          }
        }} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-sm font-medium">Nombre</label>
            <input required name="name" type="text" placeholder="Ej: Google Calendar Trabajo" className="w-full px-4 py-3 rounded-xl bg-background border outline-none focus:border-primary" />
          </div>
          <div className="flex-1 w-full space-y-2">
            <label className="text-sm font-medium">URL (.ics)</label>
            <input required name="url" type="url" placeholder="https://..." className="w-full px-4 py-3 rounded-xl bg-background border outline-none focus:border-primary" />
          </div>
          <div className="w-full md:w-32 space-y-2">
            <label className="text-sm font-medium">Color</label>
            <input required name="color" type="color" defaultValue="#6366f1" className="w-full h-[50px] p-1 rounded-xl bg-background border cursor-pointer" />
          </div>
          <button type="submit" className="w-full md:w-auto bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 flex items-center justify-center">
            Añadir
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {externalCals.length === 0 ? (
          <p className="text-muted-foreground">No hay calendarios externos configurados.</p>
        ) : (
          externalCals.map((cal) => (
            <div key={cal.id} className="p-5 rounded-2xl border bg-card flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:border-primary/30">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: cal.color + '20', color: cal.color }}>
                <Globe className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg">{cal.name}</p>
                <p className="text-sm text-muted-foreground truncate">{cal.url}</p>
              </div>
              <form action={async () => {
                "use server";
                await deleteExternalCalendarAction(cal.id);
              }}>
                <button type="submit" className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all">
                  Eliminar
                </button>
              </form>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
