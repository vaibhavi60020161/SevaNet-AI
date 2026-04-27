import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Star, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Feedback = () => {
  const { user } = useAuth();
  const [type, setType] = useState<'allocation' | 'volunteer'>('allocation');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [targetId, setTargetId] = useState('');
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (type === 'volunteer') {
      fetch('/api/volunteers')
        .then(res => res.json())
        .then(data => setVolunteers(data))
        .catch(err => console.error(err));
    }
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          userName: user?.name,
          type,
          targetId,
          rating,
          comment
        })
      });

      if (!res.ok) throw new Error('Failed to submit feedback');

      setSubmitted(true);
      setComment('');
      setRating(5);
      setTargetId('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Thank You!</h2>
          <p className="text-slate-600 mb-6">Your feedback helps us improve SevaNet AI for everyone.</p>
          <button 
            onClick={() => setSubmitted(false)}
            className="text-sky-600 font-semibold hover:underline"
          >
            Submit more feedback
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Community Feedback</h1>
        <p className="text-slate-600">Share your thoughts on our allocation process or recognize a helpful volunteer.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">What would you like to provide feedback on?</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType('allocation')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                type === 'allocation' 
                ? 'border-sky-500 bg-sky-50 text-sky-700' 
                : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
              }`}
            >
              <div className="font-bold mb-1">Resource Allocation</div>
              <div className="text-xs opacity-80">How well are we matching needs with resources?</div>
            </button>
            <button
              type="button"
              onClick={() => setType('volunteer')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                type === 'volunteer' 
                ? 'border-sky-500 bg-sky-50 text-sky-700' 
                : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
              }`}
            >
              <div className="font-bold mb-1">Volunteer Performance</div>
              <div className="text-xs opacity-80">Rate the assistance provided by an individual.</div>
            </button>
          </div>
        </div>

        {type === 'volunteer' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Volunteer</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            >
              <option value="">Choose a volunteer...</option>
              {volunteers.map(v => (
                <option key={v._id} value={v.name}>{v.name}</option>
              ))}
            </select>
          </motion.div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Rate your experience</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 transition-transform active:scale-90"
              >
                <Star 
                  size={32} 
                  className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} 
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Detailed Comments</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            placeholder={type === 'allocation' ? "How can we improve our distribution?" : "Tell us about your experience with this volunteer..."}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm min-h-[120px] focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-slate-900 text-white rounded-lg py-4 font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : (
            <>
              Submit Feedback
              <Send size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Feedback;
