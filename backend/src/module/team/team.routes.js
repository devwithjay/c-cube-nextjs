import {
  Router
} from "express";

import {
  getTeam,
  getTeamMember
} from "./team.controller.js";


const router =
  Router();


router.get(
  "/",
  getTeam
);


router.get(
  "/:id",
  getTeamMember
);


export default router;