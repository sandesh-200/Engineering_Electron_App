import prisma from "../config/prisma";

export const getDashboardSummaryData = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      subscriptionPlan: true,
      subscriptionExpiresAt: true,
      isActive: true,
      _count: {
        select: { projects: true },
      },
    },
  });

  return user;
};
