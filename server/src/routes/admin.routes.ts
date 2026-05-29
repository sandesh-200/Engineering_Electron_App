import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import {
  listUsers,
  changeUserRole,
  toggleUserStatus,
  changeUserSubscription,
  listLoginLogs,
  removeUser,
} from "../controllers/admin.controller";

const router = Router();

// All admin routes require auth + ADMIN role
router.use(authenticate, authorize(["ADMIN"]));

router.get("/users", listUsers);
router.put("/users/:id/role", changeUserRole);
router.put("/users/:id/status", toggleUserStatus);
router.put("/users/:id/subscription", changeUserSubscription);
router.delete("/users/:id", removeUser);
router.get("/login-logs", listLoginLogs);

export default router;
