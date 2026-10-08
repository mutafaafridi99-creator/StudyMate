// Saved notes in Firebase Firestore.
// Path: users/{uid}/notes/{noteId}   -> each student only sees their own notes.
import { getFirebase, CLOUD_NOT_CONFIGURED_MESSAGE, isFirebaseConfigured } from "../firebase.js";

const SAVE_ERROR =
  "Could not reach cloud saving. Please check your Firebase setup (see README) and try again.";

function friendly(err) {
  if (err && err.message === "NOT_CONFIGURED") return new Error(CLOUD_NOT_CONFIGURED_MESSAGE);
  const code = err && err.code ? String(err.code) : "";
  if (code.includes("admin-restricted-operation") || code.includes("operation-not-allowed")) {
    return new Error(
      "Cloud saving needs Anonymous sign-in enabled in Firebase (Authentication > Sign-in method)."
    );
  }
  if (code.includes("permission-denied")) {
    return new Error("Cloud saving is blocked by your Firestore rules. See the README for the rules to paste.");
  }
  return new Error(SAVE_ERROR);
}

export { isFirebaseConfigured, CLOUD_NOT_CONFIGURED_MESSAGE };

export async function saveNote({ title, content, subject }) {
  try {
    const { db, uid, store } = await getFirebase();
    const ref = await store.addDoc(store.collection(db, "users", uid, "notes"), {
      title: String(title || "Untitled").slice(0, 120),
      content: String(content || "").slice(0, 20000),
      subject: String(subject || "Other").slice(0, 60),
      createdAt: store.serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    throw friendly(err);
  }
}

export async function listNotes() {
  try {
    const { db, uid, store } = await getFirebase();
    const q = store.query(
      store.collection(db, "users", uid, "notes"),
      store.orderBy("createdAt", "desc"),
      store.limit(100)
    );
    const snap = await store.getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      const date = data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : new Date();
      return {
        id: d.id,
        title: data.title || "Untitled",
        content: data.content || "",
        subject: data.subject || "Other",
        date: date.toISOString(),
      };
    });
  } catch (err) {
    throw friendly(err);
  }
}

export async function deleteNote(id) {
  try {
    const { db, uid, store } = await getFirebase();
    await store.deleteDoc(store.doc(db, "users", uid, "notes", id));
  } catch (err) {
    throw friendly(err);
  }
}
