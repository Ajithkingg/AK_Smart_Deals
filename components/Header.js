"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "firebase/auth";
import logo from "@/public/assets/logo.jpg";
import { auth } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";

export default function Header({ children }) {
  const { user, profile, loading, isAdmin } = useAuth();
  const name = profile?.name || user?.displayName || user?.email || "";

  return (
    <header>
      <div className="wrap bar">
        <Link className="logo" href="/">
          <Image src={logo} alt="" width={42} height={42} priority />
          <span>AK <em>Smart Deals</em></span>
        </Link>
        {children}
        {!loading && (
          <nav className="account" aria-label="Account">
            {user ? (
              <>
                {isAdmin && <Link className="navlink" href="/admin">Admin</Link>}
                <span className="who" title={user.email || ""}>{name.split(" ")[0]}</span>
                <button className="navlink" onClick={() => signOut(auth)}>Log out</button>
              </>
            ) : (
              <>
                <Link className="navlink" href="/login">Log in</Link>
                <Link className="navlink solid" href="/signup">Sign up</Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
