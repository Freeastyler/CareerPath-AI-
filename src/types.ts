/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CVAnalysis {
  scores: {
    overall: number;
    atsCompatibility: number;
    contentStrength: number;
    experienceImpact: number;
    skillsRelevance: number;
    formattingStructure: number;
  };
  summary: string;
  weaknesses: Array<{
    id: string;
    category: string; // e.g., "ATS Compatibility", "Content Strength", "Formatting", etc.
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
  }>;
  recommendations: {
    bulletRewrites: Array<{
      original: string;
      improved: string;
      explanation: string;
    }>;
    actionVerbsToUse: string[];
    skillsToAdd: string[];
    skillsToRemove: string[];
    atsKeywords: string[];
    roleSpecificTips: string[];
  };
  sideBySideComparison: Array<{
    sectionTitle: string;
    originalContent: string;
    rewrittenContent: string;
    whyItIsBetter: string;
  }>;
  overallNextSteps: string[];
}

export interface DemoResume {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  description: string;
  rawText: string;
}

export interface SavedAnalysis {
  id: string;
  userId: string;
  fileName: string;
  timestamp: string;
  analysis: CVAnalysis;
}

