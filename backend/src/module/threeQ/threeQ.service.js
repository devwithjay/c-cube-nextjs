import crypto from "node:crypto";

import { withTransaction } from "../../db/database.js";
import { env } from "../../config/env.js";

import {
  CACHE_KEYS,
  cacheGetOrSet,
  cacheInvalidate,
  testCacheKey
} from "../../utils/cache.js";

import {
  findPublishedTest,
  findLatestTest,
  findTestById,
  findSections,
  findQuestions,
  findOptions,
  findQuestionsByTestId,
  findOptionsByQuestionIds,

  findParticipantByPRN,
  findParticipantByEmail,
  createParticipant,

  findRetestRequestByParticipantAndTest,
  findApprovedRetestRequest,
  createRetestRequest,

  getActiveOrSubmittedSession,
  createSession,
  getSessionById,

  findQuestionForTest,
  findOptionForQuestion,
  findQuestionsAndOptionsByIds,

  upsertAnswer,
  upsertAnswersBatch,

  findAnswersForSession,
  createResult,
  getResultBySession,
  markSessionSubmitted,
  markSessionExpired
} from "./threeQ.repository.js";

import { calculateThreeQScore } from "./threeQ.scoring.js";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const DEFAULT_CACHE_TTL_SECONDS = 60;

const CACHE_TTL_SECONDS =
  Number(
    env?.ASSESSMENT_CACHE_TTL_SECONDS ??
    env?.assessment?.cacheTtlSeconds ??
    DEFAULT_CACHE_TTL_SECONDS
  ) || DEFAULT_CACHE_TTL_SECONDS;


/*
|--------------------------------------------------------------------------
| CACHE INVALIDATION
|--------------------------------------------------------------------------
*/

export function invalidateAssessmentCache() {
  cacheInvalidate("threeq:");
}


/*
|--------------------------------------------------------------------------
| ERROR HELPER
|--------------------------------------------------------------------------
*/

function createServiceError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}


/*
|--------------------------------------------------------------------------
| NORMALIZE QUESTION TYPE
|--------------------------------------------------------------------------
*/

function normalizeQuestionType(question) {
  return String(question?.question_type || "mcq")
    .trim()
    .toLowerCase();
}


/*
|--------------------------------------------------------------------------
| VALIDATE / NORMALIZE ANSWER
|--------------------------------------------------------------------------
|
| Supported:
|   mcq
|   short_answer
|   long_answer
|
*/

function normalizeAnswerPayload(
  question,
  selectedOptionId = null,
  answerText = null
) {
  const questionType = normalizeQuestionType(question);

  /*
  |--------------------------------------------------------------------------
  | MCQ
  |--------------------------------------------------------------------------
  */

  if (questionType === "mcq") {
    if (
      selectedOptionId === null ||
      selectedOptionId === undefined ||
      selectedOptionId === ""
    ) {
      throw createServiceError(
        "Please select an option.",
        400
      );
    }

    const numericOptionId = Number(selectedOptionId);

    if (!Number.isInteger(numericOptionId) || numericOptionId <= 0) {
      throw createServiceError(
        "Invalid option selected.",
        400
      );
    }

    return {
      questionId: question.id,
      questionType,
      selectedOptionId: numericOptionId,
      answerText: null
    };
  }

  /*
  |--------------------------------------------------------------------------
  | SHORT / LONG ANSWER
  |--------------------------------------------------------------------------
  */

  if (
    questionType === "short_answer" ||
    questionType === "long_answer"
  ) {
    const cleanedText =
      typeof answerText === "string"
        ? answerText.trim()
        : "";

    if (!cleanedText) {
      throw createServiceError(
        "Please enter an answer.",
        400
      );
    }

    return {
      questionId: question.id,
      questionType,
      selectedOptionId: null,
      answerText: cleanedText
    };
  }

  throw createServiceError(
    `Unsupported question type: ${questionType}`,
    400
  );
}


/*
|--------------------------------------------------------------------------
| GET / CREATE PARTICIPANT
|--------------------------------------------------------------------------
*/

