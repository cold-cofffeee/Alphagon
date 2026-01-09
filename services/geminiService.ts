
import { GoogleGenAI, Type } from "@google/genai";
import { ContentAnalysis, GenerationSettings, Platform, Insight, ContentVersion } from "../types";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fix: Refined Gemini API calls with recommended responseSchema for reliability
export async function analyzeMedia(fileBase64: string, mimeType: string): Promise<ContentAnalysis> {
  const ai = getAIClient();
  const prompt = `Analyze this media content. 
  1. Provide a verbatim transcription.
  2. Summarize the core message.
  3. Identify the speaker's intent and target audience.
  4. List 5-10 SEO keywords.
  5. List primary topics discussed.`;

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
        },
        required: ["transcript", "summary", "intent", "keywords", "topics"]
      }
    }
  });

  return JSON.parse(response.text?.trim() || '{}');
}

export async function parseVoiceSettings(audioBase64: string): Promise<Partial<GenerationSettings>> {
  const ai = getAIClient();
  const prompt = `Extract desired Emotion, Tone, Language, Region, and Target Audience from this audio context.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: audioBase64, mimeType: 'audio/wav' } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          emotion: { type: Type.STRING },
          tone: { type: Type.STRING },
          language: { type: Type.STRING },
          region: { type: Type.STRING },
          targetAudience: { type: Type.STRING }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text?.trim() || '{}');
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
  - Growth: Improvements and variation ideas.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          body: { type: Type.STRING },
          scores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                score: { type: Type.NUMBER }
              },
              required: ["label", "score"]
            }
          },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } },
          trace: {
            type: Type.OBJECT,
            properties: {
              detectedEmotion: { type: Type.STRING },
              audienceAssumption: { type: Type.STRING },
              platformBias: { type: Type.STRING }
            },
            required: ["detectedEmotion", "audienceAssumption", "platformBias"]
          }
        },
        required: ["body", "scores", "risks", "trace"]
      }
    }
  });

  return JSON.parse(response.text?.trim() || '{}');
}

// Fix: Incorporate analysis into prompt and add responseSchema
export async function generateInsights(analysis: ContentAnalysis): Promise<Insight> {
  const ai = getAIClient();
  const prompt = `Perform Strategy analysis for the following content analysis results:
  ${JSON.stringify(analysis)}
  
  Identify the niche, competitor strategy, market gaps, opportunities, and differentiation ideas.`;

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
        },
        required: ["niche", "competitorStrategy", "gaps", "opportunities", "differentiationIdeas"]
      }
    }
  });

  return JSON.parse(response.text?.trim() || '{}');
}
