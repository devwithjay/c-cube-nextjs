import re

file_path = 'client/pages/admin/AdminAssessment.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Import deleteTestSection
content = content.replace('updateTestSection\n} from "../../services/adminApi.js";', 'updateTestSection,\n  deleteTestSection\n} from "../../services/adminApi.js";')

# 2. Add requestDeleteSection function
request_del_fn = """
  // SECTION DELETION
  const [sectionToDelete, setSectionToDelete] = useState(null);

  async function confirmDeleteSection() {
    if (!sectionToDelete) return;
    try {
      setSaving(true);
      await deleteTestSection(sectionToDelete);
      
      setSections((current) => current.filter((s) => s.id !== sectionToDelete));
      setQuestions((current) => {
        const next = { ...current };
        delete next[sectionToDelete];
        return next;
      });
      
      showNotice("Section deleted successfully.");
    } catch (requestError) {
      showNotice(requestError?.message || "Failed to delete section.", true);
    } finally {
      setSaving(false);
      setSectionToDelete(null);
    }
  }

  // QUESTION EDITING
"""
content = content.replace('  // QUESTION EDITING', request_del_fn)

# 3. Add Delete section button
old_buttons = """                        <Button
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

new_buttons = """                        <div className="flex gap-2 items-start">
                          <Button
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
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => setSectionToDelete(section.id)}
                            className="h-8 text-xs font-black"
                          >
                            Delete
                          </Button>
                        </div>"""
content = content.replace(old_buttons, new_buttons)

# 4. Add ConfirmDialog for Section Deletion
old_dialog = """      <ConfirmDialog
        isOpen={!!questionToDelete}"""
    
new_dialog = """      <ConfirmDialog
        isOpen={!!sectionToDelete}
        title="Delete Section"
        description="Are you sure you want to delete this section? All questions inside will also be permanently deleted. This action cannot be undone."
        onConfirm={confirmDeleteSection}
        onCancel={() => setSectionToDelete(null)}
        confirmText="Delete Section"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={saving}
      />

      <ConfirmDialog
        isOpen={!!questionToDelete}"""
    
content = content.replace(old_dialog, new_dialog)

with open(file_path, 'w') as f:
    f.write(content)

print("AdminAssessment updated")
