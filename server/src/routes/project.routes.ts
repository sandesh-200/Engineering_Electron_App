import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/project.controller";
import { checkSubscription } from "../middleware/subscription.middleware";
import { enforceProjectLimit } from "../middleware/projectLimit.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  checkSubscription,
  enforceProjectLimit,
  authorize(["ADMIN", "ENGINEER"]),
  create,
);

router.get(
  "/",
  authenticate,
  authorize(["ADMIN", "ENGINEER", "VIEWER"]),
  getAll,
);

router.get("/:id", authenticate, getOne);

router.put("/:id", authenticate, authorize(["ADMIN", "ENGINEER"]), update);

router.delete("/:id", authenticate, authorize(["ADMIN", "ENGINEER"]), remove);

export default router;
