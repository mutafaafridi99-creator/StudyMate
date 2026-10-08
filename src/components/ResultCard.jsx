import { useState } from "react";
import Markdown from "./Markdown.jsx";
import Alert from "./Alert.jsx";
import { Icon } from "./Icons.jsx";
import { saveNote } from "../services/notes.js";

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers / non-secure pages
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

// Shows an AI result with Copy and Save buttons.
export default function ResultCard({ heading, text, subject, noteTitle }) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null); // { kind, text }

  const onCopy = async () => {
    const ok = await copyText(text);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 2000);
  };

  const onSave = async () => {
    if (saving) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      await saveNote({ title: noteTitle, content: text, subject });
      setSaveMsg({ kind: "success", text: "Saved! Find it under Saved." });
    } catch (err) {
      setSaveMsg({ kind: "info", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card result" aria-live="polite">
      <div className="result-head">
        <h2>{heading}</h2>
        <div className="result-actions">
          <button type="button" className="btn btn-ghost" onClick={onCopy}>
            <Icon.Copy width={18} height={18} /> {copied ? "Copied!" : "Copy"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onSave} disabled={saving}>
            <Icon.Bookmark width={18} height={18} /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      <Alert kind={saveMsg?.kind}>{saveMsg?.text}</Alert>
      <Markdown text={text} />
    </section>
  );
}
