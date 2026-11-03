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

// A pointer that clicks, sending a ring out from its tip
export function ClickingCursor() {
  return (
    <svg className="label-icon cursor-click" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <circle className="cursor-ring" cx="4" cy="4" r="5" />
      <path
        className="cursor-arrow"
        d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"
      />
    </svg>
  );
}

// A heart that gives a double beat every couple of seconds
export function BeatingHeart() {
  return (
    <svg className="label-icon beating-heart" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

// An eye that looks around and blinks now and then
export function BlinkingEye() {
  return (
    <svg className="label-icon" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <g className="eye-lid">
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle className="eye-pupil" cx="12" cy="12" r="3" fill="currentColor" />
      </g>
    </svg>
  );
}
