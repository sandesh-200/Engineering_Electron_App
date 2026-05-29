import prisma from "../config/prisma";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });

  // Return without password
  const { password: _, ...safeUser } = user;
  return safeUser;
};

export const loginUser = async (
  data: { email: string; password: string },
  meta: { ipAddress?: string; deviceInfo?: string }
) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.isActive) {
    throw new Error("Account is suspended. Contact your administrator.");
  }

  const isValid = await comparePassword(data.password, user.password);

  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  // Record login log
  await prisma.loginLog.create({
    data: {
      userId: user.id,
      ipAddress: meta.ipAddress || "unknown",
      deviceInfo: meta.deviceInfo || "unknown",
    },
  });

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  const { password: _, ...safeUser } = user;
  return { user: safeUser, token };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      subscriptionPlan: true,
      subscriptionExpiresAt: true,
      isActive: true,
      createdAt: true,
    },
  });

  return user;
};
