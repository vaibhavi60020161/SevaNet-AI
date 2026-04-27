import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb } from "./db";
import admin from "firebase-admin";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "seva-secret-key";

// Helper to handle Firestore errors
function handleFirestoreError(error: any, operation: string, path: string | null) {
  console.error(`Firestore Error [${operation}] at ${path}:`, error);
  return { error: `Database error during ${operation}` };
}

// --- AUTH ROUTES ---
router.post("/auth/register", async (req, res) => {
  try {
    const { email, password, name, adminCode } = req.body;
    const db = getDb();
    
    // Check if user exists in Firestore
    const userSnap = await db.collection("users").where("email", "==", email).get();
    if (!userSnap.empty) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = adminCode === "SEVA_ADMIN_2026" ? "admin" : "user";
    
    const userRef = db.collection("users").doc();
    const newUser = {
      uid: userRef.id,
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await userRef.set(newUser);
    
    const token = jwt.sign({ id: userRef.id, role }, JWT_SECRET);
    res.json({ token, user: { id: userRef.id, name, email, role } });
  } catch (err) {
    res.status(500).json(handleFirestoreError(err, "register", "users"));
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDb();
    
    const userSnap = await db.collection("users").where("email", "==", email).get();
    if (userSnap.empty) return res.status(400).json({ error: "Invalid credentials" });

    const userData = userSnap.docs[0].data();
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: userSnap.docs[0].id, role: userData.role }, JWT_SECRET);
    res.json({ token, user: { id: userSnap.docs[0].id, name: userData.name, email: userData.email, role: userData.role } });
  } catch (err) {
    res.status(500).json(handleFirestoreError(err, "login", "users"));
  }
});

// --- RESOURCE ROUTES ---

router.get("/stats", async (req, res) => {
  try {
    const db = getDb();
    const needsSnap = await db.collection("needs").where("status", "==", "pending").get();
    const volunteersSnap = await db.collection("volunteers").where("status", "==", "online").get();
    
    res.json({
      activeNeeds: needsSnap.size,
      volunteersOnline: volunteersSnap.size,
      tasksCompleted: 45, // Placeholder or fetch from collection
      peopleHelped: 1250, // Placeholder
    });
  } catch (err) {
    res.status(500).json(handleFirestoreError(err, "stats", "multiple"));
  }
});

router.get("/needs", async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection("needs").orderBy("createdAt", "desc").get();
    const needs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(needs);
  } catch (err) {
    res.status(500).json(handleFirestoreError(err, "list", "needs"));
  }
});

router.post("/needs", async (req, res) => {
  try {
    const { title, description, category, urgency, location, userId } = req.body;
    const db = getDb();
    const newNeed = {
      title,
      description,
      category,
      urgency: urgency.toLowerCase(),
      location,
      userId,
      status: 'pending',
      lat: 18.5204 + (Math.random() - 0.5) * 0.1,
      lng: 73.8567 + (Math.random() - 0.5) * 0.1,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection("needs").add(newNeed);
    res.json({ id: docRef.id, ...newNeed });
  } catch (err) {
    res.status(500).json(handleFirestoreError(err, "create", "needs"));
  }
});

router.get("/volunteers", async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection("volunteers").get();
    res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (err) {
    res.status(500).json(handleFirestoreError(err, "list", "volunteers"));
  }
});

router.get("/tasks", async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection("tasks").get();
    res.json(snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        location: data.location,
        assignedTo: data.assignedTo,
        status: data.status.toLowerCase().replace(" ", "-"),
        deadline: data.deadline
      };
    }));
  } catch (err) {
    res.status(500).json(handleFirestoreError(err, "list", "tasks"));
  }
});

