import Link from "next/link";

/** DriveReady mark: rounded gradient tile with a three-lamp signal, go-lamp lit. */
export function Mark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="dr-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2457e6" />
          <stop offset="1" stopColor="#6a35e8" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#dr-mark)" />
      <rect x="14" y="6" width="12" height="28" rx="6" fill="#0a1633" />
      <circle cx="20" cy="12.5" r="2.8" fill="#fff" opacity="0.25" />
      <circle cx="20" cy="20" r="2.8" fill="#fff" opacity="0.25" />
      <circle cx="20" cy="27.5" r="3.2" fill="#3ccf7f" />
    </svg>
  );
}

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="DriveReady home">
      <Mark />
      <span>
        <span className="brand-name">DriveReady</span>
        <span className="brand-sub">
          <span className="hide-xs">DMV permit practice · </span>by <b>Pytron Digital</b>
        </span>
      </span>
    </Link>
  );
}

/** Generic road-sign silhouettes (shape + color only, no agency marks) for decoration. */
export function SignShape({ shape, size = 56 }: { shape: "octagon" | "yield" | "diamond" | "pentagon" | "circle" | "rect"; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 100 100", "aria-hidden": true as const, focusable: "false" as const };
  switch (shape) {
    case "octagon":
      return (
        <svg {...common}>
          <polygon points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30" fill="#c2362f" />
          <polygon points="33,12 67,12 88,33 88,67 67,88 33,88 12,67 12,33" fill="none" stroke="#fff" strokeWidth="4" />
        </svg>
      );
    case "yield":
      return (
        <svg {...common}>
          <polygon points="4,10 96,10 50,92" fill="#c2362f" />
          <polygon points="22,20 78,20 50,70" fill="#fff" />
        </svg>
      );
    case "diamond":
      return (
        <svg {...common}>
          <polygon points="50,3 97,50 50,97 3,50" fill="#f2b705" />
          <polygon points="50,11 89,50 50,89 11,50" fill="none" stroke="#10201a" strokeWidth="3" />
          <path d="M40 66 L50 34 L60 66" fill="none" stroke="#10201a" strokeWidth="6" strokeLinecap="round" />
        </svg>
      );
    case "pentagon":
      return (
        <svg {...common}>
          <polygon points="50,4 94,40 94,96 6,96 6,40" fill="#b6d635" />
          <polygon points="50,13 86,43 86,88 14,88 14,43" fill="none" stroke="#10201a" strokeWidth="3" />
        </svg>
      );
    case "circle":
      return (
        <svg {...common}>
          <circle cx="50" cy="50" r="46" fill="#f2b705" />
          <path d="M22 22 L78 78 M78 22 L22 78" stroke="#10201a" strokeWidth="7" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="16" y="6" width="68" height="88" rx="6" fill="#fff" stroke="#10201a" strokeWidth="4" />
          <rect x="30" y="30" width="40" height="8" rx="2" fill="#10201a" />
          <rect x="30" y="50" width="40" height="22" rx="3" fill="#10201a" />
        </svg>
      );
  }
}
