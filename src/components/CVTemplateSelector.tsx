/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Sparkles, 
  Copy, 
  Printer, 
  CheckCircle, 
  FileText, 
  ShieldCheck, 
  BookOpen, 
  Download, 
  Edit3,
  Undo2,
  RefreshCw
} from "lucide-react";
import { CVAnalysis } from "../types";

interface CVTemplateSelectorProps {
  analysis: CVAnalysis;
  fileName: string;
}

interface SelectedTemplate {
  id: string;
  name: string;
  vibe: string;
  font: string;
  color: string;
  styles: string;
}

const CURATED_TEMPLATES: SelectedTemplate[] = [
  {
    id: "executive_classic",
    name: "Executive Class",
    vibe: "Traditional, high-influence serif font layout optimal for McKinsey, finance, or leadership tracks.",
    font: "font-serif",
    color: "border-t-[6px] border-slate-900 bg-white text-slate-800",
    styles: "p-8 shadow-xl max-w-2xl mx-auto"
  },
  {
    id: "clean_minimalist",
    name: "Clean Slate Minimalist",
    vibe: "Elegant Swiss design framework with plenty of negative space. Highly readable on all ATS parsers.",
    font: "font-sans",
    color: "border-l-[4px] border-slate-400 bg-white text-slate-800",
    styles: "p-8 shadow-xl max-w-2xl mx-auto"
  },
  {
    id: "tech_mono",
    name: "Tech Modern Mono",
    vibe: "Clean, monospaced layout elements suited for developers, engineers, and product specialists.",
    font: "font-mono",
    color: "border-t-[6px] border-blue-500 bg-slate-900 text-slate-100",
    styles: "p-8 shadow-xl max-w-2xl mx-auto"
  },
  {
    id: "fintech_highlight",
    name: "Fintech Blue Highlight",
    vibe: "Sleek, high-converting accent design featuring subtle colors and compact info lists.",
    font: "font-sans",
    color: "border-t-[8px] border-blue-600 bg-white text-slate-850",
    styles: "p-8 shadow-xl max-w-2xl mx-auto"
  }
];

