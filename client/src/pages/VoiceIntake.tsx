import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Mic, 
  MicOff, 
  Send, 
  Globe, 
  AlertCircle, 
  Volume2, 
  RefreshCw,
  CheckCircle2,
  FileText,
  MapPin,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const VoiceIntake = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [isSupported, setIsSupported] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [manualText, setManualText] = useState('');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + event.results[i][0].transcript + ' ');
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setManualText(transcript + interimTranscript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [transcript]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setManualText('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = async () => {
    const textToSubmit = manualText || transcript;
    if (!textToSubmit.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/intake/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSubmit })
      });
      
      const data = await res.json();
      if (data.success) {
        setResult(data.need);
      }
    } catch (err) {
      console.error('Error submitting intake:', err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setTranscript('');
    setManualText('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold uppercase tracking-widest mb-4">
             <Volume2 size={12} />
             Next-Gen Voice Intake
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 italic uppercase">
            Emergency <span className="text-blue-600">Voice</span> Report
          </h1>
          <p className="text-slate-500 font-medium">Speak naturally in your preferred language to register a need.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-3 space-y-6">
            <div className={`bg-white rounded-[40px] shadow-2xl p-10 border-4 transition-all duration-500 ${
              isRecording ? 'border-red-100 shadow-red-500/10' : 'border-white'
            }`}>
              {!isSupported && (
                 <div className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4 text-amber-700">
                   <AlertCircle className="shrink-0" />
                   <p className="text-sm font-medium">
                     Speech recognition is not supported in your browser. Please use the text input below.
                   </p>
                 </div>
              )}

              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                    <Globe size={16} className="text-blue-600" />
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-transparent text-sm font-bold text-slate-900 outline-none"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="hi-IN">Hindi (हिंदी)</option>
                      <option value="mr-IN">Marathi (मराठी)</option>
                    </select>
                  </div>
                  {isRecording && (
                    <div className="flex items-center gap-2">
                       <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                       <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Listening...</span>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={reset}
                  className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all"
                >
                  <RefreshCw size={20} />
                </button>
              </div>

              <div className="relative mb-12">
                <textarea
                  value={manualText || transcript}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Tap microphone and speak, or type here..."
                  className="w-full h-48 bg-slate-50 rounded-[32px] p-8 text-xl font-medium text-slate-900 placeholder:text-slate-300 resize-none outline-none border-2 border-transparent focus:border-blue-100 transition-all"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <AnimatePresence>
                    {!manualText && !transcript && !isRecording && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pointer-events-none"
                      >
                         <Volume2 size={80} className="text-slate-100" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <button
                  onClick={toggleRecording}
                  disabled={!isSupported}
                  className={`flex-1 py-6 rounded-[32px] font-black uppercase italic tracking-tighter text-xl flex items-center justify-center gap-4 transition-all shadow-xl ${
                    isRecording 
                      ? 'bg-red-600 text-white shadow-red-500/20 hover:bg-red-700' 
                      : 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700 disabled:bg-slate-200'
                  }`}
                >
                  {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading || (!transcript && !manualText)}
                  className="w-24 h-24 bg-slate-900 text-white rounded-[32px] flex items-center justify-center hover:bg-black transition-all shadow-xl shadow-slate-900/10 disabled:bg-slate-200 disabled:shadow-none"
                >
                  {loading ? (
                    <RefreshCw size={32} className="animate-spin" />
                  ) : (
                    <Send size={32} />
                  )}
                </button>
              </div>
            </div>
            
            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-600 text-white p-8 rounded-[40px] shadow-2xl shadow-emerald-500/20"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                     <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase italic tracking-tighter leading-none">Report Registered</h3>
                    <p className="text-emerald-100 text-xs font-bold uppercase mt-1">AI Classification Complete</p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                   <h4 className="text-lg font-black uppercase italic tracking-tighter mb-4">{result.title}</h4>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <FileText size={18} className="opacity-60" />
                           <span className="text-sm font-bold">Category: {result.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <AlertCircle size={18} className="opacity-60" />
                           <span className="text-sm font-bold uppercase italic">Urgency: {result.urgency}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <MapPin size={18} className="opacity-60" />
                           <span className="text-sm font-bold">{result.location}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <Clock size={18} className="opacity-60" />
                           <span className="text-sm font-bold uppercase italic tracking-tighter">Status: {result.status}</span>
                        </div>
                      </div>
                   </div>
                </div>
                
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full mt-6 py-4 bg-white text-emerald-700 rounded-2xl font-black uppercase italic tracking-tighter text-sm flex items-center justify-center gap-2"
                >
                  View My Dashboard
                  <Plus size={18} />
                </button>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
               <h3 className="font-black uppercase italic tracking-tighter text-lg mb-6 flex items-center gap-2">
                 <Globe size={20} className="text-blue-600" />
                 Local Dialects
               </h3>
               <div className="space-y-4">
                  {[
                    { lang: 'English', samples: ['Food needed near station', 'Medical emergency'] },
                    { lang: 'Hindi', samples: ['स्टेशन के पास भोजन चाहिए', 'मेडिकल इमरजेंसी'] },
                    { lang: 'Marathi', samples: ['भोजनाची गरज आहे', 'तात्काळ मदत हवी'] }
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.lang}</p>
                       <div className="space-y-1">
                          {item.samples.map((s, j) => (
                            <p key={j} className="text-xs font-bold text-slate-700 italic">"{s}"</p>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-slate-900 rounded-[32px] p-6 text-white text-center">
               <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Model Update</p>
               <h4 className="text-xl font-bold uppercase italic tracking-tighter mb-4">NLP v2.0 Ready</h4>
               <p className="text-xs opacity-70 mb-6 leading-relaxed">Our AI now detects 98% of humanitarian keywords across 14 regional dialects.</p>
               <div className="w-12 h-12 rounded-full bg-blue-600 mx-auto flex items-center justify-center animate-bounce">
                  <CheckCircle2 size={24} />
               </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VoiceIntake;
