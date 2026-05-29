import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { AdminControls } from "@/components/admin-controls";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  FolderIcon,
  Settings2Icon,
  CircleHelpIcon,
  CommandIcon,
  CreditCard,
  UserCog,
  LogOutIcon,
  LayoutDashboardIcon,
} from "lucide-react";
import { toast } from "sonner";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out");
      navigate("/");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  const sidebarData = React.useMemo(() => {
    return {
      navMain: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: <LayoutDashboardIcon className="size-4" />,
        },
        {
          title: "Projects",
          url: "/projects",
          icon: <FolderIcon className="size-4" />,
        },
      ],
      navSecondary: [
        {
          title: "Settings",
          url: "#",
          icon: <Settings2Icon className="size-4" />,
        },
        {
          title: "Get Help",
          url: "#",
          icon: <CircleHelpIcon className="size-4" />,
        },
      ],
      adminControls: [
        {
          name: "Admin Portal",
          url: "/admin",
          icon: <UserCog className="size-4" />,
        },
      ],
    };
  }, []);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to="/dashboard">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">
                  Acme Engineering
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        {user?.role === "ADMIN" && (
          <AdminControls items={sidebarData.adminControls} />
        )}
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-muted-foreground transition-colors hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={handleLogout}
            >
              <LogOutIcon className="size-4 text-rose-400" />
              <span className="font-medium">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
