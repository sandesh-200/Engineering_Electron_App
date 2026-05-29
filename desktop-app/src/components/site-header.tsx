import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = (path: string) => {
    switch (path) {
      case "/dashboard":
        return "Dashboard";
      case "/projects":
        return "Projects Workspace";
      case "/admin":
        return "Administrative Controls";
      default:
        return "Workspace";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center justify-between border-b transition-[width,height] ease-linear px-4 lg:px-6">
      <div className="flex items-center gap-1">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-semibold tracking-tight text-slate-800 dark:text-slate-200">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="hidden sm:inline-flex capitalize">
            {user.role.toLowerCase()}
          </Badge>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 rounded-full bg-primary/10 text-primary border border-primary/20">
              <AvatarFallback className="text-xs font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {user.name}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
