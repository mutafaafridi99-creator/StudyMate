import { useState, useEffect } from "react";
import Navbar, { NAV_ITEMS } from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Ask from "./pages/Ask.jsx";
import Summarizer from "./pages/Summarizer.jsx";
import Quiz from "./pages/Quiz.jsx";
import Planner from "./pages/Planner.jsx";
import Saved from "./pages/Saved.jsx";

const PAGES = {
  home: Home,
  ask: Ask,
  summarizer: Summarizer,
  quiz: Quiz,
  planner: Planner,
  saved: Saved,
};

function pageFromHash() {
  const id = (typeof window !== "undefined" ? window.location.hash : "").replace("#", "");
  return NAV_ITEMS.some((n) => n.id === id) ? id : "home";
}

// No router library: the page is chosen with simple state + the URL hash,
// so the browser Back button and page refresh keep working on any host.
export default function App() {
  const [page, setPage] = useState(pageFromHash);

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (id) => {
    window.location.hash = id === "home" ? "" : id;
    setPage(id);
    window.scrollTo({ top: 0 });
  };

  const Page = PAGES[page] || Home;

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar page={page} onNavigate={navigate} />
      <main id="main" className="container">
        {/* key resets a page's form state when you switch tools */}
        <Page key={page} onNavigate={navigate} />
      </main>
      <footer className="footer">
        <p>StudyMate AI · AI can make mistakes. Double-check important facts.</p>
      </footer>
    </>
  );
}
