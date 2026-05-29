import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RecentProjectsTable } from "@/components/data-table";

export default function ProjectsPage() {
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
        <div className="flex flex-1 flex-col p-4 lg:p-6 gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
            <p className="text-muted-foreground">
              Manage your engineering workspace, configure credentials, and inspect logs.
            </p>
          </div>
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 bg-card border rounded-lg p-4 shadow-sm">
            <RecentProjectsTable />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
