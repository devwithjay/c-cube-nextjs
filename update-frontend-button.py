import os

file_path = 'client/pages/admin/AdminAssessment.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Import unpublishAdminTest
content = content.replace(
    'publishAdminTest,',
    'publishAdminTest,\n  unpublishAdminTest,'
)

# Add Unpublish button
unpublish_button = """
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  changeStatus(
                    unpublishAdminTest,
                    "Assessment unpublished."
                  )
                }
                className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-black text-amber-600 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-500"
              >
                Unpublish
              </button>

              <button
"""

content = content.replace(
    '<button',
    unpublish_button,
    1 # We only want to replace the FIRST <button that matches... wait, no.
)

