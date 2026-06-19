/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingPage from "./components/LandingPage";
import AnalysisDashboard from "./components/AnalysisDashboard";
import AuthModal from "./components/AuthModal";
import { CVAnalysis, SavedAnalysis } from "./types";
import { AlertCircle, Sliders } from "lucide-react";

export default function App() {
  const [analysisResult, setAnalysisResult] = useState<{
    fileName: string;
    analysis: CVAnalysis;
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Authentication & History management states
  const [user, setUser] = useState<{ email: string; displayName?: string } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);

  // Monitor auth state changes on mount
  useEffect(() => {
    const localUserRaw = localStorage.getItem("local_current_user");
    if (localUserRaw) {
      try {
        const u = JSON.parse(localUserRaw);
        setUser(u);
        fetchUserHistory(u.email);
      } catch (err) {
        console.warn("Failed to parse logged user session:", err);
      }
    }
  }, []);

  const fetchUserHistory = (userEmail: string) => {
    try {
      const localAnalysesRaw = localStorage.getItem("local_analyses");
      const list: SavedAnalysis[] = localAnalysesRaw ? JSON.parse(localAnalysesRaw) : [];
      // Filter list for only the logged-in user email
      const items = list.filter((a) => a.userId === userEmail);
      // Sort items chronologically descending by timestamp
      items.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setSavedAnalyses(items);
    } catch (err) {
      console.warn("Failed to fetch evaluation history from localStorage:", err);
    }
  };

  const handleSelectHistory = (item: SavedAnalysis) => {
    setAnalysisResult({
      fileName: item.fileName,
      analysis: item.analysis
    });
  };

  const handleDeleteHistory = (id: string) => {
    try {
      const localAnalysesRaw = localStorage.getItem("local_analyses");
      const list: SavedAnalysis[] = localAnalysesRaw ? JSON.parse(localAnalysesRaw) : [];
      const updated = list.filter((a) => a.id !== id);
      localStorage.setItem("local_analyses", JSON.stringify(updated));
      if (user) {
        fetchUserHistory(user.email);
      }
    } catch (err) {
      console.error("Delete failed from local storage:", err);
    }
  };

  const handleAuthSuccess = (u: { email: string; displayName?: string } | null) => {
    setUser(u);
    if (u) {
      fetchUserHistory(u.email);
    } else {
      setSavedAnalyses([]);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("local_current_user");
    setUser(null);
    setSavedAnalyses([]);
  };

  // Clean trigger to start a new audit
  const handleReset = () => {
    setAnalysisResult(null);
    setErrorStatus(null);
  };

  /**
   * Common helper calling backend upload & structured AI auditing endpoint
   */
  const executeAnalysis = async (formData: FormData, fileNameOverride?: string) => {
    setIsAnalyzing(true);
    setErrorStatus(null);

    try {
      const response = await fetch("/api/analyze-cv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Server responded with ${response.status}`);
      }

      const result = await response.json();
      const finalName = fileNameOverride || result.fileName || "Pasted Text Draft";
      setAnalysisResult({
        fileName: finalName,
        analysis: result.analysis,
      });

      // Synchronize to Local Storage database under candidate's email
      if (user) {
        try {
          const localAnalysesRaw = localStorage.getItem("local_analyses");
          const list: SavedAnalysis[] = localAnalysesRaw ? JSON.parse(localAnalysesRaw) : [];
          
          const newAnalysis: SavedAnalysis = {
            id: Math.random().toString(36).substring(2, 11),
            userId: user.email,
            fileName: finalName,
            timestamp: new Date().toISOString(),
            analysis: result.analysis,
          };

          list.push(newAnalysis);
          localStorage.setItem("local_analyses", JSON.stringify(list));
          fetchUserHistory(user.email);
        } catch (dbErr) {
          console.warn("Could not log evaluation to local database:", dbErr);
        }
      }
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setErrorStatus(err.message || "An unexpected network or Gemini model error occurred. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 1. Core file drop / browse selection analysis handler
  const handleAnalyzeFile = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    executeAnalysis(formData, file.name);
  };

  // 2. Pre-configured Sandbox demo analyzer trigger
  const handleAnalyzeDemo = (demoId: string) => {
    const formData = new FormData();
    formData.append("demoId", demoId);
    
    let demoName = "Demo profile";
    if (demoId === "junior_dev") demoName = "Demo: Alex Rivera (Junior Developer)";
    else if (demoId === "senior_marketing") demoName = "Demo: Sarah Jenkins (Marketing Lead)";
    else if (demoId === "recent_grad") demoName = "Demo: Alex Chen (Finance Graduate)";
    else if (demoId === "sales_rep") demoName = "Demo: Michael Scott (Sales Rep)";

    executeAnalysis(formData, demoName);
  };

  // 3. Raw text paste box analyzer trigger
  const handleAnalyzeText = (text: string) => {
    const formData = new FormData();
    formData.append("text", text);
    executeAnalysis(formData, "Pasted Content Resume");
  };

  return (
    <div className="min-height-screen flex flex-col bg-[#0A1F44] text-white relative bg-radial-glow overflow-x-hidden selection:bg-blue-500/35 selection:text-white">
      {/* Background radial effects */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Modern Frosted Header */}
      <Header onReset={handleReset} onOpenAuth={() => setIsAuthOpen(true)} user={user} onSignOut={handleSignOut} />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 relative z-10 flex flex-col justify-center">
        {/* API Error warning banners */}
        {errorStatus && (
          <div className="my-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-100 text-sm flex items-start gap-3 shadow-lg max-w-3xl mx-auto w-full">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">Auditing Error</span>
              <p className="font-light text-red-200/90 text-xs sm:text-sm">
                {errorStatus}
              </p>
              <button 
                onClick={() => setErrorStatus(null)} 
                className="text-[11px] font-mono text-red-400 hover:text-red-300 font-semibold cursor-pointer"
              >
                Dismiss notification
              </button>
            </div>
          </div>
        )}

        {/* Global Loading overlay strictly triggered on new analyzes */}
        {isAnalyzing && !analysisResult && (
          <div className="py-24 text-center max-w-xl mx-auto space-y-6">
            <div className="relative inline-block">
              <div className="h-16 w-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sliders className="h-5 w-5 text-blue-400 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Recruiter-Grade AI Audit in Progress...</h3>
              <p className="text-sm text-slate-300 font-light max-w-sm mx-auto leading-relaxed">
                Gemini 3.5-Flash is benchmarking your document structure, checking action verbs, evaluating ATS keywords, and drafting metric-oriented bullet rewrites.
              </p>
            </div>

            <div className="pt-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 inline-block text-[11px] font-mono text-slate-400">
              ⚡ ESTIMATED SCAN DURATION: &lt; 5 SECONDS
            </div>
          </div>
        )}

        {/* Dynamic Screen Routing */}
        {!isAnalyzing && !analysisResult && (
          <LandingPage
            onAnalyzeFile={handleAnalyzeFile}
            onAnalyzeDemo={handleAnalyzeDemo}
            onAnalyzeText={handleAnalyzeText}
            isAnalyzing={isAnalyzing}
            savedAnalyses={savedAnalyses}
            onSelectHistory={handleSelectHistory}
            onDeleteHistory={handleDeleteHistory}
          />
        )}

        {analysisResult && (
          <AnalysisDashboard
            fileName={analysisResult.fileName}
            analysis={analysisResult.analysis}
            onBack={handleReset}
            onReanalyzeFile={handleAnalyzeFile}
            isReanalyzing={isAnalyzing}
          />
        )}
      </main>

      {/* Account Auth Dialog */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuthSuccess={handleAuthSuccess} />

      {/* Styled Footer */}
      <Footer />
    </div>
  );
}
