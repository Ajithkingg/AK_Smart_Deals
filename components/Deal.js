"use client";

import { useState } from "react";
import { inr, isOwn, pct, safeUrl } from "@/lib/products";

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  );
}

export function Thumb({ d }) {
  const [broken, setBroken] = useState(false);
  if (!d.img || broken) return <TagIcon />;
  // eslint-disable-next-line @next/next/no-img-element -- product images come from any store/Drive URL
  return <img src={d.img} alt="" loading="lazy" onError={() => setBroken(true)} />;
}

export function Price({ d }) {
  return (
    <div className="price">
      <span className="now">{inr(d.price)}</span>
      {d.mrp > d.price && (
        <>
          <span className="mrp">{inr(d.mrp)}</span>
          <span className="save">Save {inr(d.mrp - d.price)}</span>
        </>
      )}
    </div>
  );
}

export function Rating({ d }) {
  if (!d.rating) return null;
  return (
    <div className="rating">
      <span>★ {d.rating}</span>
      {d.reviews ? ` · ${Number(d.reviews).toLocaleString("en-IN")} ratings` : ""}
    </div>
  );
}

export function BuyButton({ d, onOrder }) {
  if (isOwn(d)) {
    return d.stock === "out" ? (
      <button className="buy soldout" disabled>Out of stock</button>
    ) : (
      <button className="buy order" onClick={() => onOrder(d)}>Order now</button>
    );
  }
  return (
    <a className="buy" href={safeUrl(d.link)} target="_blank" rel="nofollow sponsored noopener">
      Buy on {d.store}
    </a>
  );
}

export function DealCard({ d, onOrder }) {
  const off = pct(d);
  return (
    <article className="card">
      <div className="thumb"><Thumb d={d} /></div>
      {off > 0 && <span className="off">{off}% OFF</span>}
      {isOwn(d) && <span className="own-tag">AK Store</span>}
      <div className="store">{isOwn(d) ? "Sold by AK Smart Deals" : d.store} · {d.cat}</div>
      <h3>{d.name}</h3>
      {isOwn(d) && d.desc && <p className="desc">{d.desc}</p>}
      <Price d={d} />
      <Rating d={d} />
      <BuyButton d={d} onOrder={onOrder} />
    </article>
  );
}

export function FeaturedDeal({ d, onOrder }) {
  const off = pct(d);
  return (
    <div className="feature">
      <div className="thumb"><Thumb d={d} /></div>
      <div style={{ minWidth: 0 }}>
        <div className="eyebrow">Deal of the day{off ? ` · ${off}% off` : ""}</div>
        <h2>{d.name}</h2>
        <Rating d={d} />
      </div>
      <div className="cta">
        <Price d={d} />
        <BuyButton d={d} onOrder={onOrder} />
      </div>
    </div>
  );
}
