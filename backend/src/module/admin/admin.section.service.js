import {
  findTestById,
  findSectionsByTestId,
  findSectionById,
  findSectionByNumber,
  createSection,
  updateSection,
  deleteSectionById
} from "./admin.section.repository.js";

/**
 * Get all sections for a test.
 */
export async function getSectionsForTest(testId) {
  const test = await findTestById(testId);

  if (!test) {
    const error = new Error("Test not found.");
    error.statusCode = 404;
    throw error;
  }

  return findSectionsByTestId(testId);
}

/**
 * Create a section for a draft test.
 */
export async function createTestSection(testId, data) {
  const test = await findTestById(testId);

  if (!test) {
    const error = new Error("Test not found.");
    error.statusCode = 404;
    throw error;
  }



  const sectionNumber = Number(data.sectionNumber);
  const questionLimit = Number(data.questionLimit);
  const sortOrder = Number(data.sortOrder);

  if (!Number.isInteger(sectionNumber) || sectionNumber <= 0) {
    const error = new Error(
      "sectionNumber must be a positive integer."
    );
    error.statusCode = 400;
    throw error;
  }

  if (!data.name || !data.name.trim()) {
    const error = new Error("Section name is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(questionLimit) || questionLimit <= 0) {
    const error = new Error(
      "questionLimit must be a positive integer."
    );
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(sortOrder) || sortOrder <= 0) {
    const error = new Error(
      "sortOrder must be a positive integer."
    );
    error.statusCode = 400;
    throw error;
  }

  const existingSection = await findSectionByNumber(
    testId,
    sectionNumber
  );

  if (existingSection) {
    const error = new Error(
      `Section number ${sectionNumber} already exists for this test.`
    );
    error.statusCode = 409;
    throw error;
  }

  return createSection({
    testId,
    sectionNumber,
    name: data.name.trim(),
    description: data.description?.trim() || null,
    questionLimit,
    sortOrder
  });
}

/**
 * Update a section belonging to a draft test.
 */
export async function updateTestSection(sectionId, data) {
  const section = await findSectionById(sectionId);

  if (!section) {
    const error = new Error("Section not found.");
    error.statusCode = 404;
    throw error;
  }

  const test = await findTestById(section.test_id);

  if (!test) {
    const error = new Error("Parent test not found.");
    error.statusCode = 404;
    throw error;
  }



  const questionLimit = Number(data.questionLimit);
  const sortOrder = Number(data.sortOrder);

  if (!data.name || !data.name.trim()) {
    const error = new Error("Section name is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(questionLimit) || questionLimit <= 0) {
    const error = new Error(
      "questionLimit must be a positive integer."
    );
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(sortOrder) || sortOrder <= 0) {
    const error = new Error(
      "sortOrder must be a positive integer."
    );
    error.statusCode = 400;
    throw error;
  }

  return updateSection,
  deleteSectionById(sectionId, {
    name: data.name.trim(),
    description: data.description?.trim() || null,
    questionLimit,
    sortOrder
  });
}
/**
 * Delete a test section
 */
export async function deleteTestSection(sectionId) {
  const section = await findSectionById(sectionId);

  if (!section) {
    const error = new Error("Section not found.");
    error.statusCode = 404;
    throw error;
  }

  const test = await findTestById(section.test_id);
  if (test && test.status !== "draft") {
    const error = new Error("Cannot delete a section of a published or closed test.");
    error.statusCode = 400;
    throw error;
  }

  await deleteSectionById(sectionId);
}
