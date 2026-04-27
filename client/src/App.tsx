import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import SubmitNeed from './pages/SubmitNeed';
import Feedback from './pages/Feedback';
import AdminFeedback from './pages/AdminFeedback';
import Heatmap from './pages/Heatmap';
import CrisisPrediction from './pages/CrisisPrediction';
import VolunteerMatching from './pages/VolunteerMatching';
import MissionMode from './pages/MissionMode';
import ImpactTracker from './pages/ImpactTracker';
import VoiceIntake from './pages/VoiceIntake';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/submit-need" element={user ? <SubmitNeed /> : <Navigate to="/login" />} />
          <Route path="/feedback" element={user ? <Feedback /> : <Navigate to="/login" />} />
          <Route path="/admin/feedback" element={user?.role === 'admin' ? <AdminFeedback /> : <Navigate to="/" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/heatmap" element={<Heatmap />} />
          <Route path="/crisis" element={user ? <CrisisPrediction /> : <Navigate to="/login" />} />
          <Route path="/matching" element={user ? <VolunteerMatching /> : <Navigate to="/login" />} />
          <Route path="/missions" element={user ? <MissionMode /> : <Navigate to="/login" />} />
          <Route path="/impact" element={user ? <ImpactTracker /> : <Navigate to="/login" />} />
          <Route path="/voice-intake" element={user ? <VoiceIntake /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
