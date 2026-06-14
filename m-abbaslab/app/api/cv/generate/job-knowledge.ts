export const platformKnowledge: Record<string, string> = {
  mercor: `
    Mercor AI platform constraints:
    - AI-First Vetting: Mercor uses LLMs to parse and vet CVs automatically.
    - Formatting: Must be strictly text-based. No columns, no tables, no custom fonts. Standard headings only (Experience, Education, Skills).
    - Content: Focus heavily on measurable outcomes and technical depth. Do not use generic summary statements.
    - Keyword density: High. If the job requires React, mention React in the context of projects with specific metrics.
  `,
  mindrift: `
    Mindrift AI platform constraints:
    - Domain Expertise: Mindrift scores heavily on domain-specific knowledge (e.g. AI tutoring, creative writing, programming).
    - Projects/Portfolio: Highlight specific projects over general experience.
    - Formatting: Standard chronological or functional format. Keep it concise, typically 1 page.
  `,
  micro1: `
    Micro1 platform constraints:
    - Top 1% Vetting: They look for elite engineering talent. 
    - Content: Emphasize scale (e.g., "Scaled system to 1M+ users", "Reduced latency by 40%").
    - Skills: Technical skills should be front-and-center. Include links to GitHub, portfolio, or live apps.
    - Tone: Confident, data-driven, engineering-focused.
  `,
  rex: `
    Rex (Remote Executive) constraints:
    - Leadership & Strategy: Focus on cross-functional leadership, strategic initiatives, and budget management.
    - Remote-First: Explicitly mention experience managing distributed teams across timezones.
    - Async Communication: Highlight ability to work asynchronously and document processes.
  `,
  remo: `
    Remo platform constraints:
    - Event/Community Focus: If applying for marketing/community roles, emphasize engagement metrics.
    - Remote Culture: Highlight self-starter attitude and ability to thrive in a fully remote environment.
  `,
  linkedin: `
    LinkedIn platform constraints:
    - Keyword Optimization: Optimize for LinkedIn Recruiter search algorithms. Use standard industry terms.
    - Sections: Must clearly map to Experience, Education, Licenses & Certifications, Skills.
    - Narrative: A strong, compelling Summary section is critical here.
  `,
  flexjobs: `
    FlexJobs platform constraints:
    - Remote Focus: Emphasize remote work history, autonomy, and communication tools (Slack, Zoom, Asana, Jira).
    - Reliability: Focus on long-term project delivery and reliability without direct supervision.
  `,
  indeed: `
    Indeed platform constraints:
    - High Volume ATS: Must be extremely machine-readable. Standard fonts, no headers/footers, simple bullet points.
    - Direct matching: Ensure job title in the CV exactly matches or closely mirrors the target job title.
  `,
  upwork: `
    Upwork platform constraints:
    - Freelance Focus: Format as a service provider rather than a traditional employee.
    - Results/ROI: Focus on what problem you solve and the ROI for the client.
    - Portfolio: Mention past client success stories and specific deliverables.
  `,
  remote_co: `
    Remote.co platform constraints:
    - Remote Veteran: Focus heavily on tools and async communication. "Experienced in remote-first environments."
    - Independence: Highlight ability to take initiative and manage time effectively.
  `
};

export const roleKnowledge: Record<string, string> = {
  software_engineer: "Must include specific tech stacks, scale of systems, cloud providers (AWS/GCP/Azure), and CI/CD. Focus on performance improvements, latency reduction, and user scale.",
  data_scientist: "Must include ML/AI frameworks (PyTorch, TensorFlow), data processing (Spark, Pandas), and business impact of models (e.g., increased revenue by X%).",
  product_manager: "Must include cross-functional leadership, Agile/Scrum methodologies, user metrics (MAU/DAU), and go-to-market strategies.",
  designer: "Must emphasize user-centered design, Figma/Adobe CC, conversion rate optimization (CRO), and collaboration with engineering teams.",
  marketing: "Must include ROI, CAC, LTV, campaign budget management, and tools (HubSpot, Google Analytics, Salesforce)."
};

export function getKnowledgeContext(platform: string, jobDescription: string): string {
  const pKnowledge = platformKnowledge[platform.toLowerCase()] || "Standard ATS rules apply. Keep formatting simple, use keywords from the job description, and focus on measurable outcomes.";
  
  let rKnowledge = "";
  const jdLower = jobDescription.toLowerCase();
  
  if (jdLower.includes("engineer") || jdLower.includes("developer") || jdLower.includes("programmer")) {
    rKnowledge = roleKnowledge["software_engineer"];
  } else if (jdLower.includes("data") || jdLower.includes("machine learning") || jdLower.includes("ai")) {
    rKnowledge = roleKnowledge["data_scientist"];
  } else if (jdLower.includes("product") && jdLower.includes("manager")) {
    rKnowledge = roleKnowledge["product_manager"];
  } else if (jdLower.includes("design") || jdLower.includes("ui") || jdLower.includes("ux")) {
    rKnowledge = roleKnowledge["designer"];
  } else if (jdLower.includes("marketing") || jdLower.includes("growth") || jdLower.includes("seo")) {
    rKnowledge = roleKnowledge["marketing"];
  }

  return `
--- AI KNOWLEDGE BASE ---
Platform Constraints (${platform}):
${pKnowledge}

Role-Specific Guidelines:
${rKnowledge ? rKnowledge : "Extract key requirements directly from the job description and emphasize those specific skills."}
-------------------------
`;
}
