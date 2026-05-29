"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummaryData = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getDashboardSummaryData = async (userId) => {
    const user = await prisma_1.default.user.findUnique({
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
exports.getDashboardSummaryData = getDashboardSummaryData;
