import config from "./config";

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
export const pct = (d) => (d.mrp > d.price ? Math.round((1 - d.price / d.mrp) * 100) : 0);
export const safeUrl = (u) => (/^https:\/\//i.test(u || "") ? u : "#");
export const isOwn = (d) => d.type === "own";
export const waNum = () => String(config.whatsapp || "").replace(/\D/g, "");

/* Accepts either the bare sheet ID or the full sheet address. */
const sheetId = () => {
  const s = String(config.sheetId || "").trim();
  const m = s.match(/\/d\/([\w-]+)/);
  return m ? m[1] : s;
};

/* Google Drive share links -> direct image links */
export function imgUrl(u) {
  u = String(u || "").trim();
  if (!u) return "";
  const m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);
  if (m) return "https://lh3.googleusercontent.com/d/" + m[1];
  if (/^https:\/\//i.test(u)) return u;
  // file uploaded to this website, e.g. images/shoe.jpg (put it in public/)
  if (/^[\w\-./]+\.(jpe?g|png|webp|gif)$/i.test(u)) return BASE_PATH + "/" + u.replace(/^\/+/, "");
  return "";
}

export function parseCSV(text) {
  const rows = [];
  let row = [], f = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { f += '"'; i++; } else q = false;
      } else f += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(f); rows.push(row); row = []; f = "";
    } else f += c;
  }
  if (f !== "" || row.length) { row.push(f); rows.push(row); }
  return rows.filter((r) => r.some((x) => String(x).trim() !== ""));
}

const num = (v) => {
  const n = Number(String(v || "").replace(/[₹,\s]/g, ""));
  return isFinite(n) ? n : 0;
};
const yes = (v) => /^(yes|y|true|1)$/i.test(v);

export function toProducts(rows) {
  if (!rows.length) return [];
  const head = rows[0].map((h) => h.trim().toLowerCase().replace(/[^a-z]+/g, "_").replace(/^_|_$/g, ""));
  const col = (r, k) => {
    const i = head.indexOf(k);
    return i < 0 ? "" : String(r[i] || "").trim();
  };
  return rows
    .slice(1)
    .map((r, i) => {
      const type = /own|my/i.test(col(r, "type")) ? "own" : "affiliate";
      const price = num(col(r, "price")), mrp = num(col(r, "mrp")) || price;
      return {
        id: "p" + i, type, name: col(r, "name"), cat: col(r, "category") || "Other",
        store: type === "own" ? "AK Smart Deals" : col(r, "store") || "Store",
        price, mrp: Math.max(mrp, price),
        rating: num(col(r, "rating")) || "", reviews: num(col(r, "ratings_count")) || "",
        link: col(r, "link"), img: imgUrl(col(r, "image")), desc: col(r, "description"),
        stock: /out|no|0/i.test(col(r, "stock")) ? "out" : "in",
        featured: yes(col(r, "featured")),
        hide: yes(col(r, "hide")),
      };
    })
    .filter((p) => p.name && p.price > 0 && !p.hide && (p.type === "own" || /^https:\/\//i.test(p.link)));
}

/* Loads from the Google Sheet when configured, otherwise from public/products.csv. */
export async function loadProducts() {
  const id = sheetId();
  const src = id
    ? `https://docs.google.com/spreadsheets/d/${encodeURIComponent(id)}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(config.sheetTab)}&t=${Date.now()}`
    : `${BASE_PATH}/products.csv?t=${Date.now()}`;
  try {
    const res = await fetch(src, { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    const text = await res.text();
    if (/^\s*</.test(text)) throw new Error("not csv");
    return { products: toProducts(parseCSV(text)), error: "" };
  } catch {
    return {
      products: [],
      error: id ? "We couldn't load today's deals. Please refresh the page in a minute." : "",
    };
  }
}

export const SORTS = [
  ["off", "Biggest discount"],
  ["new", "Newest first"],
  ["low", "Price: low to high"],
  ["high", "Price: high to low"],
  ["rating", "Top rated"],
];

export function visible(products, { cat, q, sort }) {
  q = q.trim().toLowerCase();
  const list = products.filter(
    (d) => (cat === "All" || d.cat === cat) && (!q || (d.name + " " + d.cat + " " + d.store + " " + d.desc).toLowerCase().includes(q))
  );
  if (sort === "new") return list.slice().reverse();
  const by = {
    off: (a, b) => pct(b) - pct(a),
    low: (a, b) => a.price - b.price,
    high: (a, b) => b.price - a.price,
    rating: (a, b) => (b.rating || 0) - (a.rating || 0),
  }[sort];
  return list.slice().sort(by);
}
