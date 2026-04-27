import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  if (!MONGODB_URI || MONGODB_URI.startsWith("mongodb://localhost")) {
    console.warn("⚠️ MONGODB_URI is missing or pointing to localhost. MongoDB Atlas connection is recommended for production.");
  }

  try {
    await mongoose.connect(MONGODB_URI || "mongodb://localhost:27017/sevanet", {
      serverSelectionTimeoutMS: 5000, 
      connectTimeoutMS: 10000,
    });
    console.log("✅ MongoDB Connected");
  } catch (err: any) {
    console.error("❌ MongoDB Connection Error:", err.message);
    if (MONGODB_URI) {
      console.log(`ℹ️ MONGODB_URI Length: ${MONGODB_URI.length} chars`);
      console.log(`ℹ️ MONGODB_URI Starts with: ${MONGODB_URI.substring(0, 20)}...`);
    }
    if (err.message.includes("ENOTFOUND")) {
      console.error("👉 HINT: Your MONGODB_URI may be misconfigured. The host part looks wrong.");
    }
    throw err;
  }
};

// --- SCHEMAS ---

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  createdAt: { type: Date, default: Date.now }
});

const NeedSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  urgency: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  location: { type: String, required: true },
  lat: { type: Number },
  lng: { type: Number },
  status: { type: String, enum: ["pending", "assigned", "completed"], default: "pending" },
  families: { type: Number, default: 1 },
  userId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const VolunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  skills: [{ type: String }],
  location: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  status: { type: String, enum: ["online", "busy", "offline"], default: "online" },
  activeTaskId: { type: String, default: null },
  impactScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  assignedTo: { type: String },
  status: { type: String, default: "In Progress" },
  deadline: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const FeedbackSchema = new mongoose.Schema({
  userId: { type: String },
  userName: { type: String },
  type: { type: String },
  targetId: { type: String },
  rating: { type: Number, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const ImpactLogSchema = new mongoose.Schema({
  event: { type: String, required: true },
  desc: { type: String, required: true },
  icon: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// --- MODELS ---

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Need = mongoose.models.Need || mongoose.model("Need", NeedSchema);
export const Volunteer = mongoose.models.Volunteer || mongoose.model("Volunteer", VolunteerSchema);
export const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);
export const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
export const ImpactLog = mongoose.models.ImpactLog || mongoose.model("ImpactLog", ImpactLogSchema);

export default connectDB;
