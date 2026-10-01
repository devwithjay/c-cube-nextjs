export const clubInfo = {
  name: "C Cube",
  fullName: "Character, Competence, and Culture",
  campus: "VIT Pune",
  facultyMentor: "Prof. Vijay Gaikwad",
  facultyMentorDetails: {
    image: "/assets/team/faculty-mentor.jpg",
    role: "Faculty Mentor",
    intro: "Guides students with mentorship, strategic direction, and a strong commitment to personal and professional growth.",
    department: "Electronics & Telecommunication Engineering",
    experience: "22 years",
    education: [
      "PhD, Savitribai Phule Pune University, 2016",
      "ME, Savitribai Phule Pune University, 2008",
      "BE, Savitribai Phule Pune University, 2003",
    ],
    specialization: ["Data Science", "Machine Learning", "IoT"],
  },
  audience: "Students",
  vision:
    "To nurture confident, capable, and value-driven students ready to grow personally, excel academically, and build meaningful careers.",
  mission:
    "A platform for students to grow through interactive learning, mentorship, and hands-on experiences while building confidence, skills, and strong values.",
  objectives: [
    "Build character through values and responsibility.",
    "Develop competence through practical learning.",
    "Celebrate culture through shared experiences.",
    "Strengthen communication skills.",
    "Encourage leadership and teamwork.",
    "Support personal growth.",
    "Create meaningful learning experiences.",
  ],
};

