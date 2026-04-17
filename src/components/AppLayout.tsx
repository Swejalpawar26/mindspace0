import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const displayName = typeof user?.user_metadata?.display_name === "string" ? user.user_metadata.display_name : "";
  const initials = displayName
    ? displayName.split(" ").map((name) => name[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-4 bg-card/50 backdrop-blur-sm">
            <SidebarTrigger className="mr-3" />
            <div className="ml-auto">
              <Link to="/profile" title="View profile">
                <Avatar className="w-10 h-10 border border-border/70">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </header>
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
