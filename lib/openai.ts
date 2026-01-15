import { createOpenAI } from '@ai-sdk/openai';

// 1. Verify API Key is present to avoid silent failures
if (!process.env.OPENAI_API_KEY) {
    console.error("❌ ERROR: OPENAI_API_KEY is missing in environment variables.");
    throw new Error("Missing OPENAI_API_KEY");
}

// 2. Configure the OpenAI Provider
export const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// 3. Export the standard model to use across the app
// We use 'gpt-4o' as requested for high capabilities, or fall back to 'gpt-4-turbo'
export const model = openai('gpt-4o');
