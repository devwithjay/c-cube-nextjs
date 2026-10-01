import re

file_path = 'client/services/adminApi.js'
with open(file_path, 'r') as f:
    content = f.read()

delete_api = """
export async function deleteTestSection(
  sectionId
) {
  return adminRequest(
    `/admin/tests/sections/${sectionId}`,
    {
      method: "DELETE"
    }
  );
}
"""
content += delete_api

with open(file_path, 'w') as f:
    f.write(content)

print("Frontend API delete section added")
