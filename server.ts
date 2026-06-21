/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body size limit configurations
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Configure multer for file uploads in memory (10MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

let aiClient: GoogleGenAI | null = null;

/**
 * Returns a lazy-initialized instance of the GoogleGenAI client.
 * Includes 'aistudio-build' telemetry agent as requested.
 */
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ---------------------------------------------------------
// Demo Resumes Data for quick sandbox evaluation
// ---------------------------------------------------------
const DEMO_RESUMES: Record<string, { role: string; text: string }> = {
  junior_dev: {
    role: "Junior Front-End Developer",
    text: `JOHN DOE - Junior Front-End Developer
Email: john.doe@email.com | Address: San Francisco, CA

SUMMARY
Enthusiastic junior developer looking for a job to code with a cool company. I really like React and JavaScript and want to learn more.

SKILLS
React, HTML, CSS, JavaScript, Git, VS Code, Slack, Microsoft Word.

EXPERIENCE
Freelance Web Developer (2025 - Present)
- Built websites for some local businesses.
- Styled pages with CSS to make them look nice.
- Wrote code to handle button clicks and forms.
- Worked with Git and push to GitHub.

Student Project (College) (2024)
- Group project to make an e-commerce store.
- I created the checkout page.
- We used React.
- Fixed some bugs near compilation.
`,
  },
  senior_marketing: {
    role: "Senior Marketing Manager",
    text: `SARAH JENKINS
Sarah.Jenkins@marketingexpert.com | Dallas, TX | www.linkedin.com/in/sarahjenkins

PROFESSIONAL SUMMARY
Senior marketing professional with over 8 years of experience. Seasoned in traditional and digital marketing strategies, managing email newsletters, running social media pages, and executing general marketing campaigns. Recognized for great teamwork and positive attitude.

EXPERIENCE
Marketing Team Lead - Peak Digital Agency (2022 - Present)
- Supervised the marketing team of 4 people.
- Planned monthly campaigns for visual assets.
- Sent weekly email newsletters to the subscriber list.
- Improved search engine optimization (SEO) on our corporate blog.
- Attended weekly align meetings with other managers.

Senior Marketing Specialist - Alpha Retail (2018 - 2022)
- Created content plan for Facebook, LinkedIn, we grew our fans.
- Curated marketing collateral for local stores.
- Managed a corporate budget of over $10k per month.
- Coordinated PR articles with external journalists.
`,
  },
  recent_grad: {
    role: "Recent Finance Graduate",
    text: `ALEX CHEN
Finance Graduate | alex.chen@finance.com | New York City, NY

OBJECTIVE
Motivated graduate from State University with a BSC in Finance looking for an Entry-level financial analyst position. I want to apply my course knowledge in accounting and financial systems.

EDUCATION
State University, Bachelor of Science in Finance (GPA: 3.4) (Graduation: May 2025)
Relevant coursework: Corporate Finance, Accounting 101, Macroeconomics, Investment Modeling.

PROJECTS & ACTIVITIES
University Finance Club - Member (2023 - 2025)
- Joined monthly meetings.
- Discussed stocks and stock trends with other club students.
- Volunteered to manage list of active members.

Academic Paper (2024)
- Wrote 15-page essay on interest rate inflation trends.
- Conducted Web research for economic data.
`,
  },
  sales_rep: {
    role: "Sales Representative",
    text: `MICHAEL SCOTT
Michael.Scott@salespower.com | Scranton, PA

SUMMARY
Outgoing and dynamic sales rep who loves hitting high figures and serving clients. Expert in customer satisfaction, closing deals, cold calling, and relationship building. Ready to crush sales targets.

EXPERIENCE
Account Executive - Dunder Paper Co (2020 - Present)
- Sold paper and office supplies to small/medium businesses.
- Cold-called dozens of local offices to pitch paper contracts.
- Managed client relationships and handled client complaints.
- Logged all meetings and call reports inside customer relationship database.
- Consistently stayed on top as one of the active representatives of our team.
`,
  },
};

// ---------------------------------------------------------
// HEALTH CHECK
// ---------------------------------------------------------
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ---------------------------------------------------------
// MAIN CV ANALYSIS ENDPOINT
// ---------------------------------------------------------
app.post("/api/analyze-cv", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  try {
    let cvText = "";
    let fileUploaded = false;
    let fileName = "";
    let mimeType = "";
    let inlineDataPart: any = null;

    // Check if a file was uploaded
    if (req.file) {
      fileUploaded = true;
      fileName = req.file.originalname;
      mimeType = req.file.mimetype;

      // Determine how to extract or use the file
      if (mimeType === "text/plain" || fileName.endsWith(".txt")) {
        cvText = req.file.buffer.toString("utf-8");
      } else if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
        // Since Gemini 3.5 Flash natively accepts PDF files as inlineData,
        // we can construct an inlineData part to send it directly!
        inlineDataPart = {
          inlineData: {
            data: req.file.buffer.toString("base64"),
            mimeType: "application/pdf",
          },
        };
        cvText = "[Sent Direct PDF Bytes to Gemini]";
      } else if (fileName.endsWith(".docx")) {
        // Simple human-readable extraction for docx XML strings if read as text,
        // but for now let's convert the raw stream text as fallback or send it to gemini.
        // Actually, we'll try to convert ASCII characters as text,
        // and guide users to use PDF for ultimate layout representation.
        const bufferStr = req.file.buffer.toString("ascii");
        // Extract plain strings from docx openXML elements
        const words = bufferStr.match(/[a-zA-Z0-9\s.,@()\-:]{4,50}/g);
        cvText = words ? words.join(" ") : bufferStr.substring(0, 10000);
      } else {
        // Fallback toString
        cvText = req.file.buffer.toString("utf-8").substring(0, 50000);
      }
    } else {
      // Direct raw text or selected demo
      const { demoId, text } = req.body;
      if (demoId && DEMO_RESUMES[demoId]) {
        cvText = DEMO_RESUMES[demoId].text;
        fileName = `Demo: ${DEMO_RESUMES[demoId].role}`;
      } else if (text) {
        cvText = text;
        fileName = "Pasted Text CV";
      }
    }

    if (!cvText && !inlineDataPart) {
      res.status(400).json({ error: "Please provide either a CV file upload, pasted text, or select a demo CV." });
      return;
    }

    // Lazy load the Gemini client
    const ai = getGeminiClient();

    // Prepare system instruction and user prompt to drive high-conversion SaaS suggestions
    const systemInstruction = `
      You are an elite Senior Recruiting Director, senior Career Consultant, and leading Applicant Tracking Systems (ATS) Optimization Expert.
      Your mission is to perform a rigorous, constructive, recruiter-level audit of the user's CV/Resume.
      Your feedback must be specific, actionable, and encouraging. Never make up facts about the candidate; customize suggestions based on their background.

      Evaluate the CV on these 5 dimensions:
      1. ATS Compatibility: Keyword frequency, standard section titles, single-column alignment, simple text format compatibility.
      2. Content Strength: Quality of the professional summary, education clarity, project details, and balance.
      3. Experience Impact: Bullet points that show strong action verbs and quantifiable business metrics (e.g., "$30K revenue", "25% increase", "15 hours saved").
      4. Skills Relevance: Modern technical skills vs soft skills, matching global hiring standards.
      5. Formatting & Structure: Layout ordering, margin checks, readable length (e.g., 1 page for junior, 2 pages for senior, empty spaces).

      You must return your feedback in rigorous JSON format that fits the requested schema perfectly.
    `;

    const cvTextPlaceholder = inlineDataPart ? "the attached document" : cvText;

    const userPrompt = `
      Please analyze the following CV/Resume content:
      "${cvTextPlaceholder}"
      
      Requirements for output:
      - overall score: 0 to 100, reflecting the current state in modern professional standards
      - weaknesses: Identify 4 to 6 critical weaknesses. For each, give a unique id, category (one of: ATS Compatibility, Content Strength, Experience Impact, Skills Relevance, Formatting & Structure), title, clear explanation, and an impact level ("high", "medium", or "low").
      - recommendations:
        - bulletRewrites: Select at least 3 weak bullet points or phrases from the CV. Show the original bullet point, provide a highly polished rewritten bullet point in the "Result-Oriented Action Format" (using action verbs and simulated metric optimization), and explain why it is better.
        - actionVerbsToUse: List 6-8 industry action verbs (e.g. "Spearheaded", "Architected", "Engineered", "Optimized", "Catalyzed").
        - skillsToAdd: 4-6 high-demand skills the candidate should add if they have experience in them.
        - skillsToRemove: 2-3 irrelevant or outdated skills (e.g., MS Word, Internet Explorer, generic soft skills like "Hard worker").
        - atsKeywords: 5-8 modern SEO terms relevant to their target role.
        - roleSpecificTips: 3 role-specific tips on how to position themselves.
      - sideBySideComparison: Provide a before-and-after text comparison of two key sections (such as their Summary or a job experience entry).
      - overallNextSteps: Checklist of next 4-5 steps to execute immediately.
    `;

    const parts: any[] = [];
    if (inlineDataPart) {
      parts.push(inlineDataPart);
    }
    parts.push({ text: userPrompt });

    // Call the Gemini 3.5 Flash Model
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["scores", "summary", "weaknesses", "recommendations", "sideBySideComparison", "overallNextSteps"],
          properties: {
            scores: {
              type: Type.OBJECT,
              required: ["overall", "atsCompatibility", "contentStrength", "experienceImpact", "skillsRelevance", "formattingStructure"],
              properties: {
                overall: { type: Type.INTEGER, description: "Overall score between 0 and 100" },
                atsCompatibility: { type: Type.INTEGER, description: "ATS rating from 0 to 100" },
                contentStrength: { type: Type.INTEGER, description: "Content rating from 0 to 100" },
                experienceImpact: { type: Type.INTEGER, description: "Impact assessment rating from 0 to 100" },
                skillsRelevance: { type: Type.INTEGER, description: "Skills fitness rating from 0 to 100" },
                formattingStructure: { type: Type.INTEGER, description: "File formatting structural layout rating from 0 to 100" },
              },
            },
            summary: { type: Type.STRING, description: "A highly premium recruiter-grade summary of the CV, highlighting potential and gaps." },
            weaknesses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "category", "title", "description", "impact"],
                properties: {
                  id: { type: Type.STRING, description: "Short alphanumeric unique ID, e.g., 'weakness-1'" },
                  category: { type: Type.STRING, description: "The specific evaluation dimension" },
                  title: { type: Type.STRING, description: "Brief clear punchy title of the weakness" },
                  description: { type: Type.STRING, description: "Recruiter explanation of why this hurts their candidate conversion rate." },
                  impact: { type: Type.STRING, description: "Must be 'high', 'medium', or 'low'" },
                },
              },
            },
            recommendations: {
              type: Type.OBJECT,
              required: ["bulletRewrites", "actionVerbsToUse", "skillsToAdd", "skillsToRemove", "atsKeywords", "roleSpecificTips"],
              properties: {
                bulletRewrites: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["original", "improved", "explanation"],
                    properties: {
                      original: { type: Type.STRING, description: "The exact or summarized weak bullet from original resume" },
                      improved: { type: Type.STRING, description: "Fully rewritten, metrics-driven bullet point" },
                      explanation: { type: Type.STRING, description: "Recruiter justification of why this rewrite stands out to a human reader & ATS" },
                    },
                  },
                },
                actionVerbsToUse: { type: Type.ARRAY, items: { type: Type.STRING } },
                skillsToAdd: { type: Type.ARRAY, items: { type: Type.STRING } },
                skillsToRemove: { type: Type.ARRAY, items: { type: Type.STRING } },
                atsKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                roleSpecificTips: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            sideBySideComparison: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["sectionTitle", "originalContent", "rewrittenContent", "whyItIsBetter"],
                properties: {
                  sectionTitle: { type: Type.STRING, description: "E.g. Professional Summary, Experience Section" },
                  originalContent: { type: Type.STRING, description: "Original draft paragraph/structure" },
                  rewrittenContent: { type: Type.STRING, description: "Optimized, recruiter-friendly layout draft" },
                  whyItIsBetter: { type: Type.STRING, description: "Detailed structural differences explanation" },
                },
              },
            },
            overallNextSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable 4-5 items they should check off next.",
            },
          },
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty text output returned from Gemini AI Model");
    }

    // Parse verified structured JSON response
    const analysisResult = JSON.parse(textOutput.trim());
    res.json({
      fileName,
      analysis: analysisResult,
    });
  } catch (error: any) {
    console.error("Error analyzing CV:", error);
    res.status(500).json({
      error: "Failed to perform AI analysis. Please verify your file type, pasted text or retry in a moment.",
      details: error.message || error,
    });
  }
});

// ---------------------------------------------------------
// VITE AND STATIC SERVING MIDDLEWARE
// ---------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite middleware on Express");
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`Serving static files from ${distPath} in production mode`);
  }

  // PORT bindings on 0.0.0.0 is mandatory
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CV Insight AI Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Vite server failure on start:", error);
});
