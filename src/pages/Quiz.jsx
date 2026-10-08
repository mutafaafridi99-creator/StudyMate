import { useState } from "react";
import Alert from "../components/Alert.jsx";
import { Select, SUBJECTS, LEVELS } from "../components/Fields.jsx";
import { Icon } from "../components/Icons.jsx";
import { askServer } from "../services/ai.js";
import { parseQuiz, QUIZ_PARSE_ERROR } from "../services/quiz.js";

const COUNTS = [5, 10, 15];
const LETTERS = ["A", "B", "C", "D"];

export default function Quiz() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState(LEVELS[0]);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState(null); // array of questions
  const [answers, setAnswers] = useState({}); // { index: "A" }
  const [submitted, setSubmitted] = useState(false);

  const create = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!topic.trim()) {
      setError("Please enter a topic for the quiz.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const text = await askServer({ mode: "quiz", topic, count, difficulty, subject });
      let questions;
      try {
        questions = parseQuiz(text);
      } catch {
        throw new Error(QUIZ_PARSE_ERROR);
      }
      setQuiz(questions);
      setAnswers({});
      setSubmitted(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    setError("");
  };

  // ---------- setup form ----------
  if (!quiz) {
    return (
      <div>
        <h1 className="page-title">Quiz Generator</h1>
        <p className="page-sub">Pick a topic and test yourself with multiple-choice questions.</p>
        <form className="card form" onSubmit={create}>
          <div className="field">
            <label htmlFor="topic">Topic</label>
            <input
              id="topic"
              type="text"
              maxLength={200}
              placeholder="Example: Photosynthesis"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="row">
            <Select id="q-subject" label="Subject" value={subject} onChange={setSubject} options={SUBJECTS} />
            <Select id="q-diff" label="Difficulty" value={difficulty} onChange={setDifficulty} options={LEVELS} />
            <Select
              id="q-count"
              label="Number of questions"
              value={count}
              onChange={(v) => setCount(Number(v))}
              options={COUNTS}
            />
          </div>
          <Alert>{error}</Alert>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating quiz..." : "Create Quiz"}
          </button>
        </form>
      </div>
    );
  }

  // ---------- results ----------
  const correctCount = quiz.filter((q, i) => answers[i] === q.correct).length;
  const total = quiz.length;
  const wrongCount = total - correctCount;
  const percent = Math.round((correctCount / total) * 100);

  const submit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <h1 className="page-title">Quiz: {topic.trim() || "Your topic"}</h1>
      <p className="page-sub">
        {subject} · {difficulty} · {total} questions
      </p>

      {submitted && (
        <section className="card score" aria-live="polite">
          <h2>Your score</h2>
          <p className="score-big">
            {correctCount} / {total} <span>({percent}%)</span>
          </p>
          <div className="score-stats">
            <span className="pill pill-good"><Icon.Check width={16} height={16} /> {correctCount} correct</span>
            <span className="pill pill-bad"><Icon.X width={16} height={16} /> {wrongCount} wrong</span>
          </div>
          <div className="score-actions">
            <button type="button" className="btn btn-primary" onClick={reset}>New quiz</button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
            >
              Retake this quiz
            </button>
          </div>
        </section>
      )}

      <form onSubmit={submit}>
        {quiz.map((q, i) => {
          const chosen = answers[i];
          const isRight = chosen === q.correct;
          return (
            <fieldset key={i} className={"card question" + (submitted ? (isRight ? " right" : " wrong") : "")}>
              <legend>
                <span className="qnum">{i + 1}</span> {q.question}
              </legend>
              {LETTERS.map((l) => {
                const id = `q${i}-${l}`;
                let cls = "option";
                if (submitted && l === q.correct) cls += " option-correct";
                else if (submitted && l === chosen) cls += " option-wrong";
                return (
                  <label key={l} htmlFor={id} className={cls}>
                    <input
                      id={id}
                      type="radio"
                      name={`q${i}`}
                      value={l}
                      checked={chosen === l}
                      disabled={submitted}
                      onChange={() => setAnswers((a) => ({ ...a, [i]: l }))}
                    />
                    <span className="letter">{l}</span>
                    <span>{q.options[l]}</span>
                  </label>
                );
              })}
              {submitted && (
                <div className="explain">
                  <strong>{isRight ? "Correct." : chosen ? `Wrong. The answer is ${q.correct}.` : `Not answered. The answer is ${q.correct}.`}</strong>{" "}
                  {q.explanation}
                </div>
              )}
            </fieldset>
          );
        })}

        {!submitted && (
          <div className="quiz-footer">
            <span className="hint">
              {Object.keys(answers).length} of {total} answered
            </span>
            <button type="submit" className="btn btn-primary">Submit quiz</button>
            <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>
          </div>
        )}
      </form>
    </div>
  );
}
