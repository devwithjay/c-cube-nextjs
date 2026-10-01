import { Router } from "express";
import { getSite } from "./site.controller.js";

const router = Router();

router.get("/", getSite);

export default router;
