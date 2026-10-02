import {
  startTestSchema
} from "./threeQ.validation.js";


import {
  startTestSession,
  getTestSession,
  getPublishedTest,
  getTestForSession,
  saveAnswer,
  saveAnswersBatch,
  submitTest,
  getTestResult,
  requestRetestPermission
} from "./threeQ.service.js";


/*
|--------------------------------------------------------------------------
| HELPER
|--------------------------------------------------------------------------
*/

function isValidSessionId(sessionId) {
  return (
    typeof sessionId === "string" &&
    sessionId.trim().length >= 10
  );
}


function sendError(res, error) {
  const statusCode =
    Number(error?.statusCode) || 500;

  return res.status(statusCode).json({
    success: false,

    message:
      error?.message ||
      "Internal server error",

    error:
      process.env.NODE_ENV === "development"
        ? error?.stack
        : undefined
  });
}


/*
|--------------------------------------------------------------------------
| POST /api/3q/sessions
|--------------------------------------------------------------------------
| Start or resume a 3Q assessment session.
|--------------------------------------------------------------------------
*/

export async function createSession(
  req,
  res,
  next
) {
  try {
    const validation =
      startTestSchema.safeParse(
        req.body
      );

    if (!validation.success) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Invalid participant information.",

          errors:
            validation.error.issues.map(
              (issue) => ({
                field:
                  issue.path.join("."),

                message:
                  issue.message
              })
            )
        });
    }

    const session =
      await startTestSession(
        validation.data
      );

    return res
      .status(201)
      .json({
        success: true,

        message:
          session.resumed
            ? "3Q test session resumed."
            : "3Q test session started.",

        data:
          session
      });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET /api/3q/sessions/:sessionId
|--------------------------------------------------------------------------
| Get current session status.
|--------------------------------------------------------------------------
*/

export async function getSession(
  req,
  res,
  next
) {
  try {
    const sessionId =
      req.params.sessionId;

    if (!isValidSessionId(sessionId)) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Invalid session ID."
        });
    }

    const session =
      await getTestSession(
        sessionId
      );

    return res
      .status(200)
      .json({
        success: true,

        data:
          session
      });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET /api/3q/sessions/:sessionId/test
|--------------------------------------------------------------------------
| Get test associated with the specific session.
|--------------------------------------------------------------------------
*/

export async function getSessionTest(
  req,
  res,
  next
) {
  try {
    const sessionId =
      req.params.sessionId;

    if (!isValidSessionId(sessionId)) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Invalid session ID."
        });
    }

    const test =
      await getTestForSession(
        sessionId
      );

    return res
      .status(200)
      .json({
        success: true,

        data:
          test
      });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| POST /api/3q/sessions/:sessionId/answers
|--------------------------------------------------------------------------
| Save or update ONE answer.
|--------------------------------------------------------------------------
|
| MCQ:
| {
|   questionId: 1,
|   selectedOptionId: 4
| }
|
| Short / Long:
| {
|   questionId: 2,
|   answerText: "My answer..."
| }
|
|--------------------------------------------------------------------------
*/

