import React, { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Navbar from "./components/Navbar";
import SectionTitle from "./components/SectionTitle";
import PillarCard from "./components/PillarCard";
import EventCard from "./components/EventCard";
import TeamCard from "./components/TeamCard";
import Footer from "./components/Footer";
import { clubInfo, events, coreTeam } from "./data/clubData";

gsap.registerPlugin(ScrollTrigger);

function Reveal({ children, className = "" }) {
  return (
    <div className={`reveal ${className}`}>
      {children}
    </div>
  );
}

export default function App() {
  const appRef = useRef(null);
  const mentorPhotoRef = useRef(null);
  const mentorIntroRef = useRef(null);

  const handleMentorEnter = () => {
    gsap.to(mentorPhotoRef.current, {
      y: -18,
      scale: 1.12,
      duration: 0.7,
      ease: "sine.out",
      overwrite: "auto",
    });
    gsap.to(mentorIntroRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.55,
      ease: "sine.out",
      overwrite: "auto",
    });
  };

  const handleMentorLeave = () => {
    gsap.to(mentorPhotoRef.current, {
      y: 0,
      scale: 1,
      duration: 0.75,
      ease: "sine.inOut",
      overwrite: "auto",
    });
    gsap.to(mentorIntroRef.current, {
      y: -8,
      opacity: 0,
      duration: 0.5,
      ease: "sine.in",
      overwrite: "auto",
    });
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Global entrance motion.
      gsap.from(".nav-shell > header", {
        y: -30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.2,
      });

      gsap.from(".hero-logo", {
        scale: 0.15,
        rotation: -18,
        opacity: 0,
        duration: 1.35,
        ease: "back.out(1.7)",
        delay: 0.25,
      });

      gsap.from(".hero-copy > *", {
        y: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.8,
      });

      // Floating decorative blobs.
      gsap.to(".hero-orbit-a", {
        x: 35,
        y: -25,
        rotation: 12,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".hero-orbit-b", {
        x: -30,
        y: 35,
        rotation: -10,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Section heading choreography:
      // giant centered title -> shrinks/docks toward the left.
      gsap.utils.toArray(".section-heading").forEach((heading) => {
        const giant = heading.querySelector(".section-title-center");
        const docked = heading.querySelector(".section-title-docked");

        gsap.set(docked, { x: -25, opacity: 1 });
        gsap.set(giant, { scale: 0.65, opacity: 1 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heading,
            start: "top 80%",
            end: "top 32%",
            scrub: 1,
          },
        });

        tl.to(giant, { scale: 0.28, opacity: 0, ease: "none" }, 0)
          .to(docked, { x: 0, opacity: 1, ease: "none" }, 0.1);
      });

      // Generic reveal blocks.
      gsap.utils.toArray(".reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 45, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true,
            },
          }
        );
      });

      // Vision/mission split cards.
      gsap.utils.toArray(".statement-card").forEach((el, index) => {
        gsap.fromTo(
          el,
          { y: 60, rotate: index % 2 === 0 ? -2 : 2, opacity: 0 },
          {
            y: 0,
            rotate: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 82%",
              once: true,
            },
          }
        );
      });

      // Event cards cascade in.
      gsap.utils.toArray(".event-card").forEach((el, index) => {
        gsap.fromTo(
          el,
          { x: index % 2 === 0 ? -80 : 80, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true,
            },
          }
        );
      });

      // Core team circular cards.
      gsap.utils.toArray(".team-card").forEach((el, index) => {
        gsap.fromTo(
          el,
          { y: 55, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: index * 0.05,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true,
            },
          }
        );
      });

      // Parallax on hero.
      gsap.to(".hero-logo-wrap", {
        y: 120,
        scale: 0.82,
        scrollTrigger: {
          trigger: "#home",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, appRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={appRef} className="overflow-hidden bg-[#f5efe6] text-slate-950">
      <div className="nav-shell">
        <Navbar />
      </div>

      <main>
        {/* HERO */}
        <section id="home" className="relative min-h-screen overflow-hidden px-6 pb-20 pt-32">
          <div className="hero-orbit-a absolute left-[8%] top-[20%] h-16 w-16 rounded-full bg-emerald-200/70 blur-[1px]" />
          <div className="hero-orbit-b absolute right-[10%] top-[25%] h-24 w-24 rounded-[2rem] bg-violet-200/70 blur-[1px]" />
          <div className="absolute bottom-[15%] left-[18%] h-10 w-10 rounded-full bg-orange-200/70" />
          <div className="absolute right-[18%] bottom-[13%] h-8 w-8 rounded-full bg-red-200/70" />

          <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-7xl flex-col items-center justify-center text-center">
            <div className="hero-logo-wrap">
              <div className="hero-logo relative mx-auto grid h-64 w-64 place-items-center sm:h-80 sm:w-80">
                <div className="logo-ring-pulse absolute inset-0 rounded-full border border-slate-200" />
                <div className="logo-ring-spin absolute inset-5 rounded-full border border-dashed border-emerald-300/80" />
                <div className="logo-ring-pulse logo-ring-pulse-delayed absolute -inset-4 rounded-full border border-violet-200/80" />
                <img
                  src="/assets/ccubelogo.png"
                  alt="C Cube club logo"
                  className="logo-float relative z-10 h-48 w-48 drop-shadow-[0_25px_50px_rgba(0,0,0,0.12)] sm:h-60 sm:w-60"
                />
              </div>
            </div>

            <div className="hero-copy mt-5 w-full max-w-4xl lg:max-w-none">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                VIT Pune • AY 2026–27
              </p>
              <h1 className="mt-5 w-full max-w-full break-words font-display text-[clamp(2rem,7vw,8rem)] font-black leading-[1.05] tracking-[-0.04em]">
                Welcome to
                <br />
                <span className="inline-block max-w-full break-words bg-gradient-to-r from-emerald-600 via-violet-600 to-orange-500 bg-clip-text text-transparent">
                  C Cube Club
                </span>
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Character. Competence. Culture. A dynamic student community
                designed to help you discover your potential and grow with
                purpose.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
                  className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  Explore the club ↓
                </button>
                <button
                  onClick={() => window.location.href = "/give-test"}
                  className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-black text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-emerald-500 hover:shadow-2xl"
                >
                  Give Test
                </button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
            Scroll to Explore
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="relative px-6 py-28 sm:py-36">
          <div className="mx-auto max-w-7xl">
            <SectionTitle number="01" title="About" eyebrow="Know the club" accent="green" />

            <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
              <Reveal className="rounded-[2.5rem] bg-slate-950 p-8 text-white sm:p-12">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
                  Who we are
                </p>
                <h3 className="mt-5 max-w-3xl font-display text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                  A space to become more confident, capable, responsible, and
                  value-driven.
                </h3>
                <p className="mt-7 max-w-3xl text-base leading-8 text-white/65">
                  {clubInfo.mission}
                </p>
              </Reveal>

              <Reveal className="rounded-[2.5rem] border border-black/5 bg-[#eee5d7] p-8 sm:p-10">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-600">
                  What we build
                </p>
                <div className="mt-8 space-y-5">
                  {clubInfo.objectives.map((objective, index) => (
                    <div key={objective} className="flex gap-4">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-xs font-black shadow-sm">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-6 text-slate-600">{objective}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <Reveal className="mt-8 grid gap-5 sm:grid-cols-3">
              <PillarCard
                letter="1"
                title="Character"
                text="Character: Build strong values, confidence, and responsibility."
                color="green"
              />
              <PillarCard
                letter="2"
                title="Competence"
                text="Competence: Develop practical skills, leadership, and communication."
                color="violet"
              />
              <PillarCard
                letter="3"
                title="Culture"
                text="Culture: Grow through collaboration, mentorship, and shared experiences."
                color="orange"
              />
            </Reveal>
          </div>
        </section>

        {/* VISION */}
        <section id="vision" className="relative bg-[#eee5d7] px-6 py-28 sm:py-36">
          <div className="mx-auto max-w-7xl">
            <SectionTitle number="02" title="Vision" eyebrow="Where we are going" accent="violet" />

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="statement-card rounded-[2.5rem] border border-violet-100 bg-violet-50 p-8 sm:p-12">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-600">
                  Our north star
                </p>
                <p className="mt-6 font-display text-3xl font-black leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl">
                  Grow with purpose, confidence, and community.
                </p>
              </div>

              <div className="statement-card rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-soft sm:p-12">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                  Vision statement
                </p>
                <p className="mt-6 text-base leading-8 text-slate-600">
                  {clubInfo.vision}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* MISSION */}
        <section id="mission" className="relative px-6 py-28 sm:py-36">
          <div className="mx-auto max-w-7xl">
            <SectionTitle number="03" title="Mission" eyebrow="How we grow" accent="orange" />

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="statement-card rounded-[2.5rem] border border-orange-100 bg-orange-50 p-8 sm:p-12">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-600">
                  Our promise
                </p>
                <p className="mt-6 font-display text-3xl font-black leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl">
                  Learn together. Reflect deeply. Build skills. Grow with
                  purpose.
                </p>
              </div>

              <div className="statement-card rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-soft sm:p-12">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                  Mission statement
                </p>
                <p className="mt-6 text-base leading-8 text-slate-600">
                  {clubInfo.mission}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* EVENTS */}
        <section id="events" className="relative bg-[#eee5d7] px-6 py-28 sm:py-36">
          <div className="mx-auto max-w-7xl">
            <SectionTitle number="04" title="Events" eyebrow="Experience the journey" accent="red" />

            <Reveal className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  From self-assessment and discovery to mentorship, reading,
                  study enhancement, and the Outing — the proposed
                  activity plan is built around continuous student development.
                </p>
              </div>
              <div className="rounded-2xl bg-white px-5 py-4 text-sm font-bold shadow-sm">
                <span className="text-red-500">07</span> proposed activities
              </div>
            </Reveal>

            <div className="space-y-8">
              {events.map((event, index) => (
                <EventCard key={event.title} event={event} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* FACULTY MENTOR */}
        <section id="mentor" className="relative px-6 py-28 sm:py-36">
          <div className="mx-auto max-w-7xl">
            <SectionTitle number="05" title="Faculty Mentor" eyebrow="Guidance behind C Cube" accent="green" />

            <Reveal className="mx-auto max-w-3xl">
              <div className="rounded-[2.5rem] border border-black/5 bg-[#eee5d7] p-7 text-left shadow-sm transition duration-300 hover:shadow-lg sm:p-10">
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Faculty Mentor</p>
                    <h3 className="mt-2 font-display text-2xl font-black text-slate-950 sm:text-3xl">
                      {clubInfo.facultyMentor}
                    </h3>
                  </div>
                </div>

                <div className="mt-8 border-t border-black/10 pt-8 text-center">
                  <div
                    onMouseEnter={handleMentorEnter}
                    onMouseLeave={handleMentorLeave}
                    className="group relative mx-auto h-52 w-52 sm:h-64 sm:w-64"
                  >
                    <div className="absolute inset-2 rounded-full bg-white" />
                    <div className="absolute inset-0 rounded-full ring-2 ring-emerald-300 ring-offset-8 ring-offset-[#eee5d7] transition duration-300 group-hover:ring-emerald-400" />
                    <img
                      ref={mentorPhotoRef}
                      src={clubInfo.facultyMentorDetails.image}
                      alt={clubInfo.facultyMentor}
                      className="relative z-10 h-full w-full rounded-full bg-white object-cover object-top p-1 shadow-xl transition-all duration-700 ease-out group-hover:shadow-2xl"
                    />
                  </div>

                  <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    {clubInfo.facultyMentorDetails.role}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    {clubInfo.facultyMentorDetails.department}
                  </p>
                  <p
                    ref={mentorIntroRef}
                    className="mx-auto mt-4 max-w-xl -translate-y-1 text-sm leading-6 text-slate-600 opacity-0 will-change-transform"
                  >
                    {clubInfo.facultyMentorDetails.intro}
                  </p>

                  <div className="mx-auto mt-8 grid max-w-3xl gap-5 text-left sm:grid-cols-3">
                    <div className="rounded-2xl bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-emerald-200/80">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Experience</p>
                      <p className="mt-3 font-display text-2xl font-black text-slate-950">
                        {clubInfo.facultyMentorDetails.experience}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-violet-200/80">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Educational Qualification</p>
                      <ul className="mt-3 space-y-2 text-sm leading-5 text-slate-600">
                        {clubInfo.facultyMentorDetails.education.map((qualification) => (
                          <li key={qualification}>{qualification}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-orange-200/80">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Area of Specialization</p>
                      <ul className="mt-3 space-y-2 text-sm leading-5 text-slate-600">
                        {clubInfo.facultyMentorDetails.specialization.map((area) => (
                          <li key={area}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

          </div>
        </section>

        {/* CORE TEAM */}
        <section id="team" className="relative bg-[#eee5d7] px-6 py-28 sm:py-36">
          <div className="mx-auto max-w-7xl">
            <SectionTitle number="06" title="Core Team" eyebrow="The people behind C Cube" accent="green" />

            <Reveal className="mx-auto mb-20 max-w-2xl text-center">
              <p className="text-lg leading-8 text-slate-600">
                Meet the founding core team. Hover over a member photo to see it lift from the profile details.
              </p>
            </Reveal>

            <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {coreTeam.map((member) => (
                <TeamCard key={member.name} member={member} />
              ))}
            </div>

          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="relative bg-slate-950 px-6 py-28 text-white sm:py-36">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[1fr_0.75fr]">
              <Reveal>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
                  07 • Connect
                </p>
                <h2 className="mt-5 max-w-3xl font-display text-5xl font-black leading-[0.95] tracking-[-0.06em] sm:text-7xl">
                  Ready to discover your next version?
                </h2>
                <p className="mt-7 max-w-xl text-base leading-7 text-white/60">
                  C Cube is designed for students and can connect
                  learners with faculty, mentors, alumni, academicians,
                  industry professionals, trainers, and subject experts.
                </p>
                <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-white/45">
                  Connect us on
                </p>
                <div className="mt-3 flex gap-3" aria-label="Social media links">
                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    title="Instagram"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:-translate-y-1 hover:border-white hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                    title="LinkedIn"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-sm font-black text-white/75 transition hover:-translate-y-1 hover:border-white hover:text-white"
                  >
                    in
                  </a>
                  <a
                    href="https://x.com/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="X"
                    title="X"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-lg font-semibold text-white/75 transition hover:-translate-y-1 hover:border-white hover:text-white"
                  >
                    𝕏
                  </a>
                  <a
                    href="mailto:vijay.gaikwad@vit.edu"
                    aria-label="Email faculty mentor"
                    title="Email faculty mentor"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:-translate-y-1 hover:border-white hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m4 7 8 6 8-6" />
                    </svg>
                  </a>
                </div>
              </Reveal>

              <Reveal className="rounded-[2.5rem] bg-white p-7 text-slate-950 sm:p-9">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                  Club details
                </p>
                <div className="mt-7 space-y-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Club</p>
                    <p className="mt-1 font-display text-xl font-black">C Cube</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Campus</p>
                    <p className="mt-1 font-semibold">VIT Pune</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Faculty Mentor</p>
                    <p className="mt-1 font-semibold">{clubInfo.facultyMentor}</p>
                  </div>
                </div>
                
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