export default function CVTemplateSelector({ analysis, fileName }: CVTemplateSelectorProps) {
  const [selectedId, setSelectedId] = useState<string>("clean_minimalist");
  const [copied, setCopied] = useState(false);

  // Editable candidate fields populated dynamically from the analysis structure
  const [candidateName, setCandidateName] = useState("Ian Kariri");
  const [candidateTitle, setCandidateTitle] = useState("Senior Professional");
  const [draftSummary, setDraftSummary] = useState(
    analysis.sideBySideComparison[0]?.rewrittenContent || "Proven leader with track record of driving significant cost savings, process optimizations and robust infrastructure."
  );
  
  // Custom work experiences draft built from comparative analysis results
  const [workExperienceBullets, setWorkExperienceBullets] = useState<string[]>(
    analysis.recommendations?.bulletRewrites?.map(br => br.improved) || [
      "Spearheaded cloud migration strategies resulting in 32% architectural optimization across multi-zone containers.",
      "Optimized legacy automation workloads, reducing transaction fail-rates to 0.05% and saving 11 development hours weekly.",
      "Catalyzed regional engagement indicators by 42% through targeted feature rollouts and SEO enhancements."
    ]
  );

  const [technicalSkills, setTechnicalSkills] = useState<string[]>(
    analysis.recommendations?.atsKeywords || ["TypeScript", "React 19", "Node.js", "ATS Benchmarking", "API Design"]
  );

  const activeTemplate = CURATED_TEMPLATES.find(t => t.id === selectedId) || CURATED_TEMPLATES[1];

  const handleCopyFormattedText = () => {
    const formattedText = `
${candidateName} - ${candidateTitle}
--------------------------------------------------
SUMMARY:
${draftSummary}

KEY STRENGTHS & SKILLS:
${technicalSkills.join(", ")}

REWRITTEN PROFESSIONAL EXPERIENCE:
${workExperienceBullets.map((b, i) => `- ${b}`).join("\n")}
    `;
    navigator.clipboard.writeText(formattedText.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printArea = document.getElementById("printable-cv-box")?.innerHTML;
    if (!printArea) return;

    const originalContent = document.body.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export printable documents.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${candidateName} - Optimized Resume</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { font-family: system-ui, sans-serif; background: #fff; padding: 40px; color: #1e293b; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="max-w-2xl mx-auto border-t-8 border-slate-900 pt-6">
            ${printArea}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      
      {/* Template selection header carousel */}
      <div className="glass rounded-xl p-5 border border-white/10">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest font-mono block mb-1">
          ✦ Premium ATS Template Suite
        </span>
        <h3 className="font-bold text-slate-100 text-sm mb-4">
          Visual Benchmarked Layouts (Optimized for parsing engines and recruiters)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {CURATED_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => setSelectedId(tpl.id)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                selectedId === tpl.id
                  ? "bg-blue-600/10 border-blue-500 scale-[1.02] shadow-inner"
                  : "bg-slate-900/40 border-white/5 hover:border-white/15"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white leading-none">{tpl.name}</span>
                {selectedId === tpl.id && (
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">
                {tpl.vibe}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-side editing dashboard and visual sandbox canvas view */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Editable fields left block */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-xl p-5 border border-white/10 space-y-4 text-left">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest font-mono block border-b border-white/5 pb-2">
              📝 Real-time Sandbox Editor
            </span>

            {/* Field: Name */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase">Candidate Full Name</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>

            {/* Field: Target Role Title */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase">Target Role / Title</label>
              <input
                type="text"
                value={candidateTitle}
                onChange={(e) => setCandidateTitle(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>

            {/* Field: Summary */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase">Professional Summary Biography</label>
              <textarea
                rows={4}
                value={draftSummary}
                onChange={(e) => setDraftSummary(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500/50 resize-none"
              />
            </div>

            {/* Skills checklist editor */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase">Active Technical Skills list</label>
              <div className="flex gap-1.5">
                <input
                  id="add-skill-field"
                  type="text"
                  placeholder="E.g. PyTorch"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const input = e.currentTarget;
                      if (input.value.trim() && !technicalSkills.includes(input.value.trim())) {
                        setTechnicalSkills([...technicalSkills, input.value.trim()]);
                        input.value = "";
                      }
                    }
                  }}
                  className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("add-skill-field") as HTMLInputElement;
                    if (el && el.value.trim() && !technicalSkills.includes(el.value.trim())) {
                      setTechnicalSkills([...technicalSkills, el.value.trim()]);
                      el.value = "";
                    }
                  }}
                  className="px-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1 mt-1.5 max-h-24 overflow-y-auto pt-1">
                {technicalSkills.map((v, i) => (
                  <span
                    key={i}
                    onClick={() => {
                      setTechnicalSkills(technicalSkills.filter(val => val !== v));
                    }}
                    className="bg-white/5 hover:bg-red-500/20 text-[10px] text-slate-300 border border-white/10 px-2 py-0.5 rounded cursor-pointer"
                    title="Click to remove skill"
                  >
                    {v} &times;
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Helper guidelines instruction note */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-[10px] text-blue-300 leading-normal font-light">
                🌟 <strong>Hacker Pro Tip:</strong> Any changes made in this editor are instantly injected to the live canvas on your right! You can select standard paper layouts to customize.
              </p>
            </div>
          </div>
        </div>

        {/* Live Canvas template Preview right block */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Action buttons list */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              Template Canvas: <strong className="text-white">{activeTemplate.name}</strong>
            </span>

            <div className="flex gap-2">
              <button
                onClick={handleCopyFormattedText}
                className="px-3 py-1.5 text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-95"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copied ? "Copied!" : "Copy Text Draft"}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-md shadow-blue-900/15"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print / Download PDF</span>
              </button>
            </div>
          </div>

          {/* Core Visual Preview Canvas document box */}
          <div 
            id="printable-cv-box"
            className={`${activeTemplate.font} ${activeTemplate.color} ${activeTemplate.styles} rounded-2xl w-full select-none text-left`}
          >
            {/* Header profile info */}
            <div className="text-center mb-6 pb-5 border-b border-slate-200/60">
              <h1 className="text-2xl font-extrabold tracking-tight uppercase mb-1">
                {candidateName}
              </h1>
              <p className="text-xs font-mono tracking-wider text-slate-500 font-bold uppercase">
                {candidateTitle}
              </p>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                San Francisco, CA | active.candidate@cvinsight.ai | www.linkedin.com/demo
              </p>
            </div>

            {/* Summary segment */}
            <div className="mb-6">
              <h4 className="text-xs font-bold font-mono tracking-widest text-[#0a1f44] uppercase mb-1.5 border-b border-slate-200 pb-0.5">
                Professional Profile
              </h4>
              <p className="text-[11px] leading-relaxed text-slate-600 font-light whitespace-pre-line">
                {draftSummary}
              </p>
            </div>

            {/* Technical Skills segment */}
            <div className="mb-6">
              <h4 className="text-xs font-bold font-mono tracking-widest text-[#0a1f44] uppercase mb-1.5 border-b border-slate-200 pb-0.5">
                Core Competencies & Skills
              </h4>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-700">
                {technicalSkills.map((skill, idx) => (
                  <span key={idx} className="font-semibold">{skill} •</span>
                ))}
              </div>
            </div>

            {/* Experience timeline segment */}
            <div className="mb-6">
              <h4 className="text-xs font-bold font-mono tracking-widest text-[#0a1f44] uppercase mb-2 border-b border-slate-200 pb-0.5">
                Professional Experience (Optimized Targets)
              </h4>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-900 mb-1">
                    <span>Peak Optimization Agency — Marketing & Technology Services</span>
                    <span className="font-mono text-[10px] text-slate-500">2022 - Present</span>
                  </div>
                  <p className="text-[10px] italic text-slate-500 mb-2">Lead Specialist / Staff Contributor</p>
                  
                  <ul className="text-[11px] text-slate-600 space-y-1.5 pl-4 list-disc font-light">
                    {workExperienceBullets.map((bullet, idx) => (
                      <li key={idx} className="leading-relaxed">{bullet}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Education placeholder block */}
            <div>
              <h4 className="text-xs font-bold font-mono tracking-widest text-[#0a1f44] uppercase mb-1.5 border-b border-slate-200 pb-0.5">
                Education & Achievements
              </h4>
              <div className="flex justify-between text-[11px] text-slate-700">
                <div>
                  <strong className="text-slate-900">Bachelor of Science, Technical Information Systems</strong> <br />
                  <span>State University, Major Honors Scholar (GPA: 3.82)</span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">Graduated: May 2023</span>
              </div>
            </div>

          </div>

          <div className="text-slate-500 text-[10px] text-center italic mt-1 font-mono flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
            <span>Formulated with 100% compliant single-column schemas for clean recruiter filtering.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
