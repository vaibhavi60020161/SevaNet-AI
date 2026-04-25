export type Urgency = "critical" | "high" | "medium" | "low";
export type Status = "pending" | "assigned" | "in-progress" | "completed";

export interface Need {
  id: string;
  category: string;
  location: string;
  lat: number;
  lng: number;
  urgency: Urgency;
  families: number;
  status: Status;
  description: string;
}

export interface Volunteer {
  id: string;
  name: string;
  skills: string[];
  location: string;
  lat: number;
  lng: number;
  distance: number;
  status: "online" | "busy" | "offline";
  activeTaskId: string | null;
}

export interface Task {
  id: string;
  title: string;
  location: string;
  category: string;
  assignedTo: string;
  urgency: Urgency;
  status: string;
  deadline: string;
}

export interface Prediction {
  trends: { day: string; food: number; medical: number; shelter: number }[];
  alerts: { message: string; location: string; probability: string }[];
}

export interface ImpactLog {
  id: string;
  type: string;
  location: string;
  impact: string;
  date: string;
}
