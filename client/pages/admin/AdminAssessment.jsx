import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  closeAdminTest,
  createSectionQuestion,
  createTestSection,
  deleteSectionQuestion,
  getAdminTest,
  getSectionQuestions,
  getTestSections,
  publishAdminTest,
  unpublishAdminTest,
  updateAdminTest,
  updateSectionQuestion,
  updateTestSection
} from "../../services/adminApi.js";


function getEmptyQuestion() {
  return {
    questionText: "",
    questionType: "mcq",
    marks: 1,
    questionImageUrl: "",
    options: [
      { key: "A", text: "", isCorrect: true },
      { key: "B", text: "", isCorrect: false }
    ]
  };
}


function getTestForm(test) {
  return {
    title: test?.title || "",
    description: test?.description || "",
    durationSeconds: Math.max(
      1,
      Math.floor(Number(test?.duration_seconds || 60))
    )
  };
}


function getSectionForm(section, nextNumber = 1) {
  return {
    sectionNumber:
      section?.section_number || nextNumber,

    name:
      section?.name || "",

    description:
      section?.description || "",

    questionLimit:
      section?.question_limit || 1,

    sortOrder:
      section?.sort_order || nextNumber
  };
}


function getQuestionForm(question) {
  if (!question) {
    return getEmptyQuestion();
  }

  return {
    questionText:
      question.question_text || "",

    questionType:
      question.question_type || "mcq",

    marks:
      question.marks || 1,

    questionImageUrl:
      question.question_image_url || "",

    options:
      question.question_type === "mcq"
        ? (
            Array.isArray(question.options) &&
            question.options.length >= 2
              ? question.options
              : getEmptyQuestion().options
          ).map((option) => ({
            key:
              option.option_key ||
              option.key,

            text:
              option.option_text ||
              option.text ||
              "",

            isCorrect:
              Boolean(
                option.is_correct ??
                option.isCorrect
              )
          }))
        : []
  };
}


