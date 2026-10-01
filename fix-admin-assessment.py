import re

file_path = 'client/pages/admin/AdminAssessment.jsx'
with open(file_path, 'r') as f:
    content = f.read()

if "ConfirmDialog" not in content:
    # Add import
    imports = """import ConfirmDialog from "@/components/ui/ConfirmDialog";\n"""
    content = content.replace('import { useParams } from "react-router-dom";', imports + 'import { useParams } from "react-router-dom";')
    
    # Add state
    state = """  const [confirmDeleteSection, setConfirmDeleteSection] = useState(null);
  const [confirmDeleteQuestion, setConfirmDeleteQuestion] = useState(null);"""
    content = content.replace('const [error, setError] = useState("");', 'const [error, setError] = useState("");\n' + state)
    
    # Replace deleteSection
    old_delete_section = """  async function deleteSection(sectionId) {
    if (
      !window.confirm(
        "Are you sure you want to delete this section? All its questions will be permanently deleted."
      )
    ) {
      return;
    }
    setSaving(true);
    setError("");

    try {
      await adminApi.deleteTestSection(
        sectionId
      );
      setSections(
        sections.filter(
          (s) => s.id !== sectionId
        )
      );
      const newQuestions = {
        ...questions
      };
      delete newQuestions[sectionId];
      setQuestions(newQuestions);
    } catch (requestError) {
      setError(
        requestError?.message ||
        "Failed to delete section."
      );
    } finally {
      setSaving(false);
    }
  }"""
  
    new_delete_section = """  function requestDeleteSection(sectionId) {
    setConfirmDeleteSection(sectionId);
  }

  async function executeDeleteSection(sectionId) {
    setSaving(true);
    setError("");

    try {
      await adminApi.deleteTestSection(sectionId);
      setSections(sections.filter((s) => s.id !== sectionId));
      const newQuestions = { ...questions };
      delete newQuestions[sectionId];
      setQuestions(newQuestions);
    } catch (requestError) {
      setError(requestError?.message || "Failed to delete section.");
    } finally {
      setSaving(false);
    }
  }"""
    content = content.replace(old_delete_section, new_delete_section)
    content = content.replace('onClick={() => deleteSection(section.id)}', 'onClick={() => requestDeleteSection(section.id)}')
    
    # Replace deleteQuestion
    old_delete_question = """  async function deleteQuestion(
    sectionId,
    questionId
  ) {
    if (
      !window.confirm(
        "Delete this question permanently?"
      )
    ) {
      return;
    }
    setSaving(true);
    setError("");

    try {
      await adminApi.deleteSectionQuestion(
        questionId
      );
      setQuestions({
        ...questions,
        [sectionId]: questions[
          sectionId
        ].filter(
          (q) => q.id !== questionId
        )
      });
    } catch (requestError) {
      setError(
        requestError?.message ||
        "Failed to delete question."
      );
    } finally {
      setSaving(false);
    }
  }"""
  
    new_delete_question = """  function requestDeleteQuestion(sectionId, questionId) {
    setConfirmDeleteQuestion({ sectionId, questionId });
  }

  async function executeDeleteQuestion(sectionId, questionId) {
    setSaving(true);
    setError("");

    try {
      await adminApi.deleteSectionQuestion(questionId);
      setQuestions({
        ...questions,
        [sectionId]: questions[sectionId].filter((q) => q.id !== questionId)
      });
    } catch (requestError) {
      setError(requestError?.message || "Failed to delete question.");
    } finally {
      setSaving(false);
    }
  }"""
    content = content.replace(old_delete_question, new_delete_question)
    content = content.replace('onClick={() => deleteQuestion(section.id, question.id)}', 'onClick={() => requestDeleteQuestion(section.id, question.id)}')
    
    # Add components
    dialogs = """      <ConfirmDialog
        isOpen={!!confirmDeleteSection}
        title="Delete Section"
        description="Are you sure you want to delete this section? All its questions will be permanently deleted."
        confirmText="Delete Section"
        onConfirm={() => executeDeleteSection(confirmDeleteSection)}
        onCancel={() => setConfirmDeleteSection(null)}
      />
      <ConfirmDialog
        isOpen={!!confirmDeleteQuestion}
        title="Delete Question"
        description="Delete this question permanently?"
        confirmText="Delete Question"
        onConfirm={() => executeDeleteQuestion(confirmDeleteQuestion.sectionId, confirmDeleteQuestion.questionId)}
        onCancel={() => setConfirmDeleteQuestion(null)}
      />"""
    content = content.replace('</AdminLayout>', dialogs + '\n    </AdminLayout>')

with open(file_path, 'w') as f:
    f.write(content)
print("AdminAssessment updated")
EOF
