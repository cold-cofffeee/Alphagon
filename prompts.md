# AI Prompt Templates for Alphagon Tools

This document contains detailed prompt templates for each AI tool in Alphagon. These prompts are used to generate high-quality, platform-specific content based on the transcription and global settings.

---

## Base Prompt Structure

Every prompt includes:

```
TRANSCRIPTION:
[User's uploaded content transcription]

GLOBAL SETTINGS:
- Target Region: [global/country]
- Emotion: [emotional/logical/inspirational/aggressive/friendly/authoritative]
- Tone: [casual/professional/storytelling/educational]
- Language: [english/bangla/mixed]
- Creator Preferences: [optional custom notes]

TASK:
[Tool-specific instructions]

REQUIREMENTS:
- Use transcription as single source of truth
- Respect all global settings
- Be creative and platform-appropriate
- Avoid generic content
- Optimize for clarity, creativity, and platform relevance
- Do not use excessive emojis unless tone requires it
```

---

## 1. Thumbnail Text Copy Generator

**Purpose**: Generate eye-catching text for video thumbnails

**Prompt Template**:
```
Generate 3-5 powerful, short text options for a video thumbnail based on this content.

Requirements:
- Keep each option under 5 words maximum
- Make them attention-grabbing and curiosity-inducing
- Use [EMOTION] approach
- Consider [TARGET_REGION] audience preferences
- Apply [TONE] style where appropriate
- Ensure high contrast readability
- Focus on the strongest hook from the transcription
- Avoid clickbait that misrepresents content

Output Format:
1. [Option 1]
2. [Option 2]
3. [Option 3]
4. [Option 4]
5. [Option 5]

Pro Tip: [Brief recommendation for color/font usage]
```

---

## 2. SEO Title Generator

**Purpose**: Create search-optimized titles that rank and get clicks

**Prompt Template**:
```
Generate 3 SEO-optimized titles based on this content.

Requirements:
- Include primary keywords naturally
- Optimal length: 50-60 characters
- Balance search intent with click appeal
- Consider [TARGET_REGION] search patterns
- Apply [TONE] style: [casual/professional/storytelling/educational]
- Include year/timeframe if relevant
- Make each title unique in approach

Output Format:
1. [Title 1]
   └─ Keywords: [key terms]

2. [Title 2]
   └─ Keywords: [key terms]

3. [Title 3]
   └─ Keywords: [key terms]

✓ Note: All titles optimized for both search engines and click-through rates
```

---

## 3. YouTube Content Generator

**Purpose**: Create YouTube-optimized titles and descriptions

**Prompt Template**:
```
Generate YouTube-optimized content including title and comprehensive description.

Requirements:

TITLE:
- Under 60 characters for full mobile display
- Include primary keyword early
- Apply [EMOTION] hook
- Use [TONE] style
- Optimize for [TARGET_REGION] audience

DESCRIPTION:
- Strong opening paragraph (first 150 chars crucial)
- Logical structure with clear sections
- Include timestamps if content has distinct segments
- Add relevant hashtags (5-10)
- Call-to-action for engagement
- Links section placeholder
- [LANGUAGE] preference applied

Output Format:
━━━━━━━━━━━━━━━━━━━━
TITLE:
[Title text]

━━━━━━━━━━━━━━━━━━━━
DESCRIPTION:

[Opening paragraph - hook and value proposition]

⏱️ TIMESTAMPS:
0:00 - [Section]
[X:XX] - [Section]
[X:XX] - [Section]

🔗 RESOURCES:
[Links placeholder]

💬 [Call to action]

#[hashtag1] #[hashtag2] #[hashtag3]
```

---

## 4. Facebook Post Generator

**Purpose**: Create engagement-driven Facebook content

