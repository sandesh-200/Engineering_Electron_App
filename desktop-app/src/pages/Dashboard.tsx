import React, { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { RecentProjectsTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { dashboardApi, type DashboardSummary } from "../api/dashboard";
import { toast } from "sonner";

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const data = await dashboardApi.getSummary();
        setSummary(data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load dashboard summary");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards
                totalProjects={summary?.totalProjects}
                subscription={summary?.subscription}
                role={summary?.role}
                accountStatus={summary?.accountStatus}
                isLoading={isLoading}
              />
              <RecentProjectsTable limit={5} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
