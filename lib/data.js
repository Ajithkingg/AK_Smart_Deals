import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query,
  serverTimestamp, setDoc, updateDoc, where, writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

/* Firestore layout
   users/{uid}       name, email, photo, role ("user" | "admin"), createdAt
   categories/{id}   name
   products/{id}     type, name, category, store, price, mrp, rating, reviews, link,
                     image, description, stock ("in" | "out"), featured, hidden, createdAt */

const listOf = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));
const watch = (q, cb, onError) => onSnapshot(q, (s) => cb(listOf(s)), onError);

/* ---------- Products ---------- */
export const watchProducts = (cb, onError) =>
  watch(query(collection(db, "products"), orderBy("createdAt", "asc")), cb, onError);

export function saveProduct(id, data) {
  if (id) return updateDoc(doc(db, "products", id), data);
  return addDoc(collection(db, "products"), { ...data, createdAt: serverTimestamp() });
}
export const deleteProduct = (id) => deleteDoc(doc(db, "products", id));

/* ---------- Categories ---------- */
export const watchCategories = (cb, onError) =>
  watch(query(collection(db, "categories"), orderBy("name", "asc")), cb, onError);

export const addCategory = (name) => addDoc(collection(db, "categories"), { name });

/* Renames the category and moves its products to the new name. */
export async function renameCategory(id, from, to) {
  const batch = writeBatch(db);
  batch.update(doc(db, "categories", id), { name: to });
  const used = await getDocs(query(collection(db, "products"), where("category", "==", from)));
  used.forEach((p) => batch.update(p.ref, { category: to }));
  await batch.commit();
}
export const deleteCategory = (id) => deleteDoc(doc(db, "categories", id));

/* ---------- Users ---------- */
export const watchUser = (uid, cb, onError) =>
  onSnapshot(doc(db, "users", uid), (s) => cb(s.exists() ? { id: s.id, ...s.data() } : null), onError);

export const watchUsers = (cb, onError) =>
  watch(query(collection(db, "users"), orderBy("createdAt", "desc")), cb, onError);

/* Creates the profile on first sign-in. New accounts always start as "user". */
export async function ensureUserDoc(user, name) {
  const ref = doc(db, "users", user.uid);
  const fillName = async (snap) => {
    // Email signup: the auth listener may create the profile before the name is set.
    if (name && !snap.data().name) await updateDoc(ref, { name });
  };
  const snap = await getDoc(ref);
  if (snap.exists()) return fillName(snap);
  try {
    await setDoc(ref, {
      name: name || user.displayName || "",
      email: user.email || "",
      photo: user.photoURL || "",
      role: "user",
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    // Lost a race with the other caller, which created the profile first.
    const again = await getDoc(ref);
    if (!again.exists()) throw e;
    await fillName(again);
  }
}

export const setUserRole = (uid, role) => updateDoc(doc(db, "users", uid), { role });
