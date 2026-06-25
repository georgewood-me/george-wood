const projects = [
  {
    name: "Tom Dixon",
    awards: ["W3 Awards x 4"],
    url: "https://www.tomdixon.net/",
  },
  {
    name: "Belstaff",
    awards: ["W3 Awards x 3"],
    url: "https://belstaff.com/",
  },
  {
    name: "Somewhere Good",
    awards: ["Awwwards Honourable Mention"],
    url: "https://somewheregood.studio/",
  },
  {
    name: "Faber & Faber",
    awards: [],
    url: "#",
    disabled: true,
  },  
  {
    name: "White Cube",
    awards: [],
    url: "#",
    disabled: true,
  },
  {
    name: "ParalympicsGB",
    awards: [],
    url: "#",
    disabled: true,
  },
  {
    name: "BandAid 30",
    awards: [],
    url: "#",
    disabled: true,
  },
];

export default function ProjectList() {
  return (
    <section className="mt-16">
      {projects.map((project, i) => (
        <div
          key={i}
          className="relative flex items-center justify-between py-3 -mx-4 px-4"
          style={{
            borderTop: i === 0 ? "1px solid var(--border-color)" : "none",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-sm font-semibold shrink-0">{project.name}</span>
            {project.awards.map((award, j) => (
              <span
                key={j}
                className="text-[11px] px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap"
                style={{ border: "1px solid var(--border-color)" }}
              >
                {award}
              </span>
            ))}
          </div>
          {project.url && (
            <>
              <div className="absolute right-4 top-0 bottom-0 flex items-center z-10">
                <div className="absolute -left-8 top-0 bottom-0 w-8 pointer-events-none" style={{ background: "linear-gradient(to right, transparent, var(--bg-color))" }} aria-hidden="true" />
              <div className="absolute right-0 top-0 bottom-0 -z-10 bg-(--bg-color)" style={{ width: "calc(100% + 2px)" }} aria-hidden="true" />
                {project.disabled ? (
                  <span className="text-sm opacity-40 line-through bg-(--bg-color)">
                    View site ↗
                  </span>
                ) : (
                  <a
                    href={project.url}
                    className="text-sm opacity-70 hover:opacity-100 transition-opacity bg-(--bg-color)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View site ↗
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </section>
  );
}
