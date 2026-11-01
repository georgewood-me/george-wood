// Cached reads of the CSS variables the control panel sets on <html>.
// getComputedStyle can force a style recalculation, so animations read through this
// cache instead; it's cleared only when the panel changes a variable.

const cache = new Map<string, string>();
const listeners = new Set<() => void>();
let observing = false;

function observe() {
  if (observing || typeof window === "undefined") return;
  observing = true;
  new MutationObserver(() => {
    cache.clear();
    listeners.forEach((listener) => listener());
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
}

export function rootVar(name: string) {
  observe();
  let value = cache.get(name);
  if (value === undefined) {
    value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    cache.set(name, value);
  }
  return value;
}

export function onRootVarsChange(listener: () => void) {
  observe();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// "#fff" or "#ffffff" to "255, 255, 255"; the stylesheet build shortens hex colours
export function hexToRgb(color: string) {
  let hex = color.trim().replace("#", "") || "ffffff";
  if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
  return `${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(hex.slice(4, 6), 16)}`;
}

// Decorative canvases don't need more than 2x; 3x phone screens otherwise
// paint over twice as many pixels for no visible gain
export const canvasDpr = () => Math.min(window.devicePixelRatio || 1, 2);
