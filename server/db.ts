import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";

let firebaseConfig: any = null;
let app: admin.app.App | null = null;

const connectDB = async () => {
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (!fs.existsSync(configPath)) {
      console.error("❌ firebase-applet-config.json not found");
      return;
    }

    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

    // Check if app already initialized
    if (admin.apps.length === 0) {
      app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: firebaseConfig.projectId
      });
      console.log("✅ Firebase Admin initialized successfully");
    } else {
      app = admin.apps[0]!;
    }
  } catch (error) {
    console.error("❌ Firebase Admin initialization error:", error);
  }
};

export const getDb = () => {
  if (!firebaseConfig || !app) {
    // Attempt to load synchronously if not yet loaded (fallback)
    try {
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      if (admin.apps.length === 0) {
        app = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: firebaseConfig.projectId
        });
      } else {
        app = admin.apps[0]!;
      }
    } catch (e) {
      console.error("Failed to load firebase info in getDb", e);
    }
  }
  
  if (firebaseConfig?.firestoreDatabaseId) {
    return getFirestore(app!, firebaseConfig.firestoreDatabaseId);
  }
  return getFirestore(app!);
};

export const getAuth = () => admin.auth();

export default connectDB;
