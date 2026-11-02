// Small animated marks that sit before the tile labels. The motion lives in globals.css,
// so reduced motion stops them along with everything else.

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

// A studio "on air" light: lit and breathing while a track is playing, dim afterwards
export function OnAirLight({ live }: { live: boolean }) {
  return <span className={`on-air ${live ? "on-air-live" : ""}`} aria-hidden="true" />;
}

// A ping spreading out from a fixed point
export function RadarPing() {
  return (
    <svg className="label-icon radar" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="radar-ring" cx="12" cy="12" r="10" {...stroke} />
      <circle className="radar-ring radar-ring-late" cx="12" cy="12" r="10" {...stroke} />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

// A hand that gives a quick wave every few seconds
export function WavingHand() {
  return (
    <svg className="label-icon waving-hand" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
      <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  );
}

// A brush that dabs while its tip cycles through the palette
export function Paintbrush() {
  return (
    <svg className="label-icon paintbrush" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <path d="m11 10 3 3" />
      <path className="paintbrush-tip" d="M6.5 21A3.5 3.5 0 1 0 3 17.5a2.62 2.62 0 0 1-.708 1.792A1 1 0 0 0 3 21z" />
      <path d="M9.969 17.031 21.378 5.624a1 1 0 0 0-3.002-3.002L6.967 14.031" />
    </svg>
  );
}
