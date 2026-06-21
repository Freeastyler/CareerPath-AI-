/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  Upload, 
  FileText, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Users, 
  Zap, 
  Target, 
  FileUp,
  BrainCircuit,
  CornerDownRight,
  ClipboardList,
  History,
  Trash2,
  Calendar
} from "lucide-react";
import { DemoResume, SavedAnalysis } from "../types";

interface LandingPageProps {
  onAnalyzeFile: (file: File) => void;
  onAnalyzeDemo: (demoId: string) => void;
  onAnalyzeText: (text: string) => void;
  isAnalyzing: boolean;
  savedAnalyses?: SavedAnalysis[];
  onSelectHistory?: (item: SavedAnalysis) => void;
  onDeleteHistory?: (id: string) => void;
}

const DEMO_PROFILES: DemoResume[] = [
  {
    id: "junior_dev",
    name: "Alex Rivera",
    role: "Junior Front-End Developer",
    avatarColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    description: "Has some freelance work. Summary is generic, lacks measurable metrics or ATS optimization.",
    rawText: ""
  },
  {
    id: "senior_marketing",
    name: "Sarah Jenkins",
    role: "Senior Marketing Manager",
    avatarColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    description: "8+ years experience. Text looks nice but missing hard KPIs or ROI stats.",
    rawText: ""
  },
  {
    id: "recent_grad",
    name: "Alex Chen",
    role: "Recent Finance Graduate",
    avatarColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    description: "Strong academic background but has highly vague project and action items.",
    rawText: ""
  },
  {
    id: "sales_rep",
    name: "Michael Scott",
    role: "Sales Representative",
    avatarColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    description: "Dynamic pitch layout but completely unquantified. Overuse of generic buzzwords.",
    rawText: ""
  }
];

