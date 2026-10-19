"use client";

import { useState } from "react";
import { saveProduct } from "@/lib/data";
import { imgUrl, toDeal } from "@/lib/products";
import { DealCard } from "../Deal";

const EMPTY = {
  type: "affiliate", name: "", category: "", store: "Amazon", price: "", mrp: "", rating: "", reviews: "",
  link: "", image: "", description: "", stock: "in", featured: false, hidden: false,
};
const NUMBERS = ["price", "mrp", "rating", "reviews"];

export default function ProductForm({ product, categories, onDone }) {
  const isNew = !product.id;
  const [f, setF] = useState(() => {
    const start = { ...EMPTY, category: categories[0]?.name || "" };
    for (const k of Object.keys(EMPTY)) if (product[k] !== undefined && product[k] !== null) start[k] = product[k];
    for (const k of NUMBERS) start[k] = start[k] === 0 ? "" : String(start[k]);
    return start;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const own = f.type === "own";

  function check() {
    if (!f.name.trim()) return "Enter the product name.";
    if (!(Number(f.price) > 0)) return "Enter a selling price greater than 0.";
    if (f.mrp && Number(f.mrp) < Number(f.price)) return "MRP can't be lower than the selling price.";
    if (!f.category) return "Pick a category. Add one in the Categories tab first.";
    if (!own && !/^https:\/\//i.test(f.link.trim())) return "Paste the product link. It must start with https://";
    if (f.image.trim() && !imgUrl(f.image)) return "The image link must start with https://";
    if (f.rating && !(Number(f.rating) >= 0 && Number(f.rating) <= 5)) return "Rating must be between 0 and 5.";
    return "";
  }

  async function submit(e) {
    e.preventDefault();
    const problem = check();
    if (problem) return setError(problem);
    setBusy(true);
    setError("");
    const data = {
      type: f.type,
      name: f.name.trim(),
      category: f.category,
      store: own ? "" : f.store.trim(),
      price: Number(f.price),
      mrp: Number(f.mrp) || Number(f.price),
      rating: Number(f.rating) || 0,
      reviews: Number(f.reviews) || 0,
      link: own ? "" : f.link.trim(),
      image: f.image.trim(),
      description: f.description.trim(),
      stock: f.stock,
      featured: f.featured,
      hidden: f.hidden,
    };
    try {
      await saveProduct(product.id, data);
      onDone();
    } catch {
      setError("Couldn't save the product. Check your connection and try again.");
      setBusy(false);
    }
  }

  const preview = toDeal({ ...f, id: "preview" });

  return (
    <section>
      <div className="ahead">
        <h1>{isNew ? "Add product" : "Edit product"}</h1>
        <button className="btn" onClick={onDone}>Back to products</button>
      </div>
      <div className="pedit">
        <form className="form" onSubmit={submit} noValidate>
          <label>
            Product type
            <select value={f.type} onChange={set("type")}>
              <option value="affiliate">Affiliate (Amazon, Flipkart…)</option>
              <option value="own">Own product (order on WhatsApp)</option>
            </select>
          </label>
          <label>
            Category
            <select value={f.category} onChange={set("category")}>
              {!categories.length && <option value="">No categories yet</option>}
              {f.category && !categories.some((c) => c.name === f.category) && <option value={f.category}>{f.category}</option>}
              {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </label>
          <label className="full">
            Product name
            <input value={f.name} onChange={set("name")} placeholder="e.g. boAt Airdopes 141 Wireless Earbuds" />
          </label>
          <label>
            Selling price (₹)
            <input inputMode="decimal" value={f.price} onChange={set("price")} placeholder="499" />
          </label>
          <label>
            MRP (₹) <span className="hint">optional</span>
            <input inputMode="decimal" value={f.mrp} onChange={set("mrp")} placeholder="999" />
          </label>
          {!own && (
            <>
              <label>
                Store
                <input value={f.store} onChange={set("store")} list="stores" />
                <datalist id="stores"><option value="Amazon" /><option value="Flipkart" /><option value="Meesho" /><option value="Myntra" /></datalist>
              </label>
              <label className="full">
                Affiliate link
                <input type="url" value={f.link} onChange={set("link")} placeholder="https://amzn.to/…" />
              </label>
            </>
          )}
          {own && (
            <label>
              Stock
              <select value={f.stock} onChange={set("stock")}>
                <option value="in">In stock</option>
                <option value="out">Out of stock</option>
              </select>
            </label>
          )}
          <label className="full">
            Image link <span className="hint">Google Drive share link or any https image link</span>
            <input type="url" value={f.image} onChange={set("image")} placeholder="https://…" />
          </label>
          <label className="full">
            Description <span className="hint">shown on own products</span>
            <textarea rows={3} value={f.description} onChange={set("description")} />
          </label>
          <label>
            Rating <span className="hint">0–5, optional</span>
            <input inputMode="decimal" value={f.rating} onChange={set("rating")} placeholder="4.2" />
          </label>
          <label>
            Number of ratings <span className="hint">optional</span>
            <input inputMode="numeric" value={f.reviews} onChange={set("reviews")} placeholder="1250" />
          </label>
          <label className="check full">
            <input type="checkbox" checked={f.featured} onChange={set("featured")} /> Show as Deal of the day
          </label>
          <label className="check full">
            <input type="checkbox" checked={f.hidden} onChange={set("hidden")} /> Hide from the store
          </label>
          {error && <p className="err full" role="alert">{error}</p>}
          <div className="full row">
            <button className="buy order" type="submit" disabled={busy}>{busy ? "Saving…" : isNew ? "Add product" : "Save changes"}</button>
            <button className="btn" type="button" onClick={onDone}>Cancel</button>
          </div>
        </form>
        <aside className="preview" aria-label="Preview">
          <div className="eyebrow">Preview</div>
          {preview.price > 0 ? <DealCard d={preview} onOrder={() => {}} /> : <p className="hint">Enter a name and price to see the card.</p>}
        </aside>
      </div>
    </section>
  );
}
