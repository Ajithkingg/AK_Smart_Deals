"use client";

import { useEffect, useState } from "react";
import { deleteProduct, saveProduct, watchCategories, watchProducts } from "@/lib/data";
import { inr, toDeal } from "@/lib/products";
import { Thumb } from "../Deal";
import ProductForm from "./ProductForm";

export default function ProductsPanel() {
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null); // null = list, {} = new product, product = edit
  const [error, setError] = useState("");

  useEffect(() => {
    const fail = () => setError("Couldn't load products. Check that you're still an admin and refresh.");
    const a = watchProducts((rows) => setProducts(rows.slice().reverse()), fail);
    const b = watchCategories(setCategories, fail);
    return () => {
      a();
      b();
    };
  }, []);

  async function remove(p) {
    if (!window.confirm(`Delete “${p.name}”? This can't be undone.`)) return;
    try {
      await deleteProduct(p.id);
    } catch {
      setError("Couldn't delete the product. Please try again.");
    }
  }

  async function toggleHidden(p) {
    try {
      await saveProduct(p.id, { hidden: !p.hidden });
    } catch {
      setError("Couldn't update the product. Please try again.");
    }
  }

  if (editing) {
    return <ProductForm product={editing} categories={categories} onDone={() => setEditing(null)} />;
  }

  return (
    <section>
      <div className="ahead">
        <h1>Products {products && <span className="count">{products.length}</span>}</h1>
        <button className="buy order" onClick={() => setEditing({})}>+ Add product</button>
      </div>
      {error && <p className="err" role="alert">{error}</p>}
      {products === null ? (
        <p className="empty">Loading…</p>
      ) : !products.length ? (
        <p className="empty">No products yet. Tap “Add product” to add your first one.</p>
      ) : (
        <ul className="alist">
          {products.map((p) => {
            const d = toDeal(p);
            return (
              <li key={p.id} className={p.hidden ? "muted" : ""}>
                <div className="mini"><Thumb d={d} /></div>
                <div className="ainfo">
                  <b>{d.name || "(no name)"}</b>
                  <span>
                    {inr(d.price)} · {d.cat} · {d.type === "own" ? "AK Store" : d.store}
                  </span>
                  <span className="tags">
                    {p.featured && <em className="tag">Deal of the day</em>}
                    {p.hidden && <em className="tag">Hidden</em>}
                    {d.type === "own" && d.stock === "out" && <em className="tag">Out of stock</em>}
                  </span>
                </div>
                <div className="aact">
                  <button className="btn" onClick={() => setEditing(p)}>Edit</button>
                  <button className="btn" onClick={() => toggleHidden(p)}>{p.hidden ? "Show" : "Hide"}</button>
                  <button className="btn danger" onClick={() => remove(p)}>Delete</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
