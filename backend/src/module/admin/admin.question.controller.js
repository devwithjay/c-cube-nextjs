import {
  getQuestions,
  createNewQuestion,
  updateExistingQuestion,
  deleteQuestion
} from "./admin.question.service.js";


/**
 * GET /api/admin/sections/:sectionId/questions
 */
export async function listQuestions(
  req,
  res,
  next
) {

  try {

    const sectionId =
      Number(
        req.params.sectionId
      );

    if (
      !Number.isInteger(sectionId) ||
      sectionId <= 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid section ID."
      });

    }

    const questions =
      await getQuestions(
        sectionId
      );

    return res.json({
      success: true,
      data: questions
    });

  } catch (error) {

    next(error);

  }

}


/**
 * POST /api/admin/sections/:sectionId/questions
 */
export async function createQuestion(
  req,
  res,
  next
) {

  try {

    const sectionId =
      Number(
        req.params.sectionId
      );

    if (
      !Number.isInteger(sectionId) ||
      sectionId <= 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid section ID."
      });

    }

    const question =
      await createNewQuestion(
        sectionId,
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        "Question created successfully.",
      data: question
    });

  } catch (error) {

    next(error);

  }

}


/**
 * PUT /api/admin/questions/:questionId
 */
export async function updateQuestion(
  req,
  res,
  next
) {

  try {

    const questionId =
      Number(
        req.params.questionId
      );

    if (
      !Number.isInteger(questionId) ||
      questionId <= 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid question ID."
      });

    }

    const question =
      await updateExistingQuestion(
        questionId,
        req.body
      );

    return res.json({
      success: true,
      message:
        "Question updated successfully.",
      data: question
    });

  } catch (error) {

    next(error);

  }

}


/**
 * DELETE /api/admin/questions/:questionId
 */
export async function removeQuestion(
  req,
  res,
  next
) {

  try {

    const questionId =
      Number(
        req.params.questionId
      );

    if (
      !Number.isInteger(questionId) ||
      questionId <= 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid question ID."
      });

    }

    const result =
      await deleteQuestion(
        questionId
      );

    return res.json({
      success: true,
      message:
        "Question deleted successfully.",
      data: result
    });

  } catch (error) {

    next(error);

  }

}