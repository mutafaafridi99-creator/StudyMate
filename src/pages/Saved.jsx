import { useEffect, useState } from "react";
import Alert from "../components/Alert.jsx";
import Markdown from "../components/Markdown.jsx";
import { Icon } from "../components/Icons.jsx";
import { listNotes, deleteNote, isFirebaseConfigured, CLOUD_NOT_CONFIGURED_MESSAGE } from "../services/notes.js";

export default function Saved() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    let cancelled = false;
    listNotes()
      .then((items) => {
        if (!cancelled) setNotes(items);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const remove = async (id) => {
    if (busyId) return;
    if (!window.confirm("Delete this saved note?")) return;
    setBusyId(id);
    setError("");
    try {
      await deleteNote(id);
      setNotes((list) => list.filter((n) => n.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="page-title">Saved</h1>
      <p className="page-sub">Your saved answers, summaries and study plans.</p>

      {!isFirebaseConfigured && <Alert kind="info">{CLOUD_NOT_CONFIGURED_MESSAGE}</Alert>}
      <Alert>{error}</Alert>
      {loading && <p className="hint">Loading your saved notes...</p>}

      {isFirebaseConfigured && !loading && !error && notes.length === 0 && (
        <div className="card empty">
          <p>No saved notes yet. Use the Save button under any AI result.</p>
        </div>
      )}

      {notes.map((n) => {
        const open = openId === n.id;
        return (
          <article key={n.id} className="card note">
            <div className="note-head">
              <div>
                <h2>{n.title}</h2>
                <p className="note-meta">
                  {n.subject} · {new Date(n.date).toLocaleDateString()}
                </p>
              </div>
              <div className="result-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : n.id)}
                >
                  {open ? "Hide" : "View"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-danger"
                  onClick={() => remove(n.id)}
                  disabled={busyId === n.id}
                  aria-label={"Delete " + n.title}
                >
                  <Icon.Trash width={18} height={18} /> Delete
                </button>
              </div>
            </div>
            {open && <Markdown text={n.content} />}
          </article>
        );
      })}
    </div>
  );
}
