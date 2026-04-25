import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar, Topbar } from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import Heatmap from "./pages/Heatmap";
import Volunteers from "./pages/Volunteers";
import Tasks from "./pages/Tasks";
import OCRIntake from "./pages/OCRIntake";
import Predictions from "./pages/Predictions";
import ImpactLog from "./pages/ImpactLog";

// Remaining simple placeholders
function AIEngine() { return <div className="p-8"><h1 className="text-2xl font-display font-bold mb-4">AI Core Engine</h1><p className="text-brand-muted">Neural pipeline visualization loading...</p></div>; }
function Admin() { return <div className="p-8"><h1 className="text-2xl font-display font-bold mb-4">System Administration</h1><p className="text-brand-muted">Secured root access established.</p></div>; }

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex bg-brand-bg min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-[200px]">
          <Topbar />
          <main className="mt-[52px] p-6 overflow-y-auto h-[calc(100vh-52px)]">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/heatmap" element={<Heatmap />} />
              <Route path="/volunteers" element={<Volunteers />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/ai-engine" element={<AIEngine />} />
              <Route path="/ocr-intake" element={<OCRIntake />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/impact" element={<ImpactLog />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
