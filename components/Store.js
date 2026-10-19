"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/public/assets/logo.jpg";
import banner from "@/public/assets/banner.jpg";
import { SORTS, loadProducts, visible, waNum } from "@/lib/products";
import { DealCard, FeaturedDeal } from "./Deal";
import OrderModal from "./OrderModal";

function Grid({ products, error, list, onOrder }) {
  if (products === null) {
    return (
      <>
        {[0, 1, 2, 3].map((i) => <div key={i} className="skel" aria-hidden="true" />)}
        <p className="empty" style={{ padding: "8px 0" }}>Loading deals…</p>
      </>
    );
  }
  if (error) return <p className="empty">{error}</p>;
  if (!list.length) {
    return (
      <p className="empty">
        {products.length ? "No deals match your search. Try another word or category." : "New deals are on the way. Check back soon."}
      </p>
    );
  }
  return list.map((d) => <DealCard key={d.id} d={d} onOrder={onOrder} />);
}

export default function Store() {
  const [{ products, error }, setData] = useState({ products: null, error: "" });
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("off");
  const [order, setOrder] = useState(null);
  const closeOrder = useCallback(() => setOrder(null), []);

  useEffect(() => {
    loadProducts().then(setData);
  }, []);

  const P = products || [];
  const cats = ["All", ...new Set(P.map((d) => d.cat))];
  const featured = P.find((d) => d.featured);
  const list = products ? visible(products, { cat, q, sort }) : [];
  const wa = waNum();

  return (
    <>
      <header>
        <div className="wrap bar">
          <a className="logo" href="#top">
            <Image src={logo} alt="" width={42} height={42} priority />
            <span>AK <em>Smart Deals</em></span>
          </a>
          <div className="search">
            <input type="search" aria-label="Search deals" placeholder="Search earbuds, mixer, shoes…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
      </header>

      <main className="wrap" id="top">
        <section className="hero">
          <Image
            className="banner"
            src={banner}
            priority
            alt="AK Smart Deals. Trending products, best deals: fashion, gadgets, home, beauty, kitchen and more."
          />
          <p className="lede">
            Handpicked deals from Amazon, Flipkart and our own AK Store. Tap &quot;Buy&quot; to order from the store, or &quot;Order now&quot; to
            order our products on WhatsApp.
          </p>
          {featured && <FeaturedDeal d={featured} onOrder={setOrder} />}
        </section>

        <div className="controls">
          <div className="chips" role="group" aria-label="Categories">
            {cats.length > 1 &&
              cats.map((c) => (
                <button key={c} className="chip" aria-pressed={c === cat} onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
          </div>
          <select aria-label="Sort deals" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
        </div>

        <section className="grid" aria-live="polite">
          <Grid products={products} error={error} list={list} onOrder={setOrder} />
        </section>
      </main>

      <footer>
        <div className="wrap">
          <p>
            <strong>Affiliate disclosure:</strong> Some products on this site are sold by other stores. AK Smart Deals earns a commission when
            you buy through those links, at no extra cost to you. As an Amazon Associate we earn from qualifying purchases. Prices can change;
            the final price is the one on the store&apos;s checkout page.
          </p>
          {wa && (
            <p>
              Questions or orders: WhatsApp <strong style={{ userSelect: "all" }}>+{wa}</strong>
            </p>
          )}
          <p>© {new Date().getFullYear()} AK Smart Deals. Smart Shopping. Better Deals.</p>
        </div>
      </footer>

      {order && <OrderModal d={order} onClose={closeOrder} />}
    </>
  );
}
