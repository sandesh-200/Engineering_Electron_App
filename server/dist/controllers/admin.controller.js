"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUser = exports.listLoginLogs = exports.changeUserSubscription = exports.toggleUserStatus = exports.changeUserRole = exports.listUsers = void 0;
const admin_service_1 = require("../services/admin.service");
const listUsers = async (_req, res) => {
    try {
        const users = await (0, admin_service_1.getAllUsers)();
        return res.json(users);
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
exports.listUsers = listUsers;
const changeUserRole = async (req, res) => {
    try {
        const id = req.params.id;
        const { role } = req.body;
        if (!["ADMIN", "ENGINEER", "VIEWER"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }
        const user = await (0, admin_service_1.updateUserRole)(id, role);
        return res.json(user);
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
};
exports.changeUserRole = changeUserRole;
const toggleUserStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { isActive } = req.body;
        if (typeof isActive !== "boolean") {
            return res.status(400).json({ message: "isActive must be a boolean" });
        }
        const user = await (0, admin_service_1.updateUserStatus)(id, isActive);
        return res.json(user);
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
};
exports.toggleUserStatus = toggleUserStatus;
const changeUserSubscription = async (req, res) => {
    try {
        const id = req.params.id;
        const { subscriptionPlan, subscriptionExpiresAt } = req.body;
        if (!["FREE_TRIAL", "PROFESSIONAL", "ENTERPRISE"].includes(subscriptionPlan)) {
            return res.status(400).json({ message: "Invalid subscription plan" });
        }
        const user = await (0, admin_service_1.updateUserSubscription)(id, {
            subscriptionPlan,
            subscriptionExpiresAt,
        });
        return res.json(user);
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
};
exports.changeUserSubscription = changeUserSubscription;
const listLoginLogs = async (_req, res) => {
    try {
        const logs = await (0, admin_service_1.getLoginLogs)();
        return res.json(logs);
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
exports.listLoginLogs = listLoginLogs;
const removeUser = async (req, res) => {
    try {
        const id = req.params.id;
        // Prevent self-deletion
        if (req.user?.id === id) {
            return res.status(400).json({ message: "Cannot delete your own account" });
        }
        await (0, admin_service_1.deleteUser)(id);
        return res.json({ message: "User deleted successfully" });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
};
exports.removeUser = removeUser;
