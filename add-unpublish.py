import os
import re

# 1. Repository
repo_path = 'backend/src/module/admin/admin.test.repository.js'
with open(repo_path, 'r') as f:
    repo = f.read()
if 'unpublishTest' not in repo:
    repo += """
export async function unpublishTest(
  testId
) {
  const result = await db.query(
    `
      UPDATE three_q_tests
      SET
        status = 'draft',
        updated_at = CURRENT_TIMESTAMP
      WHERE
        id = $1
      RETURNING *
    `,
    [testId]
  );
  return result.rows[0] || null;
}
"""
    with open(repo_path, 'w') as f: f.write(repo)

# 2. Service
service_path = 'backend/src/module/admin/admin.test.service.js'
with open(service_path, 'r') as f:
    service = f.read()
if 'unpublishTest' not in service:
    service += """
export async function unpublishTest(
  testId
) {
  const updatedTest =
    await repository.unpublishTest(
      testId
    );
  if (!updatedTest) {
    throw createServiceError(
      "Test not found or could not be unpublished.",
      404
    );
  }
  return updatedTest;
}
"""
    with open(service_path, 'w') as f: f.write(service)

# 3. Controller
controller_path = 'backend/src/module/admin/admin.test.controller.js'
with open(controller_path, 'r') as f:
    controller = f.read()
if 'unpublishTest' not in controller:
    controller += """
export async function unpublishTest(
  req,
  res,
  next
) {
  try {
    const testId = Number(req.params.testId);
    if (!Number.isInteger(testId) || testId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid test ID."
      });
    }
    const test = await adminTestService.unpublishTest(testId);
    return res.status(200).json({
      success: true,
      message: "Test successfully unpublished.",
      data: test
    });
  } catch (error) {
    next(error);
  }
}
"""
    with open(controller_path, 'w') as f: f.write(controller)

# 4. Routes
routes_path = 'backend/src/module/admin/admin.test.routes.js'
with open(routes_path, 'r') as f:
    routes = f.read()
if 'unpublishTest' not in routes:
    routes = routes.replace(
        'import {',
        'import {\n  unpublishTest,'
    )
    routes = routes.replace(
        'export default router;',
        """
router.post(
  "/:testId/unpublish",
  unpublishTest
);

export default router;
"""
    )
    with open(routes_path, 'w') as f: f.write(routes)

# 5. API client
api_path = 'client/services/adminApi.js'
with open(api_path, 'r') as f:
    api = f.read()
if 'unpublishAdminTest' not in api:
    api += """
export async function unpublishAdminTest(
  testId
) {
  return adminRequest(
    `/admin/tests/${testId}/unpublish`,
    {
      method: "POST"
    }
  );
}
"""
    with open(api_path, 'w') as f: f.write(api)

print("Backend endpoints and API functions added.")
