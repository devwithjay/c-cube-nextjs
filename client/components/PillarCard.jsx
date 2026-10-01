import React from "react";

const colors = {
  green: "border-emerald-200 bg-emerald-50/70 text-emerald-700",
  violet: "border-violet-200 bg-violet-50/70 text-violet-700",
  orange: "border-orange-200 bg-orange-50/70 text-orange-700",
};

export default function PillarCard({ letter, title, text, color }) {
  return (
    <article className={`group rounded-[2rem] border p-6 transition duration-500 hover:-translate-y-2 hover:shadow-soft ${colors[color]}`}>
      <div className="mb-8 flex items-center justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-xl font-black shadow-sm">
          {letter}
        </span>
        <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">
          Pillar
        </span>
      </div>
      <h3 className="font-display text-2xl font-black tracking-tight text-slate-950">
        {title}
      </h3>
      <p className="mt-3 leading-7 text-slate-600">{text}</p>
    </article>
  );
}
