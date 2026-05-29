import { Request, Response } from "express";
import { registerUser, loginUser, getMe as getMeService } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const ipAddress =
      (req.headers["x-forwarded-for"] as string) ||
      req.socket.remoteAddress ||
      "unknown";
    const deviceInfo = req.headers["user-agent"] || "unknown";

    const { user, token } = await loginUser(req.body, { ipAddress, deviceInfo });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login successful", user, token });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
  res.json({ message: "Logged out successfully" });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await getMeService(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};
