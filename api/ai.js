// Vercel serverless function  ->  available at /api/ai
// All logic lives in server/groq.js (shared with Netlify).
import { handleAI } from "../server/groq.js";

export default async function handler(req, res) {
  const result = await handleAI({
    method: req.method,
    body: req.body,
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL,
  });
  res.setHeader("Cache-Control", "no-store");
  res.status(result.status).json(result.body);
}
