import { Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "./auth.middleware";

export const enforceProjectLimit = async (
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

    if (
      user.subscriptionPlan === "PROFESSIONAL" ||
      user.subscriptionPlan === "ENTERPRISE"
    ) {
      return next();
    }

    const projectCount = await prisma.project.count({
      where: { creatorId: userId },
    });

    if (projectCount >= 2) {
      return res.status(403).json({
        message: "Free trial limit reached (2 projects max)",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: "Limit check failed" });
  }
};
