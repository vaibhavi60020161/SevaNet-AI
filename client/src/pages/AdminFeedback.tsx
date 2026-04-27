import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Calendar, Tag, BarChart3, Heart } from 'lucide-react';
import { motion } from 'motion/react';

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'allocation' | 'volunteer'>('all');

  useEffect(() => {
    fetch('/api/feedback')
      .then(res => res.json())
      .then(data => {
        setFeedback(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const filteredFeedback = feedback.filter(f => filter === 'all' || f.type === filter);

  const stats = {
    avgRating: feedback.length ? (feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length).toFixed(1) : 0,
    allocationCount: feedback.filter(f => f.type === 'allocation').length,
    volunteerCount: feedback.filter(f => f.type === 'volunteer').length
  };

  if (loading) return <div className="py-20 text-center">Loading feedback...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Feedback Management</h1>
          <p className="text-slate-600">Monitor community satisfaction and volunteer performance reports.</p>
        </div>

        <div className="flex bg-white p-1 rounded-lg border border-slate-200">
          {(['all', 'allocation', 'volunteer'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                filter === t ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
            <Star fill="currentColor" size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats.avgRating} / 5.0</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Average Rating</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500">
            <BarChart3 size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats.allocationCount}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Allocation Reports</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
            <Heart size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats.volunteerCount}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Volunteer Reviews</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
            <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No feedback found for this category.</p>
          </div>
        ) : (
          filteredFeedback.map((item) => (
            <motion.div 
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6"
            >
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.type === 'allocation' ? 'bg-sky-100 text-sky-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {item.type}
                      </span>
                      {item.targetId && (
                        <span className="text-xs text-slate-500 font-medium">
                          for <span className="text-slate-900 font-bold">{item.targetId}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} className={s <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed italic">"{item.comment}"</p>

                <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                  <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-500 font-bold">
                    {item.userName.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-slate-600 font-mono">Reported by: {item.userName}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;
