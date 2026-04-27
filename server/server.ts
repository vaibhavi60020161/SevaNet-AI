import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import connectDB, { getDb } from "./db";
import apiRoutes from "./api";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  await connectDB();
  
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Seed Data if empty
  const seedIfEmpty = async () => {
    const db = getDb();
    if (!db) return;

    const needsSnap = await db.collection("needs").limit(1).get();
    if (needsSnap.empty) {
      console.log("🌱 Seeding initial data to Firestore...");
      
      const needs = [
        { title: "Food Crisis", category: "Food", location: "Hadapsar", lat: 18.5089, lng: 73.9259, urgency: "critical", families: 40, status: "pending", description: "Extreme shortage of dry rations in slum area.", createdAt: admin.firestore.FieldValue.serverTimestamp() },
        { title: "Medical Support", category: "Medical", location: "Kothrud", lat: 18.5074, lng: 73.8077, urgency: "high", families: 15, status: "pending", description: "Insulin and basic antibiotics needed for elderly camp.", createdAt: admin.firestore.FieldValue.serverTimestamp() },
        { title: "Education Kits", category: "Education", location: "Wanowrie", lat: 18.4901, lng: 73.8951, urgency: "medium", families: 22, status: "assigned", description: "Need 22 primary education kits for local school.", createdAt: admin.firestore.FieldValue.serverTimestamp() }
      ];
      
      for (const need of needs) {
        await db.collection("needs").add(need);
      }

      await db.collection("volunteers").add({ 
        name: "Priya Sharma", 
        skills: ["Food Logistics", "Coordination"], 
        location: "Hadapsar", 
        lat: 18.5080, 
        lng: 73.9250, 
        distance: 0.5, 
        status: "online", 
        activeTaskId: null,
        impactScore: 10,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await db.collection("volunteers").add({ 
        name: "Dr. Anand Kumar", 
        skills: ["Medical", "First Aid"], 
        location: "Kothrud", 
        lat: 18.5070, 
        lng: 73.8070, 
        distance: 1.2, 
        status: "online", 
        activeTaskId: null,
        impactScore: 15,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await db.collection("tasks").add({ 
        title: "Deliver Education Kits", 
        location: "Wanowrie", 
        assignedTo: "Sneha Rao", 
        status: "In Progress", 
        deadline: "Today 5PM",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log("✅ Seeding complete");
    }
  };
  
  await seedIfEmpty();

  // API Routes
  app.use("/api", apiRoutes);

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.join(process.cwd(), "client"),
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "client/dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
