
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
  Extract desired Emotion, Tone, Language, Region, and Target Audience.
  Return only JSON.`;

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
  Intent: ${analysis.intent}
  Transcript: ${analysis.transcript.substring(0, 1000)}...
  
  Generate specific content for ${platform}.
  Target Audience: ${settings.targetAudience}
  Region/Culture: ${settings.region}
  Tone: ${settings.tone}
  Emotion: ${settings.emotion}
  Language: ${settings.language}
  
  Instructions for ${platform}:
  - YouTube: 5 SEO-optimized titles (viral style) and a comma-separated tag list.
  - Shorts: A retention-mapped vertical video script (60s) with overlay cues and audio timestamps.
  - Facebook: A conversation-focused post with platform-native engagement hooks.
  - Twitter: A high-impact thread (5-7 tweets) starting with a scroll-stopping hook.
  - Instagram: 3 Reel caption variations with emoji-rich storytelling and 15 niche hashtags.
  - Blog: A SEO-friendly article draft with clear H1, H2, and H3 formatting.
  - Thumbnail: 5 "Thumbnail Copy" options (max 4 words) designed for high contrast and curiosity.
  - Descriptions: 1 "Short Description" (150 chars max) and 1 SEO-heavy "Long-form Description" (1000+ chars).
  - AdCopy: 3 conversion-focused variations using the PAS (Problem, Agitate, Solution) framework.
  - Hooks: 5 retention-optimized openings for the first 3–5 seconds (Visual, Text, and Audio hooks).
  - Growth: Provide:
    1. [Content Improvement Suggestions]: Specific feedback to make this piece better.
    2. [More Ideas - Same Angle]: 3 new video topics exploring the same core message.
    3. [More Ideas - Variation/Twists]: 3 new topics taking the message in a wildly different direction.
  
  Adapt tone and emotion for culture-aware targeting. Focus on precision and control.`;

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
  const prompt = `Perform a Competitor & Strategy analysis for this content:
  Topics: ${analysis.topics.join(', ')}
  Summary: ${analysis.summary}
  
  Provide:
  1. Specific Niche classification.
  2. Competitor Strategy: How others typically cover this.
  3. Content Gaps: What is missing from current market discussions.
  4. Opportunities: High-impact ways to present this.
  5. Differentiation Ideas: Specific, creative ways to stand out based on current market behavior.
  
  Return JSON following:
  {
    "niche": string,
    "competitorStrategy": string,
    "gaps": string[],
    "opportunities": string[],
    "differentiationIdeas": string[]
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
          opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
          differentiationIdeas: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}');
}
