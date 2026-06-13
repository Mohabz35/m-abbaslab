/**
 * ATS (Applicant Tracking System) Optimization Engine
 * Evaluates CV against industry standards and best practices
 */

interface ATSCheck {
  name: string;
  points: number;
  status: "passed" | "failed";
  description: string;
}

interface ATSReport {
  score: number;
  totalPoints: number;
  checks: ATSCheck[];
  suggestedImprovements: string[];
}

/**
 * Calculate ATS score for a generated CV
 * Checks formatting, structure, keywords, and ATS compatibility
 */
export function calculateATSScore(cv: string): ATSReport {
  const checks: ATSCheck[] = [];
  let totalPoints = 0;

  // Check 1: Keyword density (50 points)
  const keywordCheck = checkKeywordDensity(cv);
  checks.push(keywordCheck);
  totalPoints += keywordCheck.points;

  // Check 2: Formatting compliance (20 points)
  const formattingCheck = checkFormatting(cv);
  checks.push(formattingCheck);
  totalPoints += formattingCheck.points;

  // Check 3: Header structure (10 points)
  const headerCheck = checkHeaderStructure(cv);
  checks.push(headerCheck);
  totalPoints += headerCheck.points;

  // Check 4: Contact info presence (10 points)
  const contactCheck = checkContactInfo(cv);
  checks.push(contactCheck);
  totalPoints += contactCheck.points;

  // Check 5: File format readiness (10 points)
  const formatCheck = checkFileFormat(cv);
  checks.push(formatCheck);
  totalPoints += formatCheck.points;

  // Calculate total score
  const score = checks.reduce((sum, check) => sum + (check.status === "passed" ? check.points : 0), 0);

  // Generate suggestions
  const suggestedImprovements = generateSuggestions(cv, checks);

  return {
    score,
    totalPoints,
    checks,
    suggestedImprovements,
  };
}

/**
 * Check keyword density and relevance
 */
function checkKeywordDensity(cv: string): ATSCheck {
  const keywords = [
    "experience",
    "skills",
    "achievement",
    "responsibility",
    "project",
    "team",
    "leadership",
    "management",
    "technical",
    "analysis",
    "development",
    "implementation",
    "improvement",
    "results",
    "metrics",
  ];

  const cvLower = cv.toLowerCase();
  const foundKeywords = keywords.filter((kw) => cvLower.includes(kw));
  const density = foundKeywords.length / keywords.length;

  const passed = density >= 0.6; // At least 60% of keywords present

  return {
    name: "Keyword Density",
    points: 50,
    status: passed ? "passed" : "failed",
    description: `Found ${foundKeywords.length}/${keywords.length} important keywords. ${
      passed ? "Good keyword coverage for ATS." : "Add more industry-specific keywords."
    }`,
  };
}

/**
 * Check formatting compliance (no tables, graphics, etc.)
 */
function checkFormatting(cv: string): ATSCheck {
  const issues = [];

  // Check for tables (ATS-unfriendly)
  if (cv.includes("<table") || cv.includes("|")) {
    issues.push("Contains tables or complex formatting");
  }

  // Check for excessive special characters
  const specialCharCount = (cv.match(/[©®™§¶†‡]/g) || []).length;
  if (specialCharCount > 5) {
    issues.push("Too many special characters");
  }

  // Check for clear section headers
  const hasHeaders = /^#+\s+(experience|education|skills|summary|contact)/im.test(cv);
  if (!hasHeaders) {
    issues.push("Missing clear section headers");
  }

  const passed = issues.length === 0;

  return {
    name: "Formatting Compliance",
    points: 20,
    status: passed ? "passed" : "failed",
    description: `${
      passed
        ? "Clean, ATS-friendly formatting detected."
        : `Issues found: ${issues.join(", ")}`
    }`,
  };
}

/**
 * Check for proper header structure
 */
function checkHeaderStructure(cv: string): ATSCheck {
  const requiredSections = ["experience", "education", "skills"];
  const cvLower = cv.toLowerCase();

  const foundSections = requiredSections.filter((section) => cvLower.includes(section));
  const passed = foundSections.length === requiredSections.length;

  return {
    name: "Header Structure",
    points: 10,
    status: passed ? "passed" : "failed",
    description: `Found ${foundSections.length}/${requiredSections.length} required sections. ${
      passed ? "All major sections present." : `Missing: ${requiredSections.filter((s) => !foundSections.includes(s)).join(", ")}`
    }`,
  };
}

/**
 * Check for contact information
 */
