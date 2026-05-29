"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircleIcon,
  ShieldIcon,
  UserIcon,
  ActivityIcon,
} from "lucide-react";

interface SectionCardsProps {
  totalProjects?: number;
  subscription?: string;
  role?: string;
  accountStatus?: string;
  isLoading?: boolean;
}

export function SectionCards({
  totalProjects = 0,
  subscription = "FREE_TRIAL",
  role = "VIEWER",
  accountStatus = "ACTIVE",
  isLoading = false,
}: SectionCardsProps) {
  // Format role and subscription for pretty display
  const formatRole = (r: string) => {
    return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
  };

  const formatSubscription = (sub: string) => {
    switch (sub) {
      case "FREE_TRIAL":
        return "Free Trial";
      case "PROFESSIONAL":
        return "Professional";
      case "ENTERPRISE":
        return "Enterprise";
      default:
        return sub;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-slate-100 dark:bg-slate-900 h-[150px]">
            <div className="h-full flex flex-col justify-between p-6">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Total Projects */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Projects</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalProjects}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <ActivityIcon className="size-3 mr-1" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Ongoing project activity <ActivityIcon className="size-4 text-primary" />
          </div>
          <div className="text-muted-foreground">
            Based on current workspace
          </div>
        </CardFooter>
      </Card>

      {/* Active Subscription */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Subscription</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatSubscription(subscription)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5">
              <CheckCircleIcon className="size-3 mr-1" />
              Verified
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Plan limits applied <CheckCircleIcon className="size-4 text-emerald-500" />
          </div>
          <div className="text-muted-foreground">
            Renews automatically each month
          </div>
        </CardFooter>
      </Card>

      {/* Role */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Role</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatRole(role)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <UserIcon className="size-3 mr-1" />
              Access
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {role === "ADMIN" ? "Elevated admin control" : "Standard developer access"} <UserIcon className="size-4 text-primary" />
          </div>
          <div className="text-muted-foreground">
            Permissions active for session
          </div>
        </CardFooter>
      </Card>

      {/* Account Status */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Account Status</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {accountStatus}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                accountStatus === "ACTIVE"
                  ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                  : "text-rose-500 border-rose-500/20 bg-rose-500/5"
              }
            >
              <ShieldIcon className="size-3 mr-1" />
              Secure
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Account fully authenticated <ShieldIcon className="size-4 text-emerald-500" />
          </div>
          <div className="text-muted-foreground">Security checks completed</div>
        </CardFooter>
      </Card>
    </div>
  );
}
