"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummary = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res
                .status(401)
                .json({ message: "Unauthorized: Missing identity payload." });
        }
        // Call the service layer instead of Prisma directly
        const user = await (0, dashboard_service_1.getDashboardSummaryData)(userId);
        if (!user) {
            return res
                .status(404)
                .json({ message: "User account records not found." });
        }
        return res.json({
            totalProjects: user._count.projects,
            role: user.role,
            subscription: user.subscriptionPlan,
            subscriptionExpiresAt: user.subscriptionExpiresAt,
            accountStatus: user.isActive ? "ACTIVE" : "SUSPENDED",
        });
    }
    catch (err) {
        return res
            .status(500)
            .json({ message: err.message || "Internal server error." });
    }
};
exports.getDashboardSummary = getDashboardSummary;
