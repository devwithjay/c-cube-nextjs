import {
  get,
  all,
  run,
} from "../../db/database.js";

/*
|--------------------------------------------------------------------------
| PARTICIPANTS
|--------------------------------------------------------------------------
*/

/**
 * Find participant by PRN.
 */
export async function findParticipantByPRN(
  prn
) {
  return get(
    `
      SELECT
        id,
        name,
        branch,
        division,
        prn,
        college_email,
        mobile_number,
        campus,
        living_at,
        created_at,
        updated_at
      FROM three_q_participants
      WHERE prn = ?
      LIMIT 1
    `,
    [prn]
  );
}

/**
 * Find participant by college email.
 */
export async function findParticipantByEmail(
  email
) {
  return get(
    `
      SELECT
        id,
        name,
        branch,
        division,
        prn,
        college_email,
        mobile_number,
        campus,
        living_at,
        created_at,
        updated_at
      FROM three_q_participants
      WHERE college_email = ?
      LIMIT 1
    `,
    [email]
  );
}

/**
 * Create participant.
 */
export async function createParticipant(
  participant
) {
  const result =
    await run(
      `
        INSERT INTO three_q_participants
        (
          name,
          branch,
          division,
          prn,
          college_email,
          mobile_number,
          campus,
          living_at,
          gender
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        participant.name,
        participant.branch,
        participant.division,
        participant.prn,
        participant.collegeEmail,
        participant.mobileNumber,
        participant.campus,
        participant.livingAt,
        participant.gender || '',
      ]
    );

  return get(
    `
      SELECT
        id,
        name,
        branch,
        division,
        prn,
        college_email,
        mobile_number,
        campus,
        living_at,
        created_at,
        updated_at
      FROM three_q_participants
      WHERE id = ?
      LIMIT 1
    `,
    [result.id]
  );
}

/*
|--------------------------------------------------------------------------
| RETEST PERMISSION REQUESTS
|--------------------------------------------------------------------------
*/

/**
 * Find latest retest request for participant/test.
 */
export async function findRetestRequestByParticipantAndTest(
  participantId,
  testId
) {
  return get(
    `
      SELECT
        id,
        test_id,
        participant_id,
        reason,
        status,
        requested_at,
        reviewed_by_admin_id,
        reviewed_at
      FROM three_q_retest_requests
      WHERE participant_id = ?
        AND test_id = ?
      ORDER BY requested_at DESC
      LIMIT 1
    `,
    [
      participantId,
      testId,
    ]
  );
}

/**
 * Find approved retest request.
 */
export async function findApprovedRetestRequest(
  participantId,
  testId
) {
  return get(
    `
      SELECT
        id,
        test_id,
        participant_id,
        status,
        requested_at
      FROM three_q_retest_requests
      WHERE participant_id = ?
        AND test_id = ?
        AND status = 'approved'
      LIMIT 1
    `,
    [
      participantId,
      testId,
    ]
  );
}

/**
 * Create retest request.
 */
export async function createRetestRequest(
  testId,
  participantId,
  reason
) {
  await run(
    `
      INSERT INTO three_q_retest_requests
      (
        test_id,
        participant_id,
        reason,
        status
      )
      VALUES (?, ?, ?, 'pending')
      ON CONFLICT (
        test_id,
        participant_id
      )
      DO NOTHING
    `,
    [
      testId,
      participantId,
      reason || null,
    ]
  );

  return findRetestRequestByParticipantAndTest(
    participantId,
    testId
  );
}

/**
 * Get retest requests by test.
 */
export async function getRetestRequestsByTest(
  testId
) {
  return all(
    `
      SELECT
        r.id,
        r.test_id,
        r.participant_id,
        r.reason,
        r.status,
        r.requested_at,
        r.reviewed_by_admin_id,
        r.reviewed_at,

        p.name,
        p.prn,
        p.college_email,
        p.branch,
        p.division,
        p.mobile_number,
        p.campus,
        p.living_at

      FROM three_q_retest_requests r

      INNER JOIN three_q_participants p
        ON p.id = r.participant_id

      WHERE r.test_id = ?

      ORDER BY r.requested_at DESC
    `,
    [testId]
  );
}

/**
 * Update retest request status.
 */
export async function updateRetestRequestStatus(
  requestId,
  status,
  adminId
) {
  await run(
    `
      UPDATE three_q_retest_requests
      SET
        status = ?,
        reviewed_by_admin_id = ?,
        reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [
      status,
      adminId,
      requestId,
    ]
  );

  return get(
    `
      SELECT
        id,
        test_id,
        participant_id,
        reason,
        status,
        requested_at,
        reviewed_by_admin_id,
        reviewed_at
      FROM three_q_retest_requests
      WHERE id = ?
      LIMIT 1
    `,
    [requestId]
  );
}