const createGlimpses = (label, colors) =>
  colors.map((color, index) => {
    const nextColor = colors[(index + 1) % colors.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 650"><rect width="900" height="650" fill="${color}"/><circle cx="130" cy="100" r="75" fill="${nextColor}" opacity=".45"/><circle cx="780" cy="560" r="130" fill="${nextColor}" opacity=".3"/><rect x="80" y="150" width="740" height="360" rx="50" fill="#ffffff" opacity=".72"/><text x="450" y="310" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" font-weight="900" fill="#0f172a">${label}</text><text x="450" y="375" text-anchor="middle" font-family="Arial, sans-serif" font-size="23" font-weight="700" fill="#334155">GLIMPSE ${index + 1}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  });

export const events = [
  {
    date: "September 2025",
    shortDate: "SEP",
    title: "3Q Test and OTP",
    description:
      "A test designed to explore IQ, EQ, and SQ, followed by an OTP prize distribution ceremony for the top scorers and a wonderful pantomime show.",
    objective: "Assess IQ, EQ, and SQ and promote self-awareness.",
    accent: "green",
    image: "/assets/events/3q-poster.png",
    glimpses: [
      "/assets/events/3q-glimpses-1.jpeg",
      "/assets/events/3q-glimpses-2.jpeg",
      "/assets/events/3q-glimpses-3.jpeg",
      "/assets/events/3q-glimpses-4.jpeg",
    ],
  },
  {
    date: "September 2025",
    shortDate: "SEP",
    title: "DYS — Discover Yourself Series",
    description:
      "Interactive sessions focused on self-awareness, confidence, identity, strengths, and clarity of purpose.",
    objective: "Develop self-awareness, confidence, and clarity of purpose.",
    accent: "violet",
    image: "/assets/events/DYS-poster.jpeg",
    glimpses: [
      "/assets/events/dys-glimpses-01.jpeg",
      "/assets/events/dys-glimpses-02.jpeg",
      "/assets/events/dys-glimpses-03.jpeg",
      "/assets/events/dys-glimpses-04.png",
      "/assets/events/dys-glimpses-05.png",
    ],
  },
  {
    date: "November 2025",
    shortDate: "NOV",
    title: "C Cube Mentoring Program",
    description:
      "Structured mentoring intended to support students across personal, academic, and professional growth.",
    objective: "Provide guidance for personal, academic, and professional growth.",
    accent: "red",
    image: "/assets/events/Mentor poster.png",
    glimpses: [
      "/assets/events/Mentor glimpses-01.png",
      "/assets/events/Mentor glimpses-02.png",
      "/assets/events/Mentor glimpses-03.png",
      "/assets/events/Mentor glimpses-04.png",
      "/assets/events/Mentor glimpses-05.png",
    ],
  },

  {
    date: "November 2025",
    shortDate: "NOV",
    title: "MMC — Mentorship and Mindset Connect",
    description:
      "A space for conversations around positive mindset, habits, reflection, and personal growth.",
    objective: "Encourage a positive mindset, good habits, and personal growth.",
    accent: "orange",
    image: "/assets/events/mmc-poster.png",
    glimpses: [
      "/assets/events/mmc-glimpses-01png.jpeg",
      "/assets/events/mmc-glimpses-02png.jpeg",
      "/assets/events/mmc-glimpses-03.png",
    ],
  },
  {
    date: "December 2025",
    shortDate: "DEC",
    title: "Study Enhancement Sessions",
    description:
      "Practical sessions around study techniques, productivity, planning, and time management.",
    objective: "Improve study techniques, productivity, and time management.",
    accent: "green",
    image: "/assets/events/study-poster.png",
    glimpses: [
      "/assets/events/study-glimpses-1.jpeg",
      "/assets/events/study-glimpses-2.jpeg",
      "/assets/events/study-glimpses-3.jpeg",
      "/assets/events/study-glimpses-4.jpeg",
    ],
  },
  {
    date: "January 2026",
    shortDate: "JAN",
    title: "Outing",
    description:
      "A memorable outing designed to build teamwork, leadership, reflection, and personal growth.",
    objective: "Promote teamwork, leadership, and personal growth.",
    accent: "orange",
    image: "/assets/events/outing-poster.jpeg",
    glimpses: [
      "/assets/events/outing-glimpses-1.jpeg",
      "/assets/events/outing-glimpses-2.jpeg",
      "/assets/events/outing-glimpses-3.jpeg",
      "/assets/events/outing-glimpses-4.jpeg",
      "/assets/events/outing-glimpses-5.jpeg",
    ],
  },
];

export const coreTeam = [
  {
    name: "Atharv Jambhule",
    branch: "Computer Engineering Software Engineering",
    year: "Third Year",
    position: "President",
    image: "/assets/team/president.png",
    color: "green",
    intro: "Leads the club vision, direction, and overall coordination.",
  },
  {
    name: "Soham Dode",
    branch: "Electronics and Telecommunication Engineering",
    year: "Third Year",
    position: "Vice President",
    image: "/assets/team/vice-president.jpeg",
    color: "violet",
    intro: "Supports strategic planning, execution, and member coordination.",
  },
  {
    name: "Deven Kumbhar",
    branch: "Computer Science and Engineering (IOT and Cybersecurity including Blockchain)",
    year: "Third Year",
    position: "Secretary",
    image: "/assets/team/secretary.jpeg",
    color: "orange",
    intro: "Handles documentation, communication, and internal organization.",
  },
  {
    name: "Prem Mankar",
    branch: "Electronics and Telecommunication Engineering",
    year: "Third Year",
    position: "Treasurer",
    image: "/assets/team/treasurer.jpeg",
    color: "red",
    intro: "Coordinates financial records and resource planning for activities.",
  },
  {
    name: "Shreyas Landge",
    branch: "Artificial Intelligence and Data Science",
    year: "Second Year",
    position: "Event Coordinator",
    image: "/assets/team/gc.jpeg",
    color: "green",
    intro: "Transforms ideas into well-organized club events and experiences.",
  },
  {
    name: "Tushar Mohale",
    branch: "Artificial Intelligence and Data Science",
    year: "Second Year",
    position: "Public Relations Officer",
    image: "/assets/team/pro.jpeg",
    color: "violet",
    intro: "Builds the club's public presence and manages outreach communication.",
  },
];

export const navItems = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Vision", id: "vision" },
  { label: "Mission", id: "mission" },
  { label: "Events", id: "events" },
  { label: "Faculty Mentor", id: "mentor" },
  { label: "Core Team", id: "team" },
];
