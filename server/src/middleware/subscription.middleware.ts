import { Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "./auth.middleware";

export const checkSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // subscription expiry check
    if (
      user.subscriptionExpiresAt &&
      new Date(user.subscriptionExpiresAt) < new Date()
    ) {
      return res.status(403).json({
        message: "Subscription expired",
      });
    }

    // ✅ attach separately (IMPORTANT CHANGE)
    req.subscription = {
      plan: user.subscriptionPlan,
      expiresAt: user.subscriptionExpiresAt,
    };

    next();
  } catch (err) {
    return res.status(500).json({ message: "Subscription check failed" });
  }
};
