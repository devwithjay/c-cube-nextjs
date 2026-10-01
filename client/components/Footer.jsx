import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-5">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/15 bg-white p-2">
              <img
                src="/assets/ccubelogo.png"
                alt="C Cube logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="h-10 w-px bg-white/20" />
            <img
              src="/assets/vit-logo.png"
              alt="Vishwakarma Institute of Technology logo"
              className="h-12 w-auto max-w-36 object-contain"
            />
          </div>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/55">
            Character. Competence. Culture. A student-development platform at
            VIT Pune.
          </p>
        </div>
        <p className="text-sm text-white/40">
          © {new Date().getFullYear()} C Cube. Built for student growth.
        </p>
      </div>
    </footer>
  );
}
