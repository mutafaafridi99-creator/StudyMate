import { useState } from "react";
import Alert from "../components/Alert.jsx";
import ResultCard from "../components/ResultCard.jsx";
import { Select } from "../components/Fields.jsx";
import { askServer } from "../services/ai.js";

const SESSIONS = ["25 minutes", "45 minutes", "60 minutes", "90 minutes"];

function todayString() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function Planner() {
  const [subjects, setSubjects] = useState("");
  const [hours, setHours] = useState("2");
  const [examDate, setExamDate] = useState("");
  const [weak, setWeak] = useState("");
  const [session, setSession] = useState(SESSIONS[1]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!subjects.trim()) {
      setError("Please list the subjects you are studying.");
      return;
    }
    if (examDate && examDate < todayString()) {
      setError("The exam date is in the past. Please choose today or a future date.");
      return;
    }
    const h = Number(hours);
    if (!hours || Number.isNaN(h) || h <= 0 || h > 16) {
      setError("Please enter study hours per day between 0.5 and 16.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const text = await askServer({
        mode: "plan",
        subjects,
        hours: `${h} hour(s) per day`,
        examDate,
        weak,
        session,
      });
      setPlan(text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Study Planner</h1>
      <p className="page-sub">Tell us about your exams and get a simple, realistic weekly plan.</p>

      <form className="card form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="subjects">Subjects you are studying</label>
          <input
            id="subjects"
            type="text"
            maxLength={500}
            placeholder="Example: Maths, Physics, English"
            value={subjects}
            onChange={(e) => setSubjects(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="weak">Weak subjects or topics (optional)</label>
          <input
            id="weak"
            type="text"
            maxLength={500}
            placeholder="Example: Algebra, Essay writing"
            value={weak}
            onChange={(e) => setWeak(e.target.value)}
          />
        </div>
        <div className="row">
          <div className="field">
            <label htmlFor="hours">Study time per day (hours)</label>
            <input
              id="hours"
              type="number"
              min="0.5"
              max="16"
              step="0.5"
              inputMode="decimal"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="exam">Exam date (optional)</label>
            <input
              id="exam"
              type="date"
              min={todayString()}
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>
          <Select id="session" label="Preferred study session" value={session} onChange={setSession} options={SESSIONS} />
        </div>
        <Alert>{error}</Alert>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Building study plan..." : "Build Study Plan"}
        </button>
      </form>

      {plan && (
        <ResultCard
          heading="Your study plan"
          text={plan}
          subject="Other"
          noteTitle={"Study plan: " + subjects.trim().slice(0, 50)}
        />
      )}
    </div>
  );
}
