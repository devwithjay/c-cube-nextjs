import React from "react";
import { Instagram, Linkedin, Mail } from "lucide-react";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

export default function Footer() {
  return (
    <footer className="relative bg-[#09090b] px-6 py-20 text-white overflow-hidden flex flex-col items-center justify-center border-t border-white/5">
      <div className="absolute inset-0 flex items-center justify-center opacity-40">
        <TextHoverEffect text="C CUBE" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="h-16 w-16 mb-6">
          <img
            src="/assets/ccubelogo.png"
            alt="C Cube logo"
            className="h-full w-full object-contain"
          />
        </div>
        
        <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-3">
          C Cube — VIT Pune
        </h2>
        
        <p className="text-sm md:text-base text-white/60 mb-10 max-w-md">
          Empowering students through Character, Competence, and Culture.
        </p>
        
        <div className="flex gap-4">
          <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10">
            <Instagram className="h-4 w-4 text-white/80" />
          </a>
          <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10">
            <Linkedin className="h-4 w-4 text-white/80" />
          </a>
          <a href="mailto:ccube@vit.edu" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10">
            <Mail className="h-4 w-4 text-white/80" />
          </a>
        </div>
      </div>
    </footer>
  );
}
