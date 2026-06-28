"use client";

import { useRef, useState } from "react";
import Image from "next/image";

const testimonials = [
  {
    quote:
      "George is one of the finest digital designers I’ve ever worked with. He is not only a first class creative and product designer but has led our design function at SOON_ for many years. He has a warm, supportive and engaging management style, has led communications with challenging clients and always guides the project to the best outcomes. George brings his considered and structured process to all his work, whether it’s small creative pieces or presenting critical projects to industry titans like world renowned designer Tom Dixon in person. George is an engaging Design leader with a strong production pedigree to whom I give my strongest recommendation.",
    name: "Alex Light",
    role: "Founder & Managing Director",
    logo: "/images/soon.svg",
  },
  {
    quote:
      "As a design engineer, working with George is always a pleasure. His shared understanding of the codebase is something that really enables deep collaboration on projects, particularly when it comes to adding that important layer of polish to UI or motion.",
    name: "Sam Goddard",
    role: "Staff Design Engineer",
    logo: "/images/intercom.svg",
  },
  {
    quote:
      "Collaborating with George is always a rewarding experience as an engineer. His strong coding knowledge makes teamwork seamless, as he’s able to speak the same language when it comes to implementation — often even providing working prototypes. Combined with his top-tier design sensibility, it always makes for an extremely high-quality end-product.",
    name: "Ste Greig",
    role: "Senior Front-end Engineer",
    logo: "/images/intercom.svg",
  },
  {
    quote:
      "Working with George has been a truly positive experience. He is exceptionally collaborative and open to ideas, making the entire process smooth and productive. George is very easy to work with, always bringing a helpful attitude and that classic ‘Notts’ sense of humour to the table. His contributions were instrumental in delivering a game-changing project for our business.",
    name: "Owen Dryden",
    role: "Director of Digital & Ecommerce",
    logo: "/images/tom-dixon.svg",
  },
];

function QuoteCard({ t, isLast }: { t: (typeof testimonials)[number]; isLast: boolean }) {
  return (
    <div
      className="w-[calc(100vw-32px)] sm:w-[400px] shrink-0 snap-start p-5 flex flex-col justify-between"
      style={{
        borderRight: isLast ? "none" : "1px solid var(--border-color)",
        minHeight: 220,
      }}
    >
      <p className="text-sm leading-relaxed whitespace-normal">{t.quote}</p>
      <div className="flex items-end justify-between mt-6">
        <div>
          <p className="text-xs font-semibold">{t.name}</p>
          <p className="text-xs opacity-50">{t.role}</p>
        </div>
        {t.logo && (
          <Image src={t.logo} alt="" width={100} height={24} className="opacity-70" style={{ filter: "invert(var(--svg-invert))" }} />
        )}
      </div>
    </div>
  );
}

export default function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    if (direction === "right" && !canScrollRight) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      const card = el.querySelector<HTMLElement>(":scope > div");
      const step = card ? card.offsetWidth : 400;
      el.scrollBy({ left: direction === "right" ? step : -step, behavior: "smooth" });
    }
  }

  return (
    <section className="mt-16 -mx-4 relative">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory"
        style={{
          borderTop: "1px solid var(--border-color)",
          borderBottom: "1px solid var(--border-color)",
          scrollbarWidth: "none",
        }}
        onScroll={updateScrollState}
      >
        {testimonials.map((t, i) => (
          <QuoteCard key={i} t={t} isLast={i === testimonials.length - 1} />
        ))}
      </div>

      {canScrollRight && (
        <div className="absolute inset-y-0 right-0 w-12 pointer-events-none z-10" style={{ background: "linear-gradient(to left, var(--bg-color), transparent)" }} />
      )}

      <div className="flex">
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className="flex items-center justify-center w-[48px] h-[48px] hover:opacity-100 transition-opacity"
          style={{ border: "1px solid var(--border-color)", borderTop: "none", borderLeft: "none" }}
          aria-label="Previous quote"
        >
          <img src="/images/left.svg" alt="" width={16} height={10} style={{ filter: "invert(var(--svg-invert))", opacity: canScrollLeft ? 0.7 : 0.2 }} />
        </button>
        <button
          onClick={() => scroll("right")}
          className="flex items-center justify-center w-[48px] h-[48px] hover:opacity-100 transition-opacity"
          style={{ border: "1px solid var(--border-color)", borderTop: "none", borderLeft: "none" }}
          aria-label="Next quote"
        >
          <img src="/images/right.svg" alt="" width={16} height={10} style={{ filter: "invert(var(--svg-invert))" }} className="opacity-70" />
        </button>
      </div>
    </section>
  );
}
