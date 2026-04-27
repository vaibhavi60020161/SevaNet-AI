import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ShieldPlus, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setRetryCountdown(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, adminCode })
      });

      if (res.status === 500) {
        throw new Error('Database connection failed');
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      if (err.message.includes('Database connection failed')) {
        setError('Server is warming up, please try again in 10 seconds');
        startRetryCountdown();
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const startRetryCountdown = () => {
    let count = 10;
    setRetryCountdown(count);
    const interval = setInterval(() => {
      count -= 1;
      setRetryCountdown(count);
      if (count === 0) {
        clearInterval(interval);
        setRetryCountdown(null);
        handleSubmit();
      }
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500 mx-auto mb-4">
            <ShieldPlus size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-sm text-slate-500 mt-1">Join the SevaNet AI relief network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Admin Code (Optional)</label>
            <input 
              type="text"
              value={adminCode}
              onChange={e => setAdminCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              placeholder="Enter code for admin access"
            />
          </div>

          {error && (
            <div className={`${
              error.includes('warming up') 
                ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                : 'bg-red-50 text-red-600 border border-red-200'
            } p-4 rounded-xl text-xs font-bold flex flex-col gap-2 transition-all`}>
              <div className="flex items-center gap-2">
                <AlertCircle size={14} />
                {error}
              </div>
              {retryCountdown !== null && (
                <div className="flex items-center justify-between mt-1 pt-2 border-t border-amber-200/50">
                  <span className="font-black italic uppercase tracking-tighter">Automatic Retry</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] opacity-70">Retrying in</span>
                    <span className="w-5 h-5 bg-amber-200 text-amber-700 rounded-md flex items-center justify-center font-black animate-pulse">
                      {retryCountdown}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 text-white rounded-lg py-3.5 font-bold hover:bg-sky-600 transition-colors shadow-lg shadow-sky-100 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register Now'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Already have an account? {' '}
            <Link to="/login" className="text-sky-600 font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
