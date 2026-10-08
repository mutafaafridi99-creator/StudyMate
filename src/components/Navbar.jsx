import { useState } from "react";
import { Icon } from "./Icons.jsx";

export const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "ask", label: "Ask AI" },
  { id: "summarizer", label: "Summarizer" },
  { id: "quiz", label: "Quiz" },
  { id: "planner", label: "Study Planner" },
  { id: "saved", label: "Saved" },
];

export default function Navbar({ page, onNavigate }) {
  const [open, setOpen] = useState(false);

  const go = (id) => {
    setOpen(false);
    onNavigate(id);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button type="button" className="brand" onClick={() => go("home")} aria-label="StudyMate AI home">
          <span className="brand-logo"><Icon.Cap /></span>
          <span>StudyMate AI</span>
        </button>

        <nav className="nav-desktop" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={"nav-link" + (page === item.id ? " active" : "")}
              aria-current={page === item.id ? "page" : undefined}
              onClick={() => go(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="menu-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <Icon.Close /> : <Icon.Menu />}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" className="nav-mobile" aria-label="Mobile">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={"nav-link" + (page === item.id ? " active" : "")}
              aria-current={page === item.id ? "page" : undefined}
              onClick={() => go(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
