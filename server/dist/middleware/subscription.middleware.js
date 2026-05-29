"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSubscription = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const checkSubscription = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // subscription expiry check
        if (user.subscriptionExpiresAt &&
            new Date(user.subscriptionExpiresAt) < new Date()) {
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
    }
    catch (err) {
        return res.status(500).json({ message: "Subscription check failed" });
    }
};
exports.checkSubscription = checkSubscription;
