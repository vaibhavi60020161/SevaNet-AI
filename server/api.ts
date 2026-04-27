import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB, { User, Need, Volunteer, Task, Feedback, ImpactLog } from "./db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "seva-secret-key";

// Middleware to ensure DB connection
router.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err: any) {
    res.status(500).json({ 
      error: "Database connection failed", 
      details: err.message,
      hint: "Check your MONGODB_URI environment variable."
    });
  }
});

// Helper to handle errors
function handleError(error: any, operation: string, path: string | null) {
  console.error(`Database Error [${operation}] at ${path}:`, error);
  return { 
    error: `Database error during ${operation}`, 
    details: error.message,
    path: path
  };
}

// --- AUTH ROUTES ---

router.post("/auth/register", async (req, res) => {
  try {
    const { email, password, name, adminCode } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = adminCode === "SEVA_ADMIN_2026" ? "admin" : "user";
    
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      role
    });
    
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET);
    res.json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } });
  } catch (err) {
    res.status(500).json(handleError(err, "register", "users"));
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json(handleError(err, "login", "users"));
  }
});

// --- RESOURCE ROUTES ---

router.get("/stats", async (req, res) => {
  try {
    const activeNeeds = await Need.countDocuments({ status: "pending" });
    const volunteersOnline = await Volunteer.countDocuments({ status: "online" });
    
    res.json({
      activeNeeds,
      volunteersOnline,
      tasksCompleted: 45, // Placeholder or fetch from collection
      peopleHelped: 1250, // Placeholder
    });
  } catch (err) {
    res.status(500).json(handleError(err, "stats", "multiple"));
  }
});

router.get("/needs", async (req, res) => {
  try {
    const needs = await Need.find().sort({ createdAt: -1 });
    res.json(needs);
  } catch (err) {
    res.status(500).json(handleError(err, "list", "needs"));
  }
});

router.post("/needs", async (req, res) => {
  try {
    const { title, description, category, urgency, location, userId } = req.body;
    const newNeed = await Need.create({
      title,
      description,
      category,
      urgency: urgency.toLowerCase(),
      location,
      userId,
      status: 'pending',
      lat: 18.5204 + (Math.random() - 0.5) * 0.1,
      lng: 73.8567 + (Math.random() - 0.5) * 0.1
    });
    
    res.json(newNeed);
  } catch (err) {
    res.status(500).json(handleError(err, "create", "needs"));
  }
});

router.get("/volunteers", async (req, res) => {
  try {
    const volunteers = await Volunteer.find();
    res.json(volunteers);
  } catch (err) {
    res.status(500).json(handleError(err, "list", "volunteers"));
  }
});

router.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      location: task.location,
      assignedTo: task.assignedTo,
      status: task.status.toLowerCase().replace(" ", "-"),
      deadline: task.deadline
    })));
  } catch (err) {
    res.status(500).json(handleError(err, "list", "tasks"));
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
    const category = text.toLowerCase().includes("food") ? "Food" : text.toLowerCase().includes("med") ? "Medical" : "Shelter";
    const urgency = text.toLowerCase().includes("critical") || text.toLowerCase().includes("urgent") ? "critical" : "medium";
    
    const newNeed = await Need.create({
      title: `${category} Support Request`,
      category,
      location: "Generated Area",
      lat: 18.52 + (Math.random() - 0.5) * 0.1,
      lng: 73.85 + (Math.random() - 0.5) * 0.1,
      urgency,
      families: Math.floor(Math.random() * 50) + 1,
      status: "pending",
      description: text
    });
    
    res.json({ success: true, need: newNeed });
  } catch (err) {
    res.status(500).json(handleError(err, "create", "needs"));
  }
});

router.post("/tasks/match", async (req, res) => {
  try {
    const { needId } = req.body;
    
    const need = await Need.findById(needId);
    if (!need) return res.status(404).json({ error: "Need not found" });

    const volunteer = await Volunteer.findOne({ status: "online" });
    if (!volunteer) return res.status(400).json({ error: "No volunteers available" });

    const newTask = await Task.create({
      title: `Response: ${need.category} in ${need.location}`,
      location: need.location,
      assignedTo: volunteer.name,
      status: "In Progress",
      deadline: "Within 2 hours"
    });
    
    await Need.findByIdAndUpdate(needId, { status: "assigned" });
    await Volunteer.findByIdAndUpdate(volunteer._id, { 
      status: "busy",
      activeTaskId: newTask._id
    });

    res.json({ success: true, task: newTask, volunteer });
  } catch (err) {
    res.status(500).json(handleError(err, "match", "transactions"));
  }
});

router.get("/impact", async (req, res) => {
  try {
    const logs = await ImpactLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json(handleError(err, "list", "impactLogs"));
  }
});

// --- FEEDBACK ROUTES ---
router.post("/feedback", async (req, res) => {
  try {
    const { userId, userName, type, targetId, rating, comment } = req.body;
    
    const newFeedback = await Feedback.create({
      userId,
      userName,
      type,
      targetId,
      rating,
      comment
    });

    if (type === 'volunteer' && targetId) {
      await Volunteer.findOneAndUpdate(
        { name: targetId },
        { $inc: { impactScore: rating } }
      );
    }

    res.json({ success: true, feedback: newFeedback });
  } catch (err) {
    res.status(500).json(handleError(err, "create", "feedback"));
  }
});

router.get("/feedback", async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json(handleError(err, "list", "feedback"));
  }
});

export default router;
