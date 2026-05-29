import React, { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  ShieldAlertIcon,
  UserCheckIcon,
  UserXIcon,
  Trash2Icon,
  ClockIcon,
  UserIcon,
  SearchIcon,
  Loader2Icon,
  CreditCardIcon,
  EllipsisVerticalIcon,
} from "lucide-react";
import { adminApi, type AdminUser, type LoginLog } from "../api/admin";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Subscription Edit Drawer State
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [subPlan, setSubPlan] = useState<"FREE_TRIAL" | "PROFESSIONAL" | "ENTERPRISE">("FREE_TRIAL");
  const [subExpiresAt, setSubExpiresAt] = useState("");
  const [isUpdatingSub, setIsUpdatingSub] = useState(false);

  const fetchData = async () => {
    try {
      setLoadingUsers(true);
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const data = await adminApi.getLoginLogs();
      setLogs(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch logs");
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "ENGINEER" | "VIEWER") => {
    try {
      await adminApi.updateRole(userId, newRole);
      toast.success("User role updated");
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await adminApi.toggleStatus(userId, !currentStatus);
      toast.success(currentStatus ? "User suspended" : "User activated");
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error("You cannot delete your own account");
      return;
    }
    if (!confirm("Are you sure you want to delete this user? All their projects and logs will be removed.")) return;

    try {
      await adminApi.deleteUser(userId);
      toast.success("User deleted successfully");
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const openSubDrawer = (user: AdminUser) => {
    setSelectedUser(user);
    setSubPlan(user.subscriptionPlan);
    if (user.subscriptionExpiresAt) {
      // Format to yyyy-MM-dd for HTML input date
      const d = new Date(user.subscriptionExpiresAt);
      setSubExpiresAt(d.toISOString().split("T")[0]);
    } else {
      setSubExpiresAt("");
    }
  };

  const handleSubUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setIsUpdatingSub(true);
      const expiresAtPayload = subExpiresAt ? new Date(subExpiresAt).toISOString() : null;
      await adminApi.updateSubscription(selectedUser.id, subPlan, expiresAtPayload);
      toast.success("Subscription updated successfully");
      setUsers(prev =>
        prev.map(u =>
          u.id === selectedUser.id
            ? { ...u, subscriptionPlan: subPlan, subscriptionExpiresAt: expiresAtPayload }
            : u
        )
      );
      setSelectedUser(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update subscription");
    } finally {
      setIsUpdatingSub(false);
    }
  };

  const filteredUsers = users.filter(
    u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h2 className="text-3xl font-bold tracking-tight">Admin Portal</h2>
            <p className="text-muted-foreground">
              Manage system users, adjust roles/subscriptions, and review audit trail.
            </p>
          </div>

          <Tabs defaultValue="users" className="w-full flex flex-col gap-4">
            <TabsList className="w-fit">
              <TabsTrigger value="users" onClick={fetchData}>User Management</TabsTrigger>
              <TabsTrigger value="logs" onClick={fetchLogs}>Login Logs</TabsTrigger>
            </TabsList>

            {/* Users Management Tab */}
            <TabsContent value="users" className="space-y-4">
              <div className="flex items-center gap-2 max-w-sm">
                <div className="relative w-full">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-lg border bg-card">
                {loadingUsers ? (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    <Loader2Icon className="mr-2 h-6 w-6 animate-spin text-primary" />
                    <span>Fetching user database...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Subscription</TableHead>
                        <TableHead>Projects</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length ? (
                        filteredUsers.map(user => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  user.role === "ADMIN"
                                    ? "default"
                                    : user.role === "ENGINEER"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium">
                                  {user.subscriptionPlan === "FREE_TRIAL"
                                    ? "Free Trial"
                                    : user.subscriptionPlan === "PROFESSIONAL"
                                    ? "Professional"
                                    : "Enterprise"}
                                </p>
                                {user.subscriptionExpiresAt && (
                                  <p className="text-xs text-muted-foreground">
                                    Expires: {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {user._count?.projects ?? 0}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  user.isActive
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                                    : "border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                                }
                              >
                                {user.isActive ? "Active" : "Suspended"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <EllipsisVerticalIcon className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                    Change Role
                                  </DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleRoleChange(user.id, "ADMIN")} disabled={user.role === "ADMIN"}>
                                    <ShieldAlertIcon className="mr-2 h-4 w-4" /> Set as Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRoleChange(user.id, "ENGINEER")} disabled={user.role === "ENGINEER"}>
                                    <UserIcon className="mr-2 h-4 w-4" /> Set as Engineer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRoleChange(user.id, "VIEWER")} disabled={user.role === "VIEWER"}>
                                    <UserIcon className="mr-2 h-4 w-4" /> Set as Viewer
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => openSubDrawer(user)}>
                                    <CreditCardIcon className="mr-2 h-4 w-4" /> Edit Subscription
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusToggle(user.id, user.isActive)}>
                                    {user.isActive ? (
                                      <>
                                        <UserXIcon className="mr-2 h-4 w-4 text-rose-500" />
                                        <span className="text-rose-500">Suspend Account</span>
                                      </>
                                    ) : (
                                      <>
                                        <UserCheckIcon className="mr-2 h-4 w-4 text-emerald-500" />
                                        <span className="text-emerald-500">Activate Account</span>
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={user.id === currentUser?.id}
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                  >
                                    <Trash2Icon className="mr-2 h-4 w-4" /> Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No users found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

            {/* Login Logs Tab */}
            <TabsContent value="logs" className="space-y-4">
              <div className="rounded-lg border bg-card">
                {loadingLogs ? (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    <Loader2Icon className="mr-2 h-6 w-6 animate-spin text-primary" />
                    <span>Fetching login audit log...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Device/Browser</TableHead>
                        <TableHead>Login Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.length ? (
                        logs.map(log => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{log.user.name}</p>
                                <p className="text-xs text-muted-foreground">{log.user.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {log.ipAddress || "unknown"}
                            </TableCell>
                            <TableCell className="max-w-[300px] truncate text-xs text-muted-foreground" title={log.deviceInfo || "unknown"}>
                              {log.deviceInfo || "unknown"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <ClockIcon className="h-3 w-3" />
                                {new Date(log.loginTime).toLocaleString()}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            No access logs recorded.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>

      {/* Edit Subscription Drawer */}
      <Drawer open={selectedUser !== null} onOpenChange={open => !open && setSelectedUser(null)}>
        <DrawerContent className="max-w-md mx-auto">
          <form onSubmit={handleSubUpdate}>
            <DrawerHeader>
              <DrawerTitle>Manage Subscription</DrawerTitle>
              <DrawerDescription>
                Update subscription plan and expiration date for {selectedUser?.name}.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-4 p-4 text-sm">
              <div className="flex flex-col gap-2">
                <Label htmlFor="sub-plan">Plan Tier</Label>
                <Select value={subPlan} onValueChange={val => setSubPlan(val as any)}>
                  <SelectTrigger id="sub-plan">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE_TRIAL">Free Trial</SelectItem>
                    <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="sub-expiry">Expires At</Label>
                <Input
                  id="sub-expiry"
                  type="date"
                  value={subExpiresAt}
                  onChange={e => setSubExpiresAt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to disable expiration (unlimited duration).
                </p>
              </div>
            </div>
            <DrawerFooter>
              <Button type="submit" disabled={isUpdatingSub}>
                {isUpdatingSub ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Subscription"
                )}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </SidebarProvider>
  );
}
