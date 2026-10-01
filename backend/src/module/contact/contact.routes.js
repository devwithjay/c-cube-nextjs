import {
  Router
} from "express";


import {
  createContact,
  getContacts,
  getContact
} from "./contact.controller.js";


const router =
  Router();


/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  createContact
);


/*
|--------------------------------------------------------------------------
| TEMPORARY GET ROUTES
|--------------------------------------------------------------------------
|
| These will be protected by admin authentication later.
|
*/

router.get(
  "/",
  getContacts
);


router.get(
  "/:id",
  getContact
);


export default router;