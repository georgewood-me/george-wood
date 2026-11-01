import Header from "./components/Header";
import ListeningTicker from "./components/ListeningTicker";
import ProjectList from "./components/ProjectList";
import Testimonials from "./components/Testimonials";
import RecentFilms from "./components/RecentFilms";
import ControlPanel from "./components/ControlPanel";

export default function Home() {
  return (
    <div
      className="content-container relative min-h-screen flex flex-col w-full max-w-[640px]"
      style={{
        marginLeft: "var(--container-ml, 0)",
        marginRight: "var(--container-mr, auto)",
        borderLeft: "var(--container-bl, none)",
        borderRight: "var(--container-br, 1px solid var(--border-color))",
        transition: "margin 0.4s ease",
      }}
    >
      <div className="px-4">
        <Header />
      </div>

      <ListeningTicker />

      <div className="px-4 flex-1">
        <section className="mt-16 text-sm leading-relaxed">
          <p className="mb-4">
            I&apos;m a Product Designer at Stripe working in Extensibility, helping to shape how developers and users extend our platform with apps and extensions.
          </p>
          <p className="mb-4">
            I previously spent over 15 years working in agencies, mainly specialising in designing ecommerce platforms and the tools that empower brands to build and curate campaigns their own way.
          </p>
          <p>
            Across all of that, what&apos;s stayed consistent is a focus on the people actually using the thing - and a habit of noticing the small stuff that&apos;s easy to overlook but ends up mattering.
          </p>
        </section>

        <ProjectList />
        <Testimonials />
        <RecentFilms />
      </div>

      <footer
        className="mt-16 flex items-center justify-between text-sm"
        style={{ borderTop: "1px solid var(--border-color)" }}
      >
        <span
          className="font-semibold py-4 px-3 sm:px-4 whitespace-nowrap"
          style={{ borderRight: "1px solid var(--border-color)" }}
        >© 2026<span className="hidden sm:inline"> George Wood</span></span>
        <div className="flex">
          <a
            href="mailto:georgewood.me@gmail.com"
            className="opacity-80 hover:opacity-100 transition-opacity py-4 px-3 sm:px-4"
            style={{ borderLeft: "1px solid var(--border-color)" }}
          >Email</a>
          <a
            href="https://www.linkedin.com/in/georgewood-me/"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-80 hover:opacity-100 transition-opacity py-4 px-3 sm:px-4"
            style={{ borderLeft: "1px solid var(--border-color)" }}
          >LinkedIn</a>
          <a
            href="https://x.com/georgewood_me"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-80 hover:opacity-100 transition-opacity py-4 px-3 sm:px-4"
            style={{ borderLeft: "1px solid var(--border-color)" }}
          >@georgewood_me</a>
        </div>
      </footer>

      <ControlPanel />
    </div>
  );
}