**Prompt Template**:
```
Generate a Facebook post optimized for engagement, comments, and shares.

Requirements:
- Apply [EMOTION] approach to connect emotionally
- Use [TONE] style: [casual/professional/storytelling/educational]
- Conversational and relatable language
- Include question or discussion prompt
- Break text with line breaks for readability
- Emoji usage: [minimal/moderate based on tone]
- Consider [TARGET_REGION] cultural context
- [LANGUAGE] preference

Structure:
- Hook: First 1-2 lines must grab attention
- Body: 3-5 lines expanding on hook
- Value: Key insight or takeaway
- Engagement: Question or call to discussion
- CTA: Soft call-to-action

Output Format:
━━━━━━━━━━━━━━━━━━━━
[Emoji if appropriate] [Hook that stops scrolling]

[Expanding context and story]

[Key value or insight]

[Engagement question]

👉 [Call to action]

━━━━━━━━━━━━━━━━━━━━
💡 Note: Optimized for algorithm and human engagement
```

---

## 5. Twitter/X Generator

**Purpose**: Create viral-ready tweets under 280 characters

**Prompt Template**:
```
Generate 3 tweet variations optimized for Twitter/X engagement.

Requirements:
- Maximum 280 characters per tweet
- Apply [EMOTION] strategy
- Use [TONE] approach
- Include 1-3 relevant hashtags per tweet
- Each variation should test different angles:
  * List/bullet format
  * Hook + insight
  * Question + answer
- Consider [TARGET_REGION] trending topics
- [LANGUAGE] preference
- Thread-starter potential

Output Format:
━━━━━━━━━━━━━━━━━━━━
TWEET 1: [Format type]
[Tweet text with hashtags]
[Character count]

━━━━━━━━━━━━━━━━━━━━
TWEET 2: [Format type]
[Tweet text with hashtags]
[Character count]

━━━━━━━━━━━━━━━━━━━━
TWEET 3: [Format type]
[Tweet text with hashtags]
[Character count]
```

---

## 6. Instagram Reels Caption Generator

**Purpose**: Create hashtag-rich, visual-focused captions

**Prompt Template**:
```
Generate an Instagram Reels caption optimized for discovery and engagement.

Requirements:
- Strong hook in first line (appears before "more")
- Apply [EMOTION] storytelling
- Use [TONE] voice
- Include 15-20 relevant hashtags
- Strategic emoji placement (but not excessive)
- Break text with line breaks for readability
- Call-to-action for saves/shares
- Consider [TARGET_REGION] Instagram trends
- [LANGUAGE] preference

Structure:
- Line 1: Hook (emoji + strong statement)
- Lines 2-5: Value proposition and context
- Lines 6-7: Call to action
- Hashtag block

Output Format:
━━━━━━━━━━━━━━━━━━━━
[Emoji] [Hook that works above the fold]

[Value proposition - what they'll learn/gain]

[Key insight 1]
[Key insight 2]
[Key insight 3]

[Emoji] [Save/share CTA]

━━━━━━━━━━━━━━━━━━━━
#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5 
#hashtag6 #hashtag7 #hashtag8 #hashtag9 #hashtag10
#hashtag11 #hashtag12 #hashtag13 #hashtag14 #hashtag15
[additional relevant hashtags]
```

---

## 7. Blog Post Generator

**Purpose**: Create compelling blog titles and introductions

**Prompt Template**:
```
Generate a blog post title and introduction paragraph.

Requirements:

TITLE:
- Compelling and SEO-friendly
- Apply [EMOTION] appeal
- Use [TONE] style
- Include primary keyword
- Promise clear value
- Optimal length: 60-70 characters

INTRODUCTION:
- 150-200 words
- Hook readers in first 2 sentences
- Establish credibility
- Preview what they'll learn
- Apply [TONE]: [casual/professional/storytelling/educational]
- Consider [TARGET_REGION] context
- [LANGUAGE] preference
- End with transition to main content

Output Format:
━━━━━━━━━━━━━━━━━━━━
TITLE:
"[Title text]"

━━━━━━━━━━━━━━━━━━━━
INTRODUCTION:

[Paragraph 1: Hook and relatable problem/question]

[Paragraph 2: What this article covers and value proposition]

[Paragraph 3: Brief credibility statement and transition]

━━━━━━━━━━━━━━━━━━━━
💡 Note: This intro hooks readers and promises clear value
```

