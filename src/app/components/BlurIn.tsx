import type { CSSProperties } from "react";

// Text that comes into focus a word at a time the first time its tile scrolls into view.
// The motion is in globals.css (.blur-in), keyed off the tile's data-seen attribute.

export const blurDelay = (ms: number) => ({ "--delay": `${Math.round(ms)}ms` }) as CSSProperties;

// Long passages speed up so the whole thing still lands in under a second
const stepFor = (count: number) => Math.min(28, 900 / count);

export function BlurWords({ text, start = 0 }: { text: string; start?: number }) {
  const words = text.split(" ");
  const step = stepFor(words.length);
  return words.map((word, i) => (
    <span key={i}>
      {i > 0 && " "}
      <span className="blur-in inline-block" style={blurDelay(start + i * step)}>
        {word}
      </span>
    </span>
  ));
}
