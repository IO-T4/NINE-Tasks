import { Sidebar } from "@/components/sidebar";
import { getCurrentUser } from "@/features/auth/actions";
import { getProfileAction } from "@/features/profile/actions";
import { getScratchpadAction } from "@/features/notes/actions";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const profile = await getProfileAction();
  const scratchpad = await getScratchpadAction();
  
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar userRole={user.role} profile={profile} scratchpadContent={scratchpad.content} />
      
      {/* Main content area */}
      <main className="flex-1 md:ml-64 p-4 pt-20 md:p-8 overflow-y-auto overflow-x-hidden w-full">
        {children}
      </main>
    </div>
  );
}
