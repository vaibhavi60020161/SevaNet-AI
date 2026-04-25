import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- MOCK DATABASE ---
  let needs = [
    { id: "n1", category: "Food", location: "Hadapsar", lat: 18.5089, lng: 73.9259, urgency: "critical", families: 40, status: "pending", description: "Extreme shortage of dry rations in slum area." },
    { id: "n2", category: "Medical", location: "Kothrud", lat: 18.5074, lng: 73.8077, urgency: "high", families: 15, status: "pending", description: "Insulin and basic antibiotics needed for elderly camp." },
    { id: "n3", category: "Education", location: "Wanowrie", lat: 18.4901, lng: 73.8951, urgency: "medium", families: 22, status: "assigned", description: "Need 22 primary education kits for local school." },
    { id: "n4", category: "Shelter", location: "Camp", lat: 18.5133, lng: 73.8767, urgency: "low", families: 5, status: "pending", description: "Temporary tarps needed for leak repairs." },
    { id: "n5", category: "Food", location: "Dhanori", lat: 18.5775, lng: 73.8961, urgency: "high", families: 30, status: "pending", description: "Cooked meals required for daily labor group." },
  ];

  let volunteers = [
    { id: "v1", name: "Priya Sharma", skills: ["Food Logistics", "Coordination"], location: "Hadapsar", lat: 18.5080, lng: 73.9250, distance: 0.5, status: "online", activeTaskId: null },
    { id: "v2", name: "Dr. Anand Kumar", skills: ["Medical", "First Aid"], location: "Kothrud", lat: 18.5070, lng: 73.8070, distance: 1.2, status: "online", activeTaskId: null },
    { id: "v3", name: "Sneha Rao", skills: ["Education", "Social Work"], location: "Wanowrie", lat: 18.4900, lng: 73.8950, distance: 0.8, status: "busy", activeTaskId: "t1" },
    { id: "v4", name: "Rajan Mehta", skills: ["Transport", "Driving"], location: "Camp", lat: 18.5130, lng: 73.8760, distance: 2.5, status: "online", activeTaskId: null },
  ];

  let tasks = [
    { id: "t1", title: "Deliver Education Kits", location: "Wanowrie", category: "Education", assignedTo: "v3", urgency: "medium", status: "in-progress", deadline: "Today 5PM" },
  ];

  let impactLogs = [
    { id: "l1", type: "Food", location: "Hadapsar", impact: "120 meals delivered", date: "2026-04-20" },
    { id: "l2", type: "Medical", location: "Kothrud", impact: "10 consults provided", date: "2026-04-22" },
  ];

  // --- API ROUTES ---

  // Dashboard Stats
  app.get("/api/stats", (req, res) => {
    res.json({
      activeNeeds: needs.filter(n => n.status === "pending").length,
      volunteersOnline: volunteers.filter(v => v.status === "online").length,
      tasksCompleted: 45, // Static for demo
      peopleHelped: 1250, // Static for demo
    });
  });

  // Needs
  app.get("/api/needs", (req, res) => {
    res.json(needs);
  });

  // Volunteers
  app.get("/api/volunteers", (req, res) => {
    res.json(volunteers);
  });

  // Tasks
  app.get("/api/tasks", (req, res) => {
    res.json(tasks);
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
  app.post("/api/intake/text", (req, res) => {
    const { text } = req.body;
    // Simple mock classifier
    const category = text.toLowerCase().includes("food") ? "Food" : text.toLowerCase().includes("med") ? "Medical" : "Shelter";
    const urgency = text.toLowerCase().includes("critical") || text.toLowerCase().includes("urgent") ? "critical" : "medium";
    
    const newNeed = {
      id: "n" + (needs.length + 1),
      category,
      location: "Generated Area",
      lat: 18.52 + (Math.random() - 0.5) * 0.1,
      lng: 73.85 + (Math.random() - 0.5) * 0.1,
      urgency,
      families: Math.floor(Math.random() * 50) + 1,
      status: "pending",
      description: text,
    };
    needs.push(newNeed);
    res.json({ success: true, need: newNeed });
  });

  // AI Matching
  app.post("/api/tasks/match", (req, res) => {
    const { needId } = req.body;
    const need = needs.find(n => n.id === needId);
    if (!need) return res.status(404).json({ error: "Need not found" });

    // Simple matching logic
    const availableVolunteers = volunteers.filter(v => v.status === "online");
    if (availableVolunteers.length === 0) return res.status(400).json({ error: "No volunteers available" });

    const volunteer = availableVolunteers[0]; // Just pick first for mock
    
    const newTask = {
      id: "t" + (tasks.length + 1),
      title: `Response: ${need.category} in ${need.location}`,
      location: need.location,
      category: need.category,
      assignedTo: volunteer.name,
      urgency: need.urgency,
      status: "assigned",
      deadline: "Within 2 hours",
    };
    
    tasks.push(newTask);
    need.status = "assigned";
    volunteer.status = "busy";
    volunteer.activeTaskId = newTask.id;

    res.json({ success: true, task: newTask, volunteer });
  });

  // Impact
  app.get("/api/impact", (req, res) => {
    res.json(impactLogs);
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
