import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import config from "./config";

export const firebaseReady = Boolean(config.firebase.apiKey && config.firebase.projectId);

const app = firebaseReady ? (getApps().length ? getApp() : initializeApp(config.firebase)) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
