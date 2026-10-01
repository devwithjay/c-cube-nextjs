import {
  unpublishTest, Router } from "express";

import {
  unpublishTest,
  listTests,
  getTestById,
  listTestResults,
  listRetestRequests,
  reviewRetestRequest,
  createTest,
  updateTest,
  publishTest,
  closeTest,
  deleteTest
} from "./admin.test.controller.js";

import {
  unpublishTest,
  requireAdmin
} from "./admin.middleware.js";


const router =
  Router();


/*
|--------------------------------------------------------------------------
| All test-management routes require admin authentication
|--------------------------------------------------------------------------
*/

router.use(
  requireAdmin
);


/*
|--------------------------------------------------------------------------
| GET /api/admin/tests
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  listTests
);


/*
|--------------------------------------------------------------------------
| GET /api/admin/tests/:testId
|--------------------------------------------------------------------------
*/

router.get(
  "/:testId",
  getTestById
);

router.get(
  "/:testId/results",
  listTestResults
);

router.get(
  "/:testId/retest-requests",
  listRetestRequests
);

router.put(
  "/retest-requests/:requestId",
  reviewRetestRequest
);


/*
|--------------------------------------------------------------------------
| POST /api/admin/tests
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  createTest
);


/*
|--------------------------------------------------------------------------
| PUT /api/admin/tests/:testId
|--------------------------------------------------------------------------
*/

router.put(
  "/:testId",
  updateTest
);


/*
|--------------------------------------------------------------------------
| DELETE /api/admin/tests/:testId
|--------------------------------------------------------------------------
*/

router.delete(
  "/:testId",
  deleteTest
);


/*
|--------------------------------------------------------------------------
| POST /api/admin/tests/:testId/publish
|--------------------------------------------------------------------------
*/

router.post(
  "/:testId/publish",
  publishTest
);


/*
|--------------------------------------------------------------------------
| POST /api/admin/tests/:testId/close
|--------------------------------------------------------------------------
*/

router.post(
  "/:testId/close",
  closeTest
);



router.post(
  "/:testId/unpublish",
  unpublishTest
);

export default router;
