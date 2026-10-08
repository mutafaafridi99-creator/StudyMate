# StudyMate AI

**Study smarter. Learn faster.** A simple AI study assistant: Ask AI, Summarizer, Quiz Generator, Study Planner, and Saved notes.

- Frontend: React + Vite (plain JavaScript and CSS, no UI library)
- AI: Groq API, called only from a tiny serverless function (your key stays secret)
- Saving notes: Firebase Firestore (optional; the app works without it)
- Hosting: Vercel **or** Netlify, with the same frontend on both

---

## How it works (30 seconds)

```
Browser (React)  --POST /api/ai-->  Serverless function  -->  Groq
                                    (reads GROQ_API_KEY)
Browser (React)  <--------------------------------------->  Firebase (saved notes only)
```

- `server/groq.js` holds all AI logic once. 
- `api/ai.js` is the Vercel wrapper. `netlify/functions/ai.js` is the Netlify wrapper. Both are about 15 lines.
- The frontend always calls `/api/ai`. `netlify.toml` points that address to the Netlify function.

### Which keys are secret?

| Value | Secret? | Where it lives |
|---|---|---|
| `GROQ_API_KEY` | **YES, secret** | Environment variable only (`.env` locally, dashboard on Vercel/Netlify). Never in React code. |
| Firebase config (`apiKey`, `projectId`, ...) | No | `src/firebase.js`. Firebase web config values are designed to be public. Your data is protected by Firestore rules (below), not by hiding these values. |

---

## A. Run locally

You need [Node.js](https://nodejs.org) **version 20.19 or newer** (22 recommended).

1. Copy `.env.example` to a new file named `.env`
   - Mac/Linux: `cp .env.example .env`
   - Windows: `copy .env.example .env`
2. Open `.env` and paste your Groq key after `GROQ_API_KEY=` (see section D).
3. Install and start:

```bash
npm install
npm run dev
```

4. Open the address shown (usually http://localhost:5173).

Check a production build any time with `npm run build` (output goes to `dist/`). `npm run preview` serves that build locally, including the AI function.

No Groq key yet? The site still loads and shows: *"AI service is not configured yet. Please add your Groq API key."*

---

## B. Create a Firebase project (for Saved notes)

Skip this whole section if you do not need saving. The app will show *"Cloud saving is not configured yet. You can still use StudyMate AI."*

1. Go to https://console.firebase.google.com and click **Create a project**. Give it a name (for example `studymate-ai`). Google Analytics is not needed.
2. In the project, click the **Web icon `</>`** ("Add app"). Give it a nickname. **Do not** tick Firebase Hosting. Click **Register app**.
3. Firebase shows a `firebaseConfig` block. Keep that page open for section C.
4. **Turn on Firestore:** left menu **Build > Firestore Database > Create database**. Choose a location near you and **Start in production mode**.
5. **Turn on anonymous sign-in** (this gives each browser a private ID, with no login screen for students): **Build > Authentication > Get started > Sign-in method > Anonymous > Enable > Save**.
6. **Add the security rules:** **Firestore Database > Rules tab**, replace everything with the rules below and click **Publish**.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Each visitor can only touch their own notes.
    match /users/{userId}/notes/{noteId} {
      allow read, delete: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId
        && request.resource.data.keys().hasOnly(['title', 'content', 'subject', 'createdAt'])
        && request.resource.data.title is string && request.resource.data.title.size() <= 120
        && request.resource.data.content is string && request.resource.data.content.size() <= 20000
        && request.resource.data.subject is string && request.resource.data.subject.size() <= 60;
      allow update: if false;
    }
  }
}
```

Note: notes belong to the browser (anonymous ID). If a student clears site data or switches device, they will not see old notes.

## C. Configure Firebase in the code

Open `src/firebase.js` and replace each `PASTE_..._HERE` with the matching value from the Firebase config block:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};
```

(Keep the quotes. Firebase Storage is not used, but the field must still be filled.)

## D. Get and add your Groq API key

1. Go to https://console.groq.com and sign in (free).
2. Open **API Keys > Create API Key**, name it, and copy it. It is shown only once.
3. **Locally:** paste it into `.env` as `GROQ_API_KEY=your_key_here`.
4. **On Vercel/Netlify:** add it as an environment variable (sections F and G).

