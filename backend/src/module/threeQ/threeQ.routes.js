import { Router } from "express";

import {
  createSession,
  getSession,
  getCurrentTest,
  getSessionTest,
  saveSessionAnswer,
  saveSessionAnswersBatch,
  submitSession,
  getSessionResult,
  requestRetest
} from "./threeQ.controller.js";


const router =
  Router();


/*
|--------------------------------------------------------------------------
| GET CURRENT 3Q TEST
|--------------------------------------------------------------------------
*/

router.get(
  "/current",
  getCurrentTest
);


/*
|--------------------------------------------------------------------------
| START 3Q SESSION
|--------------------------------------------------------------------------
*/

router.post(
  "/sessions",
  createSession
);


/*
|--------------------------------------------------------------------------
| GET SESSION
|--------------------------------------------------------------------------
*/

router.get(
  "/sessions/:sessionId",
  getSession
);


/*
|--------------------------------------------------------------------------
| GET TEST FOR SESSION
|--------------------------------------------------------------------------
*/

router.get(
  "/sessions/:sessionId/test",
  getSessionTest
);


/*
|--------------------------------------------------------------------------
| SAVE / UPDATE SINGLE ANSWER
|--------------------------------------------------------------------------
*/

router.post(
  "/sessions/:sessionId/answers",
  saveSessionAnswer
);


/*
|--------------------------------------------------------------------------
| SAVE / UPDATE MULTIPLE ANSWERS
|--------------------------------------------------------------------------
|
| Used for:
| - Autosave
| - Next / Previous
| - Refresh recovery
| - Before final submission
|
|--------------------------------------------------------------------------
*/

router.post(
  "/sessions/:sessionId/answers/batch",
  saveSessionAnswersBatch
);


/*
|--------------------------------------------------------------------------
| SUBMIT ASSESSMENT
|--------------------------------------------------------------------------
*/

router.post(
  "/sessions/:sessionId/submit",
  submitSession
);


/*
|--------------------------------------------------------------------------
| GET FINAL RESULT
|--------------------------------------------------------------------------
*/

router.get(
  "/sessions/:sessionId/result",
  getSessionResult
);


/*
|--------------------------------------------------------------------------
| REQUEST RETEST PERMISSION
|--------------------------------------------------------------------------
*/

router.post(
  "/retest-request",
  requestRetest
);


export default router;