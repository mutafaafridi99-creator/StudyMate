// Talks to our own serverless function (/api/ai).
// The secret Groq key is never available here.

const FRIENDLY = {
  NOT_CONFIGURED: "AI service is not configured yet. Please add your Groq API key.",
  INVALID_KEY: "The AI service key was not accepted. Please check the Groq API key.",
  RATE_LIMIT: "The AI service is busy right now (rate limit). Please wait a minute and try again.",
  TIMEOUT: "The AI took too long to answer. Please try again.",
  NETWORK: "Could not reach the AI service. Please try again.",
};

const GENERIC = "Something went wrong. Please try again.";

// Returns the AI text, or throws an Error whose message is safe to show.
export async function askServer(payload) {
  let res;
  try {
    res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Network problem. Please check your internet connection and try again.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok || !data || typeof data.text !== "string") {
    if (res.status === 404) {
      throw new Error(
        "The AI service was not found. If you are testing locally, run \"npm run dev\" (not a plain file server)."
      );
    }
    const code = data?.error?.code;
    const message = data?.error?.message;
    throw new Error(FRIENDLY[code] || (typeof message === "string" ? message : GENERIC));
  }
  if (!data.text.trim()) throw new Error("The AI did not return an answer. Please try again.");
  return data.text;
}
