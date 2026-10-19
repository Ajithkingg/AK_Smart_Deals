"use client";

import { useEffect, useState } from "react";
import { addCategory, deleteCategory, renameCategory, watchCategories, watchProducts } from "@/lib/data";

export default function CategoriesPanel() {
  const [categories, setCategories] = useState(null);
  const [counts, setCounts] = useState({});
  const [name, setName] = useState("");
  const [edit, setEdit] = useState({ id: null, name: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const fail = () => setError("Couldn't load categories. Refresh the page.");
    const a = watchCategories(setCategories, fail);
    const b = watchProducts((rows) => {
      const c = {};
      rows.forEach((p) => (c[p.category] = (c[p.category] || 0) + 1));
      setCounts(c);
    }, fail);
    return () => {
      a();
      b();
    };
  }, []);

  const exists = (n, exceptId) => (categories || []).some((c) => c.id !== exceptId && c.name.toLowerCase() === n.toLowerCase());

  async function attempt(fn, msg) {
    setError("");
    try {
      await fn();
      return true;
    } catch {
      setError(msg);
      return false;
    }
  }

  async function add(e) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    if (exists(n)) return setError(`“${n}” already exists.`);
    if (await attempt(() => addCategory(n), "Couldn't add the category. Please try again.")) setName("");
  }

  async function saveRename(c) {
    const n = edit.name.trim();
    if (!n || n === c.name) return setEdit({ id: null, name: "" });
    if (exists(n, c.id)) return setError(`“${n}” already exists.`);
    if (await attempt(() => renameCategory(c.id, c.name, n), "Couldn't rename the category. Please try again."))
      setEdit({ id: null, name: "" });
  }

  async function remove(c) {
    if (counts[c.name]) return setError(`“${c.name}” still has ${counts[c.name]} product(s). Move or delete them first.`);
    if (!window.confirm(`Delete the category “${c.name}”?`)) return;
    await attempt(() => deleteCategory(c.id), "Couldn't delete the category. Please try again.");
  }

  return (
    <section>
      <div className="ahead">
        <h1>Categories {categories && <span className="count">{categories.length}</span>}</h1>
      </div>
      <form className="addrow" onSubmit={add}>
        <input aria-label="New category name" placeholder="New category, e.g. Gadgets" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="buy order" type="submit" disabled={!name.trim()}>Add</button>
      </form>
      {error && <p className="err" role="alert">{error}</p>}
      {categories === null ? (
        <p className="empty">Loading…</p>
      ) : !categories.length ? (
        <p className="empty">No categories yet. Add your first one above, e.g. Gadgets, Kitchen, Fashion.</p>
      ) : (
        <ul className="alist">
          {categories.map((c) => (
            <li key={c.id}>
              <div className="ainfo">
                {edit.id === c.id ? (
                  <input
                    autoFocus
                    aria-label="Category name"
                    value={edit.name}
                    onChange={(e) => setEdit({ id: c.id, name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveRename(c);
                      if (e.key === "Escape") setEdit({ id: null, name: "" });
                    }}
                  />
                ) : (
                  <b>{c.name}</b>
                )}
                <span>{counts[c.name] || 0} product(s)</span>
              </div>
              <div className="aact">
                {edit.id === c.id ? (
                  <>
                    <button className="btn" onClick={() => saveRename(c)}>Save</button>
                    <button className="btn" onClick={() => setEdit({ id: null, name: "" })}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn" onClick={() => setEdit({ id: c.id, name: c.name })}>Rename</button>
                    <button className="btn danger" onClick={() => remove(c)}>Delete</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
