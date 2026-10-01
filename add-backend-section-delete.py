import re

file_path = 'backend/src/module/admin/admin.section.repository.js'
with open(file_path, 'r') as f:
    content = f.read()

delete_repo = """
/**
 * Delete a section by ID.
 */
export async function deleteSectionById(sectionId) {
  // Delete questions for this section first (if not cascading)
  await run(`DELETE FROM three_q_questions WHERE section_id = ?`, [sectionId]);
  await run(`DELETE FROM three_q_sections WHERE id = ?`, [sectionId]);
}
"""
content += delete_repo

with open(file_path, 'w') as f:
    f.write(content)

file_path = 'backend/src/module/admin/admin.section.service.js'
with open(file_path, 'r') as f:
    content = f.read()

# Add import
content = content.replace('updateSection', 'updateSection,\n  deleteSectionById')

delete_service = """
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
"""
content += delete_service

with open(file_path, 'w') as f:
    f.write(content)

file_path = 'backend/src/module/admin/admin.section.controller.js'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace('updateTestSection', 'updateTestSection,\n  deleteTestSection')

delete_controller = """
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
"""
content += delete_controller

with open(file_path, 'w') as f:
    f.write(content)

file_path = 'backend/src/module/admin/admin.section.routes.js'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace('updateSection', 'updateSection,\n  deleteSection')

delete_route = """
/**
 * DELETE /api/admin/tests/sections/:sectionId
 */
router.delete(
  "/sections/:sectionId",
  deleteSection
);
"""
content = content.replace('export default router;', delete_route + '\nexport default router;')

with open(file_path, 'w') as f:
    f.write(content)

print("Backend delete section added")
