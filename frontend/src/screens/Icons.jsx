// Icons.jsx — small inline SVG icons. No external icon library needed.
// Each takes an optional size; they inherit the current text color.

const base = (size) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

export function HomeIcon({ size = 22 }) {
  return (
    <svg {...base(size)}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

export function UsersIcon({ size = 22 }) {
  return (
    <svg {...base(size)}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6" />
      <path d="M17.5 14.6A5.5 5.5 0 0 1 20.5 20" />
    </svg>
  );
}

export function ListIcon({ size = 22 }) {
  return (
    <svg {...base(size)}>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function UserIcon({ size = 22 }) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function SearchIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function ChevronRight({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function BackIcon({ size = 22 }) {
  return (
    <svg {...base(size)}>
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

export function WalletIcon({ size = 22 }) {
  return (
    <svg {...base(size)}>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 9h18" />
      <circle cx="17" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ArrowUp({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M12 19V6" />
      <path d="m6 11 6-6 6 6" />
    </svg>
  );
}

export function ArrowDown({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M12 5v13" />
      <path d="m6 13 6 6 6-6" />
    </svg>
  );
}

export function LogoutIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
      <path d="M10 12h10" />
      <path d="m17 9 3 3-3 3" />
    </svg>
  );
}
