// Safely turns the AI's reply into a validated quiz.
// Returns an array of { question, options: {A,B,C,D}, correct, explanation }
// or throws an Error with a friendly message. It never returns bad data.

const LETTERS = ["A", "B", "C", "D"];

function extractJson(text) {
  let s = String(text).trim();
  // Remove ```json fences if the model added them.
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(s);
  } catch {
    // Recovery: take everything between the first "{" and the last "}".
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(s.slice(start, end + 1));
      } catch {
        /* fall through */
      }
    }
  }
  return null;
}

function normalizeOptions(raw) {
  // Accept {A:..,B:..} or ["..","..","..",".."].
  const out = {};
  if (Array.isArray(raw)) {
    if (raw.length !== 4) return null;
    LETTERS.forEach((l, i) => (out[l] = raw[i]));
  } else if (raw && typeof raw === "object") {
    for (const l of LETTERS) out[l] = raw[l] ?? raw[l.toLowerCase()];
  } else {
    return null;
  }
  for (const l of LETTERS) {
    if (typeof out[l] !== "string" && typeof out[l] !== "number") return null;
    out[l] = String(out[l]).replace(/^[A-D][).:]\s+/i, "").trim();
    if (!out[l]) return null;
  }
  return out;
}

export function parseQuiz(text) {
  const data = extractJson(text);
  const list = Array.isArray(data) ? data : data?.questions;
  if (!Array.isArray(list)) throw new Error("bad");

  const questions = [];
  for (const item of list) {
    if (!item || typeof item.question !== "string" || !item.question.trim()) continue;
    const options = normalizeOptions(item.options);
    if (!options) continue;
    const correct = String(item.correct ?? item.answer ?? "").trim().charAt(0).toUpperCase();
    if (!LETTERS.includes(correct)) continue;
    questions.push({
      question: item.question.trim(),
      options,
      correct,
      explanation: typeof item.explanation === "string" ? item.explanation.trim() : "",
    });
  }
  if (questions.length === 0) throw new Error("bad");
  return questions;
}

export const QUIZ_PARSE_ERROR =
  "The AI sent a quiz we could not read. Please press Create Quiz again.";