router.get("/predictions", (req, res) => {
  res.json({
    trends: [
      { day: "Mon", food: 20, medical: 15, shelter: 5 },
      { day: "Tue", food: 25, medical: 12, shelter: 8 },
      { day: "Wed", food: 18, medical: 18, shelter: 4 },
      { day: "Thu", food: 35, medical: 10, shelter: 10 },
      { day: "Fri", food: 30, medical: 22, shelter: 6 },
      { day: "Sat", food: 45, medical: 15, shelter: 12 },
      { day: "Sun", food: 50, medical: 10, shelter: 15 },
    ],
    alerts: [
      { message: "Food demand likely to spike 23% in Hadapsar next 48h", location: "Hadapsar", probability: "High" },
      { message: "Medical needs rising in Kothrud due to weather change", location: "Kothrud", probability: "Medium" }
    ]
  });
});

router.post("/intake/text", async (req, res) => {
  try {
    const { text } = req.body;
    const db = getDb();
    const category = text.toLowerCase().includes("food") ? "Food" : text.toLowerCase().includes("med") ? "Medical" : "Shelter";
    const urgency = text.toLowerCase().includes("critical") || text.toLowerCase().includes("urgent") ? "critical" : "medium";
    
    const newNeed = {
      title: `${category} Support Request`,
      category,
      location: "Generated Area",
      lat: 18.52 + (Math.random() - 0.5) * 0.1,
      lng: 73.85 + (Math.random() - 0.5) * 0.1,
      urgency,
      families: Math.floor(Math.random() * 50) + 1,
      status: "pending",
      description: text,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection("needs").add(newNeed);
    res.json({ success: true, need: { id: docRef.id, ...newNeed } });
  } catch (err) {
    res.status(500).json(handleFirestoreError(err, "create", "needs"));
  }
});

router.post("/tasks/match", async (req, res) => {
  try {
    const { needId } = req.body;
    const db = getDb();
    
    const needRef = db.collection("needs").doc(needId);
    const needSnap = await needRef.get();
    if (!needSnap.exists) return res.status(404).json({ error: "Need not found" });

    const volunteerSnap = await db.collection("volunteers").where("status", "==", "online").limit(1).get();
    if (volunteerSnap.empty) return res.status(400).json({ error: "No volunteers available" });

    const volunteerDoc = volunteerSnap.docs[0];
    const volunteerData = volunteerDoc.data();
    const needData = needSnap.data()!;

    const newTask = {
      title: `Response: ${needData.category} in ${needData.location}`,
      location: needData.location,
      assignedTo: volunteerData.name,
      status: "In Progress",
      deadline: "Within 2 hours",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const taskRef = await db.collection("tasks").add(newTask);
    
    await needRef.update({ status: "assigned" });
    await volunteerDoc.ref.update({ 
      status: "busy",
      activeTaskId: taskRef.id
    });

    res.json({ success: true, task: { id: taskRef.id, ...newTask }, volunteer: volunteerData });
  } catch (err) {
    res.status(500).json(handleFirestoreError(err, "match", "transactions"));
  }
});

router.get("/impact", async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection("impactLogs").orderBy("timestamp", "desc").get();
    res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (err) {
    res.status(500).json(handleFirestoreError(err, "list", "impactLogs"));
  }
});

// --- FEEDBACK ROUTES ---
router.post("/feedback", async (req, res) => {
  try {
    const { userId, userName, type, targetId, rating, comment } = req.body;
    const db = getDb();
    
    const newFeedback = {
      userId,
      userName,
      type,
      targetId,
      rating,
      comment,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const feedbackRef = await db.collection("feedback").add(newFeedback);

    if (type === 'volunteer' && targetId) {
      const volSnap = await db.collection("volunteers").where("name", "==", targetId).limit(1).get();
      if (!volSnap.empty) {
        await volSnap.docs[0].ref.update({
          impactScore: admin.firestore.FieldValue.increment(rating)
        });
      }
    }

    res.json({ success: true, feedback: { id: feedbackRef.id, ...newFeedback } });
  } catch (err) {
    res.status(500).json(handleFirestoreError(err, "create", "feedback"));
  }
});

router.get("/feedback", async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection("feedback").orderBy("createdAt", "desc").get();
    res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (err) {
    res.status(500).json(handleFirestoreError(err, "list", "feedback"));
  }
});

export default router;
