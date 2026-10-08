import { Icon } from "../components/Icons.jsx";

const FEATURES = [
  { id: "ask", title: "Ask AI", text: "Get clear, simple answers to any study question.", icon: Icon.Chat },
  { id: "summarizer", title: "Summarize", text: "Turn long notes into short summaries and key points.", icon: Icon.Summary },
  { id: "quiz", title: "Generate Quiz", text: "Practice with multiple-choice questions on any topic.", icon: Icon.Quiz },
  { id: "planner", title: "Study Planner", text: "Get a practical weekly plan before your exam.", icon: Icon.Plan },
];

export default function Home({ onNavigate }) {
  return (
    <div>
      <section className="hero">
        <p className="eyebrow">STUDYMATE AI</p>
        <h1>Study smarter. Learn faster.</h1>
        <p className="hero-sub">
          Your simple AI-powered study companion for explanations, summaries, quizzes and study planning.
        </p>
        <div className="hero-buttons">
          <button type="button" className="btn btn-primary btn-lg" onClick={() => onNavigate("ask")}>
            Ask AI
          </button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => onNavigate("quiz")}>
            Generate Quiz
          </button>
        </div>
      </section>

      <section aria-label="Tools" className="feature-grid">
        {FEATURES.map((f) => {
          const Ico = f.icon;
          return (
            <button key={f.id} type="button" className="card feature" onClick={() => onNavigate(f.id)}>
              <span className="feature-icon"><Ico /></span>
              <span className="feature-title">{f.title}</span>
              <span className="feature-text">{f.text}</span>
            </button>
          );
        })}
      </section>

      <section className="card built">
        <h2>Built for students</h2>
        <p>
          StudyMate AI explains hard ideas in plain language, helps you revise faster and keeps your
          study time organised. No sign-up needed: just open a tool and start learning.
        </p>
      </section>
    </div>
  );
}
