"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ensureUserDoc, watchUser } from "@/lib/data";

const AuthContext = createContext({ user: null, profile: null, loading: true, isAdmin: false });
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, profile: null, loading: Boolean(auth) });

  useEffect(() => {
    if (!auth) return;
    let stopProfile = () => {};
    const stopAuth = onAuthStateChanged(auth, async (user) => {
      stopProfile();
      if (!user) {
        setState({ user: null, profile: null, loading: false });
        return;
      }
      try {
        await ensureUserDoc(user);
      } catch {
        // Profile is created again on the next sign-in; the account still works.
      }
      stopProfile = watchUser(
        user.uid,
        (profile) => setState({ user, profile, loading: false }),
        () => setState({ user, profile: null, loading: false })
      );
    });
    return () => {
      stopAuth();
      stopProfile();
    };
  }, []);

  const value = { ...state, isAdmin: state.profile?.role === "admin" };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
