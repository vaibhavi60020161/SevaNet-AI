import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";

let firebaseConfig: any = null;
let app: admin.app.App | null = null;

const loadConfig = () => {
  if (firebaseConfig) return firebaseConfig;

  // 1. Try environment variable (for Vercel/Production)
  if (process.env.FIREBASE_CONFIG_JSON) {
    try {
      firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG_JSON);
      return firebaseConfig;
    } catch (e) {
      console.error("Failed to parse FIREBASE_CONFIG_JSON", e);
    }
  }

  // 2. Try local file (for Local Dev)
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      return firebaseConfig;
    }
  } catch (e) {
    console.error("Failed to read firebase-applet-config.json", e);
  }

  return null;
};

const connectDB = async () => {
  try {
    const config = loadConfig();
    
    if (admin.apps.length === 0) {
      const options: admin.AppOptions = {
        projectId: config?.projectId || process.env.FIREBASE_PROJECT_ID
      };

      // Handle Service Account if provided (required on Vercel)
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
          options.credential = admin.credential.cert(serviceAccount);
        } catch (e) {
          console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT", e);
        }
      } else if (!process.env.VERCEL) {
        // Fallback for local dev/Cloud Run only
        try {
          options.credential = admin.credential.applicationDefault();
        } catch (e) {
          console.warn("⚠️ applicationDefault() failed, using unauthenticated access where possible.");
        }
      }

      if (!options.credential && process.env.VERCEL) {
        console.error("❌ CRITICAL: FIREBASE_SERVICE_ACCOUNT environment variable is missing on Vercel!");
      }

      app = admin.initializeApp(options);
      console.log("✅ Firebase Admin initialized successfully");
    } else {
      app = admin.apps[0]!;
    }
  } catch (error) {
    console.error("❌ Firebase Admin initialization error:", error);
  }
};

export const getDb = () => {
  const config = loadConfig();
  if (!app) {
    if (admin.apps.length > 0) {
      app = admin.apps[0]!;
    } else {
      // Emergency initialization if connectDB hasn't finished (serverless context)
      const options: admin.AppOptions = {
        projectId: config?.projectId || process.env.FIREBASE_PROJECT_ID
      };
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        options.credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
      } else {
        options.credential = admin.credential.applicationDefault();
      }
      app = admin.initializeApp(options);
    }
  }
  
  const databaseId = config?.firestoreDatabaseId || process.env.FIREBASE_DATABASE_ID;
  if (databaseId) {
    return getFirestore(app!, databaseId);
  }
  return getFirestore(app!);
};

export const getAuth = () => admin.auth();

export default connectDB;
