// =====================================================================
// FIREBASE CONFIGURATION
// Replace these values with your Firebase project configuration.
// (Firebase Console -> Project settings -> General -> Your apps -> Web app)
//
// These Firebase web values are NOT secret. They are designed to be
// included in frontend code; your data is protected by Firestore rules.
// The Groq API key is different: it is secret and lives ONLY in the
// GROQ_API_KEY environment variable (see README).
//
// If you leave the placeholders below, StudyMate AI still works. Only
// "Save" is switched off and a friendly message is shown instead.
// =====================================================================
const firebaseConfig = {
  apiKey: "AIzaSyAh2p40G5BYbddZ_QlL2VRoOfD9NtXJJoA",
  authDomain: "studymate-458a1.firebaseapp.com",
  projectId: "studymate-458a1",
  storageBucket: "studymate-458a1.firebasestorage.app",
  messagingSenderId: "364859936440",
  appId: "1:364859936440:web:029c250cb900b883fb2e4d",
  measurementId: "G-FZ2H76DTVM"
};

// True only when the placeholders have been replaced with real values.
export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (v) => typeof v === "string" && v.trim() !== "" && !v.startsWith("PASTE_")
);

export const CLOUD_NOT_CONFIGURED_MESSAGE =
  "Cloud saving is not configured yet. You can still use StudyMate AI.";

let cached = null;

// Firebase is loaded lazily (only when the student saves or opens "Saved"),
// so the home page stays small and fast, and a Firebase problem can never
// break the rest of the app.
export function getFirebase() {
  if (!isFirebaseConfigured) {
    return Promise.reject(new Error("NOT_CONFIGURED"));
  }
  if (!cached) {
    cached = (async () => {
      const [{ initializeApp }, auth, store] = await Promise.all([
        import("firebase/app"),
        import("firebase/auth"),
        import("firebase/firestore"),
      ]);
      const app = initializeApp(firebaseConfig);
      const authInstance = auth.getAuth(app);
      // Anonymous sign-in: no login screen for students. It simply gives each
      // browser a private ID so Firestore rules can keep notes separate.
      await authInstance.authStateReady();
      if (!authInstance.currentUser) {
        await auth.signInAnonymously(authInstance);
      }
      return { db: store.getFirestore(app), uid: authInstance.currentUser.uid, store };
    })().catch((err) => {
      cached = null; // allow a retry after the student fixes the config
      throw err;
    });
  }
  return cached;
}
