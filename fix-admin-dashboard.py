import re

file_path = 'client/pages/admin/AdminDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace window.confirm with ConfirmDialog
# We need to add state for ConfirmDialog and the actual component

if "ConfirmDialog" not in content:
    # Add imports
    imports = """import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
"""
    content = content.replace('import { useState, useEffect } from "react";', imports + 'import { useState, useEffect } from "react";')
    
    # Add state
    state = """  const [confirmDelete, setConfirmDelete] = useState(null);
  const { toast } = useToast();"""
    content = content.replace('const [error, setError] = useState("");', 'const [error, setError] = useState("");\n' + state)
    
    # Replace handleDeleteTest logic
    old_handle_delete = """  async function handleDeleteTest(test) {
    const hasResults =
      test.status === "published" ||
      test.status === "closed";
    const confirmed = window.confirm(
      `Delete ${test.status} assessment "${test.title}"? This will permanently delete its sections, questions${hasResults ? ", participant sessions, and results" : ""}.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(test.id);
      setError("");
      await deleteAdminTest(test.id);
      setTests((current) =>
        current.filter((item) => item.id !== test.id)
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
        "Failed to delete assessment."
      );
    } finally {
      setDeletingId(null);
    }
  }"""
    
    new_handle_delete = """  function requestDeleteTest(test) {
    setConfirmDelete(test);
  }

  async function executeDeleteTest(test) {
    try {
      setDeletingId(test.id);
      setError("");
      await deleteAdminTest(test.id);
      setTests((current) =>
        current.filter((item) => item.id !== test.id)
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
        "Failed to delete assessment."
      );
    } finally {
      setDeletingId(null);
    }
  }"""
    
    content = content.replace(old_handle_delete, new_handle_delete)
    
    # Update button onClick
    content = content.replace('onClick={() => handleDeleteTest(test)}', 'onClick={() => requestDeleteTest(test)}')
    
    # Add ConfirmDialog component inside return
    dialog_component = """      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Assessment"
        description={
          confirmDelete
            ? `Delete ${confirmDelete.status} assessment "${confirmDelete.title}"? This will permanently delete its sections, questions${(confirmDelete.status === "published" || confirmDelete.status === "closed") ? ", participant sessions, and results" : ""}.`
            : ""
        }
        confirmText="Delete"
        onConfirm={() => executeDeleteTest(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />"""
      
    content = content.replace('</AdminLayout>', dialog_component + '\n    </AdminLayout>')
    
    # Also replace window.prompt / alert
    content = content.replace(
        'alert("Link copied to clipboard: " + link);',
        'toast({ title: "Copied!", description: "Link copied to clipboard." });'
    )

with open(file_path, 'w') as f:
    f.write(content)
print("AdminDashboard updated")
