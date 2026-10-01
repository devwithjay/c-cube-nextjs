import {
  getSectionsForTest,
  createTestSection,
  updateTestSection,
  deleteTestSection
} from "./admin.section.service.js";

/**
 * GET /api/admin/tests/:testId/sections
 */
export async function listSections(req, res, next) {
  try {
    const testId = Number(req.params.testId);

    if (!Number.isInteger(testId) || testId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid test ID."
      });
    }

    const sections = await getSectionsForTest(testId);

    return res.json({
      success: true,
      data: sections
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/tests/:testId/sections
 */
export async function createSection(req, res, next) {
  try {
    const testId = Number(req.params.testId);

    if (!Number.isInteger(testId) || testId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid test ID."
      });
    }

    const section = await createTestSection(
      testId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Section created successfully.",
      data: section
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/tests/sections/:sectionId
 */
export async function updateSection(req, res, next) {
  try {
    const sectionId = Number(req.params.sectionId);

    if (!Number.isInteger(sectionId) || sectionId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid section ID."
      });
    }

    const section = await updateTestSection,
  deleteTestSection(
      sectionId,
      req.body
    );

    return res.json({
      success: true,
      message: "Section updated successfully.",
      data: section
    });
  } catch (error) {
    next(error);
  }
}
/**
 * DELETE /api/admin/tests/sections/:sectionId
 */
export async function deleteSection(req, res, next) {
  try {
    const sectionId = Number(req.params.sectionId);

    if (!Number.isInteger(sectionId) || sectionId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid section ID."
      });
    }

    await deleteTestSection(sectionId);

    return res.json({
      success: true,
      message: "Section deleted successfully."
    });
  } catch (error) {
    next(error);
  }
}
