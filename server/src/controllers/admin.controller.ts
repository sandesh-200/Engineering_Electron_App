import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  updateUserSubscription,
  getLoginLogs,
  deleteUser,
} from "../services/admin.service";

export const listUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await getAllUsers();
    return res.json(users);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const changeUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;

    if (!["ADMIN", "ENGINEER", "VIEWER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await updateUserRole(id, role);
    return res.json(user);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean" });
    }

    const user = await updateUserStatus(id, isActive);
    return res.json(user);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const changeUserSubscription = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = req.params.id as string;
    const { subscriptionPlan, subscriptionExpiresAt } = req.body;

    if (
      !["FREE_TRIAL", "PROFESSIONAL", "ENTERPRISE"].includes(subscriptionPlan)
    ) {
      return res.status(400).json({ message: "Invalid subscription plan" });
    }

    const user = await updateUserSubscription(id, {
      subscriptionPlan,
      subscriptionExpiresAt,
    });
    return res.json(user);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const listLoginLogs = async (_req: AuthRequest, res: Response) => {
  try {
    const logs = await getLoginLogs();
    return res.json(logs);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const removeUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    if (req.user?.id === id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    await deleteUser(id);
    return res.json({ message: "User deleted successfully" });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
