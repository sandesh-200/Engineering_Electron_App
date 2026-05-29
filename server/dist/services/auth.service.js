"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.loginUser = exports.registerUser = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const registerUser = async (data) => {
    const existingUser = await prisma_1.default.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        throw new Error("User already exists");
    }
    const hashedPassword = await (0, hash_1.hashPassword)(data.password);
    const user = await prisma_1.default.user.create({
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
exports.registerUser = registerUser;
const loginUser = async (data, meta) => {
    const user = await prisma_1.default.user.findUnique({
        where: { email: data.email },
    });
    if (!user) {
        throw new Error("Invalid credentials");
    }
    if (!user.isActive) {
        throw new Error("Account is suspended. Contact your administrator.");
    }
    const isValid = await (0, hash_1.comparePassword)(data.password, user.password);
    if (!isValid) {
        throw new Error("Invalid credentials");
    }
    // Record login log
    await prisma_1.default.loginLog.create({
        data: {
            userId: user.id,
            ipAddress: meta.ipAddress || "unknown",
            deviceInfo: meta.deviceInfo || "unknown",
        },
    });
    const token = (0, jwt_1.generateToken)({
        id: user.id,
        role: user.role,
    });
    const { password: _, ...safeUser } = user;
    return { user: safeUser, token };
};
exports.loginUser = loginUser;
const getMe = async (userId) => {
    const user = await prisma_1.default.user.findUnique({
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
exports.getMe = getMe;
