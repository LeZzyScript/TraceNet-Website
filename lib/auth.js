import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { normalizeRole } from "./reportMapper.js";

export const PORTAL_ROLES = {
  barangay: ["barangay_official", "admin"],
  ccpo: ["ccpo_officer", "admin"],
  admin: ["admin"],
};

const FRIENDLY_ERRORS = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-not-found": "No account found for that email.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "tracenet/wrong-role": "This account does not have access to this portal.",
};

export function friendlyAuthError(err) {
  return FRIENDLY_ERRORS[err?.code] || "Something went wrong. Please try again.";
}

async function readRole(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return {
      role: normalizeRole(snap.exists() ? snap.data().role : null),
      profile: snap.exists() ? snap.data() : null,
    };
  } catch {
    return { role: "citizen", profile: null };
  }
}

export async function signInForPortal(email, password, portal) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const { role } = await readRole(cred.user.uid);
  if (!PORTAL_ROLES[portal].includes(role)) {
    await signOut(auth);
    const err = new Error("Role not permitted for this portal");
    err.code = "tracenet/wrong-role";
    throw err;
  }
  return { user: cred.user, role };
}

export async function signInCitizen(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return { user: cred.user };
}

export async function registerCitizen({ name, email, contactNumber, password }) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, "users", cred.user.uid), {
    name,
    email: email.trim(),
    contactNumber,
    role: "Citizen / Family Member",
    createdAt: serverTimestamp(),
  });
  return { user: cred.user };
}

export async function signOutUser() {
  if (auth) await signOut(auth);
}

