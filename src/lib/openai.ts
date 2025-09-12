import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, use a backend API
});

export interface EssayGenerationRequest {
  school: string;
  prompt: string;
  responses: Record<string, string>;
  wordLimit?: number;
}

export async function generateEssay(request: EssayGenerationRequest): Promise<string> {
  const { school, prompt, responses, wordLimit = 650 } = request;
  
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
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: Math.ceil(wordLimit * 1.5), // Allow some buffer
      temperature: 0.9, // Higher temperature for more human-like variation
      presence_penalty: 0.6, // Encourage diverse language
      frequency_penalty: 0.3, // Reduce repetition
    });

    return completion.choices[0]?.message?.content || "Error generating essay. Please try again.";
  } catch (error) {
    console.error('Error generating essay:', error);
    throw new Error('Failed to generate essay. Please check your API key and try again.');
  }
}

export async function improveEssay(originalEssay: string, feedback: string): Promise<string> {
  const systemPrompt = `You are an expert college admissions essay editor and human writing specialist. Improve the given essay based on the feedback provided while maintaining completely natural, human-like writing that will pass all AI detection systems. Ensure the improved essay feels authentic and personal while addressing the feedback.`;

  const userPrompt = `Please improve this essay based on the feedback:

ORIGINAL ESSAY:
${originalEssay}

FEEDBACK:
${feedback}

Provide an improved version that addresses the feedback while keeping the student's authentic voice.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.8,
      presence_penalty: 0.5,
      frequency_penalty: 0.3,
    });

    return completion.choices[0]?.message?.content || "Error improving essay. Please try again.";
  } catch (error) {
    console.error('Error improving essay:', error);
    throw new Error('Failed to improve essay. Please try again.');
  }
}