"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceProjectLimit = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const enforceProjectLimit = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.subscriptionPlan === "PROFESSIONAL" ||
            user.subscriptionPlan === "ENTERPRISE") {
            return next();
        }
        const projectCount = await prisma_1.default.project.count({
            where: { creatorId: userId },
        });
        if (projectCount >= 2) {
            return res.status(403).json({
                message: "Free trial limit reached (2 projects max)",
            });
        }
        next();
    }
    catch (err) {
        return res.status(500).json({ message: "Limit check failed" });
    }
};
exports.enforceProjectLimit = enforceProjectLimit;
