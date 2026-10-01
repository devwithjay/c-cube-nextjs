import { get, all, run } from "../../db/database.js";

/*
|--------------------------------------------------------------------------
| SECTION
|--------------------------------------------------------------------------
*/

/**
 * Get a section by ID.
 */
export async function findSectionById(sectionId) {
  return get(
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
      WHERE id = ?
      LIMIT 1
    `,
    [sectionId]
  );
}

/**
 * Get parent test for a section.
 */
export async function findTestBySectionId(sectionId) {
  return get(
    `
      SELECT
        t.id,
        t.title,
        t.description,
        t.duration_seconds,
        t.status,
        t.version
      FROM three_q_tests t
      INNER JOIN three_q_sections s
        ON s.test_id = t.id
      WHERE s.id = ?
      LIMIT 1
    `,
    [sectionId]
  );
}

/*
|--------------------------------------------------------------------------
| QUESTION NUMBER
|--------------------------------------------------------------------------
*/

/**
 * Get next question number inside a section.
 */
export async function getNextQuestionNumber(sectionId) {
  const row = await get(
    `
      SELECT
        MAX(question_number) AS max_question_number
      FROM three_q_questions
      WHERE section_id = ?
    `,
    [sectionId]
  );

  return (
    Number(row?.max_question_number || 0) + 1
  );
}

/*
|--------------------------------------------------------------------------
| CREATE QUESTION
|--------------------------------------------------------------------------
*/

/**
 * Create question.
 *
 * Supports:
 * - mcq
 * - short_answer
 * - long_answer
 *
 * question_image_url is optional.
 */
export async function createQuestion(question) {
  const result = await run(
    `
      INSERT INTO three_q_questions
      (
        section_id,
        question_number,
        question_text,
        question_type,
        question_image_url,
        marks,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `,
    [
      question.sectionId,
      question.questionNumber,
      question.questionText,
      question.questionType,
      question.questionImageUrl || null,
      question.marks ?? 1,
    ]
  );

  return result.id;
}

/*
|--------------------------------------------------------------------------
| UPDATE QUESTION
|--------------------------------------------------------------------------
*/

/**
 * Update an existing question.
 */
export async function updateQuestion(
  questionId,
  question
) {
  await run(
    `
      UPDATE three_q_questions
      SET
        question_text = ?,
        question_type = ?,
        question_image_url = ?,
        marks = ?,
        is_active = ?
      WHERE id = ?
    `,
    [
      question.questionText,
      question.questionType,
      question.questionImageUrl || null,
      question.marks ?? 1,
      question.isActive === false ? 0 : 1,
      questionId,
    ]
  );

  return questionId;
}

/*
|--------------------------------------------------------------------------
| DELETE / DEACTIVATE QUESTION
|--------------------------------------------------------------------------
*/

/**
 * Soft-delete a question.
 *
 * We do not physically delete it because existing
 * student sessions/answers may reference the question.
 */
export async function deactivateQuestion(
  questionId
) {
  await run(
    `
      UPDATE three_q_questions
      SET is_active = 0
      WHERE id = ?
    `,
    [questionId]
  );

  return questionId;
}

/**
 * Reactivate a question.
 */
export async function activateQuestion(
  questionId
) {
  await run(
    `
      UPDATE three_q_questions
      SET is_active = 1
      WHERE id = ?
    `,
    [questionId]
  );

  return questionId;
}

/*
|--------------------------------------------------------------------------
| OPTIONS
|--------------------------------------------------------------------------
*/

/**
 * Create question option.
 */
export async function createQuestionOption(
  option
) {
  const result = await run(
    `
      INSERT INTO three_q_options
      (
        question_id,
        option_key,
        option_text,
        is_correct,
        sort_order
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      option.questionId,
      option.optionKey,
      option.optionText,
      option.isCorrect ? 1 : 0,
      option.sortOrder,
    ]
  );

  return result.id;
}

/**
 * Update question option.
 */
export async function updateQuestionOption(
  optionId,
  option
) {
  await run(
    `
      UPDATE three_q_options
      SET
        option_key = ?,
        option_text = ?,
        is_correct = ?,
        sort_order = ?
      WHERE id = ?
    `,
    [
      option.optionKey,
      option.optionText,
      option.isCorrect ? 1 : 0,
      option.sortOrder,
      optionId,
    ]
  );

  return optionId;
}

/**
 * Delete all options belonging to a question.
 *
 * Mainly used when replacing the complete MCQ option
 * set during an admin edit.
 */
export async function deleteOptionsByQuestionId(
  questionId
) {
  await run(
    `
      DELETE FROM three_q_options
      WHERE question_id = ?
    `,
    [questionId]
  );

  return questionId;
}

/**
 * Delete a single option.
 */
export async function deleteQuestionOption(
  optionId
) {
  await run(
    `
      DELETE FROM three_q_options
      WHERE id = ?
    `,
    [optionId]
  );

  return optionId;
}

/*
|--------------------------------------------------------------------------
| SINGLE QUESTION
|--------------------------------------------------------------------------
*/

/**
 * Get question with options.
 */
export async function findQuestionById(
  questionId
) {
  const question = await get(
    `
      SELECT
        id,
        section_id,
        question_number,
        question_text,
        question_type,
        question_image_url,
        marks,
        is_active
      FROM three_q_questions
      WHERE id = ?
      LIMIT 1
    `,
    [questionId]
  );

  if (!question) {
    return null;
  }

  const options = await all(
    `
      SELECT
        id,
        question_id,
        option_key,
        option_text,
        is_correct,
        sort_order
      FROM three_q_options
      WHERE question_id = ?
      ORDER BY sort_order ASC, id ASC
    `,
    [questionId]
  );

  return {
    ...question,
    options,
  };
}

/*
|--------------------------------------------------------------------------
| ALL QUESTIONS FOR SECTION
|--------------------------------------------------------------------------
*/

/**
 * Get all questions belonging to a section.
 *
 * This version avoids the N+1 query pattern used by the
 * previous implementation.
 */
export async function findQuestionsBySectionId(
  sectionId
) {
  const questions = await all(
    `
      SELECT
        id,
        section_id,
        question_number,
        question_text,
        question_type,
        question_image_url,
        marks,
        is_active
      FROM three_q_questions
      WHERE section_id = ?
      ORDER BY question_number ASC, id ASC
    `,
    [sectionId]
  );

  if (!questions.length) {
    return [];
  }

  const questionIds =
    questions.map(
      (question) => question.id
    );

  const options = await all(
    `
      SELECT
        id,
        question_id,
        option_key,
        option_text,
        is_correct,
        sort_order
      FROM three_q_options
      WHERE question_id = ANY(?::bigint[])
      ORDER BY
        question_id ASC,
        sort_order ASC,
        id ASC
    `,
    [questionIds]
  );

  const optionsByQuestionId =
    new Map();

  for (const option of options) {
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
| ALL QUESTIONS FOR TEST
|--------------------------------------------------------------------------
*/

/**
 * Get all questions for every section of a test.
 *
 * Useful for admin assessment editing and
 * efficient test loading.
 */
export async function findQuestionsByTestId(
  testId
) {
  const questions = await all(
    `
      SELECT
        q.id,
        q.section_id,
        q.question_number,
        q.question_text,
        q.question_type,
        q.question_image_url,
        q.marks,
        q.is_active
      FROM three_q_questions q
      INNER JOIN three_q_sections s
        ON s.id = q.section_id
      WHERE s.test_id = ?
      ORDER BY
        s.sort_order ASC,
        s.section_number ASC,
        q.question_number ASC,
        q.id ASC
    `,
    [testId]
  );

  if (!questions.length) {
    return [];
  }

  const questionIds =
    questions.map(
      (question) => question.id
    );

  const options = await all(
    `
      SELECT
        id,
        question_id,
        option_key,
        option_text,
        is_correct,
        sort_order
      FROM three_q_options
      WHERE question_id = ANY(?::bigint[])
      ORDER BY
        question_id ASC,
        sort_order ASC,
        id ASC
    `,
    [questionIds]
  );

  const optionsByQuestionId =
    new Map();

  for (const option of options) {
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
| BATCH QUESTION + OPTION FETCH
|--------------------------------------------------------------------------
*/

/**
 * Find multiple questions belonging to a test
 * and load all their options in a single query.
 *
 * Used by the student answer batch-saving flow.
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

  const questions = await all(
    `
      SELECT
        q.id,
        q.section_id,
        q.question_number,
        q.question_text,
        q.question_type,
        q.question_image_url,
        q.marks,
        q.is_active
      FROM three_q_questions q
      INNER JOIN three_q_sections s
        ON s.id = q.section_id
      WHERE
        s.test_id = ?
        AND q.id = ANY(?::bigint[])
      ORDER BY
        s.sort_order ASC,
        s.section_number ASC,
        q.question_number ASC,
        q.id ASC
    `,
    [
      testId,
      questionIds,
    ]
  );

  if (!questions.length) {
    return [];
  }

  const validQuestionIds =
    questions.map(
      (question) => question.id
    );

  const options = await all(
    `
      SELECT
        id,
        question_id,
        option_key,
        option_text,
        is_correct,
        sort_order
      FROM three_q_options
      WHERE question_id = ANY(?::bigint[])
      ORDER BY
        question_id ASC,
        sort_order ASC,
        id ASC
    `,
    [validQuestionIds]
  );

  const optionsByQuestionId =
    new Map();

  for (const option of options) {
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