function checkContactInfo(cv: string): ATSCheck {
  const contactElements = [];

  // Check for email
  if (/@/.test(cv)) {
    contactElements.push("email");
  }

  // Check for phone
  if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(cv)) {
    contactElements.push("phone");
  }

  // Check for location
  if (/(location|city|address|based in)/i.test(cv)) {
    contactElements.push("location");
  }

  const passed = contactElements.length >= 2;

  return {
    name: "Contact Information",
    points: 10,
    status: passed ? "passed" : "failed",
    description: `Found ${contactElements.length}/3 contact elements: ${contactElements.join(", ")}. ${
      passed ? "Sufficient contact information." : "Add more contact details (email, phone, location)."
    }`,
  };
}

/**
 * Check file format readiness (plain text, no images)
 */
function checkFileFormat(cv: string): ATSCheck {
  const issues = [];

  // Check for image references
  if (/<img|\.png|\.jpg|\.jpeg|\.gif|\.svg/i.test(cv)) {
    issues.push("Contains image references");
  }

  // Check for embedded media
  if (/<video|<audio|<embed/i.test(cv)) {
    issues.push("Contains embedded media");
  }

  // Check for proper text encoding
  const hasProperText = cv.length > 100; // Basic check
  if (!hasProperText) {
    issues.push("CV content too short");
  }

  const passed = issues.length === 0;

  return {
    name: "File Format",
    points: 10,
    status: passed ? "passed" : "failed",
    description: `${
      passed
        ? "File format is ATS-compatible (text-based, no images)."
        : `Issues: ${issues.join(", ")}`
    }`,
  };
}

/**
 * Generate actionable improvement suggestions
 */
function generateSuggestions(cv: string, checks: ATSCheck[]): string[] {
  const suggestions: string[] = [];

  // Check for failed items and generate suggestions
  const failedChecks = checks.filter((c) => c.status === "failed");

  if (failedChecks.some((c) => c.name === "Keyword Density")) {
    suggestions.push("Add more industry-specific keywords related to your target role");
    suggestions.push("Include metrics and quantifiable achievements (e.g., 'increased sales by 25%')");
  }

  if (failedChecks.some((c) => c.name === "Formatting Compliance")) {
    suggestions.push("Remove tables and use bullet points instead for better ATS compatibility");
    suggestions.push("Avoid special characters and symbols");
  }

  if (failedChecks.some((c) => c.name === "Header Structure")) {
    suggestions.push("Add clear section headers for Experience, Education, and Skills");
  }

  if (failedChecks.some((c) => c.name === "Contact Information")) {
    suggestions.push("Include your email address, phone number, and location");
  }

  // General suggestions
  if (cv.length < 500) {
    suggestions.push("Expand your CV with more detailed descriptions of your achievements");
  }

  if (!/\d/.test(cv)) {
    suggestions.push("Add quantifiable metrics and numbers to demonstrate impact");
  }

  if (!/(led|managed|directed|oversaw)/i.test(cv)) {
    suggestions.push("Highlight leadership experience if applicable");
  }

  // Remove duplicates
  return Array.from(new Set(suggestions));
}

/**
 * Humanize CV text to pass AI detection tools
 * Applies various techniques to make AI-generated text sound more natural
 */
export function humanizeCV(cv: string): string {
  let humanized = cv;

  // Vary sentence structure - replace some passive voice with active
  humanized = humanized.replace(/was (.*?) by/g, (match, action) => {
    const verbs = ["led", "drove", "spearheaded", "championed"];
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    return `${verb} ${action}`;
  });

  // Add contractions where appropriate
  humanized = humanized.replace(/I am/g, "I'm");
  humanized = humanized.replace(/do not/g, "don't");
  humanized = humanized.replace(/can not/g, "can't");

  // Vary word choices to avoid repetition
  const replacements: Record<string, string[]> = {
    responsible: ["accountable for", "owned", "took charge of"],
    developed: ["created", "built", "engineered"],
    improved: ["enhanced", "optimized", "refined"],
    managed: ["led", "oversaw", "coordinated"],
    achieved: ["accomplished", "attained", "reached"],
  };

  Object.entries(replacements).forEach(([original, alternatives]) => {
    const regex = new RegExp(`\\b${original}\\b`, "gi");
    let count = 0;
    humanized = humanized.replace(regex, () => {
      const replacement = alternatives[count % alternatives.length];
      count++;
      return replacement;
    });
  });

  // Add occasional filler phrases (natural speech patterns)
  const fillers = ["Notably, ", "Importantly, ", "In particular, "];
  const paragraphs = humanized.split("\n");
  const modifiedParagraphs = paragraphs.map((para) => {
    if (para.length > 100 && Math.random() > 0.7) {
      const filler = fillers[Math.floor(Math.random() * fillers.length)];
      return filler + para;
    }
    return para;
  });

  humanized = modifiedParagraphs.join("\n");

  return humanized;
}
