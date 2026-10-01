import {
  useEffect,
  useMemo,
  useState
} from "react";

import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getAssessmentForSession,
  getPublishedAssessment,
  getTestByIdPublic,
  saveAssessmentAnswersBatch,
  startAssessment,
  submitAssessment
} from "../services/threeQApi.js";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* =========================================================
   CONSTANTS
   ========================================================= */

const BRANCHES = [
  "Computer Engineering",
  "Information Technology",
  "Computer Science & Engineering (AI)",
  "Computer Science & Engineering (AIML)",
  "Artificial Intelligence and Data Science",
  "Computer Engineering (Software Engineering)",
  "Computer Science & Engineering (DS)",
  "Computer Science & Engineering (IoT & Cybersecurity including Blockchain Technology)",
  "Electronics & Tele Communication Engineering",
  "Instrumentation & Control Engineering",
  "Mechanical Engineering",
  "Civil Engineering"
];

const DIVISIONS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L"
];

const CAMPUSES = [
  "VIT Bibwewadi",
  "VIT Kondhwa"
];

const LIVING_OPTIONS = [
  "Hostel",
  "PG/flat",
  "Native"
];

const initialParticipant = {
  name: "",
  branch: "",
  division: "",
  prn: "",
  collegeEmail: "",
  mobileNumber: "",
  campus: "",
  livingAt: "",
  gender: ""
};

/* =========================================================
   HELPERS
   ========================================================= */

function isAnswerProvided(answer) {
  if (!answer) {
    return false;
  }

  if (
    answer.selectedOptionId !== null &&
    answer.selectedOptionId !== undefined
  ) {
    return true;
  }

  if (
    typeof answer.answerText === "string" &&
    answer.answerText.trim().length > 0
  ) {
    return true;
  }

  return false;
}

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(
    0,
    Number(totalSeconds) || 0
  );

  const hours = Math.floor(
    safeSeconds / 3600
  );

  const minutes = Math.floor(
    (safeSeconds % 3600) / 60
  );

  const seconds =
    safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