async function getOrCreateParticipant(data) {
  /*
  |--------------------------------------------------------------------------
  | Validate participant data
  |--------------------------------------------------------------------------
  */

  if (!data) {
    throw createServiceError(
      "Participant information is required.",
      400
    );
  }

  if (!data.prn) {
    throw createServiceError(
      "PRN is required.",
      400
    );
  }

  if (!data.collegeEmail) {
    throw createServiceError(
      "College email is required.",
      400
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Check PRN
  |--------------------------------------------------------------------------
  */

  const existingByPRN =
    await findParticipantByPRN(data.prn);

  /*
  |--------------------------------------------------------------------------
  | Check email
  |--------------------------------------------------------------------------
  */

  const existingByEmail =
    await findParticipantByEmail(data.collegeEmail);

  /*
  |--------------------------------------------------------------------------
  | PRN already registered
  |--------------------------------------------------------------------------
  */

  if (existingByPRN) {
    if (
      String(existingByPRN.college_email).toLowerCase() !==
      String(data.collegeEmail).toLowerCase()
    ) {
      throw createServiceError(
        "This PRN is already registered with another email address.",
        409
      );
    }

    return existingByPRN;
  }

  /*
  |--------------------------------------------------------------------------
  | Email already registered
  |--------------------------------------------------------------------------
  */

  if (existingByEmail) {
    throw createServiceError(
      "This official email is already registered with another PRN.",
      409
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Create participant
  |--------------------------------------------------------------------------
  */

  return createParticipant({
    name: data.name,
    branch: data.branch,
    division: data.division,
    prn: data.prn,
    collegeEmail: data.collegeEmail,
    mobileNumber: data.mobileNumber,
    campus: data.campus,
    livingAt: data.livingAt,
    gender: data.gender
  });
}


/*
|--------------------------------------------------------------------------
| ASSEMBLE TEST PAYLOAD
|--------------------------------------------------------------------------
*/

async function assembleTestPayload(test) {
  const cacheKey = testCacheKey(
    test.id,
    test.version
  );

  return cacheGetOrSet(
    cacheKey,
    CACHE_TTL_SECONDS * 1000,
    async () => {
      const [
        sections,
        questions
      ] = await Promise.all([
        findSections(test.id),
        findQuestionsByTestId(test.id)
      ]);

      const questionIds =
        questions.map(
          (question) => question.id
        );

      const options =
        questionIds.length > 0
          ? await findOptionsByQuestionIds(
            questionIds
          )
          : [];

      /*
      |--------------------------------------------------------------------------
      | Group options
      |--------------------------------------------------------------------------
      */

      const optionsByQuestionId =
        new Map();

      for (const option of options) {
        const existing =
          optionsByQuestionId.get(
            option.question_id
          ) || [];

        existing.push(option);

        optionsByQuestionId.set(
          option.question_id,
          existing
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Group questions by section
      |--------------------------------------------------------------------------
      */

      const questionsBySectionId =
        new Map();

      for (const question of questions) {
        const existing =
          questionsBySectionId.get(
            question.section_id
          ) || [];

        existing.push(question);

        questionsBySectionId.set(
          question.section_id,
          existing
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Return safe public payload
      |--------------------------------------------------------------------------
      */

      return {
        id: test.id,
        title: test.title,
        description: test.description,
        status: test.status,
        live_message: test.live_message,
        durationSeconds:
          Number(test.duration_seconds),

        version:
          test.version,

        sections:
          sections.map((section) => ({
            id: section.id,

            sectionNumber:
              section.section_number,

            name:
              section.name,

            description:
              section.description,

            questionLimit:
              Number(section.question_limit || 0),

            questions:
              (
                questionsBySectionId.get(
                  section.id
                ) || []
              ).map((question) => ({
                id: question.id,

                questionNumber:
                  question.question_number,

                questionText:
                  question.question_text,

                questionType:
                  question.question_type,

                marks:
                  Number(question.marks || 0),

                questionImageUrl:
                  question.question_image_url ||
                  null,

                options:
                  question.question_type === "mcq"
                    ? (
                      optionsByQuestionId.get(
                        question.id
                      ) || []
                    ).map((option) => ({
                      id: option.id,
                      key: option.option_key,
                      text: option.option_text
                    }))
                    : []
              }))
          }))
      };
    }
  );
}


/*
|--------------------------------------------------------------------------
| START 3Q TEST SESSION
|--------------------------------------------------------------------------
*/

export async function startTestSession(
  participantData
) {
  /*
  |--------------------------------------------------------------------------
  | Find published test
  |--------------------------------------------------------------------------
  */

  const test =
    await findPublishedTest();

  if (!test) {
    throw createServiceError(
      "No published 3Q test is currently available.",
      404
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Get / create participant
  |--------------------------------------------------------------------------
  */

  const participant =
    await getOrCreateParticipant(
      participantData
    );

  /*
  |--------------------------------------------------------------------------
  | Find existing session
  |--------------------------------------------------------------------------
  */

  const existingSession =
    await getActiveOrSubmittedSession(
      participant.id,
      test.id
    );

  if (existingSession) {
    /*
    |--------------------------------------------------------------------------
    | Already submitted
    |--------------------------------------------------------------------------
    */

    if (
      existingSession.status ===
      "submitted"
    ) {
      const approvedRetestRequest =
        await findApprovedRetestRequest(
          participant.id,
          test.id
        );

      /*
      |--------------------------------------------------------------------------
      | Approved retest
      |--------------------------------------------------------------------------
      */

      if (approvedRetestRequest) {
        const now =
          new Date();

        const expiresAt =
          new Date(
            now.getTime() +
            Number(
              test.duration_seconds
            ) *
            1000
          );

        const newSession = {
          id: crypto.randomUUID(),

          testId:
            test.id,

          participantId:
            participant.id,

          startedAt:
            now.toISOString(),

          expiresAt:
            expiresAt.toISOString()
        };

        return createSession(
          newSession
        );
      }

      throw createServiceError(
        "You have already appeared for this test. Your test has already been submitted. Request admin permission to appear again.",
        409
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Existing active session
    |--------------------------------------------------------------------------
    */

    if (
      existingSession.status ===
      "active"
    ) {
      const now =
        new Date();

      const expiresAt =
        new Date(
          existingSession.expires_at
        );

      /*
      |--------------------------------------------------------------------------
      | Existing session expired
      |--------------------------------------------------------------------------
      */

      if (now >= expiresAt) {
        await markSessionExpired(
          existingSession.id
        );

        throw createServiceError(
          "This assessment session has expired.",
          410
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Resume session
      |--------------------------------------------------------------------------
      */

      return {
        sessionId:
          existingSession.id,

        testId:
          existingSession.test_id,

        participantId:
          existingSession.participant_id,

        startedAt:
          existingSession.started_at,

        expiresAt:
          existingSession.expires_at,

        status:
          existingSession.status,

        resumed:
          true
      };
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Create new session
  |--------------------------------------------------------------------------
  */

  const startedAt =
    new Date();

  const expiresAt =
    new Date(
      startedAt.getTime() +
      Number(
        test.duration_seconds
      ) *
      1000
    );

  const session = {
    id: crypto.randomUUID(),

    testId:
      test.id,

    participantId:
      participant.id,

    startedAt:
      startedAt.toISOString(),

    expiresAt:
      expiresAt.toISOString()
  };

  const savedSession =
    await createSession(
      session
    );

  return {
    sessionId:
      savedSession.id,

    testId:
      savedSession.test_id,

    participantId:
      savedSession.participant_id,

    startedAt:
      savedSession.started_at,

    expiresAt:
      savedSession.expires_at,

    status:
      savedSession.status,

    resumed:
      false
  };
}


/*
|--------------------------------------------------------------------------
| GET TEST SESSION
|--------------------------------------------------------------------------
*/

export async function getTestSession(
  sessionId
) {
  const session =
    await getSessionById(
      sessionId
    );

  if (!session) {
    throw createServiceError(
      "Test session not found.",
      404
    );
  }

  const now =
    new Date();

  const expiresAt =
    new Date(
      session.expires_at
    );

  let status =
    session.status;

  /*
  |--------------------------------------------------------------------------
  | Mark expired session
  |--------------------------------------------------------------------------
  */

  if (
    status === "active" &&
    now >= expiresAt
  ) {
    await markSessionExpired(
      sessionId
    );

    status = "expired";
  }

  return {
    sessionId:
      session.id,

    testId:
      session.test_id,

    participantId:
      session.participant_id,

    startedAt:
      session.started_at,

    expiresAt:
      session.expires_at,

    submittedAt:
      session.submitted_at,

    status
  };
}


/*
|--------------------------------------------------------------------------
| GET TEST FOR SESSION
|--------------------------------------------------------------------------
|
| Returns:
|   session
|   test
|   savedAnswers
|
*/

export async function getTestForSession(
  sessionId
) {
  const session =
    await getSessionById(
      sessionId
    );

  if (!session) {
    throw createServiceError(
      "Test session not found.",
      404
    );
  }

  const now =
    new Date();

  const expiresAt =
    new Date(
      session.expires_at
    );

  /*
  |--------------------------------------------------------------------------
  | Already submitted
  |--------------------------------------------------------------------------
  */

  if (
    session.status ===
    "submitted"
  ) {
    throw createServiceError(
      "You have already appeared for this test. Your test has already been submitted.",
      409
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Expired
  |--------------------------------------------------------------------------
  */

  if (
    session.status === "expired" ||
    (
      session.status === "active" &&
      now >= expiresAt
    )
  ) {
    await markSessionExpired(
      sessionId
    );

    throw createServiceError(
      "This assessment session has expired.",
      410
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Find exact test
  |--------------------------------------------------------------------------
  */

  const test =
    await findTestById(
      session.test_id
    );

  if (!test) {
    throw createServiceError(
      "Assessment test not found.",
      404
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Build test
  |--------------------------------------------------------------------------
  */

  const testPayload =
    await assembleTestPayload(
      test
    );

  /*
  |--------------------------------------------------------------------------
  | Get saved answers
  |--------------------------------------------------------------------------
  */

  const savedAnswers =
    await findAnswersForSession(
      sessionId
    );

  /*
  |--------------------------------------------------------------------------
  | Format saved answers
  |--------------------------------------------------------------------------
  */

  const formattedAnswers =
    savedAnswers.map((answer) => ({
      questionId:
        answer.question_id,

      selectedOptionId:
        answer.selected_option_id ??
        null,

      answerText:
        answer.answer_text ??
        null,

      answeredAt:
        answer.answered_at
    }));

  /*
  |--------------------------------------------------------------------------
  | Remaining time
  |--------------------------------------------------------------------------
  */

  const remainingSeconds =
    Math.max(
      0,
      Math.ceil(
        (
          expiresAt.getTime() -
          now.getTime()
        ) / 1000
      )
    );

  return {
    session: {
      sessionId:
        session.id,

      testId:
        session.test_id,

      participantId:
        session.participant_id,

      startedAt:
        session.started_at,

      expiresAt:
        session.expires_at,

      status:
        session.status,

      remainingSeconds
    },

    test:
      testPayload,

    savedAnswers:
      formattedAnswers
  };
}


/*
|--------------------------------------------------------------------------
| VALIDATE SESSION FOR ANSWER SAVE
|--------------------------------------------------------------------------
*/

async function validateActiveSession(
  sessionId
) {
  const session =
    await getSessionById(
      sessionId
    );

  if (!session) {
    throw createServiceError(
      "Test session not found.",
      404
    );
  }

  if (
    session.status ===
    "submitted"
  ) {
    throw createServiceError(
      "You have already appeared for this test. Your test has already been submitted.",
      409
    );
  }

  if (
    session.status ===
    "expired"
  ) {
    throw createServiceError(
      "This assessment session has expired.",
      410
    );
  }

  const now =
    new Date();

  const expiresAt =
    new Date(
      session.expires_at
    );

  if (now >= expiresAt) {
    await markSessionExpired(
      sessionId
    );

    throw createServiceError(
      "This assessment session has expired.",
      410
    );
  }

  return session;
}


/*
|--------------------------------------------------------------------------
| SAVE / UPDATE SINGLE ANSWER
|--------------------------------------------------------------------------
*/

export async function saveAnswer(
  sessionId,
  questionId,
  selectedOptionId = null,
  answerText = null
) {
  /*
  |--------------------------------------------------------------------------
  | Validate session
  |--------------------------------------------------------------------------
  */

  const session =
    await validateActiveSession(
      sessionId
    );

  /*
  |--------------------------------------------------------------------------
  | Verify question
  |--------------------------------------------------------------------------
  */

  const question =
    await findQuestionForTest(
      questionId,
      session.test_id
    );

  if (!question) {
    throw createServiceError(
      "Invalid question for this assessment.",
      400
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Normalize answer
  |--------------------------------------------------------------------------
  */

  const normalized =
    normalizeAnswerPayload(
      question,
      selectedOptionId,
      answerText
    );

  /*
  |--------------------------------------------------------------------------
  | Verify MCQ option
  |--------------------------------------------------------------------------
  */

  if (
    normalized.questionType ===
    "mcq"
  ) {
    const option =
      await findOptionForQuestion(
        normalized.selectedOptionId,
        questionId
      );

    if (!option) {
      throw createServiceError(
        "Invalid option for this question.",
        400
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  */

  const savedAnswer =
    await upsertAnswer({
      sessionId,

      questionId:
        normalized.questionId,

      selectedOptionId:
        normalized.selectedOptionId,

      answerText:
        normalized.answerText
    });

  return {
    action:
      "saved",

    answer: {
      id:
        savedAnswer.id,

      questionId:
        savedAnswer.question_id,

      questionType:
        normalized.questionType,

      selectedOptionId:
        savedAnswer.selected_option_id ??
        null,

      answerText:
        savedAnswer.answer_text ??
        null,

      answeredAt:
        savedAnswer.answered_at
    }
  };
}


/*
|--------------------------------------------------------------------------
| SAVE MULTIPLE ANSWERS
|--------------------------------------------------------------------------
|
| Used by frontend before:
|   - Next
|   - Previous
|   - Submit
|   - Page refresh / autosave
|
*/

export async function saveAnswersBatch(
  sessionId,
  answers
) {
  /*
  |--------------------------------------------------------------------------
  | Validate input
  |--------------------------------------------------------------------------
  */

  if (!Array.isArray(answers)) {
    throw createServiceError(
      "Answers must be provided as an array.",
      400
    );
  }

  if (answers.length === 0) {
    return {
      action: "saved",
      count: 0,
      answers: []
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Validate session once
  |--------------------------------------------------------------------------
  */

  const session =
    await validateActiveSession(
      sessionId
    );

  /*
  |--------------------------------------------------------------------------
  | Remove duplicate question IDs
  |--------------------------------------------------------------------------
  */

  const uniqueAnswers =
    new Map();

  for (const item of answers) {
    if (!item) {
      continue;
    }

    const questionId =
      Number(item.questionId);

    if (
      !Number.isInteger(questionId) ||
      questionId <= 0
    ) {
      throw createServiceError(
        "Invalid question ID.",
        400
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Last answer wins
    |--------------------------------------------------------------------------
    */

    uniqueAnswers.set(
      questionId,
      item
    );
  }

  const questionIds =
    Array.from(
      uniqueAnswers.keys()
    );

  if (questionIds.length === 0) {
    return {
      action: "saved",
      count: 0,
      answers: []
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Find all questions in one query
  |--------------------------------------------------------------------------
  */

  const questionData =
    await findQuestionsAndOptionsByIds(
      session.test_id,
      questionIds
    );

  /*
  |--------------------------------------------------------------------------
  | Verify every question belongs
  |--------------------------------------------------------------------------
  */

  if (
    questionData.length !==
    questionIds.length
  ) {
    throw createServiceError(
      "One or more questions are invalid for this assessment.",
      400
    );
  }

  const questionMap =
    new Map();

  for (const question of questionData) {
    questionMap.set(
      Number(question.id),
      question
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Normalize + validate all answers
  |--------------------------------------------------------------------------
  */

  const normalizedAnswers =
    [];

  for (const questionId of questionIds) {
    const item =
      uniqueAnswers.get(
        questionId
      );

    const question =
      questionMap.get(
        questionId
      );

    if (!question) {
      throw createServiceError(
        `Invalid question: ${questionId}`,
        400
      );
    }

    const normalized =
      normalizeAnswerPayload(
        question,
        item.selectedOptionId ??
        null,
        item.answerText ??
        null
      );

    /*
    |--------------------------------------------------------------------------
    | MCQ option validation
    |--------------------------------------------------------------------------
    */

    if (
      normalized.questionType ===
      "mcq"
    ) {
      const validOption =
        Array.isArray(
          question.options
        )
          ? question.options.some(
            (option) =>
              Number(option.id) ===
              Number(
                normalized.selectedOptionId
              )
          )
          : false;

      if (!validOption) {
        throw createServiceError(
          `Invalid option for question ${questionId}.`,
          400
        );
      }
    }

    normalizedAnswers.push({
      sessionId,

      questionId:
        normalized.questionId,

      selectedOptionId:
        normalized.selectedOptionId,

      answerText:
        normalized.answerText
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Bulk UPSERT
  |--------------------------------------------------------------------------
  */

  const savedAnswers =
    await upsertAnswersBatch(
      normalizedAnswers
    );

  /*
  |--------------------------------------------------------------------------
  | Return safe response
  |--------------------------------------------------------------------------
  */

  return {
    action:
      "saved",

    count:
      savedAnswers.length,

    answers:
      savedAnswers.map(
        (answer) => ({
          id:
            answer.id,

          questionId:
            answer.question_id,

          selectedOptionId:
            answer.selected_option_id ??
            null,

          answerText:
            answer.answer_text ??
            null,

          answeredAt:
            answer.answered_at
        })
      )
  };
}


/*
|--------------------------------------------------------------------------
| REQUEST RETEST PERMISSION
|--------------------------------------------------------------------------
*/

export async function requestRetestPermission(
  participantData,
  reason
) {
  /*
  |--------------------------------------------------------------------------
  | Find published test
  |--------------------------------------------------------------------------
  */

  const test =
    await findPublishedTest();

  if (!test) {
    throw createServiceError(
      "No published 3Q test is currently available.",
      404
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Get participant
  |--------------------------------------------------------------------------
  */

  const participant =
    await getOrCreateParticipant(
      participantData
    );

  /*
  |--------------------------------------------------------------------------
  | Find existing session
  |--------------------------------------------------------------------------
  */

  const existingSession =
    await getActiveOrSubmittedSession(
      participant.id,
      test.id
    );

  if (
    !existingSession ||
    existingSession.status !==
    "submitted"
  ) {
    return {
      status:
        "not_required",

      message:
        "This participant has not submitted the assessment yet."
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Check existing request
  |--------------------------------------------------------------------------
  */

  const existingRequest =
    await findRetestRequestByParticipantAndTest(
      participant.id,
      test.id
    );

  if (existingRequest) {
    return {
      status:
        existingRequest.status,

      requestId:
        existingRequest.id,

      message:
        existingRequest.status ===
          "approved"
          ? "Admin approval already exists for this participant."
          : "A retest request is already pending review."
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Create request
  |--------------------------------------------------------------------------
  */

  const request =
    await createRetestRequest(
      test.id,
      participant.id,
      reason
    );

  return {
    status:
      "pending",

    requestId:
      request.id,

    message:
      "Retest permission requested successfully. Please wait for admin approval."
  };
}


/*
|--------------------------------------------------------------------------
| SUBMIT TEST
|--------------------------------------------------------------------------
*/

export async function submitTest(
  sessionId
) {
  /*
  |--------------------------------------------------------------------------
  | Find session
  |--------------------------------------------------------------------------
  */

  const session =
    await getSessionById(
      sessionId
    );

  if (!session) {
    throw createServiceError(
      "Test session not found.",
      404
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Already submitted
  |--------------------------------------------------------------------------
  */

  if (
    session.status ===
    "submitted"
  ) {
    const existingResult =
      await getResultBySession(
        sessionId
      );

    if (existingResult) {
      return formatResult(
        existingResult
      );
    }

    throw createServiceError(
      "You have already appeared for this test. Your test has already been submitted.",
      409
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Already expired
  |--------------------------------------------------------------------------
  */

  if (
    session.status ===
    "expired"
  ) {
    throw createServiceError(
      "This assessment session has expired.",
      410
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Server-side timer
  |--------------------------------------------------------------------------
  */

  const now =
    new Date();

  const expiresAt =
    new Date(
      session.expires_at
    );

  if (now >= expiresAt) {
    await markSessionExpired(
      sessionId
    );

    throw createServiceError(
      "The assessment time has expired.",
      410
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Get answers
  |--------------------------------------------------------------------------
  */

  const answers =
    await findAnswersForSession(
      sessionId
    );

  /*
  |--------------------------------------------------------------------------
  | Get sections
  |--------------------------------------------------------------------------
  */

  const sections =
    await findSections(
      session.test_id
    );

  /*
  |--------------------------------------------------------------------------
  | Calculate total questions
  |--------------------------------------------------------------------------
  */

  let totalQuestions = 0;
  const allQuestions = await findQuestionsByTestId(session.test_id);
  totalQuestions = allQuestions.length;

  /*
  |--------------------------------------------------------------------------
  | Calculate score
  |--------------------------------------------------------------------------
  |
  | MCQ:
  |   Automatically scored.
  |
  | Short / Long:
  |   Stored but not automatically awarded.
  |
  */

  const score =
    calculateThreeQScore(
      answers,
      totalQuestions,
      sections
    );

  const submittedAt =
    new Date().toISOString();

  /*
  |--------------------------------------------------------------------------
  | Create result + mark session submitted
  |--------------------------------------------------------------------------
  */

  const transactionResult =
    await withTransaction(
      async () => {
        const savedResult =
          await createResult({
            sessionId,

            testId:
              session.test_id,

            totalQuestions:
              score.totalQuestions,

            attemptedQuestions:
              score.attemptedQuestions,

            totalScore:
              score.totalScore,

            section1Score:
              score.section1Score,

            section2Score:
              score.section2Score,

            section3Score:
              score.section3Score,

            submittedAt
          });

        await markSessionSubmitted(
          sessionId,
          submittedAt
        );

        return {
          savedResult
        };
      }
    );

  /*
  |--------------------------------------------------------------------------
  | Return final result
  |--------------------------------------------------------------------------
  */

  return formatResult(
    transactionResult.savedResult
  );
}


/*
|--------------------------------------------------------------------------
| FORMAT RESULT
|--------------------------------------------------------------------------
*/

function formatResult(
  result
) {
  return {
    sessionId:
      result.session_id,

    testId:
      result.test_id,

    totalQuestions:
      result.total_questions,

    attemptedQuestions:
      result.attempted_questions,

    totalScore:
      result.total_score,

    sections: {
      iq:
        result.section1_score,

      eq:
        result.section2_score,

      sq:
        result.section3_score
    },

    submittedAt:
      result.submitted_at
  };
}


/*
|--------------------------------------------------------------------------
| GET TEST RESULT
|--------------------------------------------------------------------------
*/

export async function getTestResult(
  sessionId
) {
  /*
  |--------------------------------------------------------------------------
  | Find session
  |--------------------------------------------------------------------------
  */

  const session =
    await getSessionById(
      sessionId
    );

  if (!session) {
    throw createServiceError(
      "Test session not found.",
      404
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Must be submitted
  |--------------------------------------------------------------------------
  */

  if (
    session.status !==
    "submitted"
  ) {
    throw createServiceError(
      "Assessment has not been submitted yet.",
      409
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Get result
  |--------------------------------------------------------------------------
  */

  const result =
    await getResultBySession(
      sessionId
    );

  if (!result) {
    throw createServiceError(
      "Assessment result not found.",
      404
    );
  }

  return formatResult(
    result
  );
}


/*
|--------------------------------------------------------------------------
| GET PUBLISHED TEST
|--------------------------------------------------------------------------
*/

export async function getPublishedTest() {
  /*
  |--------------------------------------------------------------------------
  | Find published test
  |--------------------------------------------------------------------------
  */

  const test =
    await findPublishedTest();

  if (!test) {
    // If no published test exists, return the latest draft test (just metadata, no questions)
    // so the frontend can display its live_message.
    const latestTest = await findLatestTest();
    if (latestTest) {
      return {
        id: latestTest.id,
        title: latestTest.title,
        description: latestTest.description,
        status: latestTest.status,
        durationSeconds: latestTest.duration_seconds,
        live_message: latestTest.live_message,
        version: latestTest.version,
        sections: [] // Empty sections so we don't leak draft questions
      };
    }

    throw createServiceError(
      "No test found.",
      404
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Use common test builder
  |--------------------------------------------------------------------------
  */

  return assembleTestPayload(
    test
  );
}