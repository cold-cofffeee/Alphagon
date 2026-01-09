
import { GoogleGenAI, Type } from "@google/genai";
import { ContentAnalysis, GenerationSettings, Platform, Insight, ContentVersion } from "../types";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeMedia(fileBase64: string, mimeType: string): Promise<ContentAnalysis> {
  const ai = getAIClient();
  const prompt = `Analyze this media content. 
  1. Provide a verbatim transcription.
  2. Summarize the core message.
  3. Identify the speaker's intent and target audience.
  4. List 5-10 SEO keywords.
  5. List primary topics discussed.
  
  Return JSON:
  {
    "transcript": string,
    "summary": string,
    "intent": string,
    "keywords": string[],
    "topics": string[]
  }`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: fileBase64, mimeType } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function parseVoiceSettings(audioBase64: string): Promise<Partial<GenerationSettings>> {
  const ai = getAIClient();
  const prompt = `Extract desired Emotion, Tone, Language, Region, and Target Audience from this audio. Return JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: audioBase64, mimeType: 'audio/wav' } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch {
    return {};
  }
}

export async function generatePlatformContent(
  platform: Platform,
  analysis: ContentAnalysis,
  settings: GenerationSettings
): Promise<Omit<ContentVersion, 'id' | 'timestamp'>> {
  const ai = getAIClient();
  const prompt = `Based on this analysis:
  Summary: ${analysis.summary}
  Intent: ${analysis.intent}
  Transcript: ${analysis.transcript.substring(0, 500)}...
  
  Generate specific content for ${platform}.
  Target Audience: ${settings.targetAudience}
  Region/Culture: ${settings.region}
  Tone: ${settings.tone}
  Emotion: ${settings.emotion}
  Language: ${settings.language}
  
  Instructions for ${platform}:
  - YouTube: Viral SEO titles & tags.
  - Shorts: 60s script with overlay cues.
  - Facebook: High engagement community post.
  - Twitter: Viral thread (5-7 tweets).
  - Instagram: Caption variations + 15 hashtags.
  - Blog: SEO long-form draft.
  - Thumbnail: High-contrast overlay text ideas.
  - Descriptions: Short and Long-form metadata.
  - AdCopy: Conversion-focused copy (PAS framework).
  - Hooks: 5 openings for first 3-5s.
  - Growth: Improvements and variation ideas.
  
  Also provide:
  1. Scores (CTR potential, Hook strength, Clarity) from 0-100.
  2. Risk warnings (Clickbait, length issues, policy risks).
  3. Logic Trace (Explain why this output was chosen).
  
  Return exactly in this JSON schema:
  {
    "body": "string content with markdown headers",
    "scores": [{"label": "CTR Potential", "score": number}, {"label": "Hook Strength", "score": number}, {"label": "Clarity", "score": number}],
    "risks": ["string risk warnings"],
    "trace": {
      "detectedEmotion": "string",
      "audienceAssumption": "string",
      "platformBias": "string"
    }
  }`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function generateInsights(analysis: ContentAnalysis): Promise<Insight> {
  const ai = getAIClient();
  const prompt = `Perform Strategy analysis:
  Return JSON: { "niche": string, "competitorStrategy": string, "gaps": string[], "opportunities": string[], "differentiationIdeas": string[] }`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || '{}');
}