export default function LandingPage({
  onAnalyzeFile,
  onAnalyzeDemo,
  onAnalyzeText,
  isAnalyzing,
  savedAnalyses = [],
  onSelectHistory,
  onDeleteHistory
}: LandingPageProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    // 10MB limits
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes && !file.type.startsWith("image/")) {
      alert(`The selected file is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a resume document smaller than 10MB.`);
      return;
    }

    const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isDocx = file.name.toLowerCase().endsWith(".docx");
    const isTxt = file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");
    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(file.name);

    if (isPDF || isDocx || isTxt || isImage) {
      setSelectedFile(file);
    } else {
      alert("Unsupported file format. Please upload a PDF, DOCX, TXT or photo/screenshot of your resume.");
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUploadSubmit = () => {
    if (selectedFile) {
      onAnalyzeFile(selectedFile);
    }
  };

  const handlePasteSubmit = () => {
    if (pastedText.trim().length < 50) {
      alert("Please paste a more substantial CV text content (at least 50 characters) to retrieve meaningful career insights.");
      return;
    }
    onAnalyzeText(pastedText);
  };

  return (
    <div className="w-full pb-16">
      {/* Dynamic Starry Sparkle Element overlay */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <section className="text-center pt-16 pb-12 px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
          Turn your CV into a <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">job-winning document</span> using AI.
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-8">
          Get instant, expert-level feedback aligned with modern hiring systems and ATS standards. Transform weak bullet points into result-driven impact statements.
        </p>

        {/* Dynamic Interactive Panel */}
        <div className="glass rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-8 max-w-3xl mx-auto text-left relative z-10 overflow-hidden">
          {/* Subtle background highlight */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Internal Navigation Tabs */}
          <div className="flex border-b border-white/10 mb-6">
            <button
              onClick={() => setActiveTab("upload")}
              className={`pb-3 px-4 text-sm font-semibold transition-all relative ${
                activeTab === "upload" 
                  ? "text-white" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>Upload Document</span>
              </div>
              {activeTab === "upload" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("paste")}
              className={`pb-3 px-4 text-sm font-semibold transition-all relative ${
                activeTab === "paste" 
                  ? "text-white" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Paste CV Content</span>
              </div>
              {activeTab === "paste" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          </div>

          {activeTab === "upload" ? (
            <div>
              {/* Drag n drop interactive area */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? "border-blue-400 bg-blue-500/10 scale-[0.99]" 
                    : "border-white/15 hover:border-blue-500/30 hover:bg-white/5"
                }`}
                id="cv-drag-drop-zone"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                />
                
                <div className="flex flex-col items-center justify-center">
                  <div className="h-14 w-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 border border-blue-500/20 shadow-inner">
                    <FileUp className="h-7 w-7" />
                  </div>
                  
                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="text-white font-medium text-base">{selectedFile.name}</p>
                      <p className="text-xs text-emerald-400 flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Ready for advanced AI analysis ({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-white font-semibold text-base">Drag & drop your resume here</p>
                      <p className="text-sm text-slate-400">PDF, DOCX, TXT, or Image (PNG/JPG) formats</p>
                      <p className="text-[11px] text-slate-500 mt-2 font-mono">Max size: 10MB (Images automatically optimized)</p>
                    </div>
                  )}

                  {!selectedFile && (
                    <button 
                      type="button" 
                      className="mt-5 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-semibold border border-white/10 transition-all active:scale-95"
                    >
                      Browse Files
                    </button>
                  )}
                </div>
              </div>

              {/* Submit trigger button */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-blue-400" />
                  <span>Privacy First: AI evaluates your text on-the-fly</span>
                </div>

                <button
                  onClick={handleUploadSubmit}
                  disabled={!selectedFile || isAnalyzing}
                  className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all ${
                    selectedFile && !isAnalyzing
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white cursor-pointer active:scale-95"
                      : "bg-slate-800 text-slate-400 cursor-not-allowed border border-white/5"
                  }`}
                  id="btn-analyze-upload"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Extracting & Auditing...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze My CV</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  Copy and paste your raw resume text below:
                </label>
                <textarea
                  rows={7}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your Header, Professional Summary, Work History, Education, and Skills here..."
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 font-sans resize-none"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {pastedText.length} characters entered (minimum 50)
                </span>

                <button
                  onClick={handlePasteSubmit}
                  disabled={pastedText.trim().length < 50 || isAnalyzing}
                  className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all ${
                    pastedText.trim().length >= 50 && !isAnalyzing
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white cursor-pointer active:scale-95"
                      : "bg-slate-800 text-slate-400 cursor-not-allowed border border-white/5"
                  }`}
                  id="btn-analyze-pasted"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Auditing Text...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze My CV</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Real-time Persistent History list saved locally */}
      {savedAnalyses.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 mb-16 relative z-10">
          <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
            <History className="h-5 w-5 text-blue-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">Your Saved Resumes & Analyses</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedAnalyses.map((item) => (
              <div
                key={item.id}
                className="glass rounded-xl p-4 border border-white/10 hover:border-blue-500/30 transition-all flex justify-between items-start gap-4 relative overflow-hidden"
              >
                <div 
                  onClick={() => onSelectHistory?.(item)}
                  className="flex-1 cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-300" />
                    <span className="font-bold text-white text-xs sm:text-sm line-clamp-1 truncate">{item.fileName}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 font-bold">
                      Score: {item.analysis.scores.overall}/100
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteHistory?.(item.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer transition"
                  title="Remove analysis record"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Core Benefits Matrix */}
      <section className="max-w-6xl mx-auto px-4 py-8 border-t border-white/10 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Why professional CV optimization matters
          </h2>
          <p className="text-sm text-slate-400">
            Standard AI models just give generic summaries. CV Insight AI performs role-specific benchmarking to beat ATS filters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass rounded-xl p-5 border border-white/10">
            <div className="h-9 w-9 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center mb-4">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">ATS Optimization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects standard single-column rendering gaps, keyword density issues, and formatting red flags before recruiters do.
            </p>
          </div>

          <div className="glass rounded-xl p-5 border border-white/10">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center mb-4">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Impact Benchmarking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Points out exactly where you used weak, passive verbs instead of measurable metrics-driven accomplishments.
            </p>
          </div>

          <div className="glass rounded-xl p-5 border border-white/10">
            <div className="h-9 w-9 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center mb-4">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Skill Gap Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compares active technologies on your CV against global high-growth sector expectations to highlight what is missing.
            </p>
          </div>

          <div className="glass rounded-xl p-5 border border-white/10">
            <div className="h-9 w-9 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center mb-4">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Recruiter Focus</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Presents feedback structured exactly how senior executives score candidates during rapid 6-second review screens.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Quote / Footer Note */}
      <section className="text-center px-4 max-w-2xl mx-auto pt-6">
        <p className="text-[11px] font-mono text-slate-500 tracking-widest uppercase">
          ✦ TRUSTED BY GRADUATES & PROFESSIONALS GLOBALLY ✦
        </p>
        <p className="text-slate-400 text-xs mt-3 leading-relaxed">
          Aligning resumes with hiring standards at Google, Stripe, McKinsey, Netflix, and hundreds of high-growth technology pioneers.
        </p>
      </section>
    </div>
  );
}
