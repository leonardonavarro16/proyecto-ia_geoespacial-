import { createOpenAI } from '@ai-sdk/openai';

// 1. Verify API Key
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    console.error("❌ ERROR: OPENAI_API_KEY is missing.");
    throw new Error("Missing OPENAI_API_KEY");
}

// Debug prefix (Safe for production logs)
if (process.env.NODE_ENV === 'production') {
    console.log(`[Config] OpenAI Key check: Prefix="${apiKey.substring(0, 7)}...", Length=${apiKey.length}`);
}

export const openai = createOpenAI({
    apiKey: apiKey,
});

export const model = openai('gpt-4o');
