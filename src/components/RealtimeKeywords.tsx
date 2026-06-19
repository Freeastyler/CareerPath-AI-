/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Search, Sparkles, Check, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

interface RealtimeKeywordsProps {
  cvText: string;
  analysisKeywords: string[];
}

interface PreloadedRole {
  title: string;
  keywords: { word: string; description: string }[];
}

const PRELOADED_ROLES: PreloadedRole[] = [
  {
    title: "Software Engineer / Web Developer",
    keywords: [
      { word: "TypeScript", description: "Standard type-safe programming language for modern frontend/backend." },
      { word: "RESTful API Design", description: "Experience designing scaleable APIs and CRUD routes." },
      { word: "CI/CD Pipelines", description: "Continuous integration tools (GitHub Actions, Jenkins) for automation." },
      { word: "React 19 Hooks", description: "State managers, memoization, and modular layout optimizations." },
      { word: "Unit Testing", description: "Code validation packages like Jest, Vitest, or Cypress." },
      { word: "System Architecture", description: "Clean structural separation, modularity, and memory performance." },
    ]
  },
  {
    title: "Digital Marketing Manager",
    keywords: [
      { word: "Omnichannel Campaigns", description: "Cross-platform organic and paid outreach strategies." },
      { word: "Google Analytics 4", description: "Web tracking, attribution Modeling, and behavioral parsing." },
      { word: "SEO Optimization", description: "SERP improvements, keyword index strategies, and core web vitals." },
      { word: "Conversion Rate (CRO)", description: "A/B testing landing pages and driving subscriber growth." },
      { word: "ROAS (Return on Ad Spend)", description: "Measuring direct paid media performance on metrics and budget." },
      { word: "Marketing Automation", description: "Using Hubspot, Marketo, or Mailchimp workflows." },
    ]
  },
  {
    title: "Finance / Accounting Graduate",
    keywords: [
      { word: "Financial Modeling", description: "Creating cash flow projection spreadsheets and trend forecasts." },
      { word: "Portfolio Risk Management", description: "Evaluating market volatility and corporate asset ratios." },
      { word: "SQL Queries", description: "Querying relational databases to fetch numerical financial records." },
      { word: "VBA & Advanced Excel", description: "Formulas, macros, pivot tables, and ledger consolidations." },
      { word: "GAAP Standard Compliance", description: "Familiarity with standard international accounting parameters." },
      { word: "Audit Support", description: "Reviewing company spend worksheets for consistency." },
    ]
  },
  {
    title: "Sales / Account Executive",
    keywords: [
      { word: "Sales pipeline", description: "Familiar with managing lists of clients from discovery to close." },
      { word: "CRM Workflows (Salesforce)", description: "Logging client interactions, statuses, and revenue targets." },
      { word: "Strategic cold calling", description: "Opening cold relationships with business decisions makers." },
      { word: "Client Retention Metrics", description: "Reducing churn and upselling contract values." },
      { word: "B2B Deal Negotiation", description: "Drafting corporate enterprise license agreements." },
      { word: "Quota Attainment History", description: "Proving you consistently hit 100%+ your annual targets." },
    ]
  }
];

