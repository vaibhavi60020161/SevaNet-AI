import axios from "axios";
import { Need, Volunteer, Task, Prediction, ImpactLog } from "./types";

const api = axios.create({
  baseURL: "/api",
});

export const getStats = () => api.get("/stats").then(res => res.data);
export const getNeeds = () => api.get<Need[]>("/needs").then(res => res.data);
export const getVolunteers = () => api.get<Volunteer[]>("/volunteers").then(res => res.data);
export const getTasks = () => api.get<Task[]>("/tasks").then(res => res.data);
export const getPredictions = () => api.get<Prediction>("/predictions").then(res => res.data);
export const getImpact = () => api.get<ImpactLog[]>("/impact").then(res => res.data);

export const submitTextIntake = (text: string) => api.post("/intake/text", { text }).then(res => res.data);
export const matchVolunteer = (needId: string) => api.post("/tasks/match", { needId }).then(res => res.data);