/*
|--------------------------------------------------------------------------
| TESTS
|--------------------------------------------------------------------------
*/

/**
 * Find latest published test.
 */
export async function findPublishedTest() {
  return get(
    `
      SELECT
        id,
        title,
        description,
        duration_seconds,
        status,
        version,
        live_message,
        created_at,
        updated_at
      FROM three_q_tests
      WHERE status = 'published'
      ORDER BY version DESC
      LIMIT 1
    `
  );
}

/**
 * Find latest test regardless of status.
 */
export async function findLatestTest() {
  return get(
    `
      SELECT
        id,
        title,
        description,
        duration_seconds,
        status,
        version,
        live_message,
        created_at,
        updated_at
      FROM three_q_tests
      ORDER BY version DESC
      LIMIT 1
    `
  );
}

/**
 * Find test by ID.
 */
export async function findTestById(
  testId
) {
  return get(
    `
      SELECT
        id,
        title,
        description,
        duration_seconds,
        status,
        version,
        live_message,
        created_at,
        updated_at
      FROM three_q_tests
      WHERE id = ?
      LIMIT 1
    `,
    [testId]
  );
}

/*
|--------------------------------------------------------------------------
| SECTIONS
|--------------------------------------------------------------------------
*/

/**
 * Find sections for a test.
 */
export async function findSections(
  testId
) {
  return all(
    `
      SELECT
        id,
        test_id,
        section_number,
        name,
        description,
        question_limit,
        sort_order
      FROM three_q_sections
      WHERE test_id = ?
      ORDER BY
        sort_order ASC,
        section_number ASC,
        id ASC
    `,
    [testId]
  );
}

/*
|--------------------------------------------------------------------------
| QUESTIONS
|--------------------------------------------------------------------------
*/

/**
 * Find active questions for section.
 */
export async function findQuestions(
  sectionId
) {
  return all(
    `
      SELECT
        id,
        section_id,
        question_number,
        question_text,
        question_type,
        marks,
        question_image_url,
        is_active
      FROM three_q_questions
      WHERE section_id = ?
        AND is_active = 1
      ORDER BY
        question_number ASC,
        id ASC
    `,
    [sectionId]
  );
}

/**
 * Find options for a question.
 */
export async function findOptions(
  questionId
) {
  return all(
    `
      SELECT
        id,
        question_id,
        option_key,
        option_text,
        sort_order
      FROM three_q_options
      WHERE question_id = ?
      ORDER BY
        sort_order ASC,
        id ASC
    `,
    [questionId]
  );
}

/**
 * Find all active questions belonging to a test.
 */
export async function findQuestionsByTestId(
  testId
) {
  return all(
    `
      SELECT
        q.id,
        q.section_id,
        q.question_number,
        q.question_text,
        q.question_type,
        q.marks,
        q.question_image_url,
        q.is_active
      FROM three_q_questions q

      INNER JOIN three_q_sections s
        ON s.id = q.section_id

      WHERE s.test_id = ?
        AND q.is_active = 1

      ORDER BY
        s.sort_order ASC,
        s.section_number ASC,
        q.question_number ASC,
        q.id ASC
    `,
    [testId]
  );
}

/**
 * Find options for multiple questions.
 *
 * This uses a normal dynamic IN clause instead of relying on
 * PostgreSQL array casting. This keeps it compatible with
 * the existing database.js placeholder system.
 */
export async function findOptionsByQuestionIds(
  questionIds
) {
  if (
    !Array.isArray(questionIds) ||
    questionIds.length === 0
  ) {
    return [];
  }

  const placeholders =
    questionIds
      .map(() => "?")
      .join(", ");

  return all(
    `
      SELECT
        id,
        question_id,
        option_key,
        option_text,
        sort_order
      FROM three_q_options
      WHERE question_id IN (${placeholders})
      ORDER BY
        question_id ASC,
        sort_order ASC,
        id ASC
    `,
    questionIds
  );
}

/**
 * Find multiple questions and their options
 * belonging to a particular test.
 *
 * This function is used when validating a batch of
 * student answers.
 */
