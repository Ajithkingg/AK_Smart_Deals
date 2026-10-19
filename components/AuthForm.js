"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider, createUserWithEmailAndPassword, sendPasswordResetEmail,
  signInWithEmailAndPassword, signInWithPopup, updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ensureUserDoc } from "@/lib/data";
import { useAuth } from "./AuthProvider";
import Header from "./Header";

const MESSAGES = {
  "auth/invalid-credential": "Wrong email or password.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/user-not-found": "No account with this email. Sign up first.",
  "auth/wrong-password": "Wrong email or password.",
  "auth/email-already-in-use": "An account with this email already exists. Log in instead.",
  "auth/weak-password": "Use a password with at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
  "auth/popup-blocked": "Your browser blocked the Google window. Allow pop-ups for this site and try again.",
  "auth/unauthorized-domain": "Google sign-in isn't enabled for this website address yet.",
  "auth/network-request-failed": "No internet connection. Check your connection and try again.",
  "auth/configuration-not-found": "Login isn't switched on yet. The site owner needs to enable Authentication in Firebase.",
  "auth/operation-not-allowed": "This sign-in method isn't switched on yet. The site owner needs to enable it in Firebase.",
};
const IGNORED = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];
const message = (e) => MESSAGES[e?.code] || `Something went wrong (${e?.code || "unknown error"}). Please try again.`;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" width="18" height="18">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default function AuthForm({ mode }) {
  const signup = mode === "signup";
  const router = useRouter();
  const { user, loading } = useAuth();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  async function run(fn) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (e) {
      if (!IGNORED.includes(e?.code)) setError(message(e));
    } finally {
      setBusy(false);
    }
  }

  const submit = (e) => {
    e.preventDefault();
    run(async () => {
      if (signup) {
        const { user } = await createUserWithEmailAndPassword(auth, f.email.trim(), f.password);
        await updateProfile(user, { displayName: f.name.trim() });
        await ensureUserDoc(user, f.name.trim());
      } else {
        await signInWithEmailAndPassword(auth, f.email.trim(), f.password);
      }
    });
  };

  const google = () => run(() => signInWithPopup(auth, new GoogleAuthProvider()));

  const reset = () => {
    if (!f.email.trim()) return setError("Enter your email above, then tap “Forgot password?” again.");
    run(async () => {
      await sendPasswordResetEmail(auth, f.email.trim());
      setNotice("Password reset link sent. Check your email.");
    });
  };

  return (
    <>
      <Header />
      <main className="wrap">
        <div className="auth">
          <h1>{signup ? "Create your account" : "Log in"}</h1>
          <p className="sub">{signup ? "Save time on orders and get the latest deals." : "Welcome back to AK Smart Deals."}</p>

          {!auth ? (
            <p className="err">Login isn&apos;t set up yet. Please check back soon.</p>
          ) : (
            <>
              <button className="gbtn" onClick={google} disabled={busy}>
                <GoogleIcon /> Continue with Google
              </button>
              <div className="or"><span>or</span></div>
              <form className="aform" onSubmit={submit}>
                {signup && (
                  <label>
                    Your name
                    <input required autoComplete="name" value={f.name} onChange={set("name")} />
                  </label>
                )}
                <label>
                  Email
                  <input required type="email" autoComplete="email" value={f.email} onChange={set("email")} />
                </label>
                <label>
                  Password
                  <input
                    required
                    type="password"
                    minLength={6}
                    autoComplete={signup ? "new-password" : "current-password"}
                    value={f.password}
                    onChange={set("password")}
                  />
                  {signup && <span className="hint">At least 6 characters</span>}
                </label>
                {error && <p className="err" role="alert">{error}</p>}
                {notice && <p className="ok" role="status">{notice}</p>}
                <button className="buy" type="submit" disabled={busy}>
                  {busy ? "Please wait…" : signup ? "Sign up" : "Log in"}
                </button>
              </form>
              {!signup && (
                <button className="linkbtn" onClick={reset} disabled={busy}>Forgot password?</button>
              )}
              <p className="switch">
                {signup ? (
                  <>Already have an account? <Link href="/login">Log in</Link></>
                ) : (
                  <>New here? <Link href="/signup">Create an account</Link></>
                )}
              </p>
            </>
          )}
        </div>
      </main>
    </>
  );
}