export async function saveSessionAnswer(
  req,
  res,
  next
) {
  try {
    const sessionId =
      req.params.sessionId;

    /*
    |--------------------------------------------------------------------------
    | Validate session ID
    |--------------------------------------------------------------------------
    */

    if (!isValidSessionId(sessionId)) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Invalid session ID."
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Read request body
    |--------------------------------------------------------------------------
    */

    const {
      questionId,
      selectedOptionId,
      answerText
    } = req.body || {};

    /*
    |--------------------------------------------------------------------------
    | Validate question ID
    |--------------------------------------------------------------------------
    */

    const numericQuestionId =
      Number(questionId);

    if (
      !Number.isInteger(
        numericQuestionId
      ) ||
      numericQuestionId <= 0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Invalid question ID."
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate selected option ID
    |--------------------------------------------------------------------------
    |
    | We don't require it because:
    |
    | MCQ          -> selectedOptionId required
    | Short answer -> answerText required
    | Long answer  -> answerText required
    |
    | The service performs the final question-type validation.
    |--------------------------------------------------------------------------
    */

    let numericOptionId =
      null;

    if (
      selectedOptionId !== undefined &&
      selectedOptionId !== null &&
      selectedOptionId !== ""
    ) {
      numericOptionId =
        Number(selectedOptionId);

      if (
        !Number.isInteger(
          numericOptionId
        ) ||
        numericOptionId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid selected option ID."
          });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Validate answer text
    |--------------------------------------------------------------------------
    */

    if (
      answerText !== undefined &&
      answerText !== null &&
      typeof answerText !== "string"
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Answer text must be a string."
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Save answer
    |--------------------------------------------------------------------------
    */

    const result =
      await saveAnswer(
        sessionId,
        numericQuestionId,
        numericOptionId,
        answerText ?? null
      );

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Answer saved.",

        data:
          result
      });
  } catch (error) {
    console.error(
      "SAVE ANSWER ERROR:",
      error
    );

    return sendError(
      res,
      error
    );
  }
}


/*
|--------------------------------------------------------------------------
| POST /api/3q/sessions/:sessionId/answers/batch
|--------------------------------------------------------------------------
| Save or update MULTIPLE answers in one request.
|--------------------------------------------------------------------------
|
| Request:
|
| {
|   "answers": [
|     {
|       "questionId": 1,
|       "selectedOptionId": 4
|     },
|     {
|       "questionId": 2,
|       "answerText": "My answer"
|     }
|   ]
| }
|
|--------------------------------------------------------------------------
*/

export async function saveSessionAnswersBatch(
  req,
  res,
  next
) {
  try {
    const sessionId =
      req.params.sessionId;

    /*
    |--------------------------------------------------------------------------
    | Validate session ID
    |--------------------------------------------------------------------------
    */

    if (!isValidSessionId(sessionId)) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Invalid session ID."
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate answers array
    |--------------------------------------------------------------------------
    */

    const answers =
      Array.isArray(req.body?.answers)
        ? req.body.answers
        : null;

    if (!answers) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Answers must be provided as an array."
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate maximum batch size
    |--------------------------------------------------------------------------
    |
    | Prevent accidentally sending an extremely large payload.
    |--------------------------------------------------------------------------
    */

    if (answers.length > 500) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Too many answers in one request."
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Normalize basic IDs
    |--------------------------------------------------------------------------
    |
    | The service performs the authoritative validation.
    |--------------------------------------------------------------------------
    */

    const normalizedAnswers =
      answers.map((answer) => {
        const normalized = {
          questionId:
            Number(answer?.questionId),

          selectedOptionId:
            null,

          answerText:
            null
        };

        if (
          answer?.selectedOptionId !==
          undefined &&
          answer?.selectedOptionId !==
          null &&
          answer?.selectedOptionId !== ""
        ) {
          normalized.selectedOptionId =
            Number(
              answer.selectedOptionId
            );
        }

        if (
          answer?.answerText !==
          undefined &&
          answer?.answerText !==
          null
        ) {
          if (
            typeof answer.answerText !==
            "string"
          ) {
            throw Object.assign(
              new Error(
                "Answer text must be a string."
              ),
              {
                statusCode: 400
              }
            );
          }

          normalized.answerText =
            answer.answerText;
        }

        return normalized;
      });

    /*
    |--------------------------------------------------------------------------
    | Validate IDs before service
    |--------------------------------------------------------------------------
    */

    for (
      const answer of normalizedAnswers
    ) {
      if (
        !Number.isInteger(
          answer.questionId
        ) ||
        answer.questionId <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid question ID."
          });
      }

      if (
        answer.selectedOptionId !==
        null
      ) {
        if (
          !Number.isInteger(
            answer.selectedOptionId
          ) ||
          answer.selectedOptionId <= 0
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "Invalid selected option ID."
            });
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Save all answers
    |--------------------------------------------------------------------------
    */

    const result =
      await saveAnswersBatch(
        sessionId,
        normalizedAnswers
      );

    return res
      .status(200)
      .json({
        success: true,

        message:
          result.count === 0
            ? "No answers to save."
            : `${result.count} answer(s) saved successfully.`,

        data:
          result
      });
  } catch (error) {
    console.error(
      "SAVE ANSWERS BATCH ERROR:",
      error
    );

    return sendError(
      res,
      error
    );
  }
}