export default function AdminAssessment() {

  const navigate = useNavigate();
  const { testId } = useParams();
  const { theme, setTheme } = useTheme();

  const [test, setTest] = useState(null);
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState({});
  const [questionForms, setQuestionForms] = useState({});
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  const [testForm, setTestForm] =
    useState(getTestForm());

  const [sectionForm, setSectionForm] =
    useState(getSectionForm());

  const [editingSectionId, setEditingSectionId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [notice, setNotice] =
    useState("");


  // The user explicitly requested to be able to edit/add questions
  // and sections at any time, even if the test is not a draft.
  const isDraft = true;


  useEffect(() => {
    loadAssessment();
  }, [testId]);


  async function loadAssessment() {

    try {

      setLoading(true);
      setError("");

      const [
        testResponse,
        sectionsResponse
      ] = await Promise.all([
        getAdminTest(testId),
        getTestSections(testId)
      ]);

      const loadedTest =
        testResponse?.data;

      const loadedSections =
        Array.isArray(sectionsResponse?.data)
          ? sectionsResponse.data
          : [];

      setTest(loadedTest);
      setTestForm(
        getTestForm(loadedTest)
      );

      setSections(
        loadedSections
      );

      const questionEntries =
        await Promise.all(
          loadedSections.map(
            async (section) => [
              section.id,
              (
                await getSectionQuestions(
                  section.id
                )
              )?.data || []
            ]
          )
        );

      setQuestions(
        Object.fromEntries(
          questionEntries
        )
      );

    } catch (requestError) {

      setError(
        requestError?.message ||
        "Unable to load assessment."
      );

    } finally {

      setLoading(false);

    }
  }


  function showNotice(message) {

    setNotice(message);
    setError("");

  }


  function updateQuestionForm(
    sectionId,
    update
  ) {

    setQuestionForms(
      (current) => ({
        ...current,

        [sectionId]: {
          ...(current[sectionId] ||
            getEmptyQuestion()),

          ...update
        }
      })
    );

  }


  function updateOption(
    sectionId,
    index,
    update
  ) {

    const form =
      questionForms[sectionId] ||
      getEmptyQuestion();

    updateQuestionForm(
      sectionId,
      {
        options:
          form.options.map(
            (option, optionIndex) =>
              optionIndex === index
                ? {
                    ...option,
                    ...update
                  }
                : option
          )
      }
    );

  }


  function addOption(sectionId) {

    const form =
      questionForms[sectionId] ||
      getEmptyQuestion();

    if (form.options.length >= 6) {
      return;
    }

    const nextKey =
      String.fromCharCode(
        65 + form.options.length
      );

    updateQuestionForm(
      sectionId,
      {
        options: [
          ...form.options,
          {
            key: nextKey,
            text: "",
            isCorrect: false
          }
        ]
      }
    );

  }


  function removeOption(
    sectionId,
    index
  ) {

    const form =
      questionForms[sectionId] ||
      getEmptyQuestion();

    if (form.options.length <= 2) {
      return;
    }

    const removed =
      form.options[index];

    const newOptions =
      form.options
        .filter(
          (_, optionIndex) =>
            optionIndex !== index
        )
        .map(
          (option, optionIndex) => ({
            ...option,

            key:
              String.fromCharCode(
                65 + optionIndex
              ),

            isCorrect:
              removed.isCorrect &&
              optionIndex === 0
                ? true
                : option.isCorrect
          })
        );

    if (
      !newOptions.some(
        (option) =>
          option.isCorrect
      )
    ) {
      newOptions[0].isCorrect = true;
    }

    updateQuestionForm(
      sectionId,
      {
        options: newOptions
      }
    );

  }


  async function handleImageChange(
    sectionId,
    event
  ) {

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      setError(
        "Please select a valid image file."
      );

      return;
    }

    if (
      file.size >
      2 * 1024 * 1024
    ) {

      setError(
        "Image size must be 2 MB or smaller."
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {

      updateQuestionForm(
        sectionId,
        {
          questionImageUrl:
            reader.result
        }
      );

      setError("");

    };

    reader.readAsDataURL(file);

  }


  async function saveTest(event) {

    event.preventDefault();

    try {

      setSaving(true);

      const response =
        await updateAdminTest(
          testId,
          {
            ...testForm,
            durationSeconds:
              Number(
                testForm.durationSeconds
              )
          }
        );

      setTest(
        response?.data
      );

      showNotice(
        "Assessment details saved."
      );

    } catch (requestError) {

      setError(
        requestError?.message ||
        "Unable to save assessment."
      );

    } finally {

      setSaving(false);

    }
  }


  async function saveSection(event) {

    event.preventDefault();

    try {

      setSaving(true);

      const data = {
        ...sectionForm,

        sectionNumber:
          Number(
            sectionForm.sectionNumber
          ),

        questionLimit:
          Number(
            sectionForm.questionLimit
          ),

        sortOrder:
          Number(
            sectionForm.sortOrder
          )
      };

      const response =
        editingSectionId
          ? await updateTestSection(
              editingSectionId,
              data
            )
          : await createTestSection(
              testId,
              data
            );

      const savedSection =
        response?.data;

      setSections(
        (current) =>
          editingSectionId
            ? current.map(
                (section) =>
                  section.id ===
                  editingSectionId
                    ? savedSection
                    : section
              )
            : [
                ...current,
                savedSection
              ]
      );

      setQuestions(
        (current) => ({
          ...current,

          [savedSection.id]:
            current[
              savedSection.id
            ] || []
        })
      );

      setEditingSectionId(null);

      setSectionForm(
        getSectionForm(
          null,
          sections.length + 2
        )
      );

      showNotice(
        editingSectionId
          ? "Section updated."
          : "Section created."
      );

    } catch (requestError) {

      setError(
        requestError?.message ||
        "Unable to save section."
      );

    } finally {

      setSaving(false);

    }
  }


  async function saveQuestion(
    event,
    sectionId
  ) {

    event.preventDefault();

    const form =
      questionForms[sectionId] ||
      getEmptyQuestion();

    try {

      setSaving(true);

      const payload = {
        questionText:
          form.questionText.trim(),

        questionType:
          form.questionType,

        marks:
          Number(form.marks),

        questionImageUrl:
          form.questionImageUrl ||
          null
      };

      if (
        form.questionType ===
        "mcq"
      ) {

        payload.options =
          form.options.map(
            (option) => ({
              key:
                option.key,

              text:
                option.text.trim(),

              isCorrect:
                Boolean(
                  option.isCorrect
                )
            })
          );

      } else {

        payload.options = [];

      }


      let response;

      if (editingQuestionId) {

        response =
          await updateSectionQuestion(
            editingQuestionId,
            payload
          );

        setQuestions(
          (current) => ({
            ...current,

            [sectionId]:
              (
                current[
                  sectionId
                ] || []
              ).map(
                (question) =>
                  question.id ===
                  editingQuestionId
                    ? response?.data
                    : question
              )
          })
        );

        showNotice(
          "Question updated successfully."
        );

      } else {

        response =
          await createSectionQuestion(
            sectionId,
            payload
          );

        setQuestions(
          (current) => ({
            ...current,

            [sectionId]: [
              ...(current[
                sectionId
              ] || []),

              response?.data
            ]
          })
        );

        showNotice(
          "Question added successfully."
        );

      }

      setQuestionForms(
        (current) => ({
          ...current,

          [sectionId]:
            getEmptyQuestion()
        })
      );

      setEditingQuestionId(
        null
      );

    } catch (requestError) {

      setError(
        requestError?.message ||
        "Unable to save question."
      );

    } finally {

      setSaving(false);

    }
  }


  function editQuestion(
    sectionId,
    question
  ) {

    setEditingQuestionId(
      question.id
    );

    setQuestionForms(
      (current) => ({
        ...current,

        [sectionId]:
          getQuestionForm(
            question
          )
      })
    );

    window.scrollTo({
      top:
        document.body.scrollHeight,
      behavior: "smooth"
    });

  }


  async function removeQuestion(
    sectionId,
    questionId
  ) {

    if (
      !window.confirm(
        "Delete this question?"
      )
    ) {
      return;
    }

    try {

      setSaving(true);

      await deleteSectionQuestion(
        questionId
      );

      setQuestions(
        (current) => ({
          ...current,

          [sectionId]:
            (
              current[
                sectionId
              ] || []
            ).filter(
              (question) =>
                question.id !==
                questionId
            )
        })
      );

      showNotice(
        "Question deleted."
      );

    } catch (requestError) {

      setError(
        requestError?.message ||
        "Unable to delete question."
      );

    } finally {

      setSaving(false);

    }
  }


  async function changeStatus(
    action,
    successMessage
  ) {

    try {

      setSaving(true);

      const response =
        await action(testId);

      setTest(
        response?.data
      );

      showNotice(
        successMessage
      );

    } catch (requestError) {

      setError(
        requestError?.message ||
        "Unable to update assessment status."
      );

    } finally {

      setSaving(false);

    }
  }


  if (loading) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm font-bold text-muted-foreground">
        Loading assessment...
      </div>
    );

  }


  if (!test) {

    return (
      <div className="min-h-screen bg-background px-6 py-10">

        <div className="mx-auto max-w-3xl rounded-2xl bg-card text-card-foreground p-8">

          <p className="font-bold text-red-600">
            {error ||
              "Assessment not found."}
          </p>

          <button
            className="mt-6 font-bold text-foreground"
            onClick={() =>
              navigate(
                "/admin/dashboard"
              )
            }
          >
            Back to dashboard
          </button>

        </div>

      </div>
    );

  }


  return (

    <div className="min-h-screen bg-background px-6 py-8 text-foreground">

      <main className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">

          <div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/dashboard"
                )
              }
              className="mb-4 text-sm font-bold text-muted-foreground hover:text-foreground"
            >
              ← Back to dashboard
            </button>

            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
              Assessment #{test.id} ·{" "}
              {test.status}
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-[-0.04em]">
              Manage assessment
            </h1>

          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl border border-border bg-card p-3 text-card-foreground transition hover:bg-muted"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {isDraft && (

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  changeStatus(
                    publishAdminTest,
                    "Assessment published."
                  )
                }
                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-primary-foreground hover:bg-emerald-700 disabled:opacity-50"
              >
                Publish assessment
              </button>

            )}

            {test.status ===
              "published" && (
              <>
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
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    changeStatus(
                      closeAdminTest,
                      "Assessment closed."
                    )
                  }
                  className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-primary-foreground hover:bg-red-700 disabled:opacity-50"
                >
                  Close assessment
                </button>
              </>
            )}

          </div>

        </div>


        {(error || notice) && (

          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm font-semibold ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || notice}
          </div>

        )}


        {/* TEST DETAILS */}

        <form
          onSubmit={saveTest}
          className="rounded-2xl bg-card text-card-foreground p-6 shadow-sm"
        >

          <div className="mb-5 flex items-center justify-between">

            <h2 className="text-xl font-black">
              Assessment details
            </h2>

            <span className="rounded-full bg-muted/50 px-3 py-1 text-xs font-black uppercase text-muted-foreground">
              Version {test.version}
            </span>

          </div>

          <div className="grid gap-5 md:grid-cols-[1fr_220px]">

            <label className="text-sm font-bold text-foreground">

              Title

              <input
                required
                disabled={
                  !isDraft ||
                  saving
                }
                value={testForm.title}
                onChange={(event) =>
                  setTestForm({
                    ...testForm,
                    title:
                      event.target.value
                  })
                }
                className="mt-2 w-full rounded-xl border border-border px-4 py-3 bg-background text-foreground outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-muted-foreground"
              />

            </label>

            <label className="text-sm font-bold text-foreground">

              Duration (seconds)

              <input
                required
                min="1"
                type="number"
                disabled={
                  !isDraft ||
                  saving
                }
                value={
                  testForm.durationSeconds
                }
                onChange={(event) =>
                  setTestForm({
                    ...testForm,
                    durationSeconds:
                      event.target.value
                  })
                }
                className="mt-2 w-full rounded-xl border border-border px-4 py-3 bg-background text-foreground outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-muted-foreground"
              />

            </label>

          </div>

          <label className="mt-5 block text-sm font-bold text-foreground">

            Description

            <textarea
              disabled={
                !isDraft ||
                saving
              }
              value={
                testForm.description
              }
              onChange={(event) =>
                setTestForm({
                  ...testForm,
                  description:
                    event.target.value
                })
              }
              rows="3"
              className="mt-2 w-full rounded-xl border border-border px-4 py-3 bg-background text-foreground outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-muted-foreground"
            />

          </label>

          {isDraft && (

            <button
              disabled={saving}
              className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground hover:bg-primary disabled:opacity-50"
            >
              Save details
            </button>

          )}

        </form>


        {/* SECTIONS */}

        <section className="mt-8">

          <div className="mb-5 flex items-end justify-between gap-4">

            <div>

              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                Structure
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Sections and questions
              </h2>

            </div>

            <p className="text-sm font-semibold text-muted-foreground">
              {sections.length} section
              {sections.length === 1
                ? ""
                : "s"}
            </p>

          </div>


          {/* ADD SECTION */}

          {isDraft && (

            <form
              onSubmit={saveSection}
              className="mb-6 rounded-2xl border border-dashed border-border bg-card text-card-foreground p-6"
            >

              <h3 className="font-black">
                {editingSectionId
                  ? "Edit section"
                  : "Add section"}
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-4">

                <input
                  required
                  type="number"
                  min="1"
                  placeholder="Section #"
                  value={
                    sectionForm.sectionNumber
                  }
                  onChange={(event) =>
                    setSectionForm({
                      ...sectionForm,
                      sectionNumber:
                        event.target.value
                    })
                  }
                  className="rounded-xl border border-border px-3 py-3 bg-background text-foreground outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-muted-foreground"
                />

                <input
                  required
                  placeholder="Section name"
                  value={
                    sectionForm.name
                  }
                  onChange={(event) =>
                    setSectionForm({
                      ...sectionForm,
                      name:
                        event.target.value
                    })
                  }
                  className="rounded-xl border border-border px-3 py-3 md:col-span-2 bg-background text-foreground outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-muted-foreground"
                />

                <input
                  required
                  type="number"
                  min="1"
                  placeholder="Question limit"
                  value={
                    sectionForm.questionLimit
                  }
                  onChange={(event) =>
                    setSectionForm({
                      ...sectionForm,
                      questionLimit:
                        event.target.value
                    })
                  }
                  className="rounded-xl border border-border px-3 py-3 bg-background text-foreground outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-muted-foreground"
                />

              </div>

              <input
                placeholder="Description"
                value={
                  sectionForm.description
                }
                onChange={(event) =>
                  setSectionForm({
                    ...sectionForm,
                    description:
                      event.target.value
                  })
                }
                className="mt-4 w-full rounded-xl border border-border px-3 py-3 bg-background text-foreground outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-muted-foreground"
              />

              <div className="mt-4 flex gap-3">

                <button
                  disabled={saving}
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground disabled:opacity-50"
                >
                  {editingSectionId
                    ? "Update section"
                    : "Add section"}
                </button>

                {editingSectionId && (

                  <button
                    type="button"
                    onClick={() => {
                      setEditingSectionId(
                        null
                      );

                      setSectionForm(
                        getSectionForm(
                          null,
                          sections.length +
                            1
                        )
                      );
                    }}
                    className="rounded-xl px-4 py-3 text-sm font-bold text-muted-foreground"
                  >
                    Cancel
                  </button>

                )}

              </div>

            </form>

          )}


          {/* SECTION LIST */}

          <div className="space-y-6">

            {sections.map(
              (section) => {

                const sectionQuestions =
                  questions[
                    section.id
                  ] || [];

                const questionForm =
                  questionForms[
                    section.id
                  ] ||
                  getEmptyQuestion();

                return (

                  <article
                    key={section.id}
                    className="rounded-2xl bg-card text-card-foreground p-6 shadow-sm"
                  >

                    <div className="flex flex-wrap items-start justify-between gap-4">

                      <div>

                        <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-600">
                          Section{" "}
                          {section.section_number}
                        </p>

                        <h3 className="mt-1 text-xl font-black">
                          {section.name}
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {section.description ||
                            "No description"}{" "}
                          ·{" "}
                          {sectionQuestions.length}/
                          {section.question_limit}{" "}
                          questions
                        </p>

                      </div>

                      {isDraft && (

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

                      )}

                    </div>


                    {/* EXISTING QUESTIONS */}

                    <div className="mt-5 space-y-4">

                      {sectionQuestions.map(
                        (question) => (

                          <div
                            key={question.id}
                            className="rounded-xl bg-background p-4"
                          >

                            <div className="flex flex-wrap justify-between gap-4">

                              <div>

                                <p className="font-bold">
                                  {
                                    question.question_number
                                  }.{" "}
                                  {
                                    question.question_text
                                  }
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2">

                                  <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-black uppercase text-primary-foreground">
                                    {
                                      question.question_type
                                    }
                                  </span>

                                  <span className="rounded-full bg-card text-card-foreground px-2.5 py-1 text-[11px] font-black text-muted-foreground">
                                    {
                                      question.marks
                                    } mark
                                    {
                                      question.marks ===
                                      1
                                        ? ""
                                        : "s"
                                    }
                                  </span>

                                </div>

                              </div>

                              <div className="flex gap-2 items-start">

                                {isDraft && (

                                  <>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => editQuestion(section.id, question)}
                                      className="h-8 text-xs font-black"
                                    >
                                      Edit
                                    </Button>

                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      disabled={saving}
                                      onClick={() => requestDeleteQuestion(section.id, question.id)}
                                      className="h-8 text-xs font-black"
                                    >
                                      Delete
                                    </Button>
                                  </>

                                )}

                              </div>

                            </div>


                            {question.question_image_url && (

                              <img
                                src={
                                  question.question_image_url
                                }
                                alt="Question"
                                className="mt-4 max-h-48 max-w-full rounded-xl border border-border object-contain"
                              />

                            )}


                            {question.question_type ===
                              "mcq" &&
                              Array.isArray(
                                question.options
                              ) && (

                                <div className="mt-4 grid gap-2 sm:grid-cols-2">

                                  {question.options.map(
                                    (option) => (

                                      <div
                                        key={
                                          option.id
                                        }
                                        className={`rounded-lg px-3 py-2 text-sm ${
                                          option.is_correct
                                            ? "bg-emerald-100 font-bold text-emerald-800"
                                            : "bg-card text-card-foreground text-muted-foreground"
                                        }`}
                                      >
                                        {option.option_key}.{" "}
                                        {
                                          option.option_text
                                        }
                                      </div>

                                    )
                                  )}

                                </div>

                              )}

                          </div>

                        )
                      )}

                    </div>


                    {/* QUESTION BUILDER */}

                    {isDraft && (

                      <form
                        onSubmit={(event) =>
                          saveQuestion(
                            event,
                            section.id
                          )
                        }
                        className="mt-6 border-t border-slate-100 pt-6"
                      >

                        <div className="flex flex-wrap items-center justify-between gap-3">

                          <div>

                            <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-600">
                              {editingQuestionId
                                ? "Edit question"
                                : "Question builder"}
                            </p>

                            <h4 className="mt-1 text-lg font-black">
                              Google Forms-style question
                            </h4>

                          </div>

                          {editingQuestionId && (

                            <button
                              type="button"
                              onClick={() => {

                                setEditingQuestionId(
                                  null
                                );

                                setQuestionForms(
                                  (current) => ({
                                    ...current,
                                    [section.id]:
                                      getEmptyQuestion()
                                  })
                                );

                              }}
                              className="text-sm font-bold text-muted-foreground"
                            >
                              Cancel edit
                            </button>

                          )}

                        </div>


                        {/* QUESTION TEXT */}

                        <textarea
                          required
                          rows="3"
                          placeholder="Enter your question"
                          value={
                            questionForm.questionText
                          }
                          onChange={(event) =>
                            updateQuestionForm(
                              section.id,
                              {
                                questionText:
                                  event.target.value
                              }
                            )
                          }
                          className="mt-4 w-full rounded-xl border border-border px-4 py-3 bg-background text-foreground outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-muted-foreground"
                        />


                        {/* QUESTION TYPE */}

                        <div className="mt-4 grid gap-4 md:grid-cols-2">

                          <label className="text-sm font-bold text-foreground">

                            Answer type

                            <Select
                              value={
                                questionForm.questionType
                              }
                              onValueChange={(type) => {
                                updateQuestionForm(
                                  section.id,
                                  {
                                    questionType: type,
                                    options: type === "mcq"
                                      ? (questionForm.options?.length >= 2 ? questionForm.options : getEmptyQuestion().options)
                                      : []
                                  }
                                );
                              }}
                            >
                              <SelectTrigger className="mt-2 w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 h-auto text-base">
                                <SelectValue placeholder="Answer type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mcq">Multiple Choice</SelectItem>
                                <SelectItem value="short_answer">Short Answer</SelectItem>
                                <SelectItem value="long_answer">Long Answer</SelectItem>
                              </SelectContent>
                            </Select>

                          </label>


                          <label className="text-sm font-bold text-foreground">

                            Marks

                            <input
                              required
                              min="1"
                              type="number"
                              value={
                                questionForm.marks
                              }
                              onChange={(event) =>
                                updateQuestionForm(
                                  section.id,
                                  {
                                    marks:
                                      event.target.value
                                  }
                                )
                              }
                              className="mt-2 w-full rounded-xl border border-border px-4 py-3 bg-background text-foreground outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-muted-foreground"
                            />

                          </label>

                        </div>


                        {/* IMAGE */}

                        <div className="mt-5 rounded-xl border border-dashed border-border bg-muted p-4">

                          <div className="flex flex-wrap items-center justify-between gap-3">

                            <div>

                              <p className="text-sm font-black">
                                Add image
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                JPG, PNG, WEBP · Maximum 2 MB
                              </p>

                            </div>

                            <label className="cursor-pointer rounded-lg bg-card text-card-foreground px-4 py-2 text-sm font-black text-foreground shadow-sm">

                              Choose image

                              <input
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                  handleImageChange(
                                    section.id,
                                    event
                                  )
                                }
                                className="hidden"
                              />

                            </label>

                          </div>


                          {questionForm.questionImageUrl && (

                            <div className="mt-4">

                              <img
                                src={
                                  questionForm.questionImageUrl
                                }
                                alt="Question preview"
                                className="max-h-48 rounded-xl border border-border object-contain"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuestionForm(
                                    section.id,
                                    {
                                      questionImageUrl:
                                        ""
                                    }
                                  )
                                }
                                className="mt-2 text-xs font-black text-red-600"
                              >
                                Remove image
                              </button>

                            </div>

                          )}

                        </div>


                        {/* MCQ OPTIONS */}

                        {questionForm.questionType ===
                          "mcq" && (

                          <div className="mt-5 rounded-xl border border-border p-4">

                            <div className="flex items-center justify-between">

                              <div>

                                <p className="text-sm font-black">
                                  Options
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  Select exactly one correct answer.
                                </p>

                              </div>

                              <button
                                type="button"
                                disabled={
                                  questionForm.options.length >=
                                  6
                                }
                                onClick={() =>
                                  addOption(
                                    section.id
                                  )
                                }
                                className="rounded-lg bg-primary px-3 py-2 text-xs font-black text-primary-foreground disabled:opacity-40"
                              >
                                + Add option
                              </button>

                            </div>


                            <div className="mt-4 space-y-3">

                              {questionForm.options.map(
                                (
                                  option,
                                  index
                                ) => (

                                  <div
                                    key={
                                      option.key
                                    }
                                    className="flex items-center gap-3"
                                  >

                                    <input
                                      type="radio"
                                      name={`correct-${section.id}`}
                                      checked={
                                        option.isCorrect
                                      }
                                      onChange={() =>
                                        updateQuestionForm(
                                          section.id,
                                          {
                                            options:
                                              questionForm.options.map(
                                                (
                                                  item,
                                                  itemIndex
                                                ) => ({
                                                  ...item,
                                                  isCorrect:
                                                    itemIndex ===
                                                    index
                                                })
                                              )
                                          }
                                        )
                                      }
                                    />

                                    <span className="w-6 text-sm font-black">
                                      {
                                        option.key
                                      }
                                    </span>

                                    <input
                                      required
                                      placeholder={`Option ${option.key}`}
                                      value={
                                        option.text
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateOption(
                                          section.id,
                                          index,
                                          {
                                            text:
                                              event
                                                .target
                                                .value
                                          }
                                        )
                                      }
                                      className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 bg-background text-foreground outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-muted-foreground"
                                    />

                                    {questionForm.options.length >
                                      2 && (

                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeOption(
                                            section.id,
                                            index
                                          )
                                        }
                                        className="text-xs font-black text-red-600"
                                      >
                                        Remove
                                      </button>

                                    )}

                                  </div>

                                )
                              )}

                            </div>

                          </div>

                        )}


                        {/* SHORT ANSWER PREVIEW */}

                        {questionForm.questionType ===
                          "short_answer" && (

                          <div className="mt-5 rounded-xl border border-border bg-muted p-4">

                            <p className="text-sm font-black">
                              Student response
                            </p>

                            <input
                              disabled
                              placeholder="Short answer"
                              className="mt-3 w-full rounded-lg border border-border bg-card text-card-foreground px-3 py-2"
                            />

                          </div>

                        )}


                        {/* LONG ANSWER PREVIEW */}

                        {questionForm.questionType ===
                          "long_answer" && (

                          <div className="mt-5 rounded-xl border border-border bg-muted p-4">

                            <p className="text-sm font-black">
                              Student response
                            </p>

                            <textarea
                              disabled
                              rows="4"
                              placeholder="Long answer"
                              className="mt-3 w-full rounded-lg border border-border bg-card text-card-foreground px-3 py-2"
                            />

                          </div>

                        )}


                        <div className="mt-5 flex justify-end">

                          <button
                            disabled={saving}
                            className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground hover:bg-primary disabled:opacity-50"
                          >
                            {editingQuestionId
                              ? "Update question"
                              : "Add question"}
                          </button>

                        </div>

                      </form>

                    )}

                  </article>

                );

              }
            )}


            {!sections.length && (

              <div className="rounded-2xl bg-card text-card-foreground p-10 text-center text-sm font-semibold text-muted-foreground">
                Add a section to start building this assessment.
              </div>

            )}

          </div>

        </section>

      </main>

    </div>

  );

}