---

## 8. Short Description Generator

**Purpose**: Create concise 100-150 word summaries

**Prompt Template**:
```
Generate a short description (100-150 words) that captures the essence and value of the content.

Requirements:
- Concise yet comprehensive
- Apply [EMOTION] appeal
- Use [TONE] approach
- Action-oriented language
- Highlight key benefits
- Include call-to-action
- Optimize for [TARGET_REGION]
- [LANGUAGE] preference
- Avoid fluff, focus on value

Structure:
- Sentence 1: What this is about
- Sentences 2-3: Key value propositions
- Sentence 4-5: Who it's for / what they'll gain
- Final sentence: CTA or closing

Output Format:
━━━━━━━━━━━━━━━━━━━━
[Description text - 100-150 words]

━━━━━━━━━━━━━━━━━━━━
✓ Word count: [X words]
✓ Concise yet comprehensive
✓ Action-oriented
✓ Optimized for engagement
```

---

## 9. Long-Form Description Generator

**Purpose**: Create comprehensive 300-400 word descriptions

**Prompt Template**:
```
Generate a long-form description (300-400 words) with clear structure and comprehensive coverage.

Requirements:
- Detailed yet scannable
- Clear section structure
- Apply [EMOTION] throughout
- Use [TONE] consistently
- Include benefits and features
- Add credibility elements
- Strong call-to-action
- Consider [TARGET_REGION] audience
- [LANGUAGE] preference
- Use formatting (bullets, sections)

Structure:
- Overview (50-75 words)
- What You'll Learn (bullet points)
- Why It Matters (75-100 words)
- Bonus/Additional Value (50-75 words)
- Call-to-Action (25-50 words)

Output Format:
━━━━━━━━━━━━━━━━━━━━
🎯 OVERVIEW
[Comprehensive introduction]

━━━━━━━━━━━━━━━━━━━━
✨ WHAT YOU'LL LEARN
• [Benefit 1]
• [Benefit 2]
• [Benefit 3]
• [Benefit 4]

━━━━━━━━━━━━━━━━━━━━
💡 WHY THIS MATTERS
[Context and importance]

━━━━━━━━━━━━━━━━━━━━
🎁 BONUS INSIGHTS
[Additional value]

━━━━━━━━━━━━━━━━━━━━
👉 TAKE ACTION NOW
[Call to action]

━━━━━━━━━━━━━━━━━━━━
✓ Word count: [X words]
✓ Comprehensive coverage
✓ Clear structure
✓ Action-oriented
```

---

## 10. Ad Copy Generator

**Purpose**: Create conversion-focused, scroll-stopping ads

**Prompt Template**:
```
Generate 3 ad copy variations optimized for conversion.

Requirements:
- Apply [EMOTION] triggers
- Use [TONE] appropriate for ads
- Include strong hooks
- Clear value propositions
- Specific calls-to-action
- Test different frameworks:
  * Problem-Agitate-Solution
  * Benefit-driven
  * Curiosity-based
  * Authority/social proof
- Optimize for [TARGET_REGION]
- [LANGUAGE] preference
- Keep concise (under 100 words each)

Output Format:
━━━━━━━━━━━━━━━━━━━━
VARIATION 1: [Framework type]

"[Hook - first sentence that stops scroll]

[Problem or benefit statement]

[Solution or value proposition]

✓ [Benefit 1]
✓ [Benefit 2]
✓ [Benefit 3]

👉 [Strong CTA]"

━━━━━━━━━━━━━━━━━━━━
VARIATION 2: [Framework type]
[Similar structure]

━━━━━━━━━━━━━━━━━━━━
VARIATION 3: [Framework type]
[Similar structure]

━━━━━━━━━━━━━━━━━━━━
✓ All variants optimized for conversion
✓ Clear CTAs
✓ Emotionally resonant
```

---

