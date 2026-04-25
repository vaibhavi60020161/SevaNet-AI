import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { createWorker } from "tesseract.js";
import { Scan, Upload, FileText, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { submitTextIntake } from "../api";
import { cn } from "../lib/utils";
import { StatusBadge } from "../components/UI";

export default function OCRIntake() {
  const [image, setImage] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
    setResults(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const processOCR = async () => {
    if (!image) return;
    setLoading(true);
    setStatus("Initializing Neural Network...");
    
    try {
      const worker = await createWorker('eng');
      setStatus("Scanning Document for Key Vectors...");
      const { data: { text } } = await worker.recognize(image);
      await worker.terminate();
      
      setStatus("Analyzing Semantics with AI Core...");
      // Simulate backend call with result
      const aiResponse = await submitTextIntake(text);
      setResults({ text, parsed: aiResponse.need });
      setStatus("Data ingestion complete.");
    } catch (err) {
      console.error(err);
      setStatus("Error: Failed to parse tactical report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-16 h-16 bg-brand-teal/10 rounded-full flex items-center justify-center text-brand-teal mb-4 border border-brand-teal/20">
          <Scan size={32} />
        </div>
        <h1 className="text-4xl font-display font-extrabold tracking-tight">Tactical OCR Bridge</h1>
        <p className="text-brand-muted font-mono max-w-xl">Digitize handwritten or printed field reports. AI Core will automatically classify needs and calculate urgency levels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Side */}
        <div className="space-y-6">
          <div 
            {...getRootProps()} 
            className={cn(
              "border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-4 h-[400px] rounded-brand",
              isDragActive ? "border-brand-teal bg-brand-teal/5" : "border-brand-border hover:border-brand-teal/40 bg-brand-surface"
            )}
          >
            <input {...getInputProps()} />
            {image ? (
              <img src={image} alt="Report" className="max-h-full object-contain rounded-sm shadow-2xl" />
            ) : (
              <>
                <div className="w-10 h-10 bg-brand-bg rounded-sm flex items-center justify-center border border-brand-border text-brand-muted">
                  <Upload size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm uppercase tracking-tight">Ingest Field Asset</p>
                  <p className="text-[9px] text-brand-muted font-mono mt-1 uppercase leading-none">PNG_JPG_MAX_10MB</p>
                </div>
              </>
            )}
          </div>

          <button
            onClick={processOCR}
            disabled={!image || loading}
            className="w-full bg-brand-teal text-brand-bg font-mono font-black py-3 rounded-brand flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-teal/90 transition-all uppercase tracking-tighter"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
            {loading ? "SCAN_INITIALIZING..." : "START_TACTICAL_SCAN"}
          </button>
          
          {status && <p className="text-center font-mono text-[9px] text-brand-teal animate-pulse uppercase tracking-[0.2em]">{status}</p>}
        </div>

        {/* Results Side */}
        <div className="tactical-card p-6 flex flex-col gap-5">
          <h3 className="text-[10px] font-mono text-brand-muted uppercase tracking-widest flex items-center gap-2">
            <CheckCircle size={12} /> Extraction_Vectors
          </h3>

          <AnimatePresence mode="wait">
            {results ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="p-3 bg-brand-bg border border-brand-border rounded-brand">
                  <p className="text-[9px] font-mono text-brand-muted uppercase mb-1.5 tracking-tighter">Raw_Stream_Dump</p>
                  <p className="text-[11px] font-mono leading-relaxed h-28 overflow-y-auto custom-scrollbar text-brand-muted">
                    {results.text}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   {[
                     { label: 'Classification', val: results.parsed.category, accent: 'text-brand-teal' },
                     { label: 'Urgency_Delta', val: results.parsed.urgency, accent: 'text-brand-red' },
                     { label: 'Zone_Cluster', val: results.parsed.location, accent: 'text-brand-text' },
                     { label: 'Impact_ Households', val: results.parsed.families, accent: 'text-brand-text' }
                   ].map(item => (
                     <div key={item.label} className="p-3 border border-brand-border rounded-brand bg-brand-surface/50">
                       <p className="text-[8px] font-mono text-brand-muted uppercase mb-0.5 tracking-tighter">{item.label}</p>
                       <p className={cn("text-[13px] font-bold truncate uppercase tracking-tighter", item.accent)}>{item.val}</p>
                     </div>
                   ))}
                </div>

                <div className="p-3 bg-brand-teal/5 border border-brand-teal/20 rounded-brand flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Scan size={14} className="text-brand-teal" />
                     <p className="text-[10px] font-mono uppercase tracking-tighter">Entry_Committed_To_Ledger</p>
                   </div>
                   <StatusBadge status="Verified" />
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-brand-muted py-12 opacity-30">
                <FileText size={40} className="mb-4" />
                <p className="text-[10px] font-mono tracking-[0.2em]">AWAITING_INPUT...</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
