import React, { useRef } from "react";
import gsap from "gsap";

const ring = {
  green: "ring-emerald-300",
  violet: "ring-violet-300",
  orange: "ring-orange-300",
  red: "ring-red-300",
};

export default function TeamCard({ member }) {
  const photoRef = useRef(null);
  const introRef = useRef(null);

  const enter = () => {
    gsap.to(photoRef.current, {
      y: -16,
      scale: 1.18,
      duration: 0.7,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(introRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const leave = () => {
    gsap.to(photoRef.current, {
      y: 0,
      scale: 1,
      duration: 0.55,
      ease: "power2.inOut",
      overwrite: "auto",
    });
    gsap.to(introRef.current, {
      y: -6,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      overwrite: "auto",
    });
  };

  return (
    <article
      className="team-card group relative text-center"
    >
      <div
        onMouseEnter={enter}
        onMouseLeave={leave}
        className="relative mx-auto h-48 w-48 sm:h-56 sm:w-56"
      >
        <div className="absolute inset-2 rounded-full bg-slate-100" />
        <div className={`absolute inset-0 rounded-full ring-2 ${ring[member.color]} ring-offset-8 ring-offset-white`} />
        <img
          ref={photoRef}
          src={member.image}
          alt={member.name}
          className="relative z-10 h-full w-full rounded-full bg-slate-100 object-cover object-top p-0 transition-shadow duration-300 hover:shadow-[0_18px_30px_rgba(15,23,42,0.2)]"
        />
      </div>

      <div className="mt-7">
        <h3 className="mt-2 font-display text-xl font-black text-slate-950">
          {member.name}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {member.branch}
          <br />
          {member.year}
        </p>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.17em] text-slate-400">
          {member.position}
        </p>
        <p
          ref={introRef}
          className="mx-auto mt-3 max-w-xs -translate-y-1 text-sm leading-6 text-slate-600 opacity-0"
        >
          {member.intro}
        </p>
      </div>
    </article>
  );
}
