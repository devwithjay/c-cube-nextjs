import express from "express";

import {
  requireAdmin
} from "./admin.middleware.js";

import {
  listQuestions,
  createQuestion,
  updateQuestion,
  removeQuestion
} from "./admin.question.controller.js";


const router =
  express.Router();


/* =========================================================
   ADMIN AUTHENTICATION
   ========================================================= */

router.use(
  requireAdmin
);


/* =========================================================
   QUESTIONS BY SECTION
   ========================================================= */

router.get(
  "/:sectionId/questions",
  listQuestions
);


router.post(
  "/:sectionId/questions",
  createQuestion
);


/* =========================================================
   SINGLE QUESTION
   ========================================================= */

router.put(
  "/:questionId",
  updateQuestion
);


router.delete(
  "/:questionId",
  removeQuestion
);


export default router;