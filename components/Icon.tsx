import type { SVGProps } from "react";

/** Small hand-drawn icon set (24px grid, stroke-based) — no icon library dependency. */
const PATHS: Record<string, string> = {
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  arrowLeft: "M19 12H5M11 18l-6-6 6-6",
  check: "M5 12.5l4.5 4.5L19 7",
  x: "M6 6l12 12M18 6L6 18",
  book: "M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5zM4 19a2 2 0 012-2h13",
  external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5",
  shield: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3zM8.5 12l2.5 2.5 4.5-5",
  clock: "M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  flag: "M5 21V4M5 4h11l-2 4 2 4H5",
  target: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01",
  shuffle: "M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5",
  zap: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
  layers: "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5",
  sign: "M12 2l10 10-10 10L2 12 12 2z",
  scale: "M12 3v18M5 7h14M7 7l-3 7a3 3 0 006 0L7 7zM17 7l-3 7a3 3 0 006 0l-3-7z",
  heart: "M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z",
  trendDown: "M3 7l6 6 4-4 8 8M21 11v6h-6",
  rotate: "M4 4v6h6M20 20v-6h-6M5.5 15A7 7 0 0018 17.5M18.5 9A7 7 0 006 6.5",
  sparkle: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6",
  info: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v6M12 7.5h.01",
  alert: "M12 3l10 18H2L12 3zM12 10v5M12 18h.01",
  map: "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14",
  globe: "M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18",
  file: "M14 3H6a1 1 0 00-1 1v16a1 1 0 001 1h12a1 1 0 001-1V8l-5-5zM14 3v5h5M8 13h8M8 17h6",
  clipboard: "M9 4h6v3H9zM9 5H6a1 1 0 00-1 1v14a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1h-3M8.5 13l2.5 2.5L15.5 11",
  id: "M3 6a1 1 0 011-1h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6zM8.5 12a2 2 0 100-4 2 2 0 000 4zM5.5 16c.5-1.5 1.7-2 3-2s2.5.5 3 2M14 10h4M14 14h3",
  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4",
  chat: "M21 11.5a8.4 8.4 0 01-12.3 7.4L3 21l2-5.4A8.5 8.5 0 1121 11.5z",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
