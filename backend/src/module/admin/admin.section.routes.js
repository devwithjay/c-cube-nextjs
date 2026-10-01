import express from "express";

import { requireAdmin } from "./admin.middleware.js";

import {
  listSections,
  createSection,
  updateSection
} from "./admin.section.controller.js";

const router = express.Router();

router.use(requireAdmin);

/**
 * GET /api/admin/tests/:testId/sections
 */
router.get(
  "/:testId/sections",
  listSections
);

/**
 * POST /api/admin/tests/:testId/sections
 */
router.post(
  "/:testId/sections",
  createSection
);

/**
 * PUT /api/admin/tests/sections/:sectionId
 */
router.put(
  "/sections/:sectionId",
  updateSection
);

export default router;