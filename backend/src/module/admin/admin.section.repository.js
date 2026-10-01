import { get, all, run } from "../../db/database.js";

/**
 * Get a test by ID.
 */
export async function findTestById(testId) {
  return get(
    `
      SELECT
        id,
        title,
        description,
        duration_seconds,
        status,
        version
      FROM three_q_tests
      WHERE id = ?
      LIMIT 1
    `,
    [testId]
  );
}

/**
 * Get all sections belonging to a test.
 */
export async function findSectionsByTestId(testId) {
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
      ORDER BY sort_order ASC, section_number ASC
    `,
    [testId]
  );
}

/**
 * Find one section by ID.
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
 * Check whether a section number already exists
 * inside a specific test.
 */
export async function findSectionByNumber(testId, sectionNumber) {
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
      WHERE test_id = ?
        AND section_number = ?
      LIMIT 1
    `,
    [testId, sectionNumber]
  );
}

/**
 * Create a section.
 */
export async function createSection(section) {
  const result = await run(
    `
      INSERT INTO three_q_sections
      (
        test_id,
        section_number,
        name,
        description,
        question_limit,
        sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      section.testId,
      section.sectionNumber,
      section.name,
      section.description,
      section.questionLimit,
      section.sortOrder
    ]
  );

  return findSectionById(result.id);
}

/**
 * Update a section.
 *
 * Only draft test sections should be updated.
 */
export async function updateSection(sectionId, section) {
  await run(
    `
      UPDATE three_q_sections
      SET
        name = ?,
        description = ?,
        question_limit = ?,
        sort_order = ?
      WHERE id = ?
    `,
    [
      section.name,
      section.description,
      section.questionLimit,
      section.sortOrder,
      sectionId
    ]
  );

  return findSectionById(sectionId);
}