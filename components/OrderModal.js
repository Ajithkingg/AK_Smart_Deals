"use client";

import { useEffect, useState } from "react";
import { inr, waNum } from "@/lib/products";
import { Thumb } from "./Deal";

const QTY = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function OrderModal({ d, onClose }) {
  const [o, setO] = useState({ qty: 1, name: "", phone: "", address: "", pin: "" });
  const set = (k) => (e) => setO({ ...o, [k]: k === "qty" ? Number(e.target.value) || 1 : e.target.value });

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const wa = waNum();
  const ready =
    o.name.trim() && o.phone.replace(/\D/g, "").length >= 10 && o.address.trim() && /^\d{6}$/.test(o.pin.trim()) && wa.length >= 10;
  const msg =
    `New order from AK Smart Deals website\n\nProduct: ${d.name}\nPrice: ${inr(d.price)} x ${o.qty} = ${inr(d.price * o.qty)}` +
    `\n\nName: ${o.name}\nPhone: ${o.phone}\nAddress: ${o.address}\nPincode: ${o.pin}`;
  const href = ready ? "https://wa.me/" + wa + "?text=" + encodeURIComponent(msg) : "#";

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true" aria-label="Place your order">
        <h2>Place your order</h2>
        <div className="osum">
          <div className="mini"><Thumb d={d} /></div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <b>{d.name}</b>
            <span className="rating">{inr(d.price)} each</span>
          </div>
        </div>
        <div className="form">
          <label>
            Quantity
            <select value={o.qty} onChange={set("qty")}>
              {QTY.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <span className="hint">Total</span>
            <span className="total">{inr(d.price * o.qty)}</span>
          </div>
          <label className="full">
            Your name
            <input autoFocus autoComplete="name" value={o.name} onChange={set("name")} />
          </label>
          <label className="full">
            Mobile number
            <input type="tel" inputMode="numeric" autoComplete="tel" placeholder="10-digit number" value={o.phone} onChange={set("phone")} />
          </label>
          <label className="full">
            Delivery address
            <input autoComplete="street-address" placeholder="House no, street, area, city" value={o.address} onChange={set("address")} />
          </label>
          <label>
            Pincode
            <input inputMode="numeric" maxLength={6} autoComplete="postal-code" value={o.pin} onChange={set("pin")} />
          </label>
        </div>
        {wa.length >= 10 ? (
          <>
            <a className="wa" href={href} target="_blank" rel="noopener" aria-disabled={!ready}>
              Send order on WhatsApp
            </a>
            <p className="note">
              {ready
                ? "WhatsApp opens with your order filled in. Tap send there. We confirm the order and payment details on WhatsApp."
                : "Fill in all the details to continue."}
            </p>
          </>
        ) : (
          <p className="err">Online ordering is not set up yet. Please check back soon.</p>
        )}
        <button className="btn" onClick={onClose}>Cancel</button>
      </div>
    </>
  );
}
