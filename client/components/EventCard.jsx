import React, { useEffect, useRef, useState } from "react";

const accents = {
  green: "bg-emerald-500",
  violet: "bg-violet-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

export default function EventCard({ event, index }) {
  const [showGlimpses, setShowGlimpses] = useState(false);
  const [activeGlimpse, setActiveGlimpse] = useState(null);
  const touchStartX = useRef(null);
  const isMentorEvent = event.title === "C Cube Mentoring Program";
  const modalImageStyle = isMentorEvent ? { objectPosition: "center 18%" } : undefined;

  useEffect(() => {
    if (activeGlimpse === null) return undefined;

    const handleKeyDown = (keyboardEvent) => {
      if (keyboardEvent.key === "Escape") setActiveGlimpse(null);
      if (keyboardEvent.key === "ArrowLeft") {
        setActiveGlimpse((current) => (current - 1 + event.glimpses.length) % event.glimpses.length);
      }
      if (keyboardEvent.key === "ArrowRight") {
        setActiveGlimpse((current) => (current + 1) % event.glimpses.length);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeGlimpse, event.glimpses.length]);

  const moveGlimpse = (direction) => {
    setActiveGlimpse((current) =>
      (current + direction + event.glimpses.length) % event.glimpses.length,
    );
  };

  const handleTouchStart = (touchEvent) => {
    touchStartX.current = touchEvent.touches[0].clientX;
  };

  const handleTouchEnd = (touchEvent) => {
    if (touchStartX.current === null) return;

    const distance = touchEvent.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(distance) > 45) moveGlimpse(distance > 0 ? -1 : 1);
    touchStartX.current = null;
  };

  return (
    <div className="event-card-wrap">
      <article className="event-card group grid min-h-[470px] overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.06)] md:grid-cols-[0.9fr_1.1fr]">
      <div className="relative aspect-[4/5] min-h-[270px] overflow-hidden bg-[#f8f4ef] md:aspect-auto md:min-h-full">
        <div className="flex h-full min-h-full w-full items-center justify-center bg-[#f8f4ef] p-3 sm:p-4 md:p-5">
          <img
            src={event.image}
            alt={`${event.title} poster`}
            className="event-image h-full w-full object-contain transition duration-700 group-hover:scale-[1.02]"
            style={{ objectPosition: "center center" }}
          />
        </div>
        <div className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-xs font-black tracking-[0.16em] text-slate-800 backdrop-blur">
          {event.shortDate} • {event.date.split(" ")[1]}
        </div>
      </div>

      <div className="flex flex-col justify-between p-7 sm:p-9">
        <div>
          <div className={`mb-6 h-1.5 w-16 rounded-full ${accents[event.accent]}`} />
          <p className="text-sm font-bold text-slate-400">EVENT {String(index + 1).padStart(2, "0")}</p>
          <h3 className="mt-3 font-display text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
            {event.title}
          </h3>
          <p className="mt-5 leading-7 text-slate-600">{event.description}</p>

          <button
            type="button"
            onClick={() => setShowGlimpses((visible) => !visible)}
            aria-expanded={showGlimpses}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
          >
            {showGlimpses ? "Hide glimpses" : "View glimpses"}
            <span aria-hidden="true">{showGlimpses ? "−" : "+"}</span>
          </button>

        </div>

        <div className="mt-8 border-t border-black/5 pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Objective
          </p>
          <p className="mt-2 font-semibold leading-6 text-slate-800">{event.objective}</p>
        </div>
      </div>
      </article>

      {showGlimpses && (
        <div className="mt-5 rounded-[2rem] border border-black/5 bg-white p-5 shadow-[0_20px_70px_rgba(0,0,0,0.06)] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            {event.title} • Glimpses
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {event.glimpses.map((image, imageIndex) => (
              <img
                key={`${event.title}-${imageIndex}`}
                src={image}
                alt={`${event.title} glimpse ${imageIndex + 1}`}
                onClick={() => setActiveGlimpse(imageIndex)}
                className="aspect-[4/3] w-full cursor-zoom-in rounded-xl object-cover transition duration-300 hover:scale-[1.03]"
                style={
                  isMentorEvent
                    ? { objectPosition: "center 18%" }
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {activeGlimpse !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${event.title} glimpses`}
          onClick={() => setActiveGlimpse(null)}
        >
          <div
            className="relative flex h-[min(65vh,720px)] min-h-[40vh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-2xl sm:p-6"
            onClick={(clickEvent) => clickEvent.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{event.title}</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {activeGlimpse + 1} / {event.glimpses.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveGlimpse(null)}
                aria-label="Close glimpses"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-2xl leading-none text-slate-700 transition hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <div className="relative mt-4 min-h-0 flex-1">
              <div className="h-full overflow-hidden rounded-2xl bg-slate-100">
                <div
                  className="flex h-full transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${activeGlimpse * 100}%)` }}
                >
                  {event.glimpses.map((image, imageIndex) => (
                    <img
                      key={`${event.title}-expanded-${imageIndex}`}
                      src={image}
                      alt={`${event.title} glimpse ${imageIndex + 1}`}
                      className="h-full w-full shrink-0 object-contain"
                      style={modalImageStyle}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => moveGlimpse(-1)}
                aria-label="Previous glimpse"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-2xl text-slate-900 shadow-lg transition hover:bg-white"
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={() => moveGlimpse(1)}
                aria-label="Next glimpse"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-2xl text-slate-900 shadow-lg transition hover:bg-white"
              >
                &gt;
              </button>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {event.glimpses.map((image, imageIndex) => (
                <button
                  key={`${event.title}-thumb-${imageIndex}`}
                  type="button"
                  onClick={() => setActiveGlimpse(imageIndex)}
                  aria-label={`Show glimpse ${imageIndex + 1}`}
                  className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-16 sm:w-24 ${
                    activeGlimpse === imageIndex ? "border-slate-950" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                    style={
                      isMentorEvent
                        ? { objectPosition: "center 18%" }
                        : undefined
                    }
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