function getQuestionType(question) {
  return (
    question?.questionType ||
    "mcq"
  ).toLowerCase();
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function GiveTest() {
  const navigate = useNavigate();
  const { testId } = useParams();

  const [assessment, setAssessment] =
    useState(null);

  const [participant, setParticipant] =
    useState(initialParticipant);

  const [sessionId, setSessionId] =
    useState("");

  const [expiresAt, setExpiresAt] =
    useState(null);

  const [answers, setAnswers] =
    useState({});

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [savingQuestionId, setSavingQuestionId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [currentSectionIndex, setCurrentSectionIndex] =
    useState(0);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    description: ""
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [remainingSeconds, setRemainingSeconds] =
    useState(null);

  const [timeExpired, setTimeExpired] =
    useState(false);

  /* =======================================================
     QUESTIONS
     ======================================================= */

  const sections =
    assessment?.sections || [];

  const questions = useMemo(
    () =>
      sections.flatMap(
        (section) =>
          section.questions || []
      ),
    [sections]
  );

  const nonEmptySections = useMemo(
    () =>
      sections
        .map((section, index) => ({
          section,
          index
        }))
        .filter(
          ({ section }) =>
            (section.questions || []).length > 0
        ),
    [sections]
  );

  const currentSection =
    sections[currentSectionIndex] || null;

  const currentQuestions =
    currentSection?.questions || [];

  const currentQuestion =
    currentQuestions[currentQuestionIndex] ||
    null;

  /* =======================================================
     TOTAL ANSWERED
     ======================================================= */

  const answeredCount = useMemo(() => {
    return questions.filter((question) =>
      isAnswerProvided(
        answers[question.id]
      )
    ).length;
  }, [answers, questions]);

  /* =======================================================
     INITIAL ASSESSMENT LOAD
     ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadAssessment() {
      try {
        setLoading(true);
        setError("");

        let response;
        if (testId) {
          response = await getTestByIdPublic(testId);
        } else {
          response = await getPublishedAssessment();
        }

        if (!mounted) {
          return;
        }

        setAssessment(
          response?.data || null
        );
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        setError(
          requestError?.message ||
          "Assessment will be live on 2nd of October, from 6 AM to 11 PM."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAssessment();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     ENSURE CURRENT SECTION HAS QUESTIONS
     ======================================================= */

  useEffect(() => {
    if (!sessionId || !sections.length) {
      return;
    }

    const currentHasQuestions =
      currentQuestions.length > 0;

    if (currentHasQuestions) {
      if (
        currentQuestionIndex >=
        currentQuestions.length
      ) {
        setCurrentQuestionIndex(0);
      }

      return;
    }

    const firstAvailable =
      nonEmptySections[0];

    if (firstAvailable) {
      setCurrentSectionIndex(
        firstAvailable.index
      );

      setCurrentQuestionIndex(0);
    }
  }, [
    sessionId,
    sections,
    currentQuestions.length,
    currentQuestionIndex,
    nonEmptySections
  ]);

  /* =======================================================
     TIMER
     ======================================================= */

  useEffect(() => {
    if (!sessionId || !expiresAt) {
      return undefined;
    }

    function updateTimer() {
      const difference =
        new Date(expiresAt).getTime() -
        Date.now();

      const seconds = Math.max(
        0,
        Math.ceil(
          difference / 1000
        )
      );

      setRemainingSeconds(seconds);

      if (seconds <= 0) {
        setTimeExpired(true);
      }
    }

    updateTimer();

    const interval =
      window.setInterval(
        updateTimer,
        1000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [sessionId, expiresAt]);

  /* =======================================================
     AUTO SUBMIT WHEN TIMER EXPIRES
     ======================================================= */

  useEffect(() => {
    if (
      !timeExpired ||
      !sessionId ||
      result ||
      submitting
    ) {
      return;
    }

    async function autoSubmit() {
      try {
        setSubmitting(true);
        setError("");

        const answersArray = Object.entries(answers).map(([questionId, ans]) => ({
          questionId,
          selectedOptionId: ans.selectedOptionId,
          answerText: ans.answerText
        }));

        if (answersArray.length > 0) {
          await saveAssessmentAnswersBatch(sessionId, answersArray);
        }

        const response =
          await submitAssessment(
            sessionId
          );

        setResult(
          response?.data || null
        );

        sessionStorage.removeItem(
          "c_cube_three_q_session"
        );
      } catch (requestError) {
        setError(
          requestError?.message ||
          "Time expired and automatic submission failed. Please try submitting again."
        );

        setTimeExpired(false);
      } finally {
        setSubmitting(false);
      }
    }

    autoSubmit();
  }, [
    timeExpired,
    sessionId,
    result,
    submitting
  ]);

  /* =======================================================
     START TEST
     ======================================================= */

  async function handleStart(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const response =
        await startAssessment(
          participant
        );

      const newSessionId =
        response?.data?.sessionId;

      const session =
        response?.data;

      if (!newSessionId) {
        throw new Error(
          "The server did not return a valid session."
        );
      }

      const testResponse =
        await getAssessmentForSession(
          newSessionId
        );

      const test =
        testResponse?.data?.test ||
        assessment;

      setSessionId(
        newSessionId
      );

      setExpiresAt(
        session?.expiresAt ||
        null
      );

      setRemainingSeconds(
        session?.remainingSeconds ??
        null
      );

      setAssessment(test);

      setAnswers({});

      const firstAvailableSection =
        (test?.sections || [])
          .map((section, index) => ({
            section,
            index
          }))
          .find(
            ({ section }) =>
              (section.questions || []).length > 0
          );

      setCurrentSectionIndex(
        firstAvailableSection?.index ?? 0
      );

      setCurrentQuestionIndex(0);

      sessionStorage.setItem(
        "c_cube_three_q_session",
        JSON.stringify({
          sessionId:
            newSessionId,
          expiresAt:
            session?.expiresAt ||
            null
        })
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
        "Unable to start the assessment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =======================================================
     UPDATE PARTICIPANT FIELD
     ======================================================= */

  function updateParticipant(
    field,
    value
  ) {
    setParticipant(
      (current) => ({
        ...current,
        [field]: value
      })
    );
  }

  /* =======================================================
     SAVE ANSWER
     ======================================================= */

  async function saveAnswer(
    question,
    selectedOptionId = null,
    answerText = null
  ) {
    if (
      !sessionId ||
      !question
    ) {
      return false;
    }

    const normalizedText =
      typeof answerText === "string"
        ? answerText
        : null;

    setAnswers(
      (current) => ({
        ...current,
        [question.id]: {
          selectedOptionId:
            selectedOptionId ??
            null,
          answerText:
            normalizedText ?? ""
        }
      })
    );

    return true;
  }

  /* =======================================================
     MCQ ANSWER
     ======================================================= */

  async function chooseAnswer(
    question,
    optionId
  ) {
    if (
      submitting ||
      savingQuestionId
    ) {
      return;
    }

    await saveAnswer(
      question,
      optionId,
      null
    );
  }

  /* =======================================================
     TEXT ANSWER CHANGE
     ======================================================= */

  function updateTextAnswer(
    questionId,
    value
  ) {
    setAnswers(
      (current) => ({
        ...current,
        [questionId]: {
          selectedOptionId: null,
          answerText: value
        }
      })
    );
  }

  /* =======================================================
     SAVE TEXT ANSWER ON BLUR
     ======================================================= */

  async function handleTextBlur(
    question
  ) {
    const currentAnswer =
      answers[question.id];

    const text =
      currentAnswer?.answerText ||
      "";

    if (!text.trim()) {
      return;
    }

    await saveAnswer(
      question,
      null,
      text
    );
  }

  /* =======================================================
     NAVIGATION HELPERS
     ======================================================= */

  function findNextAvailableSection(
    fromIndex
  ) {
    for (
      let index = fromIndex + 1;
      index < sections.length;
      index += 1
    ) {
      if (
        (sections[index]?.questions || [])
          .length > 0
      ) {
        return index;
      }
    }

    return -1;
  }

  function findPreviousAvailableSection(
    fromIndex
  ) {
    for (
      let index = fromIndex - 1;
      index >= 0;
      index -= 1
    ) {
      if (
        (sections[index]?.questions || [])
          .length > 0
      ) {
        return index;
      }
    }

    return -1;
  }

  function goToNextQuestion() {
    if (
      currentQuestionIndex <
      currentQuestions.length - 1
    ) {
      setCurrentQuestionIndex(
        (current) => current + 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      return;
    }

    const nextSectionIndex =
      findNextAvailableSection(
        currentSectionIndex
      );

    if (nextSectionIndex !== -1) {
      setCurrentSectionIndex(
        nextSectionIndex
      );

      setCurrentQuestionIndex(0);

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }

  function goToPreviousQuestion() {
    if (
      currentQuestionIndex > 0
    ) {
      setCurrentQuestionIndex(
        (current) => current - 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      return;
    }

    const previousSectionIndex =
      findPreviousAvailableSection(
        currentSectionIndex
      );

    if (previousSectionIndex !== -1) {
      const previousSection =
        sections[
        previousSectionIndex
        ];

      setCurrentSectionIndex(
        previousSectionIndex
      );

      setCurrentQuestionIndex(
        Math.max(
          0,
          (previousSection?.questions
            ?.length || 1) - 1
        )
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }

  function jumpToQuestion(
    sectionIndex,
    questionIndex
  ) {
    const section =
      sections[sectionIndex];

    if (
      !section ||
      !(section.questions || []).length
    ) {
      return;
    }

    setCurrentSectionIndex(
      sectionIndex
    );

    setCurrentQuestionIndex(
      questionIndex
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  /* =======================================================
     SUBMIT
     ======================================================= */

  async function handleSubmit(
    force = false
  ) {
    if (
      !sessionId ||
      submitting
    ) {
      return;
    }

    /*
      If the current question is a text question,
      save its latest value before submitting.
    */
    if (
      currentQuestion &&
      getQuestionType(
        currentQuestion
      ) !== "mcq"
    ) {
      const currentAnswer =
        answers[
        currentQuestion.id
        ];

      const text =
        currentAnswer?.answerText ||
        "";

      if (text.trim()) {
        const saved =
          await saveAnswer(
            currentQuestion,
            null,
            text
          );

        if (!saved) {
          return;
        }
      }
    }

    if (!force) {
      const unanswered =
        questions.length -
        answeredCount;

      let description = "Are you sure you want to submit the assessment? You will not be able to change your answers after submission.";
      
      if (unanswered > 0) {
        description = `${unanswered} question${unanswered === 1 ? "" : "s"} ${unanswered === 1 ? "is" : "are"} unanswered. Do you want to submit anyway? You will not be able to change your answers after submission.`;
      }

      setConfirmDialog({
        isOpen: true,
        title: "Submit Assessment",
        description
      });
      return;
    }

    executeSubmit();
  }

  async function executeSubmit() {
    try {
      setSubmitting(true);
      setError("");

      const answersArray = Object.entries(answers).map(([questionId, ans]) => ({
        questionId,
        selectedOptionId: ans.selectedOptionId,
        answerText: ans.answerText
      }));

      if (answersArray.length > 0) {
        await saveAssessmentAnswersBatch(sessionId, answersArray);
      }

      const response =
        await submitAssessment(
          sessionId
        );

      setResult(
        response?.data || null
      );

      sessionStorage.removeItem(
        "c_cube_three_q_session"
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
        "Unable to submit the assessment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <Shell>
        <LoadingState
          text="Checking for an active assessment..."
        />
      </Shell>
    );
  }

  /* =======================================================
     NO ASSESSMENT OR UNPUBLISHED
     ======================================================= */

  if (!assessment || assessment.status !== "published") {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-sm mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>

          <h1 className="mt-2 text-3xl font-black text-foreground md:text-4xl">
            Assessment Not Active Yet
          </h1>

          <div className="mt-6 max-w-lg rounded-2xl bg-card p-6 shadow-sm border border-slate-100">
            <p className="text-lg font-medium leading-relaxed text-foreground">
              {assessment?.status === "draft" && assessment?.live_message
                ? assessment.live_message
                : "The test will begin tomorrow on 2nd of October from 6 PM to 11 PM."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-10 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground transition hover:bg-primary hover:-translate-y-0.5 shadow-lg shadow-slate-900/20"
          >
            Return to website
          </button>
        </div>
      </Shell>
    );
  }

  /* =======================================================
     RESULT
     ======================================================= */

  if (result) {
    const whatsappLink = participant.gender === 'female' 
      ? "https://chat.whatsapp.com/FI23Jnp9pNZFObYHApsGfQ"
      : "https://chat.whatsapp.com/DErjW6JXHC71L5RqTduT72";

    return (
      <Shell>
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl text-blue-600 mb-6 shadow-sm">
            ✓
          </div>

          <h1 className="font-display text-4xl font-black tracking-tight text-foreground mb-4">
            Test Submitted Successfully!
          </h1>

          <p className="text-lg leading-7 text-muted-foreground max-w-xl mb-8">
            Thank you for completing the 3Q Online Assessment. Your responses have been recorded.
            To receive your results and stay updated on further steps, please join your designated WhatsApp group below.
          </p>

          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-primary-foreground shadow-md hover:bg-blue-700 transition-all hover:-translate-y-1"
          >
            Join WhatsApp Group for Results
          </a>
        </div>
      </Shell>
    );
  }

  /* =======================================================
     REGISTRATION
     ======================================================= */

  if (!sessionId) {
    return (
      <Shell>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
            3Q Online Assessment
          </p>

          <h1 className="mt-3 font-display text-4xl font-black tracking-[-0.04em] text-foreground">
            {assessment.title}
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            {assessment.description ||
              "Complete this assessment thoughtfully. Enter your official student details before starting."}
          </p>
        </div>

        <Alert className="mt-8 border-emerald-200 bg-emerald-50/50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-500">
          <AlertTitle className="font-black flex items-center gap-2">
            <span className="text-lg">ⓘ</span> Before you begin
          </AlertTitle>
          <AlertDescription className="mt-1 text-emerald-800 dark:text-emerald-400">
            Please make sure your details are correct. Once the assessment starts, the timer will begin immediately.
          </AlertDescription>
        </Alert>

        <form
          onSubmit={handleStart}
          className="mt-8 grid gap-5 sm:grid-cols-2"
        >
          <FormField
            label="Full name"
            required
          >
            <input
              required
              value={participant.name}
              onChange={(event) =>
                updateParticipant(
                  "name",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Enter your full name"
            />
          </FormField>

          <FormField
            label="PRN"
            required
          >
            <input
              required
              value={participant.prn}
              onChange={(event) =>
                updateParticipant(
                  "prn",
                  event.target.value.trimStart()
                )
              }
              className={inputClass}
              placeholder="Enter your PRN"
            />
          </FormField>

          <FormField
            label="Branch"
            required
          >
            <Select value={participant.branch} onValueChange={(value) => updateParticipant("branch", value)} required>
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="Select your branch" />
              </SelectTrigger>
              <SelectContent>
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Division"
            required
          >
            <Select value={participant.division} onValueChange={(value) => updateParticipant("division", value)} required>
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="Select division" />
              </SelectTrigger>
              <SelectContent>
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Official VIT email"
            required
          >
            <input
              required
              type="email"
              value={
                participant.collegeEmail
              }
              onChange={(event) =>
                updateParticipant(
                  "collegeEmail",
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="yourname@vit.edu"
            />
          </FormField>

          <FormField
            label="Mobile number"
            required
          >
            <input
              required
              type="tel"
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              maxLength={10}
              value={
                participant.mobileNumber
              }
              onChange={(event) =>
                updateParticipant(
                  "mobileNumber",
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10)
                )
              }
              className={inputClass}
              placeholder="10-digit mobile number"
              title="Enter a 10-digit mobile number beginning with 6, 7, 8, or 9."
            />
          </FormField>

          <FormField
            label="Campus"
            required
          >
            <Select value={participant.campus} onValueChange={(value) => updateParticipant("campus", value)} required>
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="Select campus" />
              </SelectTrigger>
              <SelectContent>
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Living at"
            required
          >
            <Select value={participant.livingAt} onValueChange={(value) => updateParticipant("livingAt", value)} required>
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="Select where you live" />
              </SelectTrigger>
              <SelectContent>
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Gender"
            required
          >
            <Select value={participant.gender} onValueChange={(value) => updateParticipant("gender", value)} required>
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          {error && (
            <div className="sm:col-span-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="sm:col-span-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-black text-primary-foreground transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Starting assessment..."
              : "Start assessment"}
          </button>
        </form>
      </Shell>
    );
  }

  /* =======================================================
     TEST SCREEN
     ======================================================= */

  const currentAnswer =
    currentQuestion
      ? answers[currentQuestion.id]
      : null;

  const currentQuestionNumber =
    questions.findIndex(
      (question) =>
        question.id ===
        currentQuestion?.id
    ) + 1;

  const currentNonEmptySectionPosition =
    nonEmptySections.findIndex(
      ({ index }) =>
        index === currentSectionIndex
    );

  const isLastQuestion =
    currentNonEmptySectionPosition ===
    nonEmptySections.length - 1 &&
    currentQuestionIndex ===
    currentQuestions.length - 1;

  const timerDanger =
    remainingSeconds !== null &&
    remainingSeconds <= 300;

  /* =======================================================
     EMPTY TEST SAFETY
     ======================================================= */

  if (!questions.length) {
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
            !
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-amber-600">
            3Q Online Assessment
          </p>

          <h1 className="mt-3 text-3xl font-black text-foreground">
            Questions are not available
          </h1>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-muted-foreground">
            The assessment has been published,
            but no questions have been added yet.
            Please contact the administrator.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="mt-7 rounded-xl bg-primary px-6 py-3 text-sm font-black text-primary-foreground transition hover:bg-primary"
          >
            Return to website
          </button>
        </div>
      </Shell>
    );
  }

  /* =======================================================
     TEST UI
     ======================================================= */

  return (
    <Shell wide>
      {/* HEADER */}

      <div className="sticky top-3 z-20 rounded-2xl border border-slate-100 bg-card/95 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
              {assessment.title}
            </p>

            <h1 className="mt-1 text-xl font-black text-foreground">
              3Q Online Assessment
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-muted px-4 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                Progress
              </p>

              <p className="mt-0.5 text-sm font-black text-foreground">
                {answeredCount}/
                {questions.length}{" "}
                answered
              </p>
            </div>

            <div
              className={`rounded-xl px-4 py-2.5 ${timerDanger
                  ? "bg-red-50 text-red-700"
                  : "bg-emerald-50 text-emerald-700"
                }`}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-60">
                Time remaining
              </p>

              <p className="mt-0.5 font-mono text-lg font-black">
                {remainingSeconds !==
                  null
                  ? formatTime(
                    remainingSeconds
                  )
                  : "--:--"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700">
          {error}
        </div>
      )}

      {/* SECTION NAVIGATION */}

      <div className="mt-6 overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {nonEmptySections.map(
            ({
              section,
              index: sectionIndex
            }) => {
              const sectionQuestions =
                section.questions || [];

              const sectionAnswered =
                sectionQuestions.filter(
                  (question) =>
                    isAnswerProvided(
                      answers[
                      question.id
                      ]
                    )
                ).length;

              const active =
                sectionIndex ===
                currentSectionIndex;

              const disabled =
                sectionQuestions.length ===
                0;

              return (
                <button
                  type="button"
                  key={section.id}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) {
                      return;
                    }

                    setCurrentSectionIndex(
                      sectionIndex
                    );

                    setCurrentQuestionIndex(
                      0
                    );

                    window.scrollTo({
                      top: 0,
                      behavior: "smooth"
                    });
                  }}
                  className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${active
                      ? "bg-primary text-primary-foreground"
                      : disabled
                        ? "cursor-not-allowed bg-muted text-slate-300"
                        : "border border-border bg-card text-muted-foreground hover:bg-muted/50"
                    }`}
                >
                  {section.name}

                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${active
                        ? "bg-card/15"
                        : "bg-muted"
                      }`}
                  >
                    {sectionAnswered}/
                    {sectionQuestions.length}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* QUESTION NAVIGATOR */}

      {currentSection &&
        currentQuestions.length > 0 && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap gap-2">
              {currentQuestions.map(
                (
                  question,
                  questionIndex
                ) => {
                  const answered =
                    isAnswerProvided(
                      answers[
                      question.id
                      ]
                    );

                  const active =
                    questionIndex ===
                    currentQuestionIndex;

                  return (
                    <button
                      type="button"
                      key={question.id}
                      onClick={() =>
                        jumpToQuestion(
                          currentSectionIndex,
                          questionIndex
                        )
                      }
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-black transition ${active
                          ? "bg-emerald-600 text-primary-foreground"
                          : answered
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-muted text-muted-foreground hover:bg-muted"
                        }`}
                    >
                      {questionIndex + 1}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        )}

      {/* QUESTION */}

      {currentQuestion ? (
        <article className="mt-6 rounded-[2rem] border border-slate-100 bg-card p-5 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                {currentSection?.name}
              </p>

              <p className="mt-1 text-sm font-bold text-muted-foreground">
                Question{" "}
                {currentQuestionNumber}{" "}
                of{" "}
                {questions.length}
              </p>
            </div>

            <div className="rounded-full bg-muted px-3 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-muted-foreground">
              {getQuestionType(
                currentQuestion
              ) === "mcq"
                ? "MCQ"
                : getQuestionType(
                  currentQuestion
                ) === "short_answer"
                  ? "Short Answer"
                  : "Long Answer"}
            </div>
          </div>

          <div className="mt-7">
            <h2 className="text-xl font-black leading-8 text-foreground sm:text-2xl">
              {currentQuestion.questionText}
            </h2>

            {currentQuestion.questionImageUrl && (
              <div className="mt-6 flex justify-center">
                <img
                  src={
                    currentQuestion.questionImageUrl
                  }
                  alt={`Question ${currentQuestion.questionNumber}`}
                  className="max-h-[280px] sm:max-h-[360px] max-w-full object-contain"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              </div>
            )}

            <div className="mt-2 text-xs font-bold text-slate-400">
              {currentQuestion.marks}{" "}
              {Number(
                currentQuestion.marks
              ) === 1
                ? "mark"
                : "marks"}
            </div>
          </div>

          {/* MCQ */}

          {getQuestionType(
            currentQuestion
          ) === "mcq" && (
              <div className="mt-7 grid gap-3">
                {(
                  currentQuestion.options ||
                  []
                ).map((option) => {
                  const selected =
                    Number(
                      currentAnswer?.selectedOptionId
                    ) ===
                    Number(option.id);

                  return (
                    <button
                      type="button"
                      key={option.id}
                      disabled={
                        submitting ||
                        savingQuestionId ===
                        currentQuestion.id
                      }
                      onClick={() =>
                        chooseAnswer(
                          currentQuestion,
                          option.id
                        )
                      }
                      className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${selected
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-border bg-card hover:border-border hover:bg-muted/50"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${selected
                            ? "bg-emerald-600 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                          }`}
                      >
                        {option.key}
                      </span>

                      <span className="pt-1 text-sm font-semibold leading-6 text-foreground">
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

          {/* SHORT ANSWER */}

          {getQuestionType(
            currentQuestion
          ) === "short_answer" && (
              <div className="mt-7">
                <textarea
                  rows={5}
                  value={
                    currentAnswer?.answerText ||
                    ""
                  }
                  onChange={(event) =>
                    updateTextAnswer(
                      currentQuestion.id,
                      event.target.value
                    )
                  }
                  onBlur={() =>
                    handleTextBlur(
                      currentQuestion
                    )
                  }
                  disabled={submitting}
                  placeholder="Write your answer here..."
                  className="w-full resize-y rounded-2xl border border-border bg-card px-4 py-4 text-sm font-medium leading-7 text-foreground outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-muted/50"
                />

                <p className="mt-2 text-xs font-semibold text-slate-400">
                  Your answer is saved when you
                  leave this field.
                </p>
              </div>
            )}

          {/* LONG ANSWER */}

          {getQuestionType(
            currentQuestion
          ) === "long_answer" && (
              <div className="mt-7">
                <textarea
                  rows={10}
                  value={
                    currentAnswer?.answerText ||
                    ""
                  }
                  onChange={(event) =>
                    updateTextAnswer(
                      currentQuestion.id,
                      event.target.value
                    )
                  }
                  onBlur={() =>
                    handleTextBlur(
                      currentQuestion
                    )
                  }
                  disabled={submitting}
                  placeholder="Write your detailed answer here..."
                  className="w-full resize-y rounded-2xl border border-border bg-card px-4 py-4 text-sm font-medium leading-7 text-foreground outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-muted/50"
                />

                <p className="mt-2 text-xs font-semibold text-slate-400">
                  Your answer is saved when you
                  leave this field.
                </p>
              </div>
            )}

          {/* NAVIGATION */}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={
                submitting ||
                (
                  currentSectionIndex ===
                  nonEmptySections[0]?.index &&
                  currentQuestionIndex ===
                  0
                )
              }
              onClick={
                goToPreviousQuestion
              }
              className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-black text-foreground transition hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            <div className="text-center text-xs font-bold text-slate-400">
              {savingQuestionId ===
                currentQuestion.id
                ? "Saving answer..."
                : isAnswerProvided(
                  currentAnswer
                )
                  ? "Answer saved"
                  : "Not answered"}
            </div>

            {!isLastQuestion ? (
              <button
                type="button"
                disabled={
                  submitting ||
                  savingQuestionId !==
                  null
                }
                onClick={
                  goToNextQuestion
                }
                className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                disabled={
                  submitting ||
                  savingQuestionId !==
                  null
                }
                onClick={() =>
                  handleSubmit(false)
                }
                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-primary-foreground transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit assessment"}
              </button>
            )}
          </div>
        </article>
      ) : (
        <div className="mt-6 rounded-[2rem] border border-amber-100 bg-amber-50 p-8 text-center">
          <h2 className="text-xl font-black text-foreground">
            No questions in this section
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This section does not contain
            questions yet. Please select another
            section.
          </p>
        </div>
      )}

      {/* BOTTOM SUBMIT */}

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          disabled={
            submitting ||
            savingQuestionId !==
            null
          }
          onClick={() =>
            handleSubmit(false)
          }
          className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-black text-foreground transition hover:border-border hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "Submitting..."
            : "Submit assessment"}
        </button>
      </div>

      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={(isOpen) =>
          setConfirmDialog({ ...confirmDialog, isOpen })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.title}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 sm:justify-end gap-2">
            <button
              onClick={() =>
                setConfirmDialog({ ...confirmDialog, isOpen: false })
              }
              className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted/50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setConfirmDialog({ ...confirmDialog, isOpen: false });
                executeSubmit();
              }}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-blue-700"
            >
              OK
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}

/* =========================================================
   REUSABLE UI
   ========================================================= */

function Shell({
  children,
  wide = false
}) {
  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10">
      <div
        className={`mx-auto ${wide
            ? "max-w-6xl"
            : "max-w-4xl"
          }`}
      >
        <div className="rounded-[2rem] bg-card p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          {children}
        </div>
      </div>
    </main>
  );
}

function LoadingState({
  text
}) {
  const [loadingText, setLoadingText] = useState(text);

  useEffect(() => {
    const originalText = text;
    const timeouts = [
      setTimeout(() => setLoadingText("Waking up server (this may take a few seconds in dev)..."), 3000),
      setTimeout(() => setLoadingText("Compiling backend routes..."), 8000),
      setTimeout(() => setLoadingText("Almost ready..."), 15000),
    ];

    return () => {
      timeouts.forEach(clearTimeout);
      setLoadingText(originalText);
    };
  }, [text]);

  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-emerald-600" />

      <p className="mt-5 font-bold text-muted-foreground transition-opacity duration-300">
        {loadingText}
      </p>
    </div>
  );
}

function FormField({
  label,
  required = false,
  children
}) {
  return (
    <label className="text-sm font-bold text-foreground">
      <span>
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

function ResultStat({
  label,
  value
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-muted/50 p-5">
      <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-foreground">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   FORM STYLES
   ========================================================= */

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

const selectClass =
  "mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";