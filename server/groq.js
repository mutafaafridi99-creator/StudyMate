// Shared AI logic used by BOTH serverless functions:
//   - api/ai.js                    (Vercel)
//   - netlify/functions/ai.js      (Netlify)
// and by the local dev server (vite.config.js).
//
// The Groq API key is only ever read here, on the server, from the
// GROQ_API_KEY environment variable. It is never sent to the browser.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-20b";
const TIMEOUT_MS = 25000;

const SUBJECTS = [
  "Mathematics",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "General Knowledge",
  "Other",
];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const SUMMARY_TYPES = ["Short Summary", "Detailed Summary", "Key Points"];
const QUESTION_COUNTS = [5, 10, 15];

const FORMAT_RULES = `Formatting rules (important):
- Use Markdown: "## " headings, short paragraphs, "- " bullet points and "1. " numbered steps.
- Use **bold** for key terms. Keep paragraphs to 1-3 sentences.
- Write equations on their own line inside a code block using plain text (for example x^2 + 3x = 10). Do not use LaTeX.
- Never write one huge block of text.`;

const SYSTEM_PROMPT = `You are StudyMate AI, a friendly and patient tutor for students.
Explain things in simple, clear language. Encourage understanding instead of just giving answers.
${FORMAT_RULES}`;

// ---------- helpers ----------

function clean(value, max) {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim().slice(0, max);
}

function pick(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function fail(status, code, message) {
  return { status, body: { error: { code, message } } };
}

// ---------- prompt builders (one per feature) ----------

function buildRequest(input) {
  const mode = input.mode;

  if (mode === "ask") {
    const question = clean(input.question, 2000);
    if (!question) return { error: "Please type a question first." };
    const subject = pick(input.subject, SUBJECTS, "Other");
    const level = pick(input.difficulty, LEVELS, "Beginner");
    return {
      temperature: 0.4,
      maxTokens: 1500,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Subject: ${subject}\nStudent level: ${level}\n\nQuestion:\n${question}\n\nGive a clear, student-friendly answer for a ${level} learner. Start with a one-sentence answer, then explain step by step, add a simple example, and finish with a short "Quick recap" of 2-3 bullet points.`,
        },
      ],
    };
  }

  if (mode === "summarize") {
    const notes = clean(input.notes, 12000);
    if (!notes) return { error: "Please paste some notes or a lesson first." };
    const type = pick(input.summaryType, SUMMARY_TYPES, "Short Summary");
    const how = {
      "Short Summary": "Write a short summary: one heading and 3-5 sentences.",
      "Detailed Summary":
        "Write a detailed summary organised under clear ## headings, with short paragraphs and bullet points. Keep every important idea.",
      "Key Points":
        "List the key points as concise bullet points (6-12 bullets). Bold the key term in each bullet.",
    }[type];
    return {
      temperature: 0.3,
      maxTokens: 1500,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `${how}\nOnly use information from the notes below. Do not invent facts.\n\nNOTES:\n"""\n${notes}\n"""`,
        },
      ],
    };
  }

  if (mode === "quiz") {
    const topic = clean(input.topic, 200);
    if (!topic) return { error: "Please enter a topic for the quiz." };
    const subject = pick(input.subject, SUBJECTS, "Other");
    const level = pick(input.difficulty, LEVELS, "Beginner");
    const count = QUESTION_COUNTS.includes(Number(input.count)) ? Number(input.count) : 5;
    return {
      temperature: 0.5,
      maxTokens: 4000,
      json: true,
      messages: [
        {
          role: "system",
          content:
            "You are a quiz writer for students. You reply with ONE valid JSON object and nothing else.",
        },
        {
          role: "user",
          content: `Create a ${level} level multiple-choice quiz for the subject "${subject}" about the topic "${topic}".
Write exactly ${count} questions. Each question has exactly 4 options and exactly one correct answer.
Return ONLY JSON in exactly this shape:
{"questions":[{"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A","explanation":"One or two short sentences explaining why the answer is correct."}]}
Rules: "correct" must be one of "A","B","C","D". Spread the correct answers across A-D. Use plain text only (no LaTeX, no Markdown) inside strings.`,
        },
      ],
    };
  }

  if (mode === "plan") {
    const subjects = clean(input.subjects, 500);
    if (!subjects) return { error: "Please list the subjects you are studying." };
    const hours = clean(input.hours, 40) || "not specified";
    const examDate = clean(input.examDate, 40) || "not specified";
    const weak = clean(input.weak, 500) || "none";
    const session = clean(input.session, 40) || "45 minutes";
    const today = new Date().toISOString().slice(0, 10);
    return {
      temperature: 0.4,
      maxTokens: 2000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Create a practical, realistic study plan.
Today's date: ${today}
Subjects: ${subjects}
Weak subjects (give these extra time): ${weak}
Available study time: ${hours}
Exam date: ${examDate}
Preferred study session length: ${session}

Format: start with a short "## Overview", then a "## Weekly Plan" with a day-by-day list (Mon-Sun) showing subject and session length, then "## Tips" with 3-5 bullets. If the exam is far away, plan a typical week and explain how to repeat it. Include short breaks and one revision slot per week. Keep it concise.`,
        },
      ],
    };
  }

  return { error: "Unknown request." };
}

// ---------- main handler ----------

export async function handleAI({ method, body, apiKey, model }) {
  if (method && method !== "POST") {
    return fail(405, "METHOD", "Please use POST.");
  }

  let input = body;
  if (typeof input === "string") {
    try {
      input = JSON.parse(input);
    } catch {
      input = null;
    }
  }
  if (!input || typeof input !== "object") {
    return fail(400, "BAD_INPUT", "Something was wrong with the request. Please try again.");
  }

  const built = buildRequest(input);
  if (built.error) return fail(400, "BAD_INPUT", built.error);

  const key = typeof apiKey === "string" ? apiKey.trim() : "";
  if (!key) {
    return fail(
      503,
      "NOT_CONFIGURED",
      "AI service is not configured yet. Please add your Groq API key."
    );
  }

  const payload = {
    model: (typeof model === "string" && model.trim()) || DEFAULT_MODEL,
    messages: built.messages,
    temperature: built.temperature,
    max_tokens: built.maxTokens,
  };
 
     // gpt-oss models "think" first; keep that short so answers are fast and never cut off.
   if (payload.model.startsWith("openai/gpt-oss")) payload.reasoning_effort = "low";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (res.status === 401 || res.status === 403) {
      return fail(
        502,
        "INVALID_KEY",
        "The AI service key was not accepted. Please check the Groq API key."
      );
    }
    if (res.status === 429) {
      return fail(
        429,
        "RATE_LIMIT",
        "The AI service is busy right now (rate limit). Please wait a minute and try again."
      );
    }
       if (!res.ok) {
      let detail = "";
      try {
        const err = await res.json();
        detail = (err && err.error && err.error.message) || "";
      } catch {
        detail = "";
      }
      return fail(502, "UPSTREAM", "The AI service had a problem (code " + res.status + "). " + String(detail).slice(0, 200));
    }

    let data;
    try {
      data = await res.json();
    } catch {
      return fail(502, "BAD_RESPONSE", "The AI gave an unreadable response. Please try again.");
    }

    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      return fail(502, "EMPTY", "The AI did not return an answer. Please try again.");
    }
    return { status: 200, body: { text } };
  } catch (err) {
    if (err && err.name === "AbortError") {
      return fail(504, "TIMEOUT", "The AI took too long to answer. Please try again.");
    }
    return fail(502, "NETWORK", "Could not reach the AI service. Please try again.");
  } finally {
    clearTimeout(timer);
  }
}
