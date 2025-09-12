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
  
  const systemPrompt = `You are an expert college admissions essay writer. Your task is to create compelling, authentic college application essays that:

1. Preserve the student's unique voice and personality
2. Tell a cohesive, engaging story
3. Address the specific prompt directly
4. Stay within the word limit (${wordLimit} words)
5. Use vivid, specific details
6. Show rather than tell
7. Demonstrate growth, reflection, and insight

The essay should feel authentic to the student, not generic or overly polished.`;

  const userPrompt = `Please write a college application essay for ${school} based on the following:

PROMPT: "${prompt}"

STUDENT RESPONSES:
${Object.entries(responses).map(([key, value]) => `${key.toUpperCase()}: ${value}`).join('\n\n')}

Create an essay that weaves together these elements into a compelling narrative that directly addresses the prompt. The essay should be approximately ${wordLimit} words and feel authentic to this student's voice and experiences.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: Math.ceil(wordLimit * 1.5), // Allow some buffer
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "Error generating essay. Please try again.";
  } catch (error) {
    console.error('Error generating essay:', error);
    throw new Error('Failed to generate essay. Please check your API key and try again.');
  }
}

export async function improveEssay(originalEssay: string, feedback: string): Promise<string> {
  const systemPrompt = `You are an expert college admissions essay editor. Improve the given essay based on the feedback provided while maintaining the student's authentic voice and story.`;

  const userPrompt = `Please improve this essay based on the feedback:

ORIGINAL ESSAY:
${originalEssay}

FEEDBACK:
${feedback}

Provide an improved version that addresses the feedback while keeping the student's authentic voice.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.6,
    });

    return completion.choices[0]?.message?.content || "Error improving essay. Please try again.";
  } catch (error) {
    console.error('Error improving essay:', error);
    throw new Error('Failed to improve essay. Please try again.');
  }
}