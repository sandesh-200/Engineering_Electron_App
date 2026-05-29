"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// All admin routes require auth + ADMIN role
router.use(auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(["ADMIN"]));
router.get("/users", admin_controller_1.listUsers);
router.put("/users/:id/role", admin_controller_1.changeUserRole);
router.put("/users/:id/status", admin_controller_1.toggleUserStatus);
router.put("/users/:id/subscription", admin_controller_1.changeUserSubscription);
router.delete("/users/:id", admin_controller_1.removeUser);
router.get("/login-logs", admin_controller_1.listLoginLogs);
exports.default = router;
