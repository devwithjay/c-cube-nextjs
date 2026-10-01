import React from "react";

export default function SectionTitle({ number, title, eyebrow, accent = "green" }) {
  return (
    <div className="section-heading relative mb-14 min-h-[105px] overflow-visible md:mb-20">
      <div className="section-title-center pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <p
          className={`font-display text-[clamp(3.5rem,11vw,9rem)] font-black leading-none tracking-[-0.07em] text-${accent}-placeholder`}
        >
          {title}
        </p>
      </div>

      <div className="section-title-docked relative z-10 flex items-end gap-4 pt-5">
        <span className="font-mono text-xs font-bold tracking-[0.2em] text-slate-400">
          {number}
        </span>
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
            {eyebrow}
          </p>
          <h2 className="font-display text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
}