## 11. Hooks Generator

**Purpose**: Create attention-grabbing opening lines

**Prompt Template**:
```
Generate 5-7 attention-grabbing hooks for the first 3-5 seconds of content.

Requirements:
- Under 15 words each
- Apply [EMOTION] strategy
- Use [TONE] where appropriate
- Focus on:
  * Pattern interrupts
  * Curiosity gaps
  * Bold claims
  * Relatable problems
  * Surprising facts
- High retention potential
- Test different psychological triggers
- Consider [TARGET_REGION] preferences
- [LANGUAGE] choice

Output Format:
━━━━━━━━━━━━━━━━━━━━
1. "[Hook text]"
   └─ Trigger: [psychological principle used]

2. "[Hook text]"
   └─ Trigger: [psychological principle used]

3. "[Hook text]"
   └─ Trigger: [psychological principle used]

[Continue for 5-7 hooks]

━━━━━━━━━━━━━━━━━━━━
✓ All hooks under 5 seconds to say
✓ High retention potential
✓ Platform-agnostic
```

---

## 12. More Content Ideas (Same Angle)

**Purpose**: Generate similar content variations

**Prompt Template**:
```
Generate 5 content ideas that explore the same theme/angle with similar approach but different perspectives.

Requirements:
- Maintain core theme and [EMOTION]
- Apply consistent [TONE]
- Each idea should be complementary to original
- Different entry points for same audience
- Expand on specific aspects
- Consider [TARGET_REGION] interests
- [LANGUAGE] preference
- Provide title + brief description for each

Output Format:
━━━━━━━━━━━━━━━━━━━━
1. "[Content Title]"
   └─ Approach: [brief description]
   └─ Unique angle: [what makes it different]

2. "[Content Title]"
   └─ Approach: [brief description]
   └─ Unique angle: [what makes it different]

[Continue for 5 ideas]

━━━━━━━━━━━━━━━━━━━━
✓ Maintains core theme
✓ Different entry points
✓ Complementary to original
```

---

## 13. More Content Ideas (Fresh Angles)

**Purpose**: Generate new perspectives and twists

**Prompt Template**:
```
Generate 5 content ideas that take the core concept in completely new directions with fresh angles and twists.

Requirements:
- Dramatic perspective shifts
- Apply different [EMOTION] approaches
- Explore different [TONE] styles
- Target new audience segments
- Contrarian or unconventional angles
- High viral potential
- Consider [TARGET_REGION] trends
- [LANGUAGE] preference
- Each should feel distinct from original

Output Format:
━━━━━━━━━━━━━━━━━━━━
1. "[Content Title]"
   └─ Fresh angle: [new perspective]
   └─ Target audience: [who this appeals to]
   └─ Viral potential: [why this could spread]

2. "[Content Title]"
   └─ Fresh angle: [new perspective]
   └─ Target audience: [who this appeals to]
   └─ Viral potential: [why this could spread]

[Continue for 5 ideas]

━━━━━━━━━━━━━━━━━━━━
✓ Complete perspective shifts
✓ New audience segments
✓ High viral potential
```

---

## 14. Improvement Suggestions

**Purpose**: Provide strategic recommendations

**Prompt Template**:
```
Analyze the content and provide 5-7 strategic improvement suggestions covering structure, delivery, engagement, and optimization.

Requirements:
- Actionable recommendations
- Prioritized by potential impact
- Cover multiple aspects:
  * Structure & pacing
  * Emotional resonance (consider [EMOTION] setting)
  * Platform optimization
  * Engagement tactics
  * SEO & discoverability
  * Value delivery
  * Call-to-action effectiveness
- Consider [TONE] preferences
- [TARGET_REGION] specific insights
- [LANGUAGE] considerations

Output Format:
━━━━━━━━━━━━━━━━━━━━
🎯 STRATEGIC IMPROVEMENT SUGGESTIONS

1. STRUCTURE & PACING
   • [Specific suggestion]
   • [Implementation tip]
   • [Expected impact]

2. EMOTIONAL RESONANCE
   • [Specific suggestion]
   • [Implementation tip]
   • [Expected impact]

3. PLATFORM OPTIMIZATION
   • [Specific suggestion]
   • [Implementation tip]
   • [Expected impact]

[Continue through 7 categories]

━━━━━━━━━━━━━━━━━━━━
✓ Actionable recommendations
✓ Prioritized by impact
✓ Platform-aware
```

