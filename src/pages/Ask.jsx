import { useState } from "react";
import Alert from "../components/Alert.jsx";
import ResultCard from "../components/ResultCard.jsx";
import { Select, SUBJECTS, LEVELS } from "../components/Fields.jsx";
import { askServer } from "../services/ai.js";

export default function Ask() {
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [difficulty, setDifficulty] = useState(LEVELS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState("");
  const [asked, setAsked] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!question.trim()) {
      setError("Please type a question first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const text = await askServer({ mode: "ask", question, subject, difficulty });
      setAnswer(text);
      setAsked(question.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Ask AI</h1>
      <p className="page-sub">Ask anything. You will get a clear, student-friendly explanation.</p>

      <form className="card form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="question">Your question</label>
          <textarea
            id="question"
            rows={5}
            maxLength={2000}
            placeholder="Example: Why does the Moon have phases?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        <div className="row">
          <Select id="subject" label="Subject" value={subject} onChange={setSubject} options={SUBJECTS} />
          <Select id="difficulty" label="Difficulty" value={difficulty} onChange={setDifficulty} options={LEVELS} />
        </div>
        <Alert>{error}</Alert>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </form>

      {answer && (
        <ResultCard
          heading="Answer"
          text={answer}
          subject={subject}
          noteTitle={asked.length > 60 ? asked.slice(0, 57) + "..." : asked}
        />
      )}
    </div>
  );
}
