import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter, Info } from 'lucide-react';
import { motion } from 'motion/react';

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
}

const Heatmap = () => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/needs')
      .then((res) => res.json())
      .then((data) => {
        setNeeds(data);
        setLoading(false);
      })
      .catch((err) => console.error('Error fetching needs:', err));
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'critical': return '#ef4444'; // red-500
      case 'high': return '#f97316'; // orange-500
      case 'medium': return '#eab308'; // yellow-500
      case 'low': return '#22c55e'; // green-500
      default: return '#94a3b8'; // slate-400
    }
  };

  const filteredNeeds = filter === 'All' 
    ? needs 
    : needs.filter(n => n.category.toLowerCase() === filter.toLowerCase());

  const center: [number, number] = [18.5204, 73.8567];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Needs Heatmap</h1>
            <p className="text-slate-600">Visualizing resource requirements across Pune</p>
          </div>

          <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            <Filter size={18} className="text-slate-400 ml-2 shrink-0" />
            {['All', 'Food', 'Medical', 'Shelter', 'Education'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === cat 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 h-[600px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 relative">
            {loading ? (
              <div className="absolute inset-0 bg-white flex items-center justify-center z-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : null}
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredNeeds.map((need) => (
                <CircleMarker
                  key={need._id}
                  center={[need.lat || 18.52, need.lng || 73.85]}
                  radius={10 + (need.families / 5)}
                  fillColor={getUrgencyColor(need.urgency)}
                  color="white"
                  weight={1}
                  opacity={1}
                  fillOpacity={0.7}
                >
                  <Popup>
                    <div className="p-1">
                      <h3 className="font-bold text-slate-900 border-b pb-1 mb-2">{need.title}</h3>
                      <div className="space-y-1 text-xs">
                        <p><span className="font-semibold">Category:</span> {need.category}</p>
                        <p><span className="font-semibold">Location:</span> {need.location}</p>
                        <p><span className="font-semibold">Families:</span> {need.families}</p>
                        <p><span className="font-semibold">Urgency:</span> 
                          <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold" 
                                style={{ backgroundColor: getUrgencyColor(need.urgency) + '20', color: getUrgencyColor(need.urgency) }}>
                            {need.urgency}
                          </span>
                        </p>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Info size={20} className="text-blue-600" />
                Map Legend
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Critical', color: '#ef4444' },
                  { label: 'High', color: '#f97316' },
                  { label: 'Medium', color: '#eab308' },
                  { label: 'Low', color: '#22c55e' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-slate-600 font-medium">{item.label} Urgency</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Size of the markers corresponds to the number of families affected. 
                  Larger markers indicate higher density of need.
                </p>
              </div>
            </div>

            <div className="bg-blue-600 p-6 rounded-2xl shadow-lg text-white">
              <h3 className="font-bold mb-2">Real-time Pulse</h3>
              <p className="text-sm opacity-90 mb-4">
                Currently tracking {filteredNeeds.length} {filter !== 'All' ? filter : ''} requests across the city.
              </p>
              <button 
                onClick={() => window.location.href = '/submit-need'}
                className="w-full py-2 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors"
                id="report-need-btn"
              >
                Report New Need
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Heatmap;
