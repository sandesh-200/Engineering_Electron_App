"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "An interactive activity log chart";

// Dummy data shifted to measure counts for the requested activities
const chartData = [
  { date: "2026-05-20", login: 45, projectCreated: 12, subscriptionUpdated: 2 },
  { date: "2026-05-21", login: 52, projectCreated: 8, subscriptionUpdated: 4 },
  { date: "2026-05-22", login: 49, projectCreated: 15, subscriptionUpdated: 1 },
  { date: "2026-05-23", login: 63, projectCreated: 22, subscriptionUpdated: 5 },
  { date: "2026-05-24", login: 58, projectCreated: 19, subscriptionUpdated: 3 },
  { date: "2026-05-25", login: 71, projectCreated: 25, subscriptionUpdated: 7 },
  { date: "2026-05-26", login: 84, projectCreated: 31, subscriptionUpdated: 2 },
  { date: "2026-05-27", login: 79, projectCreated: 28, subscriptionUpdated: 4 },
];

const chartConfig = {
  activity: {
    label: "Activities",
  },
  login: {
    label: "Logins",
    color: "var(--primary)",
  },
  projectCreated: {
    label: "Projects Created",
    color: "hsl(var(--chart-2))",
  },
  subscriptionUpdated: {
    label: "Subscriptions Updated",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2026-05-28");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>System Activity Log</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Event frequencies for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a timeframe"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillLogin" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-login)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-login)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="fillProjectCreated"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-projectCreated)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-projectCreated)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="fillSubscriptionUpdated"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-subscriptionUpdated)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-subscriptionUpdated)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="subscriptionUpdated"
              type="natural"
              fill="url(#fillSubscriptionUpdated)"
              stroke="var(--color-subscriptionUpdated)"
              stackId="activityStack"
            />
            <Area
              dataKey="projectCreated"
              type="natural"
              fill="url(#fillProjectCreated)"
              stroke="var(--color-projectCreated)"
              stackId="activityStack"
            />
            <Area
              dataKey="login"
              type="natural"
              fill="url(#fillLogin)"
              stroke="var(--color-login)"
              stackId="activityStack"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
