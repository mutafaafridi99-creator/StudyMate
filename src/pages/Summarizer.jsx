import { useState } from "react";
import Alert from "../components/Alert.jsx";
import ResultCard from "../components/ResultCard.jsx";
import { Select, SUBJECTS } from "../components/Fields.jsx";
import { askServer } from "../services/ai.js";

const TYPES = ["Short Summary", "Detailed Summary", "Key Points"];

export default function Summarizer() {
  const [notes, setNotes] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [subject, setSubject] = useState(SUBJECTS[SUBJECTS.length - 1]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [usedType, setUsedType] = useState(TYPES[0]);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!notes.trim()) {
      setError("Please paste some notes or a lesson first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const text = await askServer({ mode: "summarize", notes, summaryType: type });
      setResult(text);
      setUsedType(type);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const firstWords = notes.trim().split(/\s+/).slice(0, 6).join(" ");

  return (
    <div>
      <h1 className="page-title">Study Summarizer</h1>
      <p className="page-sub">Paste your notes or a lesson and get a clean summary.</p>

      <form className="card form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="notes">Your notes or lesson</label>
          <textarea
            id="notes"
            rows={10}
            maxLength={12000}
            placeholder="Paste your notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <span className="hint">{notes.length} / 12000 characters</span>
        </div>
        <div className="row">
          <Select id="type" label="Summary type" value={type} onChange={setType} options={TYPES} />
          <Select id="sum-subject" label="Subject (for saving)" value={subject} onChange={setSubject} options={SUBJECTS} />
        </div>
        <Alert>{error}</Alert>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Generating summary..." : "Summarize"}
        </button>
      </form>

      {result && (
        <ResultCard
          heading={usedType}
          text={result}
          subject={subject}
          noteTitle={"Summary: " + (firstWords || "My notes")}
        />
      )}
    </div>
  );
}
