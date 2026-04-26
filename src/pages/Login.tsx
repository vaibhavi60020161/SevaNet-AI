import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LogIn, Mail, Lock, UserPlus } from "lucide-react";
import { motion } from "motion/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      
      login(data.token, data.user);
      if (data.user.role === "admin") {
        navigate("/");
      } else {
        navigate("/submit-need");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="tactical-card max-w-md w-full p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold mb-2">SEVANET SOURCE</h1>
          <p className="text-brand-muted text-xs uppercase tracking-widest">Access Resource Engine</p>
        </div>

        {error && (
          <div className="bg-brand-red/10 border border-brand-red p-3 rounded mb-6 text-brand-red text-xs font-mono">
            ERROR: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-brand-muted uppercase">Email Vector</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded p-2.5 pl-10 text-sm focus:border-brand-teal transition-colors"
                placeholder="operator@seva.net"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-brand-muted uppercase">Access Key</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded p-2.5 pl-10 text-sm focus:border-brand-teal transition-colors"
                placeholder="********"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand-teal text-brand-bg font-mono font-bold py-3 rounded hover:bg-brand-teal/90 transition-all flex items-center justify-center gap-2 mt-6 uppercase tracking-widest text-xs"
          >
            {loading ? "INITIALIZING..." : <><LogIn size={16} /> INITIATE_SESSION</>}
          </button>
        </form>

        <p className="text-center text-brand-muted text-[10px] mt-8 uppercase font-mono">
          New Operator? <Link to="/register" className="text-brand-teal hover:underline">Register Vector</Link>
        </p>
      </motion.div>
    </div>
  );
}
