import { exec } from "./database.js";

export async function initializeDatabase() {
  await exec(`
    /* ============================================================
       CLUB INFORMATION
       ============================================================ */

    CREATE TABLE IF NOT EXISTS club_info (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      full_name TEXT NOT NULL,
      campus TEXT NOT NULL,
      audience TEXT NOT NULL,
      vision TEXT NOT NULL,
      mission TEXT NOT NULL,
      short_term_goal TEXT NOT NULL,
      long_term_goal TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );


    /* ============================================================
       OBJECTIVES
       ============================================================ */

    CREATE TABLE IF NOT EXISTS objectives (
      id SERIAL PRIMARY KEY,
      objective TEXT NOT NULL,
      sort_order INTEGER NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );


    /* ============================================================
       FACULTY MENTOR
       ============================================================ */

    CREATE TABLE IF NOT EXISTS faculty_mentor (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT,
      intro TEXT,
      image_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );


    /* ============================================================
       TEAM MEMBERS
       ============================================================ */

    CREATE TABLE IF NOT EXISTS team_members (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      branch TEXT,
      year TEXT,
      position TEXT NOT NULL,
      image_url TEXT,
      color TEXT,
      intro TEXT,
      sort_order INTEGER NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );


    /* ============================================================
       EVENTS
       ============================================================ */

    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      date_text TEXT NOT NULL,
      short_date TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      objective TEXT NOT NULL,
      accent TEXT NOT NULL,
      image_url TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );


    /* ============================================================
       EVENT GLIMPSES
       ============================================================ */

    CREATE TABLE IF NOT EXISTS event_glimpses (
      id SERIAL PRIMARY KEY,
      event_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
    );


    /* ============================================================
       GALLERY
       ============================================================ */

    CREATE TABLE IF NOT EXISTS gallery (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      image_url TEXT NOT NULL,
      event_id INTEGER,
      caption TEXT,
      sort_order INTEGER NOT NULL,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE SET NULL
    );


    /* ============================================================
       CONTACTS
       ============================================================ */

    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );


    /* ============================================================
       ADMIN USERS
       ============================================================ */

    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin'
        CHECK (role IN ('admin', 'super_admin')),
      is_active INTEGER NOT NULL DEFAULT 1,
      last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );


    /* ============================================================
       3Q TESTS
       ============================================================ */

    CREATE TABLE IF NOT EXISTS three_q_tests (
      id SERIAL PRIMARY KEY,

      title TEXT NOT NULL,

      description TEXT,

      duration_seconds INTEGER NOT NULL,
      
      live_message TEXT,

      status TEXT NOT NULL
        CHECK (
          status IN (
            'draft',
            'published',
            'closed',
            'archived'
          )
        ),

      version INTEGER NOT NULL DEFAULT 1,

      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );


    /* ============================================================
       3Q SECTIONS
       ============================================================ */

    CREATE TABLE IF NOT EXISTS three_q_sections (
      id SERIAL PRIMARY KEY,

      test_id INTEGER NOT NULL,

      section_number INTEGER NOT NULL,

      name TEXT NOT NULL,

      description TEXT,

      question_limit INTEGER NOT NULL DEFAULT 10,

      sort_order INTEGER NOT NULL,

      FOREIGN KEY (test_id)
        REFERENCES three_q_tests(id)
        ON DELETE CASCADE,

      UNIQUE (
        test_id,
        section_number
      )
    );


    /* ============================================================
       3Q QUESTIONS
       
       question_type:
         mcq
         short_answer
         long_answer

       question_image_url:
         Optional image associated with question.
       ============================================================ */

    CREATE TABLE IF NOT EXISTS three_q_questions (
      id SERIAL PRIMARY KEY,

      section_id INTEGER NOT NULL,

      question_number INTEGER NOT NULL,

      question_text TEXT NOT NULL,

      question_type TEXT NOT NULL DEFAULT 'mcq'
        CHECK (
          question_type IN (
            'mcq',
            'short_answer',
            'long_answer'
          )
        ),

      question_image_url TEXT,

      marks INTEGER NOT NULL DEFAULT 1,

      is_active INTEGER NOT NULL DEFAULT 1,

      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (section_id)
        REFERENCES three_q_sections(id)
        ON DELETE CASCADE,

      UNIQUE (
        section_id,
        question_number
      )
    );


    /* ============================================================
       3Q OPTIONS
       
       Used primarily for MCQ questions.
       ============================================================ */

    CREATE TABLE IF NOT EXISTS three_q_options (
      id SERIAL PRIMARY KEY,

      question_id INTEGER NOT NULL,

      option_key TEXT NOT NULL,

      option_text TEXT NOT NULL,

      is_correct INTEGER NOT NULL DEFAULT 0,

      sort_order INTEGER NOT NULL,

      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (question_id)
        REFERENCES three_q_questions(id)
        ON DELETE CASCADE,

      UNIQUE (
        question_id,
        option_key
      )
    );


    /* ============================================================
       3Q PARTICIPANTS
       
       Student information:
         - Name
         - Branch
         - Division
         - PRN
         - College Email
         - Mobile
         - Campus
         - Living At
       ============================================================ */

    CREATE TABLE IF NOT EXISTS three_q_participants (
      id SERIAL PRIMARY KEY,

      name TEXT NOT NULL,

      branch TEXT NOT NULL,

      division TEXT NOT NULL,

      prn TEXT NOT NULL UNIQUE,

      college_email TEXT NOT NULL UNIQUE,

      mobile_number TEXT NOT NULL,

      campus TEXT NOT NULL,

      living_at TEXT NOT NULL,

      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );


    /* ============================================================
       3Q SESSIONS
       ============================================================ */

    CREATE TABLE IF NOT EXISTS three_q_sessions (
      id TEXT PRIMARY KEY,

      test_id INTEGER NOT NULL,

      participant_id INTEGER NOT NULL,

      started_at TIMESTAMPTZ NOT NULL,

      expires_at TIMESTAMPTZ NOT NULL,

      submitted_at TIMESTAMPTZ,

      status TEXT NOT NULL
        CHECK (
          status IN (
            'active',
            'submitted',
            'expired'
          )
        ),

      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (test_id)
        REFERENCES three_q_tests(id),

      FOREIGN KEY (participant_id)
        REFERENCES three_q_participants(id)
    );


    /* ============================================================
       3Q ANSWERS
       
       MCQ:
         selected_option_id is used.

       Short / Long Answer:
         answer_text is used.

       A participant can only have one answer
       for a particular question in a session.
       ============================================================ */

    CREATE TABLE IF NOT EXISTS three_q_answers (
      id SERIAL PRIMARY KEY,

      session_id TEXT NOT NULL,

      question_id INTEGER NOT NULL,

      selected_option_id INTEGER,

      answer_text TEXT,

      answered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (session_id)
        REFERENCES three_q_sessions(id)
        ON DELETE CASCADE,

      FOREIGN KEY (question_id)
        REFERENCES three_q_questions(id),

      FOREIGN KEY (selected_option_id)
        REFERENCES three_q_options(id),

      UNIQUE (
        session_id,
        question_id
      ),

      CHECK (
        selected_option_id IS NOT NULL
        OR answer_text IS NOT NULL
      )
    );


    /* ============================================================
       3Q RESULTS
       ============================================================ */

    CREATE TABLE IF NOT EXISTS three_q_results (
      id SERIAL PRIMARY KEY,

      session_id TEXT NOT NULL UNIQUE,

      test_id INTEGER NOT NULL,

      total_questions INTEGER NOT NULL,

      attempted_questions INTEGER NOT NULL,

      total_score INTEGER NOT NULL,

      section1_score INTEGER NOT NULL DEFAULT 0,

      section2_score INTEGER NOT NULL DEFAULT 0,

      section3_score INTEGER NOT NULL DEFAULT 0,

      submitted_at TIMESTAMPTZ NOT NULL,

      FOREIGN KEY (session_id)
        REFERENCES three_q_sessions(id),

      FOREIGN KEY (test_id)
        REFERENCES three_q_tests(id)
    );


    /* ============================================================
       3Q RETEST REQUESTS
       ============================================================ */

    CREATE TABLE IF NOT EXISTS three_q_retest_requests (
      id SERIAL PRIMARY KEY,

      test_id INTEGER NOT NULL,

      participant_id INTEGER NOT NULL,

      reason TEXT,

      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
          status IN (
            'pending',
            'approved',
            'rejected'
          )
        ),

      requested_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      reviewed_by_admin_id INTEGER,

      reviewed_at TIMESTAMPTZ,

      FOREIGN KEY (test_id)
        REFERENCES three_q_tests(id)
        ON DELETE CASCADE,

      FOREIGN KEY (participant_id)
        REFERENCES three_q_participants(id)
        ON DELETE CASCADE,

      FOREIGN KEY (reviewed_by_admin_id)
        REFERENCES admin_users(id)
        ON DELETE SET NULL,

      UNIQUE (
        test_id,
        participant_id
      )
    );


    /* ============================================================
       MIGRATION SUPPORT
       
       These statements make the schema safe when an older
       database already exists.
       ============================================================ */

    ALTER TABLE three_q_questions
      ADD COLUMN IF NOT EXISTS question_image_url TEXT;

    ALTER TABLE three_q_answers
      ADD COLUMN IF NOT EXISTS answer_text TEXT;

    ALTER TABLE three_q_participants
      ADD COLUMN IF NOT EXISTS campus TEXT;

    ALTER TABLE three_q_participants
      ADD COLUMN IF NOT EXISTS living_at TEXT;

    ALTER TABLE three_q_tests
      ADD COLUMN IF NOT EXISTS live_message TEXT;


    /* ============================================================
       MIGRATE EXISTING PARTICIPANTS
       ============================================================ */

    UPDATE three_q_participants
    SET campus = 'VIT Bibwewadi'
    WHERE campus IS NULL;

    UPDATE three_q_participants
    SET living_at = 'Native'
    WHERE living_at IS NULL;


    /* ============================================================
       PERFORMANCE INDEXES
       
       Important for high concurrent traffic.
       ============================================================ */

    CREATE INDEX IF NOT EXISTS idx_events_sort_order
      ON events(sort_order);

    CREATE INDEX IF NOT EXISTS idx_events_published_sort
      ON events(is_published, sort_order);

    CREATE INDEX IF NOT EXISTS idx_team_members_active_sort
      ON team_members(is_active, sort_order);

    CREATE INDEX IF NOT EXISTS idx_gallery_published_sort
      ON gallery(is_published, sort_order);

    CREATE INDEX IF NOT EXISTS idx_contacts_created
      ON contacts(created_at DESC);


    CREATE INDEX IF NOT EXISTS idx_event_glimpses_event
      ON event_glimpses(event_id);


    CREATE INDEX IF NOT EXISTS idx_gallery_sort_order
      ON gallery(sort_order);


    CREATE INDEX IF NOT EXISTS idx_gallery_event
      ON gallery(event_id);


    CREATE INDEX IF NOT EXISTS idx_admin_users_email
      ON admin_users(email);


    /* ============================================================
       PARTICIPANT INDEXES
       ============================================================ */

    CREATE INDEX IF NOT EXISTS idx_three_q_participants_prn
      ON three_q_participants(prn);


    CREATE INDEX IF NOT EXISTS idx_three_q_participants_email
      ON three_q_participants(college_email);


    CREATE INDEX IF NOT EXISTS idx_three_q_participants_branch
      ON three_q_participants(branch);


    CREATE INDEX IF NOT EXISTS idx_three_q_participants_division
      ON three_q_participants(division);


    CREATE INDEX IF NOT EXISTS idx_three_q_participants_campus
      ON three_q_participants(campus);


    CREATE INDEX IF NOT EXISTS idx_three_q_participants_living_at
      ON three_q_participants(living_at);


    /* ============================================================
       TEST INDEXES
       ============================================================ */

    CREATE INDEX IF NOT EXISTS idx_three_q_tests_status
      ON three_q_tests(status);


    CREATE INDEX IF NOT EXISTS idx_three_q_tests_version
      ON three_q_tests(version DESC);


    /* ============================================================
       SECTION INDEXES
       ============================================================ */

    CREATE INDEX IF NOT EXISTS idx_three_q_sections_test
      ON three_q_sections(test_id);


    CREATE INDEX IF NOT EXISTS idx_three_q_sections_test_sort
      ON three_q_sections(
        test_id,
        sort_order
      );


    /* ============================================================
       QUESTION INDEXES
       ============================================================ */

    CREATE INDEX IF NOT EXISTS idx_three_q_questions_section
      ON three_q_questions(section_id);


    CREATE INDEX IF NOT EXISTS idx_three_q_questions_section_number
      ON three_q_questions(
        section_id,
        question_number
      );


    CREATE INDEX IF NOT EXISTS idx_three_q_questions_type
      ON three_q_questions(question_type);


    CREATE INDEX IF NOT EXISTS idx_three_q_questions_active
      ON three_q_questions(is_active);


    /* ============================================================
       OPTION INDEXES
       ============================================================ */

    CREATE INDEX IF NOT EXISTS idx_three_q_options_question
      ON three_q_options(question_id);


    CREATE INDEX IF NOT EXISTS idx_three_q_options_question_sort
      ON three_q_options(
        question_id,
        sort_order
      );


    /* ============================================================
       SESSION INDEXES
       ============================================================ */

    CREATE INDEX IF NOT EXISTS idx_three_q_sessions_participant
      ON three_q_sessions(participant_id);


    CREATE INDEX IF NOT EXISTS idx_three_q_sessions_test
      ON three_q_sessions(test_id);


    CREATE INDEX IF NOT EXISTS idx_three_q_sessions_status
      ON three_q_sessions(status);


    CREATE INDEX IF NOT EXISTS idx_three_q_sessions_expires
      ON three_q_sessions(expires_at);


    CREATE INDEX IF NOT EXISTS idx_three_q_sessions_participant_test
      ON three_q_sessions(
        participant_id,
        test_id
      );


    CREATE INDEX IF NOT EXISTS idx_three_q_sessions_active
      ON three_q_sessions(
        participant_id,
        test_id,
        status
      )
      WHERE status = 'active';


    /* ============================================================
       ANSWER INDEXES
       ============================================================ */

    CREATE INDEX IF NOT EXISTS idx_three_q_answers_session
      ON three_q_answers(session_id);


    CREATE INDEX IF NOT EXISTS idx_three_q_answers_question
      ON three_q_answers(question_id);


    CREATE INDEX IF NOT EXISTS idx_three_q_answers_session_question
      ON three_q_answers(
        session_id,
        question_id
      );


    CREATE INDEX IF NOT EXISTS idx_three_q_answers_option
      ON three_q_answers(selected_option_id);


    /* ============================================================
       RESULT INDEXES
       ============================================================ */

    CREATE INDEX IF NOT EXISTS idx_three_q_results_test
      ON three_q_results(test_id);


    CREATE INDEX IF NOT EXISTS idx_three_q_results_session
      ON three_q_results(session_id);


    /* ============================================================
       RETEST INDEXES
       ============================================================ */

    CREATE INDEX IF NOT EXISTS idx_three_q_retest_test
      ON three_q_retest_requests(test_id);


    CREATE INDEX IF NOT EXISTS idx_three_q_retest_participant
      ON three_q_retest_requests(participant_id);


    CREATE INDEX IF NOT EXISTS idx_three_q_retest_status
      ON three_q_retest_requests(status);


    CREATE INDEX IF NOT EXISTS idx_three_q_retest_test_participant
      ON three_q_retest_requests(
        test_id,
        participant_id
      );


    /* ============================================================
       FINAL CONSTRAINT MIGRATION
       
       Existing rows have already been given safe defaults above.
       New participant rows must contain these fields.
       ============================================================ */

    ALTER TABLE three_q_participants
      ALTER COLUMN campus SET NOT NULL;

    ALTER TABLE three_q_participants
      ALTER COLUMN living_at SET NOT NULL;


    /* ============================================================
       COMPLETE
       ============================================================ */
  `);

  console.log("✅ PostgreSQL database schema initialized");
}