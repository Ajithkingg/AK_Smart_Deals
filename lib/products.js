import config from "./config";

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
export const pct = (d) => (d.mrp > d.price ? Math.round((1 - d.price / d.mrp) * 100) : 0);
export const safeUrl = (u) => (/^https:\/\//i.test(u || "") ? u : "#");
export const isOwn = (d) => d.type === "own";
export const waNum = () => String(config.whatsapp || "").replace(/\D/g, "");

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

const toNum = (v) => {
  const n = Number(String(v ?? "").replace(/[₹,\s]/g, ""));
  return isFinite(n) ? n : 0;
};

/* Firestore product -> shape used by the store. */
export function toDeal(p) {
  const type = p.type === "own" ? "own" : "affiliate";
  const price = toNum(p.price), mrp = toNum(p.mrp) || price;
  return {
    id: p.id, type, name: String(p.name || "").trim(), cat: p.category || "Other",
    store: type === "own" ? "AK Smart Deals" : p.store || "Store",
    price, mrp: Math.max(mrp, price),
    rating: toNum(p.rating) || "", reviews: toNum(p.reviews) || "",
    link: p.link || "", img: imgUrl(p.image), desc: p.description || "",
    stock: p.stock === "out" ? "out" : "in",
    featured: Boolean(p.featured), hide: Boolean(p.hidden),
  };
}

/* Products shoppers can see: named, priced, not hidden, and affiliate ones need a valid link. */
export const isListed = (d) => d.name && d.price > 0 && !d.hide && (d.type === "own" || /^https:\/\//i.test(d.link));

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
