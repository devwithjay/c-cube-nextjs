import bcrypt from "bcryptjs";
import {
  get,
  all,
  run
} from "./database.js";

export async function seedDatabase() {

  /*
  |--------------------------------------------------------------------------
  | CLUB INFORMATION
  |--------------------------------------------------------------------------
  */

  const existingClub =
    await get(
      `
      SELECT id
      FROM club_info
      WHERE id = 1
      `
    );


  if (!existingClub) {

    await run(
      `
      INSERT INTO club_info
      (
        id,
        name,
        full_name,
        campus,
        audience,
        vision,
        mission,
        short_term_goal,
        long_term_goal
      )

      VALUES
      (
        1,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
      )
      `,

      [
        "C Cube",

        "Character, Competence, and Culture",

        "Kondhwa",

        "First-year students",

        "To create a dynamic student community that nurtures Character, Competence, and Culture, empowering students to become confident, capable, responsible, and value-driven individuals prepared to excel in their personal, academic, and professional lives.",

        "To provide students with a complete platform for personality development through interactive learning, skill enhancement, mentorship, meaningful discussions, and experiential activities. The club aims to help students discover their potential, develop essential life skills, strengthen their character, and build a balanced approach towards personal, academic, and professional growth.",

        "To establish C Cube as an active personality-development and skill-building platform that engages students through structured sessions, technical workshops, study-oriented programs, mentoring, online book reading, and interactive activities.",

        "To develop C Cube into a sustainable student-development platform that nurtures competent, confident, ethical, and socially responsible individuals."
      ]

    );

  }


  /*
  |--------------------------------------------------------------------------
  | OBJECTIVES
  |--------------------------------------------------------------------------
  */

  const objectiveCount =
    await get(
      `
      SELECT COUNT(*) AS count
      FROM objectives
      `
    );


  if (
    objectiveCount.count === 0
  ) {

    const objectives = [

      "To promote overall personality development through the three core pillars of Character, Competence, and Culture.",

      "To develop essential skills such as communication, leadership, critical thinking, decision-making, teamwork, and emotional intelligence.",

      "To enhance students' technical competence through practical workshops, hands-on sessions, and exposure to relevant technologies.",

      "To provide structured one-to-one alumni mentorship and guidance for students' personal, academic, and professional growth.",

      "To encourage learning beyond the classroom through interactive sessions, seminars, book reading, camps, technical workshops, and experiential activities."

    ];


    for (
      let i = 0;
      i < objectives.length;
      i++
    ) {

      await run(
        `
        INSERT INTO objectives
        (
          objective,
          sort_order
        )

        VALUES (?, ?)
        `,

        [
          objectives[i],
          i + 1
        ]
      );

    }

  }


  /*
  |--------------------------------------------------------------------------
  | FACULTY MENTOR
  |--------------------------------------------------------------------------
  */

  const existingMentor =
    await get(
      `
      SELECT id
      FROM faculty_mentor
      WHERE id = 1
      `
    );


  if (!existingMentor) {

    await run(
      `
      INSERT INTO faculty_mentor
      (
        id,
        name,
        role
      )

      VALUES
      (
        1,
        ?,
        ?
      )
      `,

      [
        "Prof. Vijay Gaikwad",
        "Faculty Mentor"
      ]

    );

  }


  /*
 |--------------------------------------------------------------------------
 | 3Q TEST
 |--------------------------------------------------------------------------
 */

  const existingTest =
    await get(
      `
        SELECT id
        FROM three_q_tests
        WHERE version = 1
      `
    );


  let testId;


  if (!existingTest) {

    const result =
      await run(
        `
          INSERT INTO three_q_tests
          (
            title,
            description,
            duration_seconds,
            status,
            version
          )

          VALUES
          (
            ?,
            ?,
            ?,
            ?,
            ?
          )
        `,

        [
          "C Cube 3Q Online Assessment",

          "An online assessment designed to assess IQ, EQ and SQ and promote self-awareness.",

          45 * 60,

          "published",

          1
        ]
      );


    testId =
      result.id;

  }
  else {

    testId =
      existingTest.id;

  }


// Ensure the existing 3Q test is published
await run(
  `
    UPDATE three_q_tests
    SET status = 'published'
    WHERE id = ?
  `,
  [testId]
);


// Ensure the 3Q test duration is 45 minutes
await run(
  `
    UPDATE three_q_tests
    SET duration_seconds = ?
    WHERE id = ?
  `,
  [
    45 * 60,
    testId
  ]
);

  /*
 |--------------------------------------------------------------------------
 | 3Q SECTIONS
 |--------------------------------------------------------------------------
 | Required structure:
 |
 | Section 1 → IQ
 | Section 2 → EQ
 | Section 3 → SQ
 |
 | Existing section IDs are preserved.
 | Existing questions remain attached to their
 | existing section IDs.
 |--------------------------------------------------------------------------
 */

  const desiredSections = [
    {
      number: 1,
      name: "IQ",
      description: "Intelligence Quotient assessment section.",
      questionLimit: 10,
      sortOrder: 1
    },

    {
      number: 2,
      name: "EQ",
      description: "Emotional Quotient assessment section.",
      questionLimit: 10,
      sortOrder: 2
    },

    {
      number: 3,
      name: "SQ",
      description: "Spiritual Quotient assessment section.",
      questionLimit: 10,
      sortOrder: 3
    }
  ];


  /*
  |--------------------------------------------------------------------------
  | GET ALL EXISTING SECTIONS
  |--------------------------------------------------------------------------
  | IMPORTANT:
  | Use all() here because we need an array.
  |--------------------------------------------------------------------------
  */

  let existingSections = await all(
    `
  SELECT
    id,
    test_id,
    section_number,
    name,
    description,
    question_limit,
    sort_order
  FROM three_q_sections
  WHERE test_id = ?
  ORDER BY id ASC
  `,
    [testId]
  );


  /*
  |--------------------------------------------------------------------------
  | CASE 1:
  | No sections exist → create IQ / EQ / SQ
  |--------------------------------------------------------------------------
  */

  if (
    !Array.isArray(existingSections) ||
    existingSections.length === 0
  ) {

    for (
      const section of desiredSections
    ) {

      await run(
        `
      INSERT INTO three_q_sections
      (
        test_id,
        section_number,
        name,
        description,
        question_limit,
        sort_order
      )

      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT (test_id, section_number) DO NOTHING
      `,
        [
          testId,
          section.number,
          section.name,
          section.description,
          section.questionLimit,
          section.sortOrder
        ]
      );

    }

  }




  /*
  |--------------------------------------------------------------------------
  | EVENTS
  |--------------------------------------------------------------------------
  */

  const eventCount =
    await get(
      `
      SELECT COUNT(*) AS count
      FROM events
      `
    );


  if (
    eventCount.count === 0
  ) {

    const events = [

      {
        dateText: "September 2026",
        shortDate: "SEP",
        title: "3Q Online Assessment Test",

        description:
          "An online assessment designed to assess IQ, EQ and SQ while promoting self-awareness.",

        objective:
          "To assess IQ, EQ and SQ and promote self-awareness.",

        accent: "green",

        imageUrl:
          "/assets/events/event1.jpg",

        sortOrder: 1
      },


      {
        dateText: "September 2026",
        shortDate: "SEP",
        title: "DYS — Discover Yourself Series",

        description:
          "Interactive sessions focused on self-awareness, confidence and clarity of purpose.",

        objective:
          "To develop self-awareness, confidence, and clarity of purpose.",

        accent: "violet",

        imageUrl:
          "/assets/events/event2.jpg",

        sortOrder: 2
      },


      {
        dateText: "November 2026",
        shortDate: "NOV",
        title:
          "MMC — Mentorship and Mindset Connect",

        description:
          "A platform encouraging positive mindset, good habits and personal growth.",

        objective:
          "To encourage a positive mindset, good habits, and personal growth.",

        accent: "orange",

        imageUrl:
          "/assets/events/event3.jpg",

        sortOrder: 3
      },


      {
        dateText: "November 2026",
        shortDate: "NOV",
        title:
          "C Cube Mentoring Program",

        description:
          "A structured mentoring program supporting personal, academic and professional development.",

        objective:
          "To provide guidance for personal, academic, and professional growth.",

        accent: "red",

        imageUrl:
          "/assets/events/event4.jpg",

        sortOrder: 4
      },


      {
        dateText: "December 2026",
        shortDate: "DEC",
        title:
          "Book Reading Sessions",

        description:
          "Reading sessions designed to encourage reading habits, critical thinking and communication.",

        objective:
          "To develop reading habits, critical thinking, and communication skills.",

        accent: "violet",

        imageUrl:
          "/assets/events/event5.jpg",

        sortOrder: 5
      },


      {
        dateText: "December 2026",
        shortDate: "DEC",
        title:
          "Study Enhancement Sessions",

        description:
          "Practical sessions focused on study techniques, productivity and time management.",

        objective:
          "To improve study techniques, productivity, and time management.",

        accent: "green",

        imageUrl:
          "/assets/events/event6.jpg",

        sortOrder: 6
      },


      {
        dateText: "January 2027",
        shortDate: "JAN",
        title:
          "Sankalpa Camp",

        description:
          "An experiential camp focused on teamwork, leadership and personal growth.",

        objective:
          "To promote teamwork, leadership, and personal growth.",

        accent: "orange",

        imageUrl:
          "/assets/events/event7.jpg",

        sortOrder: 7
      }

    ];


    for (
      const event
      of events
    ) {

      await run(
        `
        INSERT INTO events
        (
          date_text,
          short_date,
          title,
          description,
          objective,
          accent,
          image_url,
          sort_order
        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,

        [
          event.dateText,
          event.shortDate,
          event.title,
          event.description,
          event.objective,
          event.accent,
          event.imageUrl,
          event.sortOrder
        ]
      );

    }

  }


  /*
  |--------------------------------------------------------------------------
  | CORE TEAM
  |--------------------------------------------------------------------------
  */

  const teamCount =
    await get(
      `
      SELECT COUNT(*) AS count
      FROM team_members
      `
    );


  if (
    teamCount.count === 0
  ) {

    const team = [

      {
        name: "Atharv Jambhule",

        branch:
          "Electronics & Telecommunication",

        year:
          "Third Year",

        position:
          "President",

        imageUrl:
          "/assets/team/atharv.jpg",

        color:
          "green",

        intro:
          "Leads the vision, direction and overall coordination of C Cube.",

        sortOrder: 1
      },


      {
        name: "Soham Dode",

        branch:
          "Branch to be updated",

        year:
          "Year to be updated",

        position:
          "Vice President",

        imageUrl:
          "/assets/team/soham.jpg",

        color:
          "violet",

        intro:
          "Supports strategic planning, execution and member coordination.",

        sortOrder: 2
      },


      {
        name: "Deven Kumbhar",

        branch:
          "Branch to be updated",

        year:
          "Year to be updated",

        position:
          "Secretary",

        imageUrl:
          "/assets/team/deven.jpg",

        color:
          "orange",

        intro:
          "Handles documentation, communication and internal organization.",

        sortOrder: 3
      },


      {
        name: "Prem Mankar",

        branch:
          "Branch to be updated",

        year:
          "Year to be updated",

        position:
          "Treasurer",

        imageUrl:
          "/assets/team/prem.jpg",

        color:
          "red",

        intro:
          "Coordinates financial records and resource planning.",

        sortOrder: 4
      },


      {
        name: "Shreyas Landge",

        branch:
          "Branch to be updated",

        year:
          "Year to be updated",

        position:
          "Event Coordinator",

        imageUrl:
          "/assets/team/shreyas.jpg",

        color:
          "green",

        intro:
          "Transforms ideas into engaging club events and experiences.",

        sortOrder: 5
      },


      {
        name: "Tushar Mohale",

        branch:
          "Branch to be updated",

        year:
          "Year to be updated",

        position:
          "Public Relations Officer",

        imageUrl:
          "/assets/team/tushar.jpg",

        color:
          "violet",

        intro:
          "Handles outreach, communication and public presence of the club.",

        sortOrder: 6
      }

    ];


    for (
      const member
      of team
    ) {

      await run(
        `
        INSERT INTO team_members
        (
          name,
          branch,
          year,
          position,
          image_url,
          color,
          intro,
          sort_order
        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,

        [
          member.name,
          member.branch,
          member.year,
          member.position,
          member.imageUrl,
          member.color,
          member.intro,
          member.sortOrder
        ]
      );

    }

  }


  /*
  |--------------------------------------------------------------------------
  | GALLERY
  |--------------------------------------------------------------------------
  */

  const galleryCount =
    await get(
      `
      SELECT COUNT(*) AS count
      FROM gallery
      `
    );


  if (
    galleryCount.count === 0
  ) {

    const galleryItems = [

      {
        title:
          "3Q Assessment",

        imageUrl:
          "/assets/events/event1.jpg",

        eventId:
          1,

        caption:
          "C Cube 3Q Online Assessment Test",

        sortOrder:
          1
      },


      {
        title:
          "Discover Yourself",

        imageUrl:
          "/assets/events/event2.jpg",

        eventId:
          2,

        caption:
          "DYS — Discover Yourself Series",

        sortOrder:
          2
      },


      {
        title:
          "Mentorship Session",

        imageUrl:
          "/assets/events/event3.jpg",

        eventId:
          3,

        caption:
          "MMC — Mentorship and Mindset Connect",

        sortOrder:
          3
      }

    ];


    for (
      const item
      of galleryItems
    ) {

      await run(
        `
        INSERT INTO gallery
        (
          title,
          image_url,
          event_id,
          caption,
          sort_order
        )

        VALUES (?, ?, ?, ?, ?)
        `,

        [
          item.title,
          item.imageUrl,
          item.eventId,
          item.caption,
          item.sortOrder
        ]
      );

    }

  }


  /*
  |--------------------------------------------------------------------------
  | ADMIN USER SEED
  |--------------------------------------------------------------------------
  */

  const adminCount =
    await get(
      `
      SELECT COUNT(*) AS count
      FROM admin_users
      `
    );


  if (
    Number(adminCount?.count || 0) === 0
  ) {

    const defaultPasswordHash =
      await bcrypt.hash(
        "Admin@vit123",
        12
      );


    await run(
      `
      INSERT INTO admin_users
      (
        name,
        email,
        password_hash,
        role,
        is_active
      )

      VALUES (?, ?, ?, 'super_admin', 1)
      `,

      [
        "C Cube Administrator",
        "admin@vit.edu",
        defaultPasswordHash
      ]
    );


    console.log(
      "👤 Default admin user seeded: admin@vit.edu / Admin@vit123"
    );

  }


  console.log(
    "✅ Database seed completed"
  );

}