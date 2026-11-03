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

const CONTAINER_WIDTH = 1280;

export default function Home() {
  return (
    <div
      className="content-container relative min-h-screen flex flex-col w-full max-w-[1280px]"
      style={{
        marginLeft: "var(--container-ml, 0)",
        marginRight: "var(--container-mr, auto)",
        borderLeft: "var(--container-bl, none)",
        transition: "margin 0.4s ease",
      }}
    >
      <PageHeader />

      {/* Ruled grid: each tile draws its own right and bottom hairline (see .bento-tile::after) */}
      <main className="grid grid-cols-2 lg:grid-cols-4">
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
