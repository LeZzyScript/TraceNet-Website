"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import { normalizeRole } from "@/lib/reportMapper";

const AuthContext = createContext({
  configured: false,
  loading: false,
  user: null,
  profile: null,
  role: null,
});

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    loading: isFirebaseConfigured,
    user: null,
    profile: null,
    role: null,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;

    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ loading: false, user: null, profile: null, role: null });
        return;
      }
      let profile = null;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        profile = snap.exists() ? snap.data() : null;
      } catch {
        profile = null;
      }
      setState({
        loading: false,
        user,
        profile,
        role: normalizeRole(profile?.role),
      });
    });
  }, []);

  const value = useMemo(
    () => ({ configured: isFirebaseConfigured, ...state }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