export async function findQuestionsAndOptionsByIds(
  testId,
  questionIds
) {
  if (
    !Array.isArray(questionIds) ||
    questionIds.length === 0
  ) {
    return [];
  }

  /*
  |--------------------------------------------------------------------------
  | Remove duplicates and normalize IDs
  |--------------------------------------------------------------------------
  */

  const normalizedQuestionIds =
    [
      ...new Set(
        questionIds
          .map((id) => Number(id))
          .filter(
            (id) =>
              Number.isInteger(id) &&
              id > 0
          )
      ),
    ];

  if (
    normalizedQuestionIds.length === 0
  ) {
    return [];
  }

  /*
  |--------------------------------------------------------------------------
  | Fetch questions
  |--------------------------------------------------------------------------
  */

  const questionPlaceholders =
    normalizedQuestionIds
      .map(() => "?")
      .join(", ");

  const questions =
    await all(
      `
        SELECT
          q.id,
          q.section_id,
          q.question_number,
          q.question_text,
          q.question_type,
          q.marks,
          q.question_image_url,
          q.is_active

        FROM three_q_questions q

        INNER JOIN three_q_sections s
          ON s.id = q.section_id

        WHERE
          s.test_id = ?
          AND q.id IN (${questionPlaceholders})
          AND q.is_active = 1

        ORDER BY
          s.sort_order ASC,
          s.section_number ASC,
          q.question_number ASC,
          q.id ASC
      `,
      [
        testId,
        ...normalizedQuestionIds,
      ]
    );

  if (!questions.length) {
    return [];
  }

  /*
  |--------------------------------------------------------------------------
  | Fetch all options in one query
  |--------------------------------------------------------------------------
  */

  const validQuestionIds =
    questions.map(
      (question) => question.id
    );

  const optionPlaceholders =
    validQuestionIds
      .map(() => "?")
      .join(", ");

  const options =
    await all(
      `
        SELECT
          id,
          question_id,
          option_key,
          option_text,
          sort_order
        FROM three_q_options
        WHERE question_id IN (${optionPlaceholders})
        ORDER BY
          question_id ASC,
          sort_order ASC,
          id ASC
      `,
      validQuestionIds
    );

  /*
  |--------------------------------------------------------------------------
  | Group options by question
  |--------------------------------------------------------------------------
  */

  const optionsByQuestionId =
    new Map();

  for (
    const option of options
  ) {
    if (
      !optionsByQuestionId.has(
        option.question_id
      )
    ) {
      optionsByQuestionId.set(
        option.question_id,
        []
      );
    }

    optionsByQuestionId
      .get(option.question_id)
      .push(option);
  }

  /*
  |--------------------------------------------------------------------------
  | Attach options to questions
  |--------------------------------------------------------------------------
  */

  return questions.map(
    (question) => ({
      ...question,

      options:
        optionsByQuestionId.get(
          question.id
        ) || [],
    })
  );
}

/*
|--------------------------------------------------------------------------
| SESSIONS
|--------------------------------------------------------------------------
*/

/**
 * Get active or submitted session.
 */
export async function getActiveOrSubmittedSession(
  participantId,
  testId
) {
  return get(
    `
      SELECT
        id,
        test_id,
        participant_id,
        started_at,
        expires_at,
        submitted_at,
        status
      FROM three_q_sessions
      WHERE participant_id = ?
        AND test_id = ?
        AND status IN (
          'active',
          'submitted'
        )
      ORDER BY
        started_at DESC
      LIMIT 1
    `,
    [
      participantId,
      testId,
    ]
  );
}

/**
 * Create session.
 */
export async function createSession(
  session
) {
  await run(
    `
      INSERT INTO three_q_sessions
      (
        id,
        test_id,
        participant_id,
        started_at,
        expires_at,
        status
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        'active'
      )
    `,
    [
      session.id,
      session.testId,
      session.participantId,
      session.startedAt,
      session.expiresAt,
    ]
  );

  return getSessionById(
    session.id
  );
}

/**
 * Get session by ID.
 */
export async function getSessionById(
  sessionId
) {
  return get(
    `
      SELECT
        id,
        test_id,
        participant_id,
        started_at,
        expires_at,
        submitted_at,
        status
      FROM three_q_sessions
      WHERE id = ?
      LIMIT 1
    `,
    [sessionId]
  );
}

/*
|--------------------------------------------------------------------------
| QUESTIONS / ANSWERS
|--------------------------------------------------------------------------
*/

/**
 * Find question belonging to a test.
 */
export async function findQuestionForTest(
  questionId,
  testId
) {
  return get(
    `
      SELECT
        q.id,
        q.section_id,
        q.question_number,
        q.question_text,
        q.question_type,
        q.marks,
        q.question_image_url

      FROM three_q_questions q

      INNER JOIN three_q_sections s
        ON s.id = q.section_id

      WHERE q.id = ?
        AND s.test_id = ?
        AND q.is_active = 1

      LIMIT 1
    `,
    [
      questionId,
      testId,
    ]
  );
}

