import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Sidebar, Topbar } from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import Heatmap from "./pages/Heatmap";
import Volunteers from "./pages/Volunteers";
import Tasks from "./pages/Tasks";
import OCRIntake from "./pages/OCRIntake";
import Predictions from "./pages/Predictions";
import ImpactLog from "./pages/ImpactLog";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SubmitNeed from "./pages/SubmitNeed";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, loading } = useAuth();
  
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  
  if (loading) return null;

  if (isAuthPage) return <>{children}</>;

  return (
    <div className="flex bg-brand-bg min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-[200px]">
        <Topbar />
        <main className="mt-[52px] p-6 overflow-y-auto h-[calc(100vh-52px)]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/heatmap" element={<Heatmap />} />
            <Route path="/volunteers" element={<Volunteers />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/ocr-intake" element={<OCRIntake />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/impact" element={<ImpactLog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/submit-need" element={
              <ProtectedRoute>
                <SubmitNeed />
              </ProtectedRoute>
            } />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}
