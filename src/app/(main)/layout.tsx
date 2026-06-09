import { Sidebar } from "@/components/sidebar";
import { getCurrentUser } from "@/features/auth/actions";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar userRole={user.role} />
      
      {/* Main content area */}
      <main className="flex-1 md:ml-64 w-full pt-16 md:pt-0 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