/**
 * Find option belonging to a question.
 *
 * Used for MCQ questions.
 */
export async function findOptionForQuestion(
  optionId,
  questionId
) {
  return get(
    `
      SELECT
        id,
        question_id,
        option_key,
        option_text,
        is_correct
      FROM three_q_options
      WHERE id = ?
        AND question_id = ?
      LIMIT 1
    `,
    [
      optionId,
      questionId,
    ]
  );
}

/**
 * Find existing answer.
 */
export async function findAnswer(
  sessionId,
  questionId
) {
  return get(
    `
      SELECT
        id,
        session_id,
        question_id,
        selected_option_id,
        answer_text,
        answered_at
      FROM three_q_answers
      WHERE session_id = ?
        AND question_id = ?
      LIMIT 1
    `,
    [
      sessionId,
      questionId,
    ]
  );
}

/*
|--------------------------------------------------------------------------
| UPSERT ANSWER
|--------------------------------------------------------------------------
*/

/**
 * Insert or update one answer.
 *
 * MCQ:
 *   selectedOptionId is used.
 *
 * Short Answer:
 *   answerText is used.
 *
 * Long Answer:
 *   answerText is used.
 *
 * The UNIQUE(session_id, question_id)
 * constraint makes this operation safe.
 */
export async function upsertAnswer(
  answer
) {
  await run(
    `
      INSERT INTO three_q_answers
      (
        session_id,
        question_id,
        selected_option_id,
        answer_text
      )
      VALUES (?, ?, ?, ?)

      ON CONFLICT (
        session_id,
        question_id
      )

      DO UPDATE SET
        selected_option_id =
          EXCLUDED.selected_option_id,

        answer_text =
          EXCLUDED.answer_text,

        answered_at =
          CURRENT_TIMESTAMP
    `,
    [
      answer.sessionId,
      answer.questionId,
      answer.selectedOptionId ??
      null,
      answer.answerText ??
      null,
    ]
  );

  return findAnswer(
    answer.sessionId,
    answer.questionId
  );
}

/**
 * Batch insert/update answers.
 *
 * This is the important high-concurrency function.
 *
 * Instead of:
 *
 *   request 1 -> DB
 *   request 2 -> DB
 *   request 3 -> DB
 *   ...
 *
 * multiple answers can be persisted with one SQL statement.
 */
