"use client";

import { useRef } from "react";
import Image from "next/image";

const projects = [
  { src: "/screens/belstaff01.png", name: "Project Name", year: "2025" },
  { src: "/screens/belstaff02.png", name: "Project Name", year: "2025" },
  { src: "/screens/belstaff03.png", name: "Project Name", year: "2025" },
  { src: "/screens/cms01.png", name: "Project Name", year: "2025" },
  { src: "/screens/cms02.png", name: "Project Name", year: "2025" },
  { src: "/screens/jomo.png", name: "Project Name", year: "2025" },
  { src: "/screens/jomo02.png", name: "Project Name", year: "2025" },
  { src: "/screens/jomo03.png", name: "Project Name", year: "2025" },
  { src: "/screens/sg01.png", name: "Project Name", year: "2025" },
  { src: "/screens/sg02.png", name: "Project Name", year: "2025" },
  { src: "/screens/shay.png", name: "Project Name", year: "2025" },
  { src: "/screens/td01.png", name: "Project Name", year: "2025" },
  { src: "/screens/td02.png", name: "Project Name", year: "2025" },
  { src: "/screens/td03.png", name: "Project Name", year: "2025" },
  { src: "/screens/td04.png", name: "Project Name", year: "2025" },
];

export default function ProjectSlideshow() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className="flex gap-4 overflow-x-auto px-4 py-8"
      style={{ scrollbarWidth: "none" }}
    >
      {projects.map((project, i) => (
        <div key={i} className="shrink-0">
          <div className="relative w-[400px] h-[400px]">
            <Image
              src={project.src}
              alt={`${project.name} ${project.year}`}
              fill
              className="object-cover"
              sizes="400px"
            />
          </div>
          <p
            className="mt-2 text-white"
            style={{ fontSize: "0.6875rem" }}
          >
            <span className="font-sans font-bold" style={{ fontSize: "0.875rem" }}>{project.name}</span>{" "}
            <span className="font-mono">{project.year}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
