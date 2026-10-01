import {
  Router
} from "express";

import {
  getClub
} from "./club.controller.js";


const router =
  Router();


/*
|--------------------------------------------------------------------------
| GET /api/club
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getClub
);


export default router;