/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  TrendingUp, 
  Share2, 
  Award,
  BookOpen,
  RefreshCw,
  FileText,
  BadgeAlert,
  Sliders,
  CheckCircle,
  Copy,
  Plus,
  ArrowRight
} from "lucide-react";
import { CVAnalysis } from "../types";
import CVTemplateSelector from "./CVTemplateSelector";
import RealtimeKeywords from "./RealtimeKeywords";

interface AnalysisDashboardProps {
  fileName: string;
  analysis: CVAnalysis;
  onBack: () => void;
  onReanalyzeFile: (file: File) => void;
  isReanalyzing: boolean;
}

export default function AnalysisDashboard({
  fileName,
  analysis,
  onBack,
  onReanalyzeFile,
  isReanalyzing
}: AnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "bulletpoints" | "sidebyside" | "words" | "templates">("overview");
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const { scores, summary, weaknesses, recommendations, sideBySideComparison, overallNextSteps } = analysis;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-400/30 bg-emerald-500/10";
    if (score >= 60) return "text-amber-400 border-amber-400/30 bg-amber-500/10";
    return "text-red-400 border-red-400/30 bg-red-500/10";
  };

  const getSubscoreBarColor = (score: number) => {
    if (score >= 80) return "bg-gradient-to-r from-emerald-500 to-teal-500";
    if (score >= 60) return "bg-gradient-to-r from-amber-500 to-orange-500";
    return "bg-gradient-to-r from-red-500 to-rose-500";
  };

  const getImpactBadge = (impact: "high" | "medium" | "low") => {
    switch (impact) {
      case "high":
        return <span className="pill px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-red-500/20 text-red-300 border border-red-500/30">High Impact</span>;
      case "medium":
        return <span className="pill px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Medium Impact</span>;
      case "low":
        return <span className="pill px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Low Impact</span>;
    }
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Drag-and-drop support for quick re-analyzer
  const handleReanalyzeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onReanalyzeFile(e.dataTransfer.files[0]);
    }
  };

  const handleReanalyzeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onReanalyzeFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full pb-16 relative">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-b border-white/10 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/10 cursor-pointer"
            title="Upload new CV"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-blue-500/10 text-blue-300 px-2.5 py-0.5 rounded-full font-semibold border border-blue-500/20">
                ACTIVE AUDIT REPORT
              </span>
              <span className="text-xs text-slate-400">• Just now</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
              <FileText className="h-5 w-5 text-blue-400" />
              <span>{fileName}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-lg transition-all cursor-pointer"
          >
            Start New Scan
          </button>
          
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-blue-900/20 cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column (2 cols in desktop): Insights, Weaknesses, Comparisons */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card 1: Main circular score container & Premium recruiter summary */}
          <div className="glass rounded-2xl border border-white/10 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Circular score display */}
            <div className="relative flex-shrink-0">
              <div className="w-36 h-36 rounded-full border-[10px] border-white/5 flex flex-col items-center justify-center relative">
                {/* Score border filled arc */}
                <div 
                  className="absolute inset-0 rounded-full border-[10px]" 
                  style={{
                    borderColor: scores.overall >= 80 ? "#10b981" : scores.overall >= 60 ? "#f59e0b" : "#ef4444",
                    clipPath: `polygon(0 0, 100% 0, 100% ${scores.overall}%, 0 ${scores.overall}%)`,
                    transform: "rotate(-45deg)",
                    opacity: 0.15
                  }}
                />
                <span className="text-5xl font-extrabold text-white tracking-tighter">
                  {scores.overall}
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-widest mt-0.5">SCORE / 100</span>
              </div>
            </div>

            {/* Recruiter expert high-conversion assessment quote */}
            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="flex justify-center md:justify-start">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getScoreColor(scores.overall)}`}>
                  {scores.overall >= 80 ? "✦ Market Ready - Top-Tier" : scores.overall >= 60 ? "▲ Moderate Gaps - Deserves Focus" : "✍ Critical Weaknesses Detected"}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-100">Senior Recruiter Audit Summary</h2>
              <p className="text-slate-300 text-sm leading-relaxed font-light italic">
                "{summary}"
              </p>
            </div>
          </div>

          {/* Navigation Sub-Tabs within active dashboard */}
          <div className="flex border-b border-white/10 mb-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all relative ${
                activeTab === "overview" ? "text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <BadgeAlert className="h-4 w-4 text-rose-400" />
                <span>Weaknesses ({weaknesses.length})</span>
              </div>
              {activeTab === "overview" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("bulletpoints")}
              className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all relative ${
                activeTab === "bulletpoints" ? "text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span>Smart Bullet Rewrites</span>
              </div>
              {activeTab === "bulletpoints" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("sidebyside")}
              className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all relative ${
                activeTab === "sidebyside" ? "text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-teal-400" />
                <span>Side-by-Side</span>
              </div>
              {activeTab === "sidebyside" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("words")}
              className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all relative ${
                activeTab === "words" ? "text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-purple-400" />
                <span>ATS Keywords & Real-Time Setup</span>
              </div>
              {activeTab === "words" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("templates")}
              className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all relative ${
                activeTab === "templates" ? "text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-[#38bdf8]" />
                <span className="font-bold text-amber-300">CV Templates (ATS Preview) ✨</span>
              </div>
              {activeTab === "templates" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          </div>

          {/* TAB CONTENT: WEAKNESS DETECTION */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>Critical Friction Elements</span>
                  <span className="text-xs font-normal text-slate-400">(Reduces ATS & Recruiter conversion)</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {weaknesses.map((w) => (
                  <div key={w.id} className="glass rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all">
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5">
                        {w.impact === "high" ? (
                          <div className="h-9 w-9 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
                            <XCircle className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-slate-100 text-sm sm:text-base">{w.title}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-slate-800 text-slate-400 border border-white/10 px-2 py-0.5 rounded">
                              {w.category}
                            </span>
                            {getImpactBadge(w.impact)}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                          {w.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: BULLET POINT REWRITES */}
          {activeTab === "bulletpoints" && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs sm:text-sm text-blue-300 flex items-start gap-2.5">
                <Sparkles className="h-4.5 w-4.5 shrink-0 text-blue-400 mt-0.5" />
                <span>
                  <strong>Impact Bullet Strategy:</strong> Modern hiring managers evaluate accomplishments through <strong>action verb + core metrics context</strong>. Below, our AI has revised vague phrases from your resume into high-converting alternatives. Feel free to copy them directly.
                </span>
              </div>

              <div className="space-y-4">
                {recommendations.bulletRewrites.map((br, index) => (
                  <div key={index} className="glass rounded-xl border border-white/10 overflow-hidden">
                    {/* Header bar */}
                    <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">OPTIMIZATION CASE #{index + 1}</span>
                      <button
                        onClick={() => copyToClipboard(br.improved, index)}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {copiedIndex === index ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Improved Bullet</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Compare blocks */}
                    <div className="p-5 space-y-4">
                      {/* Original */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-red-400 tracking-wider">
                          ✕ Original Draft
                        </span>
                        <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 text-xs sm:text-sm text-slate-400 italic">
                          "{br.original}"
                        </div>
                      </div>

                      {/* Improved */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                          ✓ Improved Result-Driven Bullet
                        </span>
                        <div className="bg-emerald-500/5 border border-emerald-500/25 rounded-lg p-3 text-xs sm:text-sm text-slate-100 font-medium">
                          {br.improved}
                        </div>
                      </div>

                      {/* Recruiter why */}
                      <div className="pt-2 border-t border-white/5 space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-blue-400 tracking-wider">
                          Why this beats recruiter filters
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed font-light">
                          {br.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: SIDE-BY-SIDE PROFILE PREVIEW COMPONENT */}
          {activeTab === "sidebyside" && (
            <div className="space-y-6">
              <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl text-xs sm:text-sm text-teal-300 flex items-start gap-2.5">
                <Sliders className="h-4.5 w-4.5 shrink-0 text-teal-400 mt-0.5" />
                <span>
                  <strong>Layout Structure Preview:</strong> Below matches standard single-column ATS templates. See how formatting changes like standard headers and strong action summaries stand out.
                </span>
              </div>

              {sideBySideComparison.map((comp, index) => (
                <div key={index} className="glass rounded-xl border border-white/10 p-5 space-y-4">
                  <h4 className="text-sm font-bold text-slate-100 border-b border-white/5 pb-2 uppercase tracking-wide">
                    Section: {comp.sectionTitle}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before box */}
                    <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3.5 space-y-1.5">
                      <span className="text-[10px] font-mono text-red-400 font-bold tracking-widest uppercase">
                        Before (Weak & Unquantified)
                      </span>
                      <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line font-light">
                        {comp.originalContent}
                      </p>
                    </div>

                    {/* After box */}
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3.5 space-y-1.5">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-widest uppercase">
                        After (Optimized & Clean)
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                        {comp.rewrittenContent}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs text-slate-300 space-y-1">
                    <span className="font-semibold text-slate-200">Recruiter Rationale:</span>
                    <p className="font-light">{comp.whyItIsBetter}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB CONTENT: VOCABULARY ENGINE COGNITIVE WORDS */}
          {activeTab === "words" && (
            <div className="space-y-6">
              {/* ATS Keywords list */}
              <div className="glass rounded-xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  <h4 className="font-bold text-slate-100 text-sm">Target Industry Keywords for ATS Matching</h4>
                </div>
                <p className="text-xs text-slate-400 font-light">
                  Include these high-frequency search keywords naturally in your skills, summary, or job descriptions to score higher in applicant filters.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {recommendations.atsKeywords.map((word, i) => (
                    <span key={i} className="text-xs bg-purple-500/15 text-purple-300 border border-purple-500/35 px-3 py-1 rounded-full font-mono">
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verified Action Verbs and Skills lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Action verbs stack */}
                <div className="glass rounded-xl p-5 border border-white/10 space-y-3">
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm font-semibold text-slate-200 font-mono">Recommended Action Verbs</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 font-light">
                    {recommendations.actionVerbsToUse.map((verb, idx) => (
                      <li key={idx}>
                        <strong className="text-blue-300">{verb}</strong>: Substitute generic words like "managed".
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skills add/remove stack */}
                <div className="glass rounded-xl p-5 border border-white/10 space-y-3">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Award className="h-4 w-4" />
                    <span className="text-sm font-semibold text-slate-200 font-mono">High-Demand Industry Skills</span>
                  </div>
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-mono block uppercase mb-1">✓ Add These Gaps:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {recommendations.skillsToAdd.map((skill, idx) => (
                          <span key={idx} className="bg-emerald-500/10 text-emerald-300 text-[11px] px-2 py-0.5 rounded border border-emerald-500/25">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-red-400 font-mono block uppercase mb-1">✕ Avoid (Outdated/Soft):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {recommendations.skillsToRemove.map((skill, idx) => (
                          <span key={idx} className="bg-red-500/10 text-red-300 text-[11px] px-2 py-0.5 rounded border border-red-500/25 line-through">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Role specific improvements */}
              <div className="glass rounded-xl p-5 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-widest block font-mono text-blue-300">
                  ⚡ Role Positioning Strategy
                </span>
                <ul className="text-xs sm:text-sm text-slate-300 space-y-2.5">
                  {recommendations.roleSpecificTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 pt-1">
                      <ArrowRight className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="font-light">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dynamic Interactive Real-time keywords match engine */}
              <RealtimeKeywords cvText="" analysisKeywords={recommendations.atsKeywords} />

            </div>
          )}

          {/* TAB CONTENT: ATS CURATED CV TEMPLATES SELECTOR */}
          {activeTab === "templates" && (
            <CVTemplateSelector analysis={analysis} fileName={fileName} />
          )}

        </div>

        {/* Right column (1 col in desktop): Score details & Next Action list */}
        <div className="space-y-8">
          
          {/* Card: ATS Score Breakdown breakdown list */}
          <div className="glass rounded-2xl border border-white/10 p-6 relative overflow-hidden">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-5 pb-2 border-b border-white/10">
              ATS Metric Dashboard
            </h3>

            <div className="space-y-5">
              {/* Score 1 */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1.5">
                  <span>ATS Compatibility</span>
                  <span className="font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded text-[11px]">
                    {scores.atsCompatibility}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getSubscoreBarColor(scores.atsCompatibility)}`} 
                    style={{ width: `${scores.atsCompatibility}%` }} 
                  />
                </div>
              </div>

              {/* Score 2 */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1.5">
                  <span>Content Strength</span>
                  <span className="font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded text-[11px]">
                    {scores.contentStrength}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getSubscoreBarColor(scores.contentStrength)}`} 
                    style={{ width: `${scores.contentStrength}%` }} 
                  />
                </div>
              </div>

              {/* Score 3 */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1.5">
                  <span>Experience Impact</span>
                  <span className="font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded text-[11px]">
                    {scores.experienceImpact}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getSubscoreBarColor(scores.experienceImpact)}`} 
                    style={{ width: `${scores.experienceImpact}%` }} 
                  />
                </div>
              </div>

              {/* Score 4 */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1.5">
                  <span>Skills Relevance</span>
                  <span className="font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded text-[11px]">
                    {scores.skillsRelevance}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getSubscoreBarColor(scores.skillsRelevance)}`} 
                    style={{ width: `${scores.skillsRelevance}%` }} 
                  />
                </div>
              </div>

              {/* Score 5 */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1.5">
                  <span>Formatting & Structure</span>
                  <span className="font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded text-[11px]">
                    {scores.formattingStructure}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getSubscoreBarColor(scores.formattingStructure)}`} 
                    style={{ width: `${scores.formattingStructure}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Checkbox tracker list for immediate execution */}
          <div className="glass rounded-2xl border border-white/10 p-6 relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-2">
              Instant Action Guidelines
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-normal font-light">
              Complete these steps on your core document to see substantial evaluation score jumps.
            </p>

            <div className="space-y-3">
              {overallNextSteps.map((step, idx) => {
                const isDone = !!completedSteps[idx];
                return (
                  <div 
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      isDone 
                        ? "border-emerald-500/30 bg-emerald-500/10 opacity-75" 
                        : "border-white/5 bg-white/3 hover:border-white/15"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                      ) : (
                        <div className="h-4.5 w-4.5 rounded-full border-2 border-slate-500" />
                      )}
                    </div>
                    <span className={`text-xs leading-relaxed font-light ${
                      isDone ? "line-through text-slate-400" : "text-slate-200"
                    }`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick interactive Re-analyzer zone */}
          <div className="glass rounded-2xl border-2 border-dashed border-blue-500/20 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleReanalyzeDrop}
              className="space-y-3"
            >
              <div className="w-11 h-11 bg-blue-500/10 rounded-full border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto">
                <RefreshCw className={`h-5 w-5 ${isReanalyzing ? "animate-spin" : ""}`} />
              </div>
              <p className="font-semibold text-sm text-slate-100">Quick Re-analyze</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-normal font-light">
                Applied recommendations? Re-upload your updated CV text/file below to measure metric improvements instantly.
              </p>
              
              <div className="pt-2">
                <label className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/15 text-white text-xs px-3 py-1.5 border border-white/10 rounded-lg cursor-pointer font-semibold transition active:scale-95">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Upload File</span>
                  <input 
                    type="file" 
                    onChange={handleReanalyzeChange} 
                    accept=".pdf,.docx,.txt" 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
