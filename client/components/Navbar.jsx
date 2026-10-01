import React, { useEffect, useState } from "react";
import LogoLockup from "./LogoLockup";
import { navItems } from "../data/clubData";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("home");

  useEffect(() => {
    const sectionIds = [...navItems.map((item) => item.id), "contact"];
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);

      const activationPoint = window.scrollY + 180;
      const currentSection = sectionIds.reduce((activeId, sectionId) => {
        const section = document.getElementById(sectionId);
        if (!section) return activeId;

        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        return sectionTop <= activationPoint ? sectionId : activeId;
      }, "home");

      setActiveId(currentSection);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveId(id);
    setOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border px-4 py-3 shadow-[0_12px_45px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-colors duration-300 sm:px-5 ${
          scrolled
            ? "border-white/10 bg-black text-white"
            : "border-black/5 bg-[#fdf9f2]/90"
        }`}
      >
        <button onClick={() => scrollTo("home")} aria-label="Go to home">
          <LogoLockup dark={scrolled} />
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition duration-300 ${
                scrolled
                  ? activeId === item.id
                    ? "bg-white text-black hover:bg-white"
                    : "text-white/75 hover:bg-white hover:text-black"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo("contact")}
            className={`ml-2 rounded-xl px-4 py-2 text-sm font-bold transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
              scrolled
                ? activeId === "contact"
                  ? "bg-white text-black hover:bg-white"
                  : "text-white/75 hover:bg-white hover:text-black"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            Contact
          </button>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className={`grid h-10 w-10 place-items-center rounded-xl border md:hidden ${
            scrolled
              ? "border-white/10 bg-white/10 text-white"
              : "border-black/5 bg-[#eee5d7]"
          }`}
          aria-label="Toggle menu"
        >
          <span className="text-lg">{open ? "×" : "☰"}</span>
        </button>

        {open && (
          <div className="absolute left-4 right-4 top-[calc(100%+8px)] rounded-2xl border border-black/5 bg-white p-2 text-black shadow-xl md:hidden">
            {[...navItems, { label: "Contact", id: "contact" }].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
