import {
  Router
} from "express";

import {
  getGalleryImages,
  getGalleryByEvent,
  getGalleryImage
} from "./gallery.controller.js";


const router =
  Router();


/*
|--------------------------------------------------------------------------
| GET /api/gallery
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getGalleryImages
);


/*
|--------------------------------------------------------------------------
| GET /api/gallery/event/:eventId
|--------------------------------------------------------------------------
*/

router.get(
  "/event/:eventId",
  getGalleryByEvent
);


/*
|--------------------------------------------------------------------------
| GET /api/gallery/:id
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  getGalleryImage
);


export default router;