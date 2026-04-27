import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter, Info, Users, AlertTriangle, List, MapPin, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface Need {
  _id: string;
  title: string;
  category: string;
  urgency: string;
  location: string;
  lat: number;
  lng: number;
  families: number;
  status: string;
  createdAt: string;
}

// Custom Marker Component
const CustomMarker = ({ need }: { need: Need; key?: string }) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#94a3b8';
    }
  };

  const color = getUrgencyColor(need.urgency);
  const size = Math.min(Math.max(12 + (need.families / 5), 14), 22);
  const isCritical = need.urgency.toLowerCase() === 'critical';

  const icon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        ${isCritical ? `
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: ${color};
            opacity: 0.4;
            animation: pulse-ring 2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
          "></div>
        ` : ''}
        <div style="
          position: absolute;
          width: 80%;
          height: 80%;
          top: 10%;
          left: 10%;
          background: ${color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 0 10px ${color}80;
          z-index: 2;
        "></div>
      </div>
      <style>
        @keyframes pulse-ring {
          0% { transform: scale(0.33); opacity: 0.8; }
          80%, 100% { transform: scale(2.5); opacity: 0; }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

  return (
    <Marker position={[need.lat || 18.52, need.lng || 73.85]} icon={icon}>
      <Popup className="custom-popup">
        <div className="p-1 min-w-[200px]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-slate-900 leading-tight mr-2">{need.title}</h3>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              need.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {need.status}
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <MapPin size={12} /> {need.location}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
               <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">{need.category}</span>
               <div className="flex items-center gap-1">
                 <Users size={12} className="text-slate-400" />
                 <span className="font-bold text-slate-700">{need.families} families</span>
               </div>
            </div>
            <div 
              className="mt-1 w-full text-center py-1 rounded text-[10px] font-black uppercase tracking-tighter"
              style={{ backgroundColor: `${color}15`, color }}
            >
              {need.urgency} Priority
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

// Map Auto-fitter
const MapAutoFitter = ({ needs }: { needs: Need[] }) => {
  const map = useMap();
  useEffect(() => {
    if (needs.length > 0) {
      const bounds = L.latLngBounds(needs.map(n => [n.lat || 18.52, n.lng || 73.85]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [needs, map]);
  return null;
};

const Heatmap = () => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/needs');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setNeeds(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredNeeds = useMemo(() => {
    return filter === 'All' 
      ? needs 
      : needs.filter(n => n.category.toLowerCase() === filter.toLowerCase());
  }, [needs, filter]);

  const stats = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0, total: filteredNeeds.length, families: 0 };
    filteredNeeds.forEach(n => {
      const u = n.urgency.toLowerCase() as keyof typeof counts;
      if (counts[u] !== undefined) counts[u]++;
      counts.families += (n.families || 1);
    });
    return counts;
  }, [filteredNeeds]);

  const recentNeeds = useMemo(() => {
    return [...filteredNeeds].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
  }, [filteredNeeds]);

  const urgencyColors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Summary Cards */}
      <div className="p-6 pb-0 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl w-full mx-auto">
        {Object.entries(urgencyColors).map(([level, color]) => (
          <motion.div 
            key={level}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">{level}</p>
              <h4 className="text-2xl font-black text-slate-900 leading-none">{stats[level as keyof typeof stats]}</h4>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15`, color }}>
               <AlertTriangle size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl w-full mx-auto h-[calc(100vh-160px)]">
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Filter Bar */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2 overflow-x-auto">
            <div className="px-3 text-slate-400 border-r border-slate-100 flex items-center gap-2">
              <Filter size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Filters</span>
            </div>
            {['All', 'Food', 'Medical', 'Shelter', 'Education'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${
                  filter === cat 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Map Container */}
          <div className="flex-1 rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative">
            {loading && (
               <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-[1000] flex items-center justify-center">
                 <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
               </div>
            )}
            <MapContainer 
              center={[18.5204, 73.8567]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <MapAutoFitter needs={filteredNeeds} />
              {filteredNeeds.map((need) => (
                <CustomMarker key={need._id} need={need} />
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 overflow-hidden flex flex-col">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="font-black italic uppercase tracking-tighter text-slate-900 mb-6 flex items-center gap-2">
              <Info size={20} className="text-blue-600" />
              Live Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Reports</span>
                <span className="text-lg font-black text-slate-900">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Families in Need</span>
                <span className="text-lg font-black text-slate-900">{stats.families}</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                {Object.entries(urgencyColors).map(([level, color]) => (
                  <div key={level} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[10px] font-black uppercase text-slate-500">{level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0">
             <h3 className="font-black italic uppercase tracking-tighter text-slate-900 mb-6 flex items-center gap-2">
              <List size={20} className="text-blue-600" />
              Recent Alerts
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {recentNeeds.map(need => (
                <div key={need._id} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 group">
                   <div className="flex items-start gap-3">
                      <div className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: urgencyColors[need.urgency.toLowerCase() as keyof typeof urgencyColors] || '#000' }} />
                      <div className="min-w-0">
                         <h4 className="text-[11px] font-black text-slate-900 leading-tight line-clamp-1 group-hover:line-clamp-none transition-all">{need.title}</h4>
                         <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{need.location}</p>
                      </div>
                   </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/submit-need')}
              className="mt-6 w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase italic tracking-tighter flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
            >
              <Plus size={18} />
              Report New Need
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Heatmap;
