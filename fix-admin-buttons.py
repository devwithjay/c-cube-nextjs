import re

file_path = 'client/pages/admin/AdminAssessment.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Add Button import if not exists
if 'import { Button }' not in content:
    imports = """import { Button } from "@/components/ui/button";\n"""
    content = content.replace('import ConfirmDialog from "@/components/ui/ConfirmDialog";', imports + 'import ConfirmDialog from "@/components/ui/ConfirmDialog";')

# Replace the "Edit section" button (around line 1315-1335)
edit_section_pattern = r'<button[^>]*onClick=\{[^}]*setEditingSectionId\(\s*section\.id\s*\)[^}]*\}[^>]*>\s*Edit section\s*</button>'
edit_section_replacement = """<Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSectionId(section.id);
                            setSectionForm(getSectionForm(section));
                          }}
                          className="font-black text-muted-foreground"
                        >
                          Edit section
                        </Button>"""

# Actually, the onClick has a lot of lines. Let's just string-replace the parts.

old_edit_section = """                        <button
                          type="button"
                          onClick={() => {

                            setEditingSectionId(
                              section.id
                            );

                            setSectionForm(
                              getSectionForm(
                                section
                              )
                            );

                          }}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-black text-muted-foreground hover:bg-muted"
                        >
                          Edit section
                        </button>"""
new_edit_section = """                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSectionId(section.id);
                            setSectionForm(getSectionForm(section));
                          }}
                          className="font-black text-muted-foreground h-8 text-xs"
                        >
                          Edit section
                        </Button>"""
content = content.replace(old_edit_section, new_edit_section)

# Now fix the row stretching for questions
old_flex_row = '<div className="flex gap-2">'
new_flex_row = '<div className="flex gap-2 items-start">'
content = content.replace(old_flex_row, new_flex_row)

old_edit_q = """                                    <button
                                      type="button"
                                      onClick={() =>
                                        editQuestion(
                                          section.id,
                                          question
                                        )
                                      }
                                      className="rounded-lg border border-border bg-card text-card-foreground px-3 py-1.5 text-xs font-black text-foreground"
                                    >
                                      Edit
                                    </button>"""
new_edit_q = """                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => editQuestion(section.id, question)}
                                      className="h-8 text-xs font-black"
                                    >
                                      Edit
                                    </Button>"""
content = content.replace(old_edit_q, new_edit_q)

old_del_q = """                                    <button
                                      type="button"
                                      disabled={saving}
                                      onClick={() =>
                                        removeQuestion(
                                          section.id,
                                          question.id
                                        )
                                      }
                                      className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 text-xs font-black text-red-600 dark:text-red-400"
                                    >
                                      Delete
                                    </button>"""
new_del_q = """                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      disabled={saving}
                                      onClick={() => requestDeleteQuestion(section.id, question.id)}
                                      className="h-8 text-xs font-black"
                                    >
                                      Delete
                                    </Button>"""
# Notice how I used `requestDeleteQuestion` because I updated this to use ConfirmDialog earlier! Wait! 
# In my `fix-admin-assessment.py` I already replaced `deleteQuestion` with `requestDeleteQuestion` in the `onClick`!
# Let's check what `onClick` actually says now.
EOF
