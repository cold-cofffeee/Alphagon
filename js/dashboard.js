// ============================================
// ALPHAGON - AI Content Intelligence Platform
// ============================================

class AlphagonApp {
    constructor() {
        this.transcription = '';
        this.audioBlob = null;
        this.settings = {
            targetRegion: 'global',
            emotion: 'emotional',
            tone: 'casual',
            language: 'english',
            creatorNotes: ''
        };
        this.init();
    }

    init() {
        this.setupFileUpload();
        this.setupSettingsListeners();
        this.setupToolButtons();
        this.setupOutputActions();
        this.setupTranscriptionEdit();
    }

    // ============================================
    // FILE UPLOAD & PROCESSING
    // ============================================

    setupFileUpload() {
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFile(e.target.files[0]);
            }
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.handleFile(e.dataTransfer.files[0]);
            }
        });

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearAll();
        });
    }

    handleFile(file) {
        const validTypes = [
            'video/mp4', 'video/quicktime', 'video/x-msvideo',
            'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a'
        ];

        if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|avi|mp3|wav|m4a)$/i)) {
            alert('Please upload a valid video or audio file.');
            return;
        }

        this.processFile(file);
    }

    async processFile(file) {
        // Show processing UI
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('processingStatus').style.display = 'block';
        
        this.updateStatus('Uploading file...', 20);
        
        // Simulate file upload
        await this.delay(1000);
        
        // Check if video or audio
        const isVideo = file.type.startsWith('video/');
        
        if (isVideo) {
            this.updateStatus('Extracting audio from video...', 40);
            await this.delay(1500);
            this.audioBlob = await this.extractAudioFromVideo(file);
        } else {
            this.updateStatus('Processing audio...', 40);
            await this.delay(1000);
            this.audioBlob = file;
        }

        this.updateStatus('Transcribing audio...', 70);
        await this.delay(2000);
        
        // Simulate transcription (in production, this would call a real API)
        this.transcription = await this.transcribeAudio(this.audioBlob, file.name);
        
        this.updateStatus('Complete!', 100);
        await this.delay(500);
        
        // Show transcription
        this.displayTranscription();
    }

    async extractAudioFromVideo(videoFile) {
        // In production, this would use FFmpeg.js or similar
        // For demo purposes, we're simulating this
        return videoFile;
    }

    async transcribeAudio(audioBlob, fileName) {
        // In production, this would call Whisper API, Deepgram, etc.
        // For demo purposes, returning sample transcription
        return `This is a sample transcription generated from the file "${fileName}".

In a real implementation, this would be the actual transcription of your audio content using services like:
- OpenAI Whisper API
- Google Speech-to-Text
- AssemblyAI
- Deepgram

The transcription would contain the full spoken content from your video or audio file, which will then be used by all the AI tools below to generate platform-specific content.

For testing purposes, you can edit this transcription to contain your actual content, and the AI tools will use it to generate relevant outputs based on your global settings (region, emotion, tone, language, and creator preferences).`;
    }

    updateStatus(text, progress) {
        document.getElementById('statusText').textContent = text;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }

    displayTranscription() {
        document.getElementById('processingStatus').style.display = 'none';
        document.getElementById('transcriptionSection').style.display = 'block';
        document.getElementById('transcriptionText').value = this.transcription;
    }

    clearAll() {
        if (confirm('This will clear the current transcription and all generated outputs. Continue?')) {
            this.transcription = '';
            this.audioBlob = null;
            
            document.getElementById('uploadArea').style.display = 'block';
            document.getElementById('processingStatus').style.display = 'none';
            document.getElementById('transcriptionSection').style.display = 'none';
            document.getElementById('transcriptionText').value = '';
            document.getElementById('fileInput').value = '';
            
            this.clearOutputs();
        }
    }

    // ============================================
    // TRANSCRIPTION EDITING
    // ============================================

    setupTranscriptionEdit() {
        const editBtn = document.getElementById('editTranscriptionBtn');
        const saveBtn = document.getElementById('saveTranscriptionBtn');
        const textarea = document.getElementById('transcriptionText');

        editBtn.addEventListener('click', () => {
            textarea.readOnly = false;
            textarea.focus();
            editBtn.style.display = 'none';
            saveBtn.style.display = 'inline-block';
        });

        saveBtn.addEventListener('click', () => {
            this.transcription = textarea.value;
            textarea.readOnly = true;
            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
        });
    }

    // ============================================
    // SETTINGS MANAGEMENT
    // ============================================

    setupSettingsListeners() {
        ['targetRegion', 'emotion', 'tone', 'language'].forEach(id => {
            document.getElementById(id).addEventListener('change', (e) => {
                this.settings[id] = e.target.value;
            });
        });

        document.getElementById('creatorNotes').addEventListener('input', (e) => {
            this.settings.creatorNotes = e.target.value;
        });
    }

    // ============================================
    // TOOL GENERATION
    // ============================================

    setupToolButtons() {
        const buttons = document.querySelectorAll('.btn-generate');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tool = btn.getAttribute('data-tool');
                this.generateContent(tool, btn);
            });
        });
    }

    async generateContent(tool, button) {
        if (!this.transcription) {
            alert('Please upload and transcribe a video or audio file first.');
            return;
        }

        // Disable button and show loading
        button.disabled = true;
        button.classList.add('loading');

        try {
            // Simulate AI generation delay
            await this.delay(2000);

            // Generate content based on tool
            const content = await this.generateAIContent(tool);

            // Display output
            this.addOutput(tool, content);

        } catch (error) {
            console.error('Generation error:', error);
            alert('An error occurred during generation. Please try again.');
        } finally {
            // Re-enable button
            button.disabled = false;
            button.classList.remove('loading');
        }
    }

    async generateAIContent(tool) {
        // Get the prompt for this tool
        const prompt = this.buildPrompt(tool);

        // In production, this would call OpenAI API, Claude API, etc.
        // For demo purposes, we're generating mock content
        return this.generateMockContent(tool);
    }

    buildPrompt(tool) {
        const baseContext = `
Transcription: ${this.transcription}

Global Settings:
- Target Region: ${this.settings.targetRegion}
- Emotion: ${this.settings.emotion}
- Tone: ${this.settings.tone}
- Language: ${this.settings.language}
${this.settings.creatorNotes ? `- Creator Notes: ${this.settings.creatorNotes}` : ''}

Task: ${this.getToolPrompt(tool)}

Requirements:
- Use the transcription as the single source of truth
- Respect all global settings
- Be creative and platform-appropriate
- Avoid generic content
- Optimize for engagement and clarity
`;

        return baseContext;
    }

    getToolPrompt(tool) {
        const prompts = {
            'thumbnail': 'Generate 3-5 powerful, short text options for a video thumbnail. Keep them under 5 words each. Make them attention-grabbing and curiosity-inducing.',
            
            'seo-title': 'Generate 3 SEO-optimized titles that would rank well in search. Include relevant keywords naturally. Make them compelling for clicks.',
            
            'youtube': 'Generate a YouTube-optimized title (under 60 chars) and a comprehensive description with timestamps, hashtags, and call-to-action.',
            
            'facebook': 'Generate a Facebook post with an engaging title and caption that encourages comments and shares. Use conversational tone.',
            
            'twitter': 'Generate 3 tweet variations (under 280 chars) that are viral-ready, punchy, and include relevant hashtags.',
            
            'instagram': 'Generate an Instagram Reels caption with strong hook, value props, hashtags (15-20), and emoji where appropriate.',
            
            'blog': 'Generate a compelling blog post title and a strong introductory paragraph (150-200 words) that hooks readers.',
            
            'short-desc': 'Generate a concise 100-150 word description that captures the essence and value of the content.',
            
            'long-desc': 'Generate a comprehensive 300-400 word description with sections, benefits, and call-to-action.',
            
            'ad-copy': 'Generate 3 conversion-focused ad copy variations with strong hooks, benefits, and clear CTAs. Make them scroll-stopping.',
            
            'hooks': 'Generate 5-7 attention-grabbing hooks for the first 3-5 seconds. Focus on pattern interrupts and curiosity gaps.',
            
            'more-same': 'Generate 5 content ideas that explore the same theme/angle with similar approach but different perspectives.',
            
            'more-different': 'Generate 5 content ideas that take the core concept in completely new directions with fresh angles and twists.',
            
            'improvements': 'Analyze the content and provide 5-7 strategic improvement suggestions covering structure, delivery, engagement, and optimization.',
            
            'competitor': 'Provide niche-based competitive analysis with insights on what\'s working in this space, gaps, and opportunities.'
        };

        return prompts[tool] || 'Generate relevant content based on the transcription.';
    }

    generateMockContent(tool) {
        // Mock content based on settings
        const { emotion, tone, language, targetRegion } = this.settings;

        const templates = {
            'thumbnail': `📌 Thumbnail Text Options:\n\n1. "The Truth About [Topic]"\n2. "This Changed Everything"\n3. "You're Doing It Wrong"\n4. "${emotion === 'inspirational' ? 'Transform Your Life' : 'Stop This Now'}"\n5. "The Real Secret"\n\n💡 Pro Tip: Use high contrast colors and bold fonts for maximum impact.`,

            'seo-title': `🔍 SEO-Optimized Titles:\n\n1. "Ultimate Guide to [Topic]: Everything You Need to Know in ${new Date().getFullYear()}"\n\n2. "[Topic] Explained: ${emotion === 'authoritative' ? 'Expert' : 'Complete'} Breakdown for ${targetRegion === 'global' ? 'Everyone' : 'Your Region'}"\n\n3. "How to Master [Topic]: ${tone === 'professional' ? 'Professional' : 'Step-by-Step'} Tutorial"\n\n✓ All titles optimized for search engines and click-through rates`,

            'youtube': `📺 YouTube Content:\n\n━━━━━━━━━━━━━━━━━━━━\nTITLE:\n"The Ultimate [Topic] Guide - ${emotion === 'inspirational' ? 'Transform Your Life Today' : 'What You Need to Know'}"\n\n━━━━━━━━━━━━━━━━━━━━\nDESCRIPTION:\n\nIn this video, I break down everything you need to know about [topic]. Whether you're a beginner or advanced, this ${tone} guide will help you understand the key concepts.\n\n⏱️ TIMESTAMPS:\n0:00 - Introduction\n2:15 - Main Concept\n5:30 - Deep Dive\n8:45 - Practical Examples\n11:20 - Final Thoughts\n\n🔗 RESOURCES:\n[Add your links here]\n\n💬 Let me know in the comments what you think!\n\n#${tone}content #${emotion}journey #contentcreation #${targetRegion}`,

            'facebook': `📱 Facebook Post:\n\n━━━━━━━━━━━━━━━━━━━━\n${emotion === 'emotional' ? '❤️' : '🎯'} The moment I discovered this about [topic], everything changed...\n\nI used to think [common misconception], but here's what I learned:\n\n✨ [Key insight from transcription]\n\nThis ${tone} approach helped me [specific benefit], and I know it can help you too.\n\nThe best part? You can start implementing this TODAY.\n\n👉 Watch the full breakdown in my latest video (link in comments)\n\n💭 Have you experienced this too? Drop a comment and let's discuss!\n\n━━━━━━━━━━━━━━━━━━━━\n💡 Optimized for engagement and shares`,

            'twitter': `🐦 Twitter/X Variations:\n\n━━━━━━━━━━━━━━━━━━━━\nTWEET 1:\nThe ${emotion} truth about [topic] that nobody tells you:\n\n• [Key point 1]\n• [Key point 2]\n• [Key point 3]\n\nThis changed my entire perspective. 🧵\n\n#${tone} #contentcreator\n\n━━━━━━━━━━━━━━━━━━━━\nTWEET 2:\nJust realized why most people struggle with [topic]...\n\nIt's not what you think 👇\n\n[Brief insight + link]\n\n#${targetRegion}community\n\n━━━━━━━━━━━━━━━━━━━━\nTWEET 3:\nHot take: ${emotion === 'aggressive' ? 'Stop wasting time on [old method]' : 'There\'s a better way to approach [topic]'}\n\nHere's what actually works: [link]\n\n#contentmarketing`,

            'instagram': `📸 Instagram Reels Caption:\n\n━━━━━━━━━━━━━━━━━━━━\n${emotion === 'inspirational' ? '✨' : '🎯'} POV: You finally understand [topic] the right way\n\nI spent [time period] figuring this out so you don't have to...\n\nHere's the ${tone} breakdown:\n\n1️⃣ [Key insight 1]\n2️⃣ [Key insight 2]\n3️⃣ [Key insight 3]\n\n💡 Save this for later!\n\n${emotion === 'friendly' ? '👋' : '💪'} Share with someone who needs to see this\n\n━━━━━━━━━━━━━━━━━━━━\n#contentcreation #${tone}content #${emotion}journey #digitalmarketing #contentcreator #socialmedia #${targetRegion} #viral #trending #explorepage #reels #reelsinstagram #reelitfeelit #instareels #trending #foryou #fyp #viralvideos`,

            'blog': `📝 Blog Post:\n\n━━━━━━━━━━━━━━━━━━━━\nTITLE:\n"${emotion === 'authoritative' ? 'The Definitive' : 'The Complete'} Guide to [Topic]: ${tone === 'professional' ? 'Industry Insights' : 'Everything You Need to Know'}"\n\n━━━━━━━━━━━━━━━━━━━━\nINTRODUCTION:\n\nIf you've ever wondered about [topic], you're not alone. This is one of the most ${emotion} subjects in [niche], and for good reason.\n\nIn this ${tone} guide, I'm going to break down everything you need to know—from the basics to advanced strategies that actually work. Based on real experience and proven results, this isn't just theory; it's a practical roadmap.\n\nBy the end of this article, you'll understand:\n• Why [key concept] matters more than you think\n• The exact steps to [achieve result]\n• Common mistakes to avoid (that cost most people time and money)\n\nLet's dive in.\n\n━━━━━━━━━━━━━━━━━━━━\n💡 This intro hooks readers and promises clear value`,

            'short-desc': `📋 Short Description:\n\n━━━━━━━━━━━━━━━━━━━━\nDiscover the ${emotion} truth about [topic] in this ${tone} breakdown. \n\nPerfect for ${targetRegion === 'global' ? 'anyone' : 'viewers in ' + targetRegion} looking to understand [key concept], this content delivers actionable insights without the fluff. \n\nLearn the essential principles, avoid common pitfalls, and get practical strategies you can implement immediately. \n\nWhether you're just starting or looking to level up, this ${tone} approach will give you the clarity and direction you need. \n\nNo BS, just real value.\n━━━━━━━━━━━━━━━━━━━━\n✓ Concise yet comprehensive\n✓ Action-oriented\n✓ Optimized for engagement`,

            'long-desc': `📄 Long-Form Description:\n\n━━━━━━━━━━━━━━━━━━━━\n🎯 OVERVIEW\n\nThis is your ${tone} guide to mastering [topic]. Drawing from real experience and proven strategies, this content cuts through the noise to deliver what actually matters.\n\n━━━━━━━━━━━━━━━━━━━━\n✨ WHAT YOU'LL LEARN\n\n• The fundamental principles that drive success in [topic]\n• Step-by-step strategies you can implement today\n• Common mistakes that hold most people back\n• Advanced techniques for ${emotion === 'authoritative' ? 'experts' : 'taking your skills to the next level'}\n• Real-world examples and case studies\n\n━━━━━━━━━━━━━━━━━━━━\n💡 WHY THIS MATTERS\n\nIn today's ${targetRegion === 'global' ? 'global' : targetRegion} landscape, understanding [topic] isn't optional—it's essential. This ${tone} approach helps you cut through the complexity and focus on what drives real results.\n\n━━━━━━━━━━━━━━━━━━━━\n🎁 BONUS INSIGHTS\n\nBeyond the core content, you'll discover insider tips and strategies that most people never learn. This is the ${emotion} knowledge that separates beginners from professionals.\n\n━━━━━━━━━━━━━━━━━━━━\n👉 TAKE ACTION NOW\n\nDon't just consume—implement. Use this knowledge to transform your approach to [topic] and see real, measurable results.\n\n${language === 'bangla' ? '\n[Bangla translation would appear here in production]\n' : ''}\n\n━━━━━━━━━━━━━━━━━━━━\n✓ Comprehensive coverage\n✓ Clear structure\n✓ Action-oriented`,

            'ad-copy': `💰 Ad Copy Variations:\n\n━━━━━━━━━━━━━━━━━━━━\nVARIATION 1: ${emotion === 'aggressive' ? 'Problem-Agitate-Solution' : 'Benefit-First'}\n\n"${emotion === 'aggressive' ? 'Still struggling with [problem]?' : 'Imagine finally mastering [topic]...'}\n\n${emotion === 'aggressive' ? 'Most people waste years on outdated methods.' : 'It\'s easier than you think.'}\n\nThis ${tone} guide shows you exactly how to [achieve result] in [timeframe].\n\n✓ Proven strategies\n✓ Step-by-step process\n✓ Real results\n\n👉 Watch Now [CTA]"\n\n━━━━━━━━━━━━━━━━━━━━\nVARIATION 2: Curiosity-Based\n\n"The ${emotion} secret to [topic] that changed everything...\n\nI discovered this by accident, but it transformed my entire approach.\n\nNo complicated theory. No endless tactics.\n\nJust one ${tone} framework that actually works.\n\n👉 See it in action [CTA]"\n\n━━━━━━━━━━━━━━━━━━━━\nVARIATION 3: Authority-Based\n\n"After [X years/experiences] in [niche], here's what I know for sure:\n\n[Bold claim about topic]\n\nThis isn't theory. It's tested, proven, and ready to use.\n\n${tone === 'professional' ? 'Professional-grade insights' : 'Real-world strategies'} for ${targetRegion === 'global' ? 'anyone' : targetRegion} looking to [achieve result].\n\n👉 Get started [CTA]"\n\n━━━━━━━━━━━━━━━━━━━━\n✓ All variants optimized for conversion\n✓ Clear CTAs\n✓ Emotionally resonant`,

            'hooks': `🎣 Attention-Grabbing Hooks:\n\n━━━━━━━━━━━━━━━━━━━━\n1. "${emotion === 'aggressive' ? 'Stop!' : 'Wait...'} Before you [common action], you need to know this..."\n   └─ Pattern interrupt + curiosity gap\n\n2. "I spent [timeframe] learning [topic] so you don't have to"\n   └─ Value proposition + empathy\n\n3. "${emotion === 'inspirational' ? 'The moment everything changed' : 'This is why you\'re struggling with [topic]'}..."\n   └─ Story-based + relatable\n\n4. "97% of people get [topic] wrong. Here's why..."\n   └─ Statistics + contrarian angle\n\n5. "POV: You finally understand [topic] ${tone === 'casual' ? 'like a pro' : 'the right way'}"\n   └─ Aspirational + trendy format\n\n6. "${emotion === 'emotional' ? '❤️' : '🔥'} If you knew this about [topic], you'd never [common mistake] again"\n   └─ Regret aversion + promise\n\n7. "Watch this ${emotion === 'friendly' ? 'if you want to' : 'before it\'s too late'}..."\n   └─ Direct + urgent\n\n━━━━━━━━━━━━━━━━━━━━\n✓ All hooks under 5 seconds\n✓ High retention potential\n✓ Platform-agnostic`,

            'more-same': `🔄 Content Ideas (Same Angle):\n\n━━━━━━━━━━━━━━━━━━━━\n1. "${emotion === 'authoritative' ? 'Deep Dive' : 'Part 2'}: [Specific aspect of topic]"\n   └─ Expand on one key point from original content\n\n2. "[Topic] Mistakes ${tone === 'educational' ? 'Explained' : 'You Must Avoid'}"\n   └─ Problem-focused variation\n\n3. "The ${tone} Checklist for [Topic] Success"\n   └─ Actionable, structured format\n\n4. "[Topic] Tips for ${targetRegion === 'global' ? 'Everyone' : targetRegion + ' Audience'}"\n   └─ Region-specific adaptation\n\n5. "Before & After: ${emotion === 'inspirational' ? 'My' : 'The'} [Topic] Transformation"\n   └─ Results-focused narrative\n\n━━━━━━━━━━━━━━━━━━━━\n✓ Maintains core theme\n✓ Different entry points\n✓ Complementary to original`,

            'more-different': `🎨 Content Ideas (Fresh Angles):\n\n━━━━━━━━━━━━━━━━━━━━\n1. "What [Topic] Taught Me About ${emotion === 'inspirational' ? 'Life' : 'Success'}"\n   └─ Meta-lesson extraction\n\n2. "[Topic] vs [Alternative Approach]: ${tone === 'professional' ? 'Honest' : 'Brutal'} Comparison"\n   └─ Contrarian positioning\n\n3. "The ${emotion} Side of [Topic] Nobody Talks About"\n   └─ Hidden angle reveal\n\n4. "I Tried [Topic] for [Timeframe] - Here's What Happened"\n   └─ Personal experiment narrative\n\n5. "${targetRegion === 'global' ? 'Global' : targetRegion} Trends: The Future of [Topic]"\n   └─ Forward-looking prediction\n\n━━━━━━━━━━━━━━━━━━━━\n✓ Complete perspective shifts\n✓ New audience segments\n✓ Viral potential angles`,

            'improvements': `🎯 Strategic Improvement Suggestions:\n\n━━━━━━━━━━━━━━━━━━━━\n1. STRUCTURE & PACING\n   • Start with a stronger hook in the first 3 seconds\n   • ${tone === 'storytelling' ? 'Incorporate more narrative elements' : 'Add clear section breaks'}\n   • Consider shorter sentences for better retention\n\n2. EMOTIONAL RESONANCE\n   • Amplify the ${emotion} elements throughout\n   • Add personal anecdotes for relatability\n   • Include more ${emotion === 'inspirational' ? 'transformation stories' : 'concrete examples'}\n\n3. PLATFORM OPTIMIZATION\n   • Optimize for ${targetRegion === 'global' ? 'international' : targetRegion + ' specific'} audience preferences\n   • Add platform-specific CTAs\n   • Test different thumbnail approaches\n\n4. ENGAGEMENT TACTICS\n   • Pose questions to encourage comments\n   • Create pause points for reflection\n   • Add interactive elements where possible\n\n5. SEO & DISCOVERABILITY\n   • Include more searchable keywords naturally\n   • Optimize title for both clicks and search\n   • Add relevant hashtags/tags\n\n6. VALUE DELIVERY\n   • Lead with the biggest insight earlier\n   • Provide ${tone === 'educational' ? 'more actionable steps' : 'clearer takeaways'}\n   • Include timestamps or chapters\n\n7. CALL-TO-ACTION\n   • Make CTAs more specific and urgent\n   • Align CTA with ${emotion} positioning\n   • Test multiple CTA placements\n\n━━━━━━━━━━━━━━━━━━━━\n✓ Actionable recommendations\n✓ Prioritized by impact\n✓ Platform-aware`,

            'competitor': `🔍 Competitive Analysis:\n\n━━━━━━━━━━━━━━━━━━━━\n🎯 NICHE LANDSCAPE\n\nBased on [topic], here's what's working in your space:\n\n━━━━━━━━━━━━━━━━━━━━\n📊 TRENDING FORMATS\n• ${tone === 'professional' ? 'Long-form educational content' : 'Short, punchy how-tos'}\n• ${emotion === 'emotional' ? 'Personal story-driven' : 'Data-backed analysis'} approaches\n• ${targetRegion === 'global' ? 'Global' : 'Region-specific'} case studies\n\n━━━━━━━━━━━━━━━━━━━━\n💡 SUCCESSFUL STRATEGIES\n1. Creators who combine ${emotion} storytelling with ${tone} delivery\n2. Content that addresses specific pain points early\n3. Multi-platform repurposing with platform-native adaptations\n4. Community-building through consistent engagement\n\n━━━━━━━━━━━━━━━━━━━━\n🚀 OPPORTUNITIES & GAPS\n\n✓ UNDERSERVED AREAS:\n• ${language === 'bangla' ? 'Bangla-language content in this niche' : 'Intermediate-level deep dives'}\n• Practical implementation guides\n• Behind-the-scenes process content\n\n✓ DIFFERENTIATION ANGLES:\n• Your ${emotion} approach to ${tone} content\n• ${targetRegion}-specific insights and examples\n• Unique perspective from [your background]\n\n━━━━━━━━━━━━━━━━━━━━\n⚠️ COMMON PITFALLS TO AVOID\n• Over-promising without clear value delivery\n• Generic advice without specific examples\n• Inconsistent posting schedule\n• Ignoring community feedback\n\n━━━━━━━━━━━━━━━━━━━━\n🎬 RECOMMENDED NEXT STEPS\n1. Double down on ${tone} content style\n2. Test ${emotion}-driven hooks\n3. Build series/sequences for depth\n4. Engage with niche communities\n5. Collaborate with complementary creators\n\n━━━━━━━━━━━━━━━━━━━━\n✓ Data-informed insights\n✓ Actionable opportunities\n✓ Strategic positioning`
        };

        return templates[tool] || `Generated content for ${tool} would appear here.\n\nThis would be powered by AI APIs like OpenAI, Claude, or similar services in production.`;
    }

    // ============================================
    // OUTPUT MANAGEMENT
    // ============================================

    addOutput(tool, content) {
        const outputsContainer = document.getElementById('outputsContainer');
        const placeholder = document.getElementById('outputPlaceholder');

        // Hide placeholder, show container
        placeholder.style.display = 'none';
        outputsContainer.classList.add('has-outputs');

        // Create output card
        const card = document.createElement('div');
        card.className = 'output-card';
        card.innerHTML = `
            <div class="output-header">
                <h4 class="output-title">${this.getToolName(tool)}</h4>
                <span class="output-timestamp">${this.getTimestamp()}</span>
            </div>
            <div class="output-content">${content}</div>
            <div class="output-actions">
                <button class="btn-copy" onclick="app.copyToClipboard(this)">📋 Copy</button>
            </div>
        `;

        // Insert at the top
        outputsContainer.insertBefore(card, outputsContainer.firstChild);

        // Scroll to output
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    getToolName(tool) {
        const names = {
            'thumbnail': 'Thumbnail Text Copy',
            'seo-title': 'SEO Title',
            'youtube': 'YouTube Content',
            'facebook': 'Facebook Post',
            'twitter': 'Twitter/X Content',
            'instagram': 'Instagram Reels',
            'blog': 'Blog Post',
            'short-desc': 'Short Description',
            'long-desc': 'Long-Form Description',
            'ad-copy': 'Ad Copy',
            'hooks': 'Hooks',
            'more-same': 'Content Ideas (Same Angle)',
            'more-different': 'Content Ideas (Fresh Angles)',
            'improvements': 'Improvement Suggestions',
            'competitor': 'Competitor Analysis'
        };
        return names[tool] || tool;
    }

    getTimestamp() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    setupOutputActions() {
        document.getElementById('clearOutputsBtn').addEventListener('click', () => {
            this.clearOutputs();
        });
    }

    clearOutputs() {
        const outputsContainer = document.getElementById('outputsContainer');
        const placeholder = document.getElementById('outputPlaceholder');

        outputsContainer.innerHTML = '';
        outputsContainer.classList.remove('has-outputs');
        placeholder.style.display = 'block';
    }

    copyToClipboard(button) {
        const card = button.closest('.output-card');
        const content = card.querySelector('.output-content').textContent;

        navigator.clipboard.writeText(content).then(() => {
            button.textContent = '✓ Copied!';
            button.classList.add('copied');

            setTimeout(() => {
                button.textContent = '📋 Copy';
                button.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('Failed to copy. Please try again.');
        });
    }

    // ============================================
    // UTILITIES
    // ============================================

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ============================================
// INITIALIZE APP
// ============================================

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AlphagonApp();
});
