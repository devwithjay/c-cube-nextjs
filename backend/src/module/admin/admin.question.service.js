import {
  findSectionById,
  findTestBySectionId,
  getNextQuestionNumber,
  createQuestion,
  updateQuestion,
  deactivateQuestion,
  createQuestionOption,
  updateQuestionOption,
  deleteOptionsByQuestionId,
  findQuestionById,
  findQuestionsBySectionId,
} from "./admin.question.repository.js";

import {
  withTransaction,
} from "../../db/database.js";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const QUESTION_TYPES = [
  "mcq",
  "short_answer",
  "long_answer",
];

const VALID_OPTION_KEYS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

/**
 * Create a standard API error.
 */
function createError(
  message,
  statusCode = 400
) {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
}

/**
 * Normalize question type.
 */
function normalizeQuestionType(
  questionType
) {
  return String(
    questionType || ""
  )
    .trim()
    .toLowerCase();
}

/**
 * Validate marks.
 */
function validateMarks(
  marks
) {
  const normalizedMarks =
    marks === undefined ||
      marks === null ||
      marks === ""
      ? 1
      : Number(marks);

  if (
    !Number.isInteger(
      normalizedMarks
    ) ||
    normalizedMarks <= 0
  ) {
    throw createError(
      "marks must be a positive integer."
    );
  }

  return normalizedMarks;
}

/**
 * Normalize and validate question image URL.
 *
 * The system stores an URL rather than the actual image
 * binary in PostgreSQL.
 */
function normalizeQuestionImageUrl(
  value
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const imageUrl =
    String(value).trim();

  if (!imageUrl) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Allow normal HTTP/HTTPS image URLs.
  |--------------------------------------------------------------------------
  */

  const isHttpUrl =
  /^https?:\/\/\S+$/i.test(
    imageUrl
  );

const isDataImage =
  /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(
    imageUrl
  );

if (
  !isHttpUrl &&
  !isDataImage
) {
  throw createError(
    "questionImageUrl must be a valid HTTP/HTTPS image URL or a supported image file."
  );
}

  return imageUrl;
}

/**
 * Normalize MCQ options.
 *
 * Supports 2 to 6 options.
 */
