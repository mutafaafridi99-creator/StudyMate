import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { handleAI } from "./server/groq.js";

// Local development helper:
// On Vercel/Netlify the address /api/ai is a serverless function.
// While you run "npm run dev" this tiny plugin answers the same address
// using the SAME code, so you do not need any extra server or CLI.
function localApi(env) {
  const middleware = async (req, res) => {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const result = await handleAI({
      method: req.method,
      body: raw,
      apiKey: env.GROQ_API_KEY,
      model: env.GROQ_MODEL,
    });
    res.statusCode = result.status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result.body));
  };
  return {
    name: "studymate-local-api",
    configureServer(server) {
      server.middlewares.use("/api/ai", middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/ai", middleware);
    },
  };
}

export default defineConfig(({ mode }) => {
  // Read .env on the server side only. Values are NOT sent to the browser
  // because we load every variable (prefix "") only inside this config file.
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), localApi(env)],
  };
});
