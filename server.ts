import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB, NeedModel, VolunteerModel, TaskModel, ImpactLogModel, UserModel } from "./src/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "seva-secret-key";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  await connectDB();
  
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Seed Data if empty
  const seedIfEmpty = async () => {
    const needCount = await NeedModel.countDocuments();
    if (needCount === 0) {
      await NeedModel.create([
        { title: "Food Crisis", category: "Food", location: "Hadapsar", lat: 18.5089, lng: 73.9259, urgency: "critical", families: 40, status: "pending", description: "Extreme shortage of dry rations in slum area." },
        { title: "Medical Support", category: "Medical", location: "Kothrud", lat: 18.5074, lng: 73.8077, urgency: "high", families: 15, status: "pending", description: "Insulin and basic antibiotics needed for elderly camp." },
        { title: "Education Kits", category: "Education", location: "Wanowrie", lat: 18.4901, lng: 73.8951, urgency: "medium", families: 22, status: "assigned", description: "Need 22 primary education kits for local school." }
      ]);
      await VolunteerModel.create([
        { name: "Priya Sharma", skills: ["Food Logistics", "Coordination"], location: "Hadapsar", lat: 18.5080, lng: 73.9250, distance: 0.5, status: "online", activeTaskId: null },
        { name: "Dr. Anand Kumar", skills: ["Medical", "First Aid"], location: "Kothrud", lat: 18.5070, lng: 73.8070, distance: 1.2, status: "online", activeTaskId: null }
      ]);
      await TaskModel.create([
        { title: "Deliver Education Kits", location: "Wanowrie", assignedTo: "Sneha Rao", status: "In Progress", deadline: "Today 5PM" }
      ]);
    }
  };
  await seedIfEmpty();

  // --- AUTH ROUTES ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name, adminCode } = req.body;
      const existing = await UserModel.findOne({ email });
      if (existing) return res.status(400).json({ error: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      
      // If code is 'SEVA_ADMIN_2026', set as admin
      const role = adminCode === "SEVA_ADMIN_2026" ? "admin" : "user";
      
      const user = await UserModel.create({ email, password: hashedPassword, name, role });
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email });
      if (!user) return res.status(400).json({ error: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // --- API ROUTES ---

  // Dashboard Stats
  app.get("/api/stats", async (req, res) => {
    const activeNeeds = await NeedModel.countDocuments({ status: "pending" });
    const volunteersOnline = await VolunteerModel.countDocuments({ status: "online" });
    res.json({
      activeNeeds,
      volunteersOnline,
      tasksCompleted: 45, 
      peopleHelped: 1250,
    });
  });

  // Needs
  app.get("/api/needs", async (req, res) => {
    const needs = await NeedModel.find().sort({ createdAt: -1 });
    res.json(needs);
  });

  app.post("/api/needs", async (req, res) => {
    try {
      const { title, description, category, urgency, location, userId } = req.body;
      const newNeed = await NeedModel.create({
        title,
        description,
        category,
        urgency: urgency.toLowerCase(),
        location,
        userId,
        status: 'pending',
        lat: 18.5204 + (Math.random() - 0.5) * 0.1,
        lng: 73.8567 + (Math.random() - 0.5) * 0.1,
      });
      res.json(newNeed);
    } catch (err) {
      res.status(500).json({ error: "Failed to submit request" });
    }
  });

  // Volunteers
  app.get("/api/volunteers", async (req, res) => {
    const volunteers = await VolunteerModel.find();
    res.json(volunteers);
  });

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    const tasks = await TaskModel.find();
    res.json(tasks.map(t => ({
      id: t._id,
      title: t.title,
      description: t.description,
      location: t.location,
      assignedTo: t.assignedTo,
      status: t.status.toLowerCase().replace(" ", "-"),
      deadline: t.deadline
    })));
  });

  // Predictions
  app.get("/api/predictions", (req, res) => {
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

  // AI Intake: Text
  app.post("/api/intake/text", async (req, res) => {
    const { text } = req.body;
    const category = text.toLowerCase().includes("food") ? "Food" : text.toLowerCase().includes("med") ? "Medical" : "Shelter";
    const urgency = text.toLowerCase().includes("critical") || text.toLowerCase().includes("urgent") ? "critical" : "medium";
    
    const newNeed = await NeedModel.create({
      title: `${category} Support Request`,
      category,
      location: "Generated Area",
      lat: 18.52 + (Math.random() - 0.5) * 0.1,
      lng: 73.85 + (Math.random() - 0.5) * 0.1,
      urgency,
      families: Math.floor(Math.random() * 50) + 1,
      status: "pending",
      description: text,
    });
    res.json({ success: true, need: newNeed });
  });

  // AI Matching
  app.post("/api/tasks/match", async (req, res) => {
    const { needId } = req.body;
    const need = await NeedModel.findById(needId);
    if (!need) return res.status(404).json({ error: "Need not found" });

    const volunteer = await VolunteerModel.findOne({ status: "online" });
    if (!volunteer) return res.status(400).json({ error: "No volunteers available" });

    const newTask = await TaskModel.create({
      title: `Response: ${need.category} in ${need.location}`,
      location: need.location,
      assignedTo: volunteer.name,
      status: "In Progress",
      deadline: "Within 2 hours",
    });
    
    need.status = "assigned";
    await need.save();
    
    volunteer.status = "busy";
    volunteer.activeTaskId = newTask._id.toString();
    await volunteer.save();

    res.json({ success: true, task: newTask, volunteer });
  });

  // Impact
  app.get("/api/impact", async (req, res) => {
    const logs = await ImpactLogModel.find().sort({ timestamp: -1 });
    res.json(logs);
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
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