function normalizeOptions(
  options
) {
  if (!Array.isArray(options)) {
    throw createError(
      "Options must be an array."
    );
  }

  if (
    options.length < 2 ||
    options.length > 6
  ) {
    throw createError(
      "An MCQ must have between 2 and 6 options."
    );
  }

  const normalizedOptions =
    options.map(
      (option, index) => {
        const key =
          String(
            option?.key || ""
          )
            .trim()
            .toUpperCase();

        const text =
          String(
            option?.text || ""
          ).trim();

        const isCorrect =
          Boolean(
            option?.isCorrect
          );

        return {
          key,
          text,
          isCorrect,
          sortOrder:
            index + 1,
        };
      }
    );

  /*
  |--------------------------------------------------------------------------
  | Validate option keys
  |--------------------------------------------------------------------------
  */

  for (
    const option of normalizedOptions
  ) {
    if (
      !VALID_OPTION_KEYS.includes(
        option.key
      )
    ) {
      throw createError(
        "Option keys must be A, B, C, D, E or F."
      );
    }

    if (!option.text) {
      throw createError(
        `Option ${option.key || "?"} cannot be empty.`
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Validate unique keys
  |--------------------------------------------------------------------------
  */

  const uniqueKeys =
    new Set(
      normalizedOptions.map(
        (option) =>
          option.key
      )
    );

  if (
    uniqueKeys.size !==
    normalizedOptions.length
  ) {
    throw createError(
      "Option keys must be unique."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Validate exactly one correct option
  |--------------------------------------------------------------------------
  */

  const correctOptions =
    normalizedOptions.filter(
      (option) =>
        option.isCorrect
    );

  if (
    correctOptions.length !== 1
  ) {
    throw createError(
      "Exactly one option must be marked as correct."
    );
  }

  return normalizedOptions;
}

/**
 * Validate common question fields.
 */
function validateQuestionData(
  data
) {
  const questionText =
    String(
      data?.questionText || ""
    ).trim();

  if (!questionText) {
    throw createError(
      "Question text is required."
    );
  }

  const questionType =
    normalizeQuestionType(
      data?.questionType
    );

  if (
    !QUESTION_TYPES.includes(
      questionType
    )
  ) {
    throw createError(
      "questionType must be mcq, short_answer or long_answer."
    );
  }

  const marks =
    validateMarks(
      data?.marks
    );

  const questionImageUrl =
    normalizeQuestionImageUrl(
      data?.questionImageUrl
    );

  return {
    questionText,
    questionType,
    marks,
    questionImageUrl,
  };
}

/*
|--------------------------------------------------------------------------
| GET QUESTIONS
|--------------------------------------------------------------------------
*/

/**
 * Get all questions in a section.
 */
export async function getQuestions(
  sectionId
) {
  const section =
    await findSectionById(
      sectionId
    );

  if (!section) {
    throw createError(
      "Section not found.",
      404
    );
  }

  return findQuestionsBySectionId(
    sectionId
  );
}

/*
|--------------------------------------------------------------------------
| CREATE QUESTION
|--------------------------------------------------------------------------
*/

/**
 * Create a complete question.
 *
 * Supported:
 *
 * MCQ:
 *   - 2 to 6 options
 *   - exactly one correct answer
 *
 * Short Answer:
 *   - no options required
 *
 * Long Answer:
 *   - no options required
 */
export async function createNewQuestion(
  sectionId,
  data
) {
  /*
  |--------------------------------------------------------------------------
  | Validate section
  |--------------------------------------------------------------------------
  */

  const section =
    await findSectionById(
      sectionId
    );

  if (!section) {
    throw createError(
      "Section not found.",
      404
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Validate parent test
  |--------------------------------------------------------------------------
  */

  const test =
    await findTestBySectionId(
      sectionId
    );

  if (!test) {
    throw createError(
      "Parent test not found.",
      404
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Only draft tests can be edited
  |--------------------------------------------------------------------------
  */

  if (
    test.status !== "draft"
  ) {
    throw createError(
      "Questions can only be added to a draft test."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Validate common fields
  |--------------------------------------------------------------------------
  */

  const {
    questionText,
    questionType,
    marks,
    questionImageUrl,
  } = validateQuestionData(
    data
  );

  /*
  |--------------------------------------------------------------------------
  | Validate MCQ options
  |--------------------------------------------------------------------------
  */

  let normalizedOptions = [];

  if (
    questionType === "mcq"
  ) {
    normalizedOptions =
      normalizeOptions(
        data.options
      );
  }

  /*
  |--------------------------------------------------------------------------
  | Short/long answer questions
  |--------------------------------------------------------------------------
  |
  | Options are not allowed/required.
  |
  |--------------------------------------------------------------------------
  */

  if (
    questionType !== "mcq" &&
    Array.isArray(data.options) &&
    data.options.length > 0
  ) {
    throw createError(
      "Options are only allowed for MCQ questions."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Check section question limit
  |--------------------------------------------------------------------------
  */

  const existingQuestions =
    await findQuestionsBySectionId(
      sectionId
    );

  if (
    existingQuestions.length >=
    Number(section.question_limit)
  ) {
    throw createError(
      `This section already has the maximum of ${section.question_limit} questions.`
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Get next question number
  |--------------------------------------------------------------------------
  */

  const questionNumber =
    await getNextQuestionNumber(
      sectionId
    );

  /*
  |--------------------------------------------------------------------------
  | Transaction
  |--------------------------------------------------------------------------
  */

  return withTransaction(
    async () => {
      /*
      |--------------------------------------------------------------------------
      | Create question
      |--------------------------------------------------------------------------
      */

      const questionId =
        await createQuestion({
          sectionId,
          questionNumber,
          questionText,
          questionType,
          questionImageUrl,
          marks,
        });

      /*
      |--------------------------------------------------------------------------
      | Create MCQ options
      |--------------------------------------------------------------------------
      */

      if (
        questionType === "mcq"
      ) {
        for (
          const option of normalizedOptions
        ) {
          await createQuestionOption({
            questionId,

            optionKey:
              option.key,

            optionText:
              option.text,

            isCorrect:
              option.isCorrect,

            sortOrder:
              option.sortOrder,
          });
        }
      }

      /*
      |--------------------------------------------------------------------------
      | Return complete question
      |--------------------------------------------------------------------------
      */

      return findQuestionById(
        questionId
      );
    }
  );
}

/*
|--------------------------------------------------------------------------
| UPDATE QUESTION
|--------------------------------------------------------------------------
*/

/**
 * Update an existing question.
 *
 * For MCQ:
 * - Existing options are replaced atomically.
 *
 * For short/long answer:
 * - Existing options are removed.
 */
export async function updateExistingQuestion(
  questionId,
  data
) {
  /*
  |--------------------------------------------------------------------------
  | Find existing question
  |--------------------------------------------------------------------------
  */

  const existingQuestion =
    await findQuestionById(
      questionId
    );

  if (!existingQuestion) {
    throw createError(
      "Question not found.",
      404
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Find parent test
  |--------------------------------------------------------------------------
  */

  const test =
    await findTestBySectionId(
      existingQuestion.section_id
    );

  if (!test) {
    throw createError(
      "Parent test not found.",
      404
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Only draft tests can be modified
  |--------------------------------------------------------------------------
  */

  if (
    test.status !== "draft"
  ) {
    throw createError(
      "Questions can only be updated in a draft test."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Validate fields
  |--------------------------------------------------------------------------
  */

  const {
    questionText,
    questionType,
    marks,
    questionImageUrl,
  } = validateQuestionData(
    data
  );

  /*
  |--------------------------------------------------------------------------
  | Validate options
  |--------------------------------------------------------------------------
  */

  let normalizedOptions = [];

  if (
    questionType === "mcq"
  ) {
    normalizedOptions =
      normalizeOptions(
        data.options
      );
  }

  if (
    questionType !== "mcq" &&
    Array.isArray(data.options) &&
    data.options.length > 0
  ) {
    throw createError(
      "Options are only allowed for MCQ questions."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Transaction
  |--------------------------------------------------------------------------
  */

  return withTransaction(
    async () => {
      /*
      |--------------------------------------------------------------------------
      | Update question
      |--------------------------------------------------------------------------
      */

      await updateQuestion(
        questionId,
        {
          questionText,
          questionType,
          questionImageUrl,
          marks,
          isActive: true,
        }
      );

      /*
      |--------------------------------------------------------------------------
      | Replace options
      |--------------------------------------------------------------------------
      */

      await deleteOptionsByQuestionId(
        questionId
      );

      if (
        questionType === "mcq"
      ) {
        for (
          const option of normalizedOptions
        ) {
          await createQuestionOption({
            questionId,

            optionKey:
              option.key,

            optionText:
              option.text,

            isCorrect:
              option.isCorrect,

            sortOrder:
              option.sortOrder,
          });
        }
      }

      /*
      |--------------------------------------------------------------------------
      | Return updated question
      |--------------------------------------------------------------------------
      */

      return findQuestionById(
        questionId
      );
    }
  );
}

/*
|--------------------------------------------------------------------------
| DELETE QUESTION
|--------------------------------------------------------------------------
*/

/**
 * Soft-delete a question.
 */
export async function deleteQuestion(
  questionId
) {
  const question =
    await findQuestionById(
      questionId
    );

  if (!question) {
    throw createError(
      "Question not found.",
      404
    );
  }

  const test =
    await findTestBySectionId(
      question.section_id
    );

  if (!test) {
    throw createError(
      "Parent test not found.",
      404
    );
  }

  if (
    test.status !== "draft"
  ) {
    throw createError(
      "Questions can only be deleted from a draft test."
    );
  }

  await deactivateQuestion(
    questionId
  );

  return {
    id: questionId,
    deleted: true,
  };
}