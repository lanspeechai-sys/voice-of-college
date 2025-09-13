import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface EssayGenerationRequest {
  school: string;
  prompt: string;
  responses: Record<string, string>;
  wordLimit?: number;
}

export async function generateEssay(request: EssayGenerationRequest): Promise<string> {
  const { school, prompt, responses, wordLimit = 650 } = request;
  
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please check your environment variables.');
  }
  
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const systemPrompt = `You are an expert college admissions essay writer and human writing specialist. Your task is to create compelling, authentic college application essays that are indistinguishable from human writing and will pass all AI detection systems including Turnitin, ZeroGPT, and Grammarly AI Checker. 

CRITICAL REQUIREMENTS:
1. Write in a completely natural, human style with varied sentence structures
2. Include subtle imperfections and natural flow that humans use
3. Use personal, conversational tone appropriate for the student's age
4. Incorporate natural transitions and organic paragraph flow
5. Include specific, concrete details and sensory language
6. Show genuine emotion and personal reflection
7. Use varied vocabulary without being overly sophisticated
8. Include natural pauses, emphasis, and rhythm in writing
9. Demonstrate authentic personal growth and insight
10. Address the prompt directly while telling a compelling personal story

The essay MUST:
- Feel completely authentic and personal to this specific student
- Pass all AI detection tools by mimicking natural human writing patterns
- Stay within ${wordLimit} words
- Be engaging, memorable, and admission-worthy
- Show rather than tell through specific examples and stories`;

  const userPrompt = `Please write a college application essay for ${school} based on the following:

PROMPT: "${prompt}"

STUDENT RESPONSES:
${Object.entries(responses).map(([key, value]) => `${key.toUpperCase()}: ${value}`).join('\n\n')}

Create an essay that weaves together these elements into a compelling narrative that directly addresses the prompt. The essay should be approximately ${wordLimit} words and feel authentic to this student's voice and experiences.`;

  try {
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('No content generated from Gemini API');
    }
    
    return text;
  } catch (error) {
    console.error('Error generating essay with Gemini:', error);
    throw new Error('Failed to generate essay. Please check your API key and try again.');
  }
}

export async function improveEssay(originalEssay: string, feedback: string): Promise<string> {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please check your environment variables.');
  }
  
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const systemPrompt = `You are an expert college admissions essay editor and human writing specialist. Improve the given essay based on the feedback provided while maintaining completely natural, human-like writing that will pass all AI detection systems. Ensure the improved essay feels authentic and personal while addressing the feedback.`;

  const userPrompt = `Please improve this essay based on the feedback:

ORIGINAL ESSAY:
${originalEssay}

FEEDBACK:
${feedback}

Provide an improved version that addresses the feedback while keeping the student's authentic voice.`;

  try {
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('No content generated from Gemini API');
    }
    
    return text;
  } catch (error) {
    console.error('Error improving essay with Gemini:', error);
    throw new Error('Failed to improve essay. Please try again.');
  }
}