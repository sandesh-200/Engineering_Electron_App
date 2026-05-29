"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getLoginLogs = exports.updateUserSubscription = exports.updateUserStatus = exports.updateUserRole = exports.getAllUsers = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getAllUsers = async () => {
    return await prisma_1.default.user.findMany({
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
exports.getAllUsers = getAllUsers;
const updateUserRole = async (userId, role) => {
    return await prisma_1.default.user.update({
        where: { id: userId },
        data: { role },
        select: { id: true, name: true, email: true, role: true, isActive: true },
    });
};
exports.updateUserRole = updateUserRole;
const updateUserStatus = async (userId, isActive) => {
    return await prisma_1.default.user.update({
        where: { id: userId },
        data: { isActive },
        select: { id: true, name: true, email: true, role: true, isActive: true },
    });
};
exports.updateUserStatus = updateUserStatus;
const updateUserSubscription = async (userId, data) => {
    return await prisma_1.default.user.update({
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
exports.updateUserSubscription = updateUserSubscription;
const getLoginLogs = async () => {
    return await prisma_1.default.loginLog.findMany({
        orderBy: { loginTime: "desc" },
        take: 100,
        include: {
            user: { select: { id: true, name: true, email: true, role: true } },
        },
    });
};
exports.getLoginLogs = getLoginLogs;
const deleteUser = async (userId) => {
    // Delete related records first
    await prisma_1.default.loginLog.deleteMany({ where: { userId } });
    await prisma_1.default.project.deleteMany({ where: { creatorId: userId } });
    return await prisma_1.default.user.delete({ where: { id: userId } });
};
exports.deleteUser = deleteUser;