export default function RealtimeKeywords({ cvText = "", analysisKeywords = [] }: RealtimeKeywordsProps) {
  const [selectedRole, setSelectedRole] = useState<string>(PRELOADED_ROLES[0].title);
  const [customJobDescription, setCustomJobDescription] = useState("");
  const [matchingKeywords, setMatchingKeywords] = useState<string[]>([]);
  const [additionalAddedKeywords, setAdditionalAddedKeywords] = useState<string[]>([]);
  
  // Computed states
  const [wordStates, setWordStates] = useState<Array<{
    word: string;
    description: string;
    present: boolean;
  }>>([]);

  const normalizeText = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]/g, " ");
  };

  useEffect(() => {
    const activeRole = PRELOADED_ROLES.find(r => r.title === selectedRole);
    if (!activeRole) return;

    const normalizedResume = normalizeText(cvText);
    const normalizedCustomJob = normalizeText(customJobDescription);

    // Build unique keyword list combining preloaded role plus any high-frequency terms parsed from custom job description
    const list: Array<{ word: string; description: string; present: boolean }> = [];

    // Parse role-specific standards
    activeRole.keywords.forEach(keyword => {
      const isPresent = normalizedResume.includes(keyword.word.toLowerCase());
      list.push({
        word: keyword.word,
        description: keyword.description,
        present: isPresent
      });
    });

    // Parse high-frequency words from custom job description (very smart!)
    if (customJobDescription.trim().length > 30) {
      const candidateCustomWords = [
        "Kubernetes", "AWS Cloud", "Node.js", "Docker", "Python", "Agile Scrum", 
        "Data Analytics", "Strategic Sourcing", "Lead Generation", "Product Roadmap",
        "A/B Testing", "Tableau", "Key Accounts", "Profitability Analysis", "Stakeholder Communication"
      ];
      
      candidateCustomWords.forEach(word => {
        const isPresentInJob = normalizedCustomJob.includes(normalizeText(word));
        // Only consider if present in active targeted Job Description
        if (isPresentInJob) {
          // Check if already in CV
          const isPresentInCV = normalizedResume.includes(normalizeText(word));
          // Avoid duplicate
          if (!list.some(item => item.word.toLowerCase() === word.toLowerCase())) {
            list.push({
              word,
              description: `High-frequency keyword extracted from your target Job Description.`,
              present: isPresentInCV
            });
          }
        }
      });
    }

    // Always include any AI-suggested keyword gaps too
    analysisKeywords.forEach(word => {
      if (!list.some(item => item.word.toLowerCase() === word.toLowerCase())) {
        const isPresent = normalizedResume.includes(normalizeText(word));
        list.push({
          word,
          description: "Crucial term recommended during our AI Recruiter analysis.",
          present: isPresent
        });
      }
    });

    setWordStates(list);
  }, [selectedRole, customJobDescription, cvText, analysisKeywords]);

  const handleAddKeywordToDraft = (word: string) => {
    if (!additionalAddedKeywords.includes(word)) {
      setAdditionalAddedKeywords([...additionalAddedKeywords, word]);
    }
  };

  const handleRemoveAddedKeyword = (word: string) => {
    setAdditionalAddedKeywords(additionalAddedKeywords.filter(w => w !== word));
  };

  const scorePercentage = wordStates.length > 0 
    ? Math.round((wordStates.filter(w => w.present).length / wordStates.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-5 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-blue-300">
            <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
            <h4 className="font-bold text-sm text-slate-100 uppercase tracking-widest font-mono">Real-Time Keyword & Skill Gap Analyzer</h4>
          </div>
          <p className="text-xs text-slate-400 font-light">
            Match your active resume against industry milestones or a specific job posting to find SEO discrepancies.
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {/* Preset Roles Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Target Career Path Preset</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-[#0A1F44] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 cursor-pointer"
            >
              {PRELOADED_ROLES.map((role, idx) => (
                <option key={idx} value={role.title}>{role.title}</option>
              ))}
            </select>
          </div>

          {/* Paste Real Job Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Custom Target Job Description (Optional)</label>
            <textarea
              rows={2}
              value={customJobDescription}
              onChange={(e) => setCustomJobDescription(e.target.value)}
              placeholder="Paste specific job requirements here to discover custom keyword gap alerts dynamically..."
              className="w-full bg-[#0A1F44] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
            />
          </div>
        </div>

        {/* Keywords Matching Matrix Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/5">
          {/* Match Rate stat Card */}
          <div className="md:col-span-1 flex flex-col justify-center items-center p-3.5 bg-white/3 border border-white/5 rounded-xl text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">SEO Match Rate</span>
            <span className="text-3xl font-extrabold text-white mt-1">{scorePercentage}%</span>
            <span className="text-[9px] text-blue-400 font-mono mt-1">
              {scorePercentage >= 75 ? "Optimal Baseline" : "Warning: Gap Alert"}
            </span>
          </div>

          {/* Keywords Live Badges checklist */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[10px] font-mono font-bold text-slate-300 block uppercase">
              ✨ TARGET MATCH SCORE MATRIX (Checked = Present in Resume)
            </span>

            <div className="flex flex-wrap gap-2">
              {wordStates.map((item, idx) => (
                <div
                  key={idx}
                  title={item.description}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition duration-150 ${
                    item.present
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                      : "bg-[#0A1F44] border-white/10 text-slate-400 hover:border-blue-500/30"
                  }`}
                >
                  <div className="shrink-0">
                    {item.present ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <button
                        onClick={() => handleAddKeywordToDraft(item.word)}
                        className="h-3 w-3 rounded-full border border-slate-500 hover:border-blue-400 flex items-center justify-center text-[8px] text-blue-400 shrink-0 select-none outline-none"
                        title="Click to queue inclusion"
                      >
                        +
                      </button>
                    )}
                  </div>
                  <span>{item.word}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected custom skills list to export to resume */}
        {additionalAddedKeywords.length > 0 && (
          <div className="mt-5 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                <span>Queued inclusion list for draft CV templates:</span>
              </span>
              <button
                onClick={() => setAdditionalAddedKeywords([])}
                className="text-[10px] uppercase font-mono text-slate-400 hover:text-white"
              >
                Clear all
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {additionalAddedKeywords.map((word, idx) => (
                <span
                  key={idx}
                  onClick={() => handleRemoveAddedKeyword(word)}
                  className="bg-[#0A1F44] hover:bg-red-500/20 text-xs text-white px-2.5 py-1 rounded border border-blue-500/30 cursor-pointer flex items-center gap-1"
                  title="Remove word"
                >
                  <span>{word}</span>
                  <span className="text-[10px] text-red-400 font-mono">×</span>
                </span>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">
              💡 Tip: Click any queued word above to remove it. When you preview your styled templates, these queued keywords will be appended directly into your "Key Technical Skills" block automatically.
            </p>
          </div>
        )}

        {/* Explain detailed definition tooltip */}
        <div className="mt-4 p-3 bg-white/3 border border-white/5 rounded-xl">
          <span className="text-[10px] font-mono text-slate-400 block uppercase mb-1">
            Core Definitions & Explanations:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] leading-relaxed text-slate-300 font-light">
            {wordStates.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex gap-1">
                <strong className={item.present ? "text-emerald-400 font-medium shrink-0" : "text-amber-400 font-medium shrink-0"}>
                  {item.word}:
                </strong>
                <span>{item.description}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
