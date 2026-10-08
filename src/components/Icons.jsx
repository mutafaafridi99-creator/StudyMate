// Small inline SVG icons (no icon library needed).
const base = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
  focusable: "false",
};

export const Icon = {
  Home: (p) => (
    <svg {...base} {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>
  ),
  Chat: (p) => (
    <svg {...base} {...p}><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
  ),
  Summary: (p) => (
    <svg {...base} {...p}><path d="M4 6h16M4 12h16M4 18h10" /></svg>
  ),
  Quiz: (p) => (
    <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7" /><path d="M12 17h.01" /></svg>
  ),
  Plan: (p) => (
    <svg {...base} {...p}><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M8 2v4M16 2v4M3 10h18" /></svg>
  ),
  Bookmark: (p) => (
    <svg {...base} {...p}><path d="M6 3h12v18l-6-4-6 4z" /></svg>
  ),
  Copy: (p) => (
    <svg {...base} {...p}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></svg>
  ),
  Trash: (p) => (
    <svg {...base} {...p}><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
  ),
  Menu: (p) => (
    <svg {...base} {...p}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
  ),
  Close: (p) => (
    <svg {...base} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
  ),
  Cap: (p) => (
    <svg {...base} {...p}><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5" /></svg>
  ),
  Check: (p) => (
    <svg {...base} {...p}><path d="M5 12l5 5L20 7" /></svg>
  ),
  X: (p) => (
    <svg {...base} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
  ),
};
