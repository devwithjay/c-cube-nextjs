import { Router } from "express";

import {
  login,
  me,
  setupAdmin,
  changePassword,
  changeEmail
} from "./admin.auth.controller.js";

import {
  requireAdmin
} from "./admin.middleware.js";


const router =
  Router();


/*
|--------------------------------------------------------------------------
| POST /api/admin/auth/login
|--------------------------------------------------------------------------
*/

router.post(
  "/login",
  login
);


/*
|--------------------------------------------------------------------------
| GET /api/admin/auth/me
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  requireAdmin,
  me
);


router.post(
  "/change-password",
  requireAdmin,
  changePassword
);

router.post(
  "/change-email",
  requireAdmin,
  changeEmail
);

/*
|--------------------------------------------------------------------------
| POST /api/admin/auth/setup
|--------------------------------------------------------------------------
|
| Temporary setup endpoint.
|--------------------------------------------------------------------------
*/

router.post(
  "/setup",
  setupAdmin
);


export default router;