Optional: `GROQ_MODEL` lets you change the model (default `llama-3.3-70b-versatile`). Leave it unset unless you want to.

---

## E. Upload to GitHub

1. Create a new empty repository on https://github.com/new (do not add a README).
2. In the project folder:

```bash
git init
git add .
git commit -m "StudyMate AI"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/studymate-ai.git
git push -u origin main
```

`.env` is listed in `.gitignore`, so your Groq key is **not** uploaded. Double-check on GitHub that there is no `.env` file.

---

## F. Deploy to Vercel

1. Go to https://vercel.com, sign in with GitHub, click **Add New > Project**, and **Import** your repository.
2. Vercel detects **Vite** automatically (Build command `npm run build`, Output directory `dist`). Leave the defaults.
3. Open **Environment Variables** on that same screen and add:
   - **Name:** `GROQ_API_KEY`
   - **Value:** your Groq key
   - **Environments:** Production, Preview, Development (all ticked)
4. Click **Deploy**.

Added the variable later? Go to **Project > Settings > Environment Variables**, add it, then **Deployments > the latest one > ... > Redeploy**. Variables only apply to new deployments.

## G. Deploy to Netlify

1. Go to https://app.netlify.com, click **Add new site > Import an existing project**, choose GitHub, and pick your repository.
2. Netlify reads `netlify.toml`, so Build command (`npm run build`), Publish directory (`dist`) and Functions directory (`netlify/functions`) are already set.
3. Before deploying, open **Environment variables** (or after: **Site configuration > Environment variables > Add a variable**) and add:
   - **Key:** `GROQ_API_KEY`
   - **Value:** your Groq key
   - **Scopes:** all scopes (it must include **Functions**)
4. Click **Deploy**.

Added the variable after the first deploy? Go to **Deploys > Trigger deploy > Clear cache and deploy site**.

---

## Troubleshooting

| You see | What to do |
|---|---|
| "AI service is not configured yet. Please add your Groq API key." | `GROQ_API_KEY` is missing. Add it and redeploy (or restart `npm run dev` after editing `.env`). |
| "The AI service key was not accepted." | The key is wrong or revoked. Create a new one in the Groq console. |
| "busy right now (rate limit)" | Free Groq limits reached. Wait a minute. |
| "Cloud saving is not configured yet..." | `src/firebase.js` still has `PASTE_...` values. |
| "Cloud saving needs Anonymous sign-in enabled..." | Do step B5. |
| "blocked by your Firestore rules" | Do step B6. |
| "The AI service was not found" locally | Use `npm run dev` (or `npm run preview`), not a plain file server. |

## Good to know

- The AI function accepts only four fixed tasks (ask, summarize, quiz, plan) with length limits, and builds the prompts itself, so it cannot be used as a free general-purpose proxy. Anyone who finds your site can still use your Groq quota, so keep an eye on usage in the Groq console.
- Serverless time limits: the function stops waiting for Groq after 25 seconds and shows a friendly message. Typical answers take 1-6 seconds.

## Project structure

```
studymate-ai/
├── api/ai.js                  Vercel function
├── netlify/functions/ai.js    Netlify function
├── server/groq.js             Shared AI logic (prompts, errors, Groq call)
├── public/favicon.svg
├── src/
│   ├── firebase.js            Firebase config (edit this)
│   ├── main.jsx, App.jsx, index.css
│   ├── components/            Navbar, Markdown, ResultCard, Alert, Fields, Icons, ErrorBoundary
│   ├── pages/                 Home, Ask, Summarizer, Quiz, Planner, Saved
│   └── services/              ai.js (calls /api/ai), quiz.js (JSON validation), notes.js (Firestore)
├── .env.example               GROQ_API_KEY=
├── netlify.toml, vercel.json, vite.config.js, package.json
└── README.md
```

## Final deployment checklist

- [ ] `src/firebase.js` has real values (or you accepted "saving not configured")
- [ ] Firestore created, Anonymous sign-in enabled, rules published
- [ ] `.env` exists locally with `GROQ_API_KEY`, and is **not** on GitHub
- [ ] `npm install` and `npm run build` finish without errors
- [ ] Repo pushed to GitHub
- [ ] `GROQ_API_KEY` added on Vercel and/or Netlify, then redeployed
- [ ] Opened the live site: Ask AI answers, Quiz scores, Save works
