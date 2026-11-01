import ControlPanel from "./components/ControlPanel";
import {
  IntroTile,
  NowPlayingTile,
  ClockTile,
  ContactTile,
  MakeItYoursTile,
  WorkTile,
  KindWordsTile,
  FilmsTile,
  PageHeader,
} from "./components/BentoTiles";

const CONTAINER_WIDTH = 1120;

export default function Home() {
  return (
    <div
      className="content-container relative min-h-screen flex flex-col w-full max-w-[1120px]"
      style={{
        marginLeft: "var(--container-ml, 0)",
        marginRight: "var(--container-mr, auto)",
        borderLeft: "var(--container-bl, none)",
        borderRight: "var(--container-br, 1px solid var(--border-color))",
        transition: "margin 0.4s ease",
      }}
    >
      <PageHeader />

      {/* Ruled grid: the 1px gaps show the border colour through, so every tile shares one hairline */}
      <main className="grid grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "var(--border-color)" }}>
        <IntroTile index={0} />
        <NowPlayingTile index={1} />
        <ClockTile index={2} />
        <ContactTile index={3} />
        <MakeItYoursTile index={4} />
        <WorkTile index={5} />
        <KindWordsTile index={6} />
        <FilmsTile index={7} />
      </main>

      <ControlPanel containerWidth={CONTAINER_WIDTH} desktopTop={20} />
    </div>
  );
}
