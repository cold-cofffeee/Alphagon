// ============================================
// GOOGLE GEMINI AI SERVICE
// Handles all AI generation with prompt templates
// ============================================

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { config } from '../config';
import { AIPromptContext, AIGenerationResult, ToolName } from '../types';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: config.gemini.model });
  }

  // ============================================
  // MAIN GENERATION METHOD
  // ============================================

  async generateContent(context: AIPromptContext): Promise<AIGenerationResult> {
    const startTime = Date.now();

    try {
      // Build the complete prompt
      const prompt = this.buildPrompt(context);

      // Call Gemini API
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Calculate metrics
      const generationTime = Date.now() - startTime;

      // Extract token usage if available
      const usageMetadata = response.usageMetadata;
      const tokensUsed = {
        input: usageMetadata?.promptTokenCount || 0,
        output: usageMetadata?.candidatesTokenCount || 0,
        total: usageMetadata?.totalTokenCount || 0,
      };

      return {
        content: text,
        tokensUsed,
        generationTime,
        modelUsed: config.gemini.model,
      };
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  // ============================================
  // TRANSCRIPTION (Using Gemini 2.0 Flash with audio/video support)
  // ============================================

  async transcribeMedia(base64Data: string, mimeType: string): Promise<string> {
    try {
      const prompt = `Transcribe the following audio/video content accurately and completely. 
      Return only the transcription text without any additional commentary, explanations, or formatting.
      Transcribe every word spoken in the content.`;

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
      ]);

      const transcription = result.response.text().trim();
      
      if (!transcription || transcription.length < 10) {
        throw new Error('Transcription returned empty or too short result');
      }

      return transcription;
    } catch (error: any) {
      console.error('Transcription Error:', error);
      
      // Provide more detailed error messages
      if (error.message?.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later.');
      } else if (error.message?.includes('invalid')) {
        throw new Error('Invalid file format. Please upload a valid audio/video file.');
      } else {
        throw new Error(`Transcription failed: ${error.message || 'Unknown error'}`);
      }
    }
  }

  // Legacy method for backward compatibility
  async transcribeAudio(audioContent: string): Promise<string> {
    return this.transcribeMedia(audioContent, 'audio/mp3');
  }

  // ============================================
  // PROMPT BUILDER
  // ============================================

  private buildPrompt(context: AIPromptContext): string {
    const {
      transcription,
      emotion,
      tone,
      language,
      targetRegion,
      creatorNotes,
      toolName,
    } = context;

    // Base context that applies to all prompts
    const baseContext = `
TRANSCRIPTION:
${transcription}

GLOBAL SETTINGS:
- Target Region: ${targetRegion}
- Emotion: ${emotion}
- Tone: ${tone}
- Language: ${language}
${creatorNotes ? `- Creator Notes: ${creatorNotes}` : ''}

TASK:
${this.getToolPrompt(toolName)}

REQUIREMENTS:
- Use the transcription as the single source of truth
- Respect all global settings (region, emotion, tone, language)
- Be creative and platform-appropriate
- Avoid generic or templated content
- Optimize for clarity, creativity, and platform relevance
- Do not use excessive emojis unless the tone requires it
- Provide actionable, high-quality content
${language === 'bangla' ? '- Include Bangla language content where appropriate' : ''}
${language === 'mixed' ? '- Mix Bangla and English naturally as requested' : ''}
`;

    return baseContext.trim();
  }

  // ============================================
  // TOOL-SPECIFIC PROMPTS
  // ============================================

  private getToolPrompt(tool: ToolName): string {
    const prompts: Record<ToolName, string> = {
      thumbnail: `Generate 3-5 powerful, short text options for a video thumbnail based on this content.

Requirements:
- Keep each option under 5 words maximum
- Make them attention-grabbing and curiosity-inducing
- Focus on the strongest hook from the transcription
- Ensure high contrast readability
- Avoid clickbait that misrepresents content

Output Format:
📌 Thumbnail Text Options:

1. [Option 1]
2. [Option 2]
3. [Option 3]
4. [Option 4]
5. [Option 5]

💡 Pro Tip: [Brief recommendation]`,

      'seo-title': `Generate 3 SEO-optimized titles based on this content.

Requirements:
- Include primary keywords naturally
- Optimal length: 50-60 characters
- Balance search intent with click appeal
- Make each title unique in approach

Output Format:
🔍 SEO-Optimized Titles:

1. [Title 1]
2. [Title 2]
3. [Title 3]

✓ All titles optimized for search engines and click-through rates`,

      youtube: `Generate YouTube-optimized content including title and comprehensive description.

Requirements:
TITLE:
- Under 60 characters for full mobile display
- Include primary keyword early
- Optimize for target audience

DESCRIPTION:
- Strong opening paragraph (first 150 chars crucial)
- Include timestamps if content has distinct segments
- Add 5-10 relevant hashtags
- Call-to-action for engagement

Output Format:
━━━━━━━━━━━━━━━━━━━━
TITLE:
[Title text]

━━━━━━━━━━━━━━━━━━━━
DESCRIPTION:

[Opening paragraph]

⏱️ TIMESTAMPS:
[If applicable]

🔗 RESOURCES:
[Links section]

💬 [Call to action]

#[hashtags]`,

      facebook: `Generate a Facebook post optimized for engagement, comments, and shares.

Requirements:
- Conversational and relatable language
- Include question or discussion prompt
- Break text with line breaks for readability
- Emoji usage based on tone

Output Format:
━━━━━━━━━━━━━━━━━━━━
[Hook that stops scrolling]

[Expanding context and story]

[Key value or insight]

[Engagement question]

👉 [Call to action]

━━━━━━━━━━━━━━━━━━━━
💡 Optimized for algorithm and engagement`,

      twitter: `Generate 3 tweet variations optimized for Twitter/X engagement.

Requirements:
- Maximum 280 characters per tweet
- Include 1-3 relevant hashtags per tweet
- Each variation should test different angles

Output Format:
━━━━━━━━━━━━━━━━━━━━
TWEET 1:
[Tweet text with hashtags]

━━━━━━━━━━━━━━━━━━━━
TWEET 2:
[Tweet text with hashtags]

━━━━━━━━━━━━━━━━━━━━
TWEET 3:
[Tweet text with hashtags]`,

      instagram: `Generate an Instagram Reels caption optimized for discovery and engagement.

Requirements:
- Strong hook in first line
- Include 15-20 relevant hashtags
- Strategic emoji placement
- Call-to-action for saves/shares

Output Format:
━━━━━━━━━━━━━━━━━━━━
[Hook that works above the fold]

[Value proposition and context]

[Key insights]

[Call to action]

━━━━━━━━━━━━━━━━━━━━
#hashtag1 #hashtag2 #hashtag3 [15-20 total hashtags]`,

      blog: `Generate a blog post title and introduction paragraph.

Requirements:
TITLE:
- Compelling and SEO-friendly
- Include primary keyword
- 60-70 characters

INTRODUCTION:
- 150-200 words
- Hook readers in first 2 sentences
- Establish credibility
- Preview what they'll learn

Output Format:
━━━━━━━━━━━━━━━━━━━━
TITLE:
"[Title text]"

━━━━━━━━━━━━━━━━━━━━
INTRODUCTION:

[Paragraph 1: Hook]

[Paragraph 2: Value proposition]

[Paragraph 3: Transition]`,

      'short-desc': `Generate a short description (100-150 words) that captures the essence and value of the content.

Requirements:
- Concise yet comprehensive
- Action-oriented language
- Highlight key benefits
- Include call-to-action

Output Format:
━━━━━━━━━━━━━━━━━━━━
[Description text - 100-150 words]

━━━━━━━━━━━━━━━━━━━━
✓ Concise yet comprehensive
✓ Action-oriented`,

      'long-desc': `Generate a long-form description (300-400 words) with clear structure.

Requirements:
- Detailed yet scannable
- Clear section structure
- Include benefits and features
- Strong call-to-action

Output Format:
━━━━━━━━━━━━━━━━━━━━
🎯 OVERVIEW
[Introduction]

━━━━━━━━━━━━━━━━━━━━
✨ WHAT YOU'LL LEARN
• [Benefit 1]
• [Benefit 2]
• [Benefit 3]

━━━━━━━━━━━━━━━━━━━━
💡 WHY THIS MATTERS
[Context]

━━━━━━━━━━━━━━━━━━━━
👉 TAKE ACTION NOW
[CTA]`,

      'ad-copy': `Generate 3 ad copy variations optimized for conversion.

Requirements:
- Include strong hooks
- Clear value propositions
- Specific calls-to-action
- Test different frameworks (Problem-Solution, Benefit-driven, Curiosity)

Output Format:
━━━━━━━━━━━━━━━━━━━━
VARIATION 1:
"[Hook]

[Value proposition]

✓ [Benefit 1]
✓ [Benefit 2]
✓ [Benefit 3]

👉 [CTA]"

━━━━━━━━━━━━━━━━━━━━
VARIATION 2:
[Similar structure]

━━━━━━━━━━━━━━━━━━━━
VARIATION 3:
[Similar structure]`,

      hooks: `Generate 5-7 attention-grabbing hooks for the first 3-5 seconds of content.

Requirements:
- Under 15 words each
- Focus on pattern interrupts, curiosity gaps, bold claims
- High retention potential

Output Format:
━━━━━━━━━━━━━━━━━━━━
1. "[Hook text]"
   └─ Trigger: [psychological principle]

2. "[Hook text]"
   └─ Trigger: [psychological principle]

[Continue for 5-7 hooks]

━━━━━━━━━━━━━━━━━━━━
✓ All hooks under 5 seconds
✓ High retention potential`,

      'more-same': `Generate 5 content ideas that explore the same theme/angle with similar approach but different perspectives.

Requirements:
- Maintain core theme
- Different entry points for same audience
- Provide title + brief description

Output Format:
━━━━━━━━━━━━━━━━━━━━
1. "[Content Title]"
   └─ Approach: [description]
   └─ Unique angle: [difference]

[Continue for 5 ideas]

━━━━━━━━━━━━━━━━━━━━
✓ Maintains core theme
✓ Complementary to original`,

      'more-different': `Generate 5 content ideas that take the core concept in completely new directions.

Requirements:
- Dramatic perspective shifts
- Target new audience segments
- High viral potential

Output Format:
━━━━━━━━━━━━━━━━━━━━
1. "[Content Title]"
   └─ Fresh angle: [new perspective]
   └─ Target audience: [who]
   └─ Viral potential: [why]

[Continue for 5 ideas]

━━━━━━━━━━━━━━━━━━━━
✓ Complete perspective shifts
✓ High viral potential`,

      improvements: `Analyze the content and provide 5-7 strategic improvement suggestions.

Requirements:
- Cover structure, delivery, engagement, optimization
- Actionable recommendations
- Prioritized by impact

Output Format:
━━━━━━━━━━━━━━━━━━━━
🎯 STRATEGIC IMPROVEMENTS

1. STRUCTURE & PACING
   • [Suggestion]
   • [Implementation]

2. EMOTIONAL RESONANCE
   • [Suggestion]
   • [Implementation]

3. PLATFORM OPTIMIZATION
   • [Suggestion]
   • [Implementation]

[Continue through 7 categories]

━━━━━━━━━━━━━━━━━━━━
✓ Actionable
✓ Prioritized by impact`,

      competitor: `Provide comprehensive competitor analysis with insights.

Requirements:
- Niche-specific insights
- Trending formats
- Opportunities and gaps
- Strategic positioning

Output Format:
━━━━━━━━━━━━━━━━━━━━
🔍 COMPETITIVE ANALYSIS

━━━━━━━━━━━━━━━━━━━━
🎯 NICHE LANDSCAPE
[Overview]

━━━━━━━━━━━━━━━━━━━━
📊 TRENDING FORMATS
• [Format 1]
• [Format 2]
• [Format 3]

━━━━━━━━━━━━━━━━━━━━
🚀 OPPORTUNITIES & GAPS
✓ UNDERSERVED AREAS:
• [Gap 1]
• [Gap 2]

✓ DIFFERENTIATION ANGLES:
• [Angle 1]
• [Angle 2]

━━━━━━━━━━━━━━━━━━━━
🎬 RECOMMENDED NEXT STEPS
1. [Action]
2. [Action]
3. [Action]`,
    };

    return prompts[tool] || 'Generate relevant content based on the transcription.';
  }
}

export const geminiService = new GeminiService();
