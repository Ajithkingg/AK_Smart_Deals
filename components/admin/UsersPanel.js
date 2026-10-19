"use client";

import { useEffect, useState } from "react";
import { setUserRole, watchUsers } from "@/lib/data";

const joined = (t) => (t?.toDate ? t.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");

export default function UsersPanel({ me }) {
  const [users, setUsers] = useState(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => watchUsers(setUsers, () => setError("Couldn't load users. Refresh the page.")), []);

  async function changeRole(u, role) {
    const verb = role === "admin" ? "Make" : "Remove";
    const msg = role === "admin" ? `${verb} ${u.name || u.email} an admin? They will be able to change products and users.` : `${verb} admin access for ${u.name || u.email}?`;
    if (!window.confirm(msg)) return;
    setError("");
    try {
      await setUserRole(u.id, role);
    } catch {
      setError("Couldn't change the role. Please try again.");
    }
  }

  const all = users || [];
  const admins = all.filter((u) => u.role === "admin").length;
  const list = all.filter((u) => filter === "all" || (u.role || "user") === filter);

  return (
    <section>
      <div className="ahead">
        <h1>Users {users && <span className="count">{all.length}</span>}</h1>
        <div className="chips" role="group" aria-label="Filter users">
          {[["all", "All"], ["admin", `Admins (${admins})`], ["user", `Customers (${all.length - admins})`]].map(([v, t]) => (
            <button key={v} className="chip" aria-pressed={filter === v} onClick={() => setFilter(v)}>{t}</button>
          ))}
        </div>
      </div>
      {error && <p className="err" role="alert">{error}</p>}
      {users === null ? (
        <p className="empty">Loading…</p>
      ) : !list.length ? (
        <p className="empty">No users here yet.</p>
      ) : (
        <ul className="alist">
          {list.map((u) => (
            <li key={u.id}>
              <div className="avatar" aria-hidden="true">{(u.name || u.email || "?").charAt(0).toUpperCase()}</div>
              <div className="ainfo">
                <b>{u.name || "(no name)"} {u.id === me && <em className="tag">You</em>}</b>
                <span>{u.email}</span>
                <span>{u.role === "admin" ? "Admin" : "Customer"}{joined(u.createdAt) && ` · joined ${joined(u.createdAt)}`}</span>
              </div>
              <div className="aact">
                {u.id === me ? null : u.role === "admin" ? (
                  <button className="btn danger" onClick={() => changeRole(u, "user")}>Remove admin</button>
                ) : (
                  <button className="btn" onClick={() => changeRole(u, "admin")}>Make admin</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
