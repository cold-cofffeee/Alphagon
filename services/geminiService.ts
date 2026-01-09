
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ContentAnalysis, GenerationSettings, Platform, Insight } from "../types";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeMedia(fileBase64: string, mimeType: string): Promise<ContentAnalysis> {
  const ai = getAIClient();
  const prompt = `Analyze this media content. 
  1. Provide a verbatim transcription.
  2. Summarize the core message.
  3. Identify the speaker's intent and target audience.
  4. List 5-10 SEO keywords.
  5. List primary topics discussed.
  
  Return the result in JSON format following this schema:
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
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          transcript: { type: Type.STRING },
          summary: { type: Type.STRING },
          intent: { type: Type.STRING },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          topics: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function parseVoiceSettings(audioBase64: string): Promise<Partial<GenerationSettings>> {
  const ai = getAIClient();
  const prompt = `Listen to this voice request for content generation settings. 
  Extract the desired Emotion, Tone, Language, Region, and Target Audience.
  Return only JSON. If something is not specified, omit it.
  
  Example Input: "I want a bold emotional tone in Spanish for an audience in Latin America."
  Example Output: {"emotion": "Bold", "tone": "Emotional", "language": "Spanish", "region": "Latin America"}`;

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
): Promise<string> {
  const ai = getAIClient();
  const prompt = `Based on this content analysis:
  Summary: ${analysis.summary}
  Keywords: ${analysis.keywords.join(', ')}
  
  Generate specific content for ${platform}.
  Target Audience: ${settings.targetAudience}
  Region/Culture: ${settings.region}
  Tone: ${settings.tone}
  Emotion: ${settings.emotion}
  Language: ${settings.language}
  
  Instructions for ${platform}:
  - YouTube: 3 SEO-optimized titles, a short catchy description, and a long-form metadata-rich description.
  - Shorts: A punchy 60-second script optimized for vertical video, including overlay text suggestions and sound effect cues.
  - Twitter: A thread of 5-7 tweets including a viral hook opening.
  - Instagram: 3 variations of reels captions with trending hashtags.
  - Blog: A structured article draft with H1, H2 tags.
  - AdCopy: 2 variations of conversion-focused ad copy (Hook, Body, CTA).
  - Hooks: 5 variations of the first 3-5 seconds of the video to maximize retention.
  
  Focus on high impact and precision. Do not use generic filler.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });

  return response.text || '';
}

export async function generateInsights(analysis: ContentAnalysis): Promise<Insight> {
  const ai = getAIClient();
  const prompt = `Analyze the niche of this content:
  Topics: ${analysis.topics.join(', ')}
  
  Provide:
  1. The specific niche classification.
  2. How competitors in this niche typically position themselves.
  3. Identified gaps in current market content for this topic.
  4. Unique opportunities for differentiation.
  
  Return JSON following:
  {
    "niche": string,
    "competitorStrategy": string,
    "gaps": string[],
    "opportunities": string[]
  }`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          niche: { type: Type.STRING },
          competitorStrategy: { type: Type.STRING },
          gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          opportunities: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}');
}