/*
|--------------------------------------------------------------------------
| POST /api/3q/sessions/:sessionId/submit
|--------------------------------------------------------------------------
| Submit assessment and calculate final result.
|--------------------------------------------------------------------------
*/

export async function submitSession(
  req,
  res,
  next
) {
  try {
    const sessionId =
      req.params.sessionId;

    if (!isValidSessionId(sessionId)) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Invalid session ID."
        });
    }

    const isAutoSubmit = req.body && req.body.isAutoSubmit === true;

    const result =
      await submitTest(
        sessionId,
        isAutoSubmit
      );

    return res
      .status(200)
      .json({
        success: true,

        message:
          "3Q assessment submitted successfully.",

        data:
          result
      });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET /api/3q/sessions/:sessionId/result
|--------------------------------------------------------------------------
| Get final result.
|--------------------------------------------------------------------------
*/

export async function getSessionResult(
  req,
  res,
  next
) {
  try {
    const sessionId =
      req.params.sessionId;

    if (!isValidSessionId(sessionId)) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Invalid session ID."
        });
    }

    const result =
      await getTestResult(
        sessionId
      );

    return res
      .status(200)
      .json({
        success: true,

        data:
          result
      });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET /api/3q/current
|--------------------------------------------------------------------------
| Get currently published 3Q assessment.
|--------------------------------------------------------------------------
*/

export async function getCurrentTest(
  req,
  res,
  next
) {
  try {
    const test =
      await getPublishedTest();

    return res
      .status(200)
      .json({
        success: true,

        data:
          test
      });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| POST /api/3q/retest-request
|--------------------------------------------------------------------------
| Request admin permission for retest.
|--------------------------------------------------------------------------
*/

export async function requestRetest(
  req,
  res,
  next
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Support both:
    |
    | {
    |   name: "...",
    |   ...
    | }
    |
    | AND
    |
    | {
    |   participant: {
    |     name: "...",
    |     ...
    |   },
    |   reason: "..."
    | }
    |--------------------------------------------------------------------------
    */

    const participantData =
      req.body?.participant ||
      req.body;

    /*
    |--------------------------------------------------------------------------
    | Validate participant
    |--------------------------------------------------------------------------
    */

    const validation =
      startTestSchema.safeParse(
        participantData
      );

    if (!validation.success) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Invalid participant information.",

          errors:
            validation.error.issues.map(
              (issue) => ({
                field:
                  issue.path.join("."),

                message:
                  issue.message
              })
            )
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Reason
    |--------------------------------------------------------------------------
    */

    const reason =
      typeof req.body?.reason ===
        "string"
        ? req.body.reason.trim()
        : "";

    /*
    |--------------------------------------------------------------------------
    | Request retest
    |--------------------------------------------------------------------------
    */

    const result =
      await requestRetestPermission(
        validation.data,
        reason
      );

    return res
      .status(200)
      .json({
        success: true,

        message:
          result.message,

        data:
          result
      });
  } catch (error) {
    next(error);
  }
}
import { findTestByIdOrSlug } from "../admin/admin.test.repository.js";

export async function getTestByIdPublic(req, res, next) {
  try {
    const testId = req.params.testId;
    const test = await findTestByIdOrSlug(testId);
    return res.status(200).json({ success: true, data: test });
  } catch (error) {
    next(error);
  }
}
