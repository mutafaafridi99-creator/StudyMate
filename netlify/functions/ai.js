// Netlify serverless function  ->  /.netlify/functions/ai
// netlify.toml maps /api/ai to this function, so the frontend is identical.
// All logic lives in server/groq.js (shared with Vercel).
import { handleAI } from "../../server/groq.js";

export default async (req) => {
  let body = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }
  const result = await handleAI({
    method: req.method,
    body,
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL,
  });
  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
};
