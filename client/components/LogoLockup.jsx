import React from "react";

export default function LogoLockup({ dark = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-transparent">
        <img
          src="/assets/ccubelogo.png"
          alt="C Cube logo"
          className="h-full w-full object-contain"
        />
      </div>
      <div
        className={`hidden h-8 w-px sm:block ${dark ? "bg-white/20" : "bg-black/10"}`}
      />
      <img
        src="/assets/vit-logo-transparent.png"
        alt="Vishwakarma Institute of Technology logo"
        className="h-9 w-auto object-contain"
      />
      <div className="hidden leading-tight sm:block">
        <p
          className={`font-display text-[11px] font-extrabold tracking-[0.12em] ${
            dark ? "text-white" : "text-slate-900"
          }`}
        >
          C CUBE
        </p>
        <p
          className={`text-[9px] font-medium uppercase tracking-[0.1em] ${
            dark ? "text-white/60" : "text-slate-500"
          }`}
        >
          VIT Pune
        </p>
      </div>
    </div>
  );
}
