import {
  Router
} from "express";

import {
  getEvents,
  getEvent
} from "./events.controller.js";


const router =
  Router();


/*
|--------------------------------------------------------------------------
| GET /api/events
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getEvents
);


/*
|--------------------------------------------------------------------------
| GET /api/events/:id
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  getEvent
);


export default router;