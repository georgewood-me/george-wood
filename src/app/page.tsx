import Header from "./components/Header";
import ListeningTicker from "./components/ListeningTicker";
import ProjectList from "./components/ProjectList";
import Testimonials from "./components/Testimonials";
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
      }}
    >
      <div className="px-4">
        <Header />
      </div>

      <ListeningTicker />

      <div className="px-4 flex-1">
        <section className="mt-16 text-sm leading-relaxed">
          <p className="mb-4">
            I&apos;m a Product Designer at Stripe working in Extensibility. Helping to shape how developers and users extend our platform with apps and extensions.
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
      </div>

      <footer className="px-4 py-6 mt-16 flex items-center justify-between text-sm">
        <span className="font-semibold">2026</span>
        <a href="https://x.com/georgewood_me" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">@georgewood_me</a>
      </footer>

      <ControlPanel />
    </div>
  );
}
