import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { getDashboardSummaryData } from "../services/dashboard.service";

export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Missing identity payload." });
    }

    // Call the service layer instead of Prisma directly
    const user = await getDashboardSummaryData(userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User account records not found." });
    }

    return res.json({
      totalProjects: user._count.projects,
      role: user.role,
      subscription: user.subscriptionPlan,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      accountStatus: user.isActive ? "ACTIVE" : "SUSPENDED",
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err.message || "Internal server error." });
  }
};
