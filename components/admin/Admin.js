"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../AuthProvider";
import Header from "../Header";
import CategoriesPanel from "./CategoriesPanel";
import ProductsPanel from "./ProductsPanel";
import UsersPanel from "./UsersPanel";

const TABS = [
  ["products", "Products"],
  ["categories", "Categories"],
  ["users", "Users"],
];

function Gate({ title, children }) {
  return (
    <div className="auth">
      <h1>{title}</h1>
      <p className="sub">{children}</p>
    </div>
  );
}

export default function Admin() {
  const { user, profile, loading, isAdmin } = useAuth();
  const [tab, setTab] = useState("products");

  let body;
  if (loading) body = <p className="empty">Loading…</p>;
  else if (!user) body = <Gate title="Admin">Please <Link href="/login">log in</Link> with an admin account.</Gate>;
  else if (!isAdmin)
    body = (
      <Gate title="No admin access">
        You&apos;re logged in as {profile?.email || user.email}, which is a customer account. Ask the site owner to make you an admin.
      </Gate>
    );
  else
    body = (
      <>
        <div className="atabs" role="tablist" aria-label="Admin sections">
          {TABS.map(([id, label]) => (
            <button key={id} role="tab" className="chip" aria-selected={tab === id} aria-pressed={tab === id} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>
        {tab === "products" && <ProductsPanel />}
        {tab === "categories" && <CategoriesPanel />}
        {tab === "users" && <UsersPanel me={user.uid} />}
      </>
    );

  return (
    <>
      <Header />
      <main className="wrap admin">{body}</main>
    </>
  );
}
