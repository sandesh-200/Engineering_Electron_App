import prisma from "../config/prisma";

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      subscriptionPlan: true,
      subscriptionExpiresAt: true,
      isActive: true,
      createdAt: true,
      _count: { select: { projects: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateUserRole = async (
  userId: string,
  role: "ADMIN" | "ENGINEER" | "VIEWER"
) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
};

export const updateUserSubscription = async (
  userId: string,
  data: {
    subscriptionPlan: "FREE_TRIAL" | "PROFESSIONAL" | "ENTERPRISE";
    subscriptionExpiresAt?: string | null;
  }
) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan: data.subscriptionPlan,
      subscriptionExpiresAt: data.subscriptionExpiresAt
        ? new Date(data.subscriptionExpiresAt)
        : null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionPlan: true,
      subscriptionExpiresAt: true,
    },
  });
};

export const getLoginLogs = async () => {
  return await prisma.loginLog.findMany({
    orderBy: { loginTime: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });
};

export const deleteUser = async (userId: string) => {
  // Delete related records first
  await prisma.loginLog.deleteMany({ where: { userId } });
  await prisma.project.deleteMany({ where: { creatorId: userId } });
  return await prisma.user.delete({ where: { id: userId } });
};
