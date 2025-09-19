import { GoogleGenerativeAI } from '@google/generative-ai';

// Rate limiting for API calls
const API_RATE_LIMIT = 5; // requests per minute
const rateLimitMap = new Map<string, number[]>();

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userRequests = rateLimitMap.get(userId) || [];
  
  // Remove requests older than 1 minute
  const recentRequests = userRequests.filter(time => now - time < 60000);
  
  if (recentRequests.length >= API_RATE_LIMIT) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(userId, recentRequests);
  return true;
};

// Input validation
const validateEssayRequest = (request: EssayGenerationRequest): void => {
  if (!request.school?.trim()) {
    throw new Error('School name is required');
  }
  if (!request.prompt?.trim()) {
    throw new Error('Essay prompt is required');
  }
  if (!request.responses || Object.keys(request.responses).length === 0) {
    throw new Error('Student responses are required');
  }
  if (request.wordLimit && (request.wordLimit < 100 || request.wordLimit > 2000)) {
    throw new Error('Word limit must be between 100 and 2000');
  }
};

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface EssayGenerationRequest {
  school: string;
  prompt: string;
  responses: Record<string, string>;
  wordLimit?: number;
  userId?: string;
}

export async function generateEssay(request: EssayGenerationRequest): Promise<string> {
  const { school, prompt, responses, wordLimit = 650, userId } = request;
  
  // Validate input
  validateEssayRequest(request);
  
  // Check rate limiting
  if (userId && !checkRateLimit(userId)) {
    throw new Error('Rate limit exceeded. Please wait before generating another essay.');
  }
  
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
    
    // Basic content validation
    if (text.length < 100) {
      throw new Error('Generated essay is too short. Please try again.');
    }
    
    return text;
  } catch (error) {
    console.error('Error generating essay with Gemini:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate essay. Please try again.');
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

export async function humanizeText(text: string): Promise<string> {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please check your environment variables.');
  }
  
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const systemPrompt = `You are an expert text humanizer that transforms AI-generated content into natural, human-like writing. Your goal is to make the text completely undetectable by AI detection systems while preserving the original meaning and improving readability.

CRITICAL REQUIREMENTS:
1. Rewrite the text to sound completely natural and human-written
2. Vary sentence structures and lengths for organic flow
3. Add subtle imperfections and natural language patterns
4. Use conversational tone and natural transitions
5. Include varied vocabulary and authentic expression
6. Maintain the original meaning and key points
7. Ensure the text passes all AI detection tools
8. Keep the same approximate length as the original
9. Add natural pauses and emphasis through punctuation
10. Use authentic human writing patterns and rhythms

The humanized text MUST:
- Feel completely natural and authentic
- Pass Turnitin, ZeroGPT, Grammarly AI Checker, and other detection systems
- Maintain the original message and intent
- Sound like it was written by a real person
- Have natural flow and readability`;

  const userPrompt = `Please humanize the following AI-generated text, making it sound completely natural and human-written while preserving the original meaning:

${text}

Transform this into natural, human-like writing that will pass all AI detection systems.`;

  try {
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);
    
    const response = await result.response;
    const humanizedText = response.text();
    
    if (!humanizedText) {
      throw new Error('No content generated from Gemini API');
    }
    
    return humanizedText;
  } catch (error) {
    console.error('Error humanizing text with Gemini:', error);
    throw new Error('Failed to humanize text. Please try again.');
  }
}