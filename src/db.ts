import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sevanet';

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
  }
}

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const NeedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  lat: { type: Number },
  lng: { type: Number },
  category: { type: String, required: true },
  urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['pending', 'assigned', 'in-progress', 'completed'], default: 'pending' },
  families: { type: Number, default: 1 },
  contact: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const VolunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  skills: [{ type: String }],
  location: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  distance: { type: Number },
  status: { type: String, enum: ['online', 'busy', 'offline'], default: 'online' },
  activeTaskId: { type: String },
  impactScore: { type: Number, default: 0 },
  operations: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  assignedTo: { type: String },
  deadline: { type: String },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  createdAt: { type: Date, default: Date.now }
});

const ImpactLogSchema = new mongoose.Schema({
  event: { type: String, required: true },
  desc: { type: String, required: true },
  icon: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export const NeedModel = mongoose.model('Need', NeedSchema);
export const VolunteerModel = mongoose.model('Volunteer', VolunteerSchema);
export const TaskModel = mongoose.model('Task', TaskSchema);
export const ImpactLogModel = mongoose.model('ImpactLog', ImpactLogSchema);
export const UserModel = mongoose.model('User', UserSchema);
