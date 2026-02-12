import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  // eslint-disable-next-line no-console
  console.warn('GEMINI_API_KEY is not set. AI features will not work until it is configured.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateGeminiText(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!genAI) {
    const err = new Error(
      'Gemini API key is not set. Add GEMINI_API_KEY to packages/backend/.env and restart the server.',
    ) as Error & { status?: number };
    err.status = 503;
    throw err;
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  try {
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt },
    ]);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (e: any) {
    const isInvalidKey =
      e?.status === 400 ||
      e?.message?.includes('API key not valid') ||
      e?.errorDetails?.some?.((d: any) => d?.reason === 'API_KEY_INVALID');
    if (isInvalidKey) {
      const err = new Error(
        'Gemini API key is invalid or missing. Add a valid GEMINI_API_KEY to packages/backend/.env and restart the server.',
      ) as Error & { status?: number };
      err.status = 503;
      throw err;
    }
    throw e;
  }
}

