import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Send, MapPin, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const SubmitNeed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Food',
    urgency: 'medium',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/needs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId: user?.id })
      });
      if (res.ok) navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAiRefine = () => {
    setAiAnalyzing(true);
    // Simulate AI refinement
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        title: prev.title || "Critical Medical & Supply Request",
        description: prev.description + "\n\n[AI Refinement]: Identified priority for geriatric care and hygiene supplies. Categorized as critical due to density."
      }));
      setAiAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Request Assistance</h1>
        <p className="text-slate-600">Provide details about the requirement. Our AI will analyze and route this to the nearest available NGO/Volunteer.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Requirement Title</label>
            <input 
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Urgent Food requirement for 20 families"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option>Food</option>
                <option>Medical</option>
                <option>Shelter</option>
                <option>Education</option>
                <option>Rescue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Urgency</label>
              <select 
                value={formData.urgency}
                onChange={e => setFormData({...formData, urgency: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Location / Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                required
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., Sector 4, Hadapsar, Pune"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-slate-700">Detailed Description</label>
              <button 
                type="button"
                onClick={handleAiRefine}
                disabled={aiAnalyzing || !formData.description}
                className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 disabled:opacity-50"
              >
                <Sparkles size={14} />
                {aiAnalyzing ? 'Analyzing...' : 'AI Refine'}
              </button>
            </div>
            <textarea 
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm min-h-[120px] focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="What specifically is needed? Mention family counts, specific age groups if relevant..."
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-xl py-4 font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-sky-200"
        >
          {loading ? 'Transmitting...' : (
            <>
              Submit Request
              <Send size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SubmitNeed;
