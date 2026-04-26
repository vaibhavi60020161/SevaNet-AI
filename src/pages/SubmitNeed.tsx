import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Send, MapPin, AlertCircle, Package } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function SubmitNeed() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Food",
    urgency: "Medium",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/needs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: user.id }),
      });
      
      if (res.ok) {
        setSuccess(true);
        setFormData({ title: "", description: "", category: "Food", urgency: "Medium", location: "" });
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg md:pl-[200px] pt-[52px]">
      <div className="max-w-3xl mx-auto p-6 lg:p-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold">RESOURCE REQUEST PORTAL</h1>
            <p className="text-brand-muted text-[10px] font-mono uppercase tracking-widest mt-1">Personnel: {user?.name} // STATUS: ACTIVE</p>
          </div>
          <button 
            onClick={logout}
            className="text-[10px] font-mono text-brand-red border border-brand-red/30 px-3 py-1 rounded-sm hover:bg-brand-red/10 transition-all uppercase"
          >
            TERMINATE_SESSION
          </button>
        </div>

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-teal/10 border border-brand-teal p-4 rounded mb-8 text-brand-teal text-sm font-mono flex items-center gap-3"
          >
            <Package size={20} />
            RESOURCE_REQUEST_COMMITTED_SUCCESSFULLY
          </motion.div>
        )}

        <div className="tactical-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-brand-muted uppercase">Target Cluster (Location)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
                  <input 
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-brand-bg border border-brand-border rounded p-2.5 pl-10 text-sm focus:border-brand-teal transition-colors"
                    placeholder="e.g. Kothrud Sector B"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-brand-muted uppercase">Resource Category</label>
                <select 
                  className="w-full bg-brand-bg border border-brand-border rounded p-2.5 text-sm focus:border-brand-teal transition-colors"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option>Food</option>
                  <option>Medical</option>
                  <option>Shelter</option>
                  <option>Education</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-brand-muted uppercase">Mission Abstract (Title)</label>
              <input 
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-brand-bg border border-brand-border rounded p-2.5 text-sm focus:border-brand-teal transition-colors"
                placeholder="e.g. Critical Food Shortage - Slum Area 4"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-brand-muted uppercase">Detailed Intelligence Report (Description)</label>
              <textarea 
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-brand-bg border border-brand-border rounded p-2.5 text-sm focus:border-brand-teal transition-colors h-32 resize-none"
                placeholder="Specify exact needs, household counts, and situational context..."
              />
            </div>

            <div className="flex items-center gap-6 p-4 bg-brand-bg border border-brand-border rounded">
               <label className="text-[10px] font-mono text-brand-muted uppercase">Urgency Vector:</label>
               {['Low', 'Medium', 'High', 'Critical'].map(lvl => (
                 <label key={lvl} className="flex items-center gap-2 cursor-pointer group">
                   <input 
                    type="radio" 
                    name="urgency" 
                    value={lvl} 
                    checked={formData.urgency === lvl}
                    onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                    className="accent-brand-teal"
                   />
                   <span className={`text-[10px] font-mono uppercase ${formData.urgency === lvl ? 'text-brand-teal' : 'text-brand-muted group-hover:text-brand-text'}`}>
                     {lvl}
                   </span>
                 </label>
               ))}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-teal text-brand-bg font-mono font-bold py-4 rounded hover:bg-brand-teal/90 transition-all flex items-center justify-center gap-3 mt-8 uppercase tracking-widest text-sm"
            >
              {loading ? "TRANSMITTING..." : <><Send size={18} /> BROADCAST_NEED</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