---

## 15. Competitor Analysis

**Purpose**: Provide niche-based competitive insights

**Prompt Template**:
```
Provide comprehensive competitor analysis with insights on what's working in this niche, gaps, and opportunities.

Requirements:
- Niche-specific insights
- Based on [TONE] and [EMOTION] of content
- Consider [TARGET_REGION] market
- Identify:
  * Trending formats
  * Successful strategies
  * Underserved areas
  * Differentiation opportunities
  * Common pitfalls
- Actionable recommendations
- Strategic positioning advice
- [LANGUAGE] market considerations

Output Format:
━━━━━━━━━━━━━━━━━━━━
🔍 COMPETITIVE ANALYSIS

━━━━━━━━━━━━━━━━━━━━
🎯 NICHE LANDSCAPE
[Overview of the competitive space]

━━━━━━━━━━━━━━━━━━━━
📊 TRENDING FORMATS
• [Format 1 and why it works]
• [Format 2 and why it works]
• [Format 3 and why it works]

━━━━━━━━━━━━━━━━━━━━
💡 SUCCESSFUL STRATEGIES
1. [Strategy and examples]
2. [Strategy and examples]
3. [Strategy and examples]

━━━━━━━━━━━━━━━━━━━━
🚀 OPPORTUNITIES & GAPS

✓ UNDERSERVED AREAS:
• [Gap 1]
• [Gap 2]
• [Gap 3]

✓ DIFFERENTIATION ANGLES:
• [Angle 1]
• [Angle 2]
• [Angle 3]

━━━━━━━━━━━━━━━━━━━━
⚠️ COMMON PITFALLS TO AVOID
• [Pitfall 1]
• [Pitfall 2]
• [Pitfall 3]

━━━━━━━━━━━━━━━━━━━━
🎬 RECOMMENDED NEXT STEPS
1. [Action step]
2. [Action step]
3. [Action step]

━━━━━━━━━━━━━━━━━━━━
✓ Data-informed insights
✓ Actionable opportunities
✓ Strategic positioning
```

---

## Best Practices for All Prompts

### 1. Context Preservation
- Always include the full transcription
- Reference global settings in every prompt
- Maintain creator preferences throughout

### 2. Quality Guidelines
- Avoid generic, templated responses
- Prioritize specificity and relevance
- Optimize for the target platform
- Balance creativity with practicality

### 3. Regional Optimization
- Consider cultural nuances
- Adapt examples and references
- Respect language preferences
- Account for local trends

### 4. Emotional Intelligence
- Match the selected emotion authentically
- Don't force emotion where it doesn't fit
- Use psychological triggers appropriately
- Balance emotion with credibility

### 5. Platform Awareness
- Respect character limits
- Follow platform best practices
- Use platform-specific features
- Optimize for each algorithm

---

## Prompt Tuning Parameters

### Temperature Settings (for API integration)
- **Creative Tools** (hooks, ad copy): 0.8-0.9
- **SEO/Technical** (titles, descriptions): 0.6-0.7
- **Analysis** (improvements, competitor): 0.5-0.6

### Max Tokens
- **Short outputs** (titles, hooks): 200-300
- **Medium outputs** (descriptions): 400-600
- **Long outputs** (blog, analysis): 800-1200

### Model Selection
- **GPT-4**: Best for creative and nuanced content
- **GPT-3.5-turbo**: Fast, cost-effective for simpler tasks
- **Claude**: Excellent for longer, structured content

---

**These prompt templates ensure consistent, high-quality outputs across all Alphagon tools while respecting user preferences and platform requirements.**
