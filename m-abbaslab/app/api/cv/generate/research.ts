/**
 * research.ts
 * Provides live web research capabilities for the CV Generator.
 * Used to research companies and roles before generating the CV.
 */

export async function researchCompanyAndRole(jobDescription: string, companyName?: string): Promise<string> {
  // If we have a Tavily or Serper API key, we could do live web search here.
  // For now, we will extract the likely company name and role from the JD
  // and provide a structured prompt that forces the LLM to use its vast internal
  // training data to "research" the company's culture, tech stack, and values.
  
  const searchTarget = companyName || "the company mentioned in the job description";
  
  return `
--- LIVE RESEARCH INSTRUCTIONS ---
Before writing the CV, you must conduct a "Research Phase" on ${searchTarget} and the specific role.
Using your extensive training data, analyze:
1. The company's core product, industry, and typical engineering/business culture.
2. The specific requirements, tech stack, or methodologies commonly used in this role.
3. The type of candidates this company typically hires (e.g., startup vs enterprise background).

You MUST output a brief 2-3 paragraph summary of your findings in the "researchSummary" field of the JSON response. 
Use this research to strictly tailor the CV models and Interview Questions.
----------------------------------
`;
}