export async function upsertAnswersBatch(
  answers
) {
  if (
    !Array.isArray(answers) ||
    answers.length === 0
  ) {
    return [];
  }

  /*
  |--------------------------------------------------------------------------
  | Build VALUES placeholders
  |--------------------------------------------------------------------------
  */

  const values =
    [];

  const params =
    [];

  for (
    const answer of answers
  ) {
    values.push(
      "(?, ?, ?, ?)"
    );

    params.push(
      answer.sessionId,
      answer.questionId,
      answer.selectedOptionId ??
      null,
      answer.answerText ??
      null
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Single bulk UPSERT
  |--------------------------------------------------------------------------
  */

  await run(
    `
      INSERT INTO three_q_answers
      (
        session_id,
        question_id,
        selected_option_id,
        answer_text
      )

      VALUES ${values.join(
      ", "
    )}

      ON CONFLICT (
        session_id,
        question_id
      )

      DO UPDATE SET
        selected_option_id =
          EXCLUDED.selected_option_id,

        answer_text =
          EXCLUDED.answer_text,

        answered_at =
          CURRENT_TIMESTAMP
    `,
    params
  );

  /*
  |--------------------------------------------------------------------------
  | Return saved answers
  |--------------------------------------------------------------------------
  */

  const sessionId =
    answers[0]?.sessionId;

  if (!sessionId) {
    return [];
  }

  const questionIds =
    [
      ...new Set(
        answers.map(
          (answer) =>
            Number(
              answer.questionId
            )
        )
      ),
    ];

  if (!questionIds.length) {
    return [];
  }

  const placeholders =
    questionIds
      .map(() => "?")
      .join(", ");

  return all(
    `
      SELECT
        id,
        session_id,
        question_id,
        selected_option_id,
        answer_text,
        answered_at
      FROM three_q_answers
      WHERE session_id = ?
        AND question_id IN (${placeholders})
      ORDER BY question_id ASC
    `,
    [
      sessionId,
      ...questionIds,
    ]
  );
}

/*
|--------------------------------------------------------------------------
| CREATE ANSWER
|--------------------------------------------------------------------------
|
| Kept for compatibility with older service code.
|
|--------------------------------------------------------------------------
*/

export async function createAnswer(
  answer
) {
  const result =
    await run(
      `
        INSERT INTO three_q_answers
        (
          session_id,
          question_id,
          selected_option_id,
          answer_text
        )
        VALUES (?, ?, ?, ?)
      `,
      [
        answer.sessionId,
        answer.questionId,
        answer.selectedOptionId ??
        null,
        answer.answerText ??
        null,
      ]
    );

  return get(
    `
      SELECT
        id,
        session_id,
        question_id,
        selected_option_id,
        answer_text,
        answered_at
      FROM three_q_answers
      WHERE id = ?
      LIMIT 1
    `,
    [result.id]
  );
}

/*
|--------------------------------------------------------------------------
| UPDATE ANSWER
|--------------------------------------------------------------------------
|
| Kept for compatibility.
|--------------------------------------------------------------------------
*/

export async function updateAnswer(
  answerId,
  selectedOptionId,
  answerText = null
) {
  await run(
    `
      UPDATE three_q_answers
      SET
        selected_option_id = ?,
        answer_text = ?,
        answered_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [
      selectedOptionId ??
      null,
      answerText ??
      null,
      answerId,
    ]
  );

  return get(
    `
      SELECT
        id,
        session_id,
        question_id,
        selected_option_id,
        answer_text,
        answered_at
      FROM three_q_answers
      WHERE id = ?
      LIMIT 1
    `,
    [answerId]
  );
}

/*
|--------------------------------------------------------------------------
| GET ALL ANSWERS FOR SESSION
|--------------------------------------------------------------------------
*/

/**
 * Get all answers for a session.
 *
 * Used when:
 * - restoring test state
 * - calculating result
 * - checking attempted questions
 * - calculating section scores
 */
export async function findAnswersForSession(
  sessionId
) {
  return all(
    `
      SELECT
        a.id,
        a.session_id,
        a.question_id,
        a.selected_option_id,
        a.answer_text,
        a.answered_at,

        q.section_id,
        q.question_type,
        q.marks,

        s.section_number,

        o.is_correct

      FROM three_q_answers a

      INNER JOIN three_q_questions q
        ON q.id = a.question_id

      INNER JOIN three_q_sections s
        ON s.id = q.section_id

      LEFT JOIN three_q_options o
        ON o.id =
          a.selected_option_id

      WHERE a.session_id = ?

      ORDER BY
        s.section_number ASC,
        q.question_number ASC
    `,
    [sessionId]
  );
}

/*
|--------------------------------------------------------------------------
| RESULTS
|--------------------------------------------------------------------------
*/

/**
 * Create final result.
 */
export async function createResult(
  result
) {
  await run(
    `
      INSERT INTO three_q_results
      (
        session_id,
        test_id,
        total_questions,
        attempted_questions,
        total_score,
        section1_score,
        section2_score,
        section3_score,
        submitted_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      result.sessionId,
      result.testId,
      result.totalQuestions,
      result.attemptedQuestions,
      result.totalScore,
      result.section1Score,
      result.section2Score,
      result.section3Score,
      result.submittedAt,
    ]
  );

  return getResultBySession(
    result.sessionId
  );
}

/**
 * Get result by session.
 */
export async function getResultBySession(
  sessionId
) {
  return get(
    `
      SELECT
        id,
        session_id,
        test_id,
        total_questions,
        attempted_questions,
        total_score,
        section1_score,
        section2_score,
        section3_score,
        submitted_at
      FROM three_q_results
      WHERE session_id = ?
      LIMIT 1
    `,
    [sessionId]
  );
}

/*
|--------------------------------------------------------------------------
| SESSION STATUS
|--------------------------------------------------------------------------
*/

/**
 * Mark session as submitted.
 */
export async function markSessionSubmitted(
  sessionId,
  submittedAt
) {
  await run(
    `
      UPDATE three_q_sessions
      SET
        status = 'submitted',
        submitted_at = ?
      WHERE id = ?
        AND status = 'active'
    `,
    [
      submittedAt,
      sessionId,
    ]
  );

  return getSessionById(
    sessionId
  );
}

/**
 * Mark session as expired.
 */
export async function markSessionExpired(
  sessionId
) {
  await run(
    `
      UPDATE three_q_sessions
      SET
        status = 'expired'
      WHERE id = ?
        AND status = 'active'
    `,
    [sessionId]
  );

  return getSessionById(
    sessionId
  );
}