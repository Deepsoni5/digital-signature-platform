import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "admin@esignvia.com";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Check Clerk Auth
  const user = await currentUser();
  const isClerkAdmin = user?.emailAddresses[0]?.emailAddress === ADMIN_EMAIL;

  // Check Custom Admin Cookie
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");
  let isCustomAdmin = false;

  if (adminSession?.value) {
     // Verify session with Supabase
     const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(adminSession.value);
     if (supabaseUser && supabaseUser.email === ADMIN_EMAIL) {
        isCustomAdmin = true;
     }
  }

  if (!isClerkAdmin && !isCustomAdmin) {
    redirect("/admin-login");
  }

  const displayEmail = isClerkAdmin ? user?.emailAddresses[0]?.emailAddress : ADMIN_EMAIL;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900">
          <div className="flex h-16 items-center border-b bg-background px-6 shadow-sm">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-lg font-semibold">Admin Console</h1>
            <div className="ml-auto flex items-center gap-4">
               <span className="text-sm text-muted-foreground">{displayEmail}</span>
            </div>
          </div>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
