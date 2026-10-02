"use client";

import React, { useEffect, useState } from "react";
import { clubInfo, events, coreTeam, navItems } from "./data/clubData";
import { motion } from "framer-motion";
import { User, Lightbulb, Globe, ChevronRight, Moon, Sun } from "lucide-react";
import ColourfulText from "@/components/ui/colourful-text";
import { Vortex } from "@/components/ui/vortex";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { useTheme } from "next-themes";

/* ================================================================
   TYPES
   ================================================================ */

interface EventItem {
  date: string;
  shortDate: string;
  title: string;
  description: string;
  objective: string;
  accent: string;
  image: string;
  glimpses: string[];
}

interface TeamMember {
  name: string;
  branch: string;
  year: string;
  position: string;
  image: string;
  color: string;
  intro: string;
}

/* ================================================================
   ANIMATION VARIANTS
   ================================================================ */

const staggerContainer: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

/* ================================================================
   MAIN APP
   ================================================================ */

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const pillarIcons = [
    <User className="h-8 w-8" key="user" />,
    <Lightbulb className="h-8 w-8" key="bulb" />,
    <Globe className="h-8 w-8" key="globe" />,
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── NAVBAR ─── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b shadow-sm py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <button onClick={() => scrollTo("home")} className="flex items-center gap-3">
            <img src="/assets/ccubelogo.png" alt="C Cube" className="h-10 w-10 object-contain" />
            <div className="hidden h-8 w-px bg-border sm:block" />
            <img src="/assets/vit-logo-transparent.png" alt="VIT" className="hidden sm:block h-9 w-auto object-contain" />
            <div className="hidden sm:block leading-tight text-left">
              <p className="text-[11px] font-extrabold tracking-[0.12em] text-foreground">C CUBE</p>
              <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">VIT Pune</p>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => scrollTo("contact")}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
            >
              Contact
            </button>
            <button
              onClick={() => window.location.href = '/give-test'}
              className="rounded-full px-4 py-2 text-sm font-bold text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all ml-2 border border-primary/20"
            >
              Give Test
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-2 rounded-full p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors focus:outline-none"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </nav>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => window.location.href = '/test'}
              className="rounded-full px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all border border-primary/20"
            >
              Test
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors focus:outline-none"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-border"
            >
              <span className="text-lg">{mobileMenuOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute left-4 right-4 top-[calc(100%+4px)] rounded-2xl border bg-card p-3 shadow-xl md:hidden">
            {[...navItems, { label: "Contact", id: "contact" }].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ─── HERO (Vortex + ColourfulText) ─── */}
      <section id="home" className="relative flex items-center justify-center min-h-[90vh] w-full overflow-hidden">
        {/* Aceternity Vortex Background */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <Vortex
            backgroundColor="transparent"
            rangeY={800}
            particleCount={300}
            baseHue={220} // Match the blue branding
            className="flex items-center flex-col justify-center w-full h-full"
          />
        </div>

        <div className="relative z-10 mx-auto w-full px-6 text-center mt-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mx-auto mb-10 flex items-center justify-center"
          >
            <img src="/assets/ccubelogo.png" alt="C Cube" className="h-32 w-32 object-contain" />
          </motion.div>

          <h1 className="mx-auto w-full max-w-[90vw] text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-[6rem] leading-[1.1]">
            Character. Competence. <br className="hidden sm:block" />
            <ColourfulText text="Culture." />
          </h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mx-auto mt-8 max-w-xl relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 rounded-2xl blur-lg transition-all duration-500 group-hover:opacity-100 opacity-50"></div>
            <div className="relative rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-2xl p-4 sm:p-5 shadow-sm dark:shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
              
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.15)] dark:shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 dark:bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-500"></span>
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Test is Live</span>
                </div>
                
                <p className="text-center text-foreground/80 text-xs sm:text-sm leading-relaxed max-w-lg">
                  The test will be live till today evening, <strong className="text-foreground font-bold">9 PM</strong>.
                  <br className="hidden sm:block mt-0.5" /> For any concerns, DM <span className="text-foreground font-medium">7385079307</span> or email at <a href="mailto:ccube@vit.edu" className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-500 dark:hover:text-blue-300 transition-colors">ccube@vit.edu</a>.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              className="bg-background text-foreground flex items-center space-x-2 px-8 py-3 text-base font-semibold hover:shadow-lg transition-shadow"
              onClick={() => scrollTo("about")}
            >
              <span>Explore C Cube</span>
              <ChevronRight className="h-4 w-4" />
            </HoverBorderGradient>

            <button
              onClick={() => window.location.href = '/give-test'}
              className="rounded-full bg-primary text-primary-foreground px-8 py-3.5 text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all border border-primary-foreground/10 flex items-center gap-2"
            >
              Give Test
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── ABOUT / PILLARS ─── */}
      <section id="about" className="py-24 bg-muted/30 relative">
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">Foundation</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Our Core Pillars</h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { title: "Character", desc: "Build character through values, responsibility, and ethical conduct that shapes a meaningful life." },
              { title: "Competence", desc: "Develop competence through practical learning, real-world skills, and continuous improvement." },
              { title: "Culture", desc: "Celebrate culture through shared experiences, meaningful connections, and community building." },
            ].map((pillar, i) => (
              <motion.div
                variants={fadeUp}
                key={i}
                className="group rounded-3xl bg-card border border-border/50 p-10 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  {pillarIcons[i]}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{pillar.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">{pillar.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── VISION / MISSION ─── */}
      <section id="vision" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">Our Goal</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Vision & Mission</h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-8"
          >
            <motion.div variants={fadeUp} className="rounded-3xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-12 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Globe className="h-32 w-32" />
              </div>
              <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-6">Vision</p>
              <p className="text-2xl text-foreground leading-relaxed font-medium relative z-10">{clubInfo.vision}</p>
            </motion.div>
            
            <motion.div variants={fadeUp} className="rounded-3xl border border-border/50 bg-gradient-to-bl from-card to-card/50 p-12 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Lightbulb className="h-32 w-32" />
              </div>
              <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-6">Mission</p>
              <p className="text-2xl text-foreground leading-relaxed font-medium relative z-10">{clubInfo.mission}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── EVENTS (Consistent Aspect Ratio + BackgroundGradient) ─── */}
      <section id="events" className="py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">What We Do</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Our Events</h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch"
          >
            {events.map((event: EventItem, i: number) => (
              <motion.div variants={fadeUp} key={i} className="h-full">
                <BackgroundGradient className="rounded-[22px] bg-card h-full flex flex-col overflow-hidden">
                  <div className="w-full flex items-center justify-center bg-black/5 p-0 m-0 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full aspect-[4/3] object-cover object-[center_top] rounded-t-[20px] transition-transform duration-700 hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <p className="text-sm font-bold text-primary uppercase tracking-wider mb-3">{event.date}</p>
                    <h3 className="text-xl font-bold text-foreground mb-3">{event.title}</h3>
                    <p className="text-base text-muted-foreground leading-relaxed line-clamp-3">{event.description}</p>
                  </div>
                </BackgroundGradient>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FACULTY MENTOR (No Card styling) ─── */}
      <section id="mentor" className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">Guidance</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Faculty Mentor</h2>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-16 md:p-12"
          >
            <div className="shrink-0 w-full md:w-auto flex justify-center">
              <div className="w-80 max-w-full rounded-[2rem] overflow-hidden drop-shadow-2xl">
                <img
                  src={clubInfo.facultyMentorDetails.image}
                  alt={clubInfo.facultyMentor}
                  className="h-auto w-full object-contain"
                />
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="text-4xl font-bold text-foreground">{clubInfo.facultyMentor}</h3>
              <p className="text-xl text-primary font-semibold mt-3">{clubInfo.facultyMentorDetails.role}</p>
              <p className="text-muted-foreground mt-6 leading-relaxed text-lg max-w-2xl">{clubInfo.facultyMentorDetails.intro}</p>
              
              <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
                {clubInfo.facultyMentorDetails.specialization.map((spec: string) => (
                  <span key={spec} className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20">
                    {spec}
                  </span>
                ))}
              </div>
              
              <div className="mt-10 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center gap-6 text-base text-muted-foreground font-medium justify-center md:justify-start">
                <span className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  {clubInfo.facultyMentorDetails.department}
                </span>
                <span className="hidden sm:inline text-border">•</span>
                <span className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {clubInfo.facultyMentorDetails.experience} Experience
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CORE TEAM (Consistent Aspect Ratio Shape) ─── */}
      <section id="team" className="py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">Our People</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Core Team</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
              The dedicated individuals driving the vision of C Cube forward.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 items-start"
          >
            {coreTeam.map((member: TeamMember, i: number) => (
              <motion.div 
                variants={fadeUp} 
                key={i} 
                className="group flex flex-col items-center text-center"
              >
                <div className="relative mb-8 w-full max-w-[280px] aspect-[4/5] rounded-3xl overflow-hidden drop-shadow-xl transition-all duration-500">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-[center_top] group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/95 backdrop-blur-md px-6 py-2.5 text-xs font-bold text-foreground uppercase tracking-widest shadow-lg whitespace-nowrap">
                    {member.position}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground">{member.name}</h3>
                <p className="text-sm font-medium text-primary mt-2">{member.branch}</p>
                <p className="text-sm text-muted-foreground mt-1">{member.year}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CONTACT / FOOTER ─── */}
      <footer id="contact" className="bg-card pt-32 pb-10 border-t border-border/50 relative overflow-hidden">
        {/* Background hover text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto opacity-30 mt-[-40px]">
          <TextHoverEffect text="C CUBE" />
        </div>

        <div className="mx-auto max-w-7xl px-6 relative z-10 pointer-events-none">
          <div className="flex flex-col items-center text-center mb-16">
            <img src="/assets/ccubelogo.png" alt="C Cube" className="h-16 w-16 mb-6 object-contain pointer-events-auto" />
            <h2 className="font-bold text-2xl text-foreground mb-3">C Cube — VIT Pune</h2>
            <p className="text-base text-muted-foreground max-w-md leading-relaxed mb-8">
              Empowering students through Character, Competence, and Culture.
            </p>
            <div className="flex gap-4 pointer-events-auto">
              <a href="https://www.instagram.com/ccubevitp/" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://www.linkedin.com/in/c-cube-club-vit-pune-165746439" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="mailto:ccube@vit.edu" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </a>
            </div>
          </div>
          
          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-auto">
            <p className="text-sm text-muted-foreground font-medium">
              &copy; {new Date().getFullYear()} C Cube. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm font-medium text-muted-foreground">
              <button onClick={() => scrollTo("home")} className="hover:text-primary transition-colors">Home</button>
              <button onClick={() => scrollTo("about")} className="hover:text-primary transition-colors">About</button>
              <button onClick={() => scrollTo("events")} className="hover:text-primary transition-colors">Events</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
