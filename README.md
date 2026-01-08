# 🎯 Alphagon - Intelligence over volume

**Alphagon** is an AI-powered content intelligence workspace for content creators. Transform a single video or audio file into multiple high-impact, platform-specific content assets with modular, on-demand AI generation.

---

## ✨ Features

### 📥 Media Processing
- **Video & Audio Upload**: Drag-and-drop or browse to upload
- **Automatic Audio Extraction**: Converts video to audio automatically
- **AI Transcription**: Transcribes audio to text for AI processing
- **Editable Transcriptions**: Manually edit transcriptions before generation

### 🎛️ Global Settings
Control how all AI tools generate content:
- **Target Region**: Global or country-specific optimization
- **Emotion**: Emotional, Logical, Inspirational, Aggressive, Friendly, Authoritative
- **Tone**: Casual, Professional, Storytelling, Educational
- **Language**: English, Bangla, or Mixed
- **Creator Preferences**: Custom notes to guide AI style

### 🧠 AI Content Tools

#### Content Generation
- **Thumbnail Text Copy Generator**: Eye-catching thumbnail text
- **SEO Title Generator**: Search-optimized titles

#### Platform-Specific Content
- **YouTube**: Optimized titles, descriptions, timestamps
- **Facebook**: Engagement-driven posts
- **Twitter/X**: Viral-ready tweets under 280 chars
- **Instagram Reels**: Hashtag-rich captions
- **Blog**: Article titles and introductions

#### Descriptions
- **Short Description**: 100-150 word summaries
- **Long-Form Description**: Comprehensive descriptions

#### Marketing
- **Ad Copy Generator**: Conversion-focused ad variations
- **Hooks Generator**: Attention-grabbing opening lines

#### Content Expansion
- **More Ideas (Same Angle)**: Similar content variations
- **More Ideas (Different Angles)**: Fresh perspectives and twists

#### Optimization
- **Improvement Suggestions**: Strategic recommendations
- **Competitor Analysis**: Niche-based competitive insights

---

## 🚀 Getting Started

### Quick Start
1. Open `index.html` in a modern web browser
2. Upload a video or audio file
3. Wait for automatic transcription
4. Configure global settings
5. Click "Generate" on any tool
6. Copy and use the generated content

### File Structure
```
Alphagon/
├── index.html      # Main HTML structure
├── styles.css      # Modern, clean UI styling
├── app.js          # Application logic & AI prompt system
├── prompts.md      # Detailed AI prompt templates
└── README.md       # This file
```

---

## 🔧 Technical Architecture

### Frontend Stack
- **HTML5**: Semantic, accessible structure
- **CSS3**: Modern grid/flexbox layout, responsive design
- **Vanilla JavaScript**: No dependencies, pure ES6+

### AI Integration Points
The application is designed to integrate with AI APIs:
- **Transcription**: OpenAI Whisper, AssemblyAI, Deepgram, Google Speech-to-Text
- **Content Generation**: OpenAI GPT-4, Anthropic Claude, Google Gemini

### Current Implementation
- **Demo Mode**: Generates mock content for testing
- **Production Ready**: Structured for easy API integration

---

## 🎨 Design Philosophy

### UI/UX Principles
- **White Mode**: Clean, professional appearance
- **Three-Panel Layout**: Input → Tools → Output
- **Modular Control**: Each tool triggers independently
- **No Auto-Generation**: User maintains full control
- **Clear Visual Hierarchy**: Important elements stand out
- **Smooth Transitions**: Professional feel without distraction

### Color Palette
- **Primary**: #3b82f6 (Blue)
- **Background**: #f8f9fa (Light Gray)
- **Text**: #1a1a1a (Near Black)
- **Borders**: #e5e7eb (Light Border)
- **Accents**: #6b7280 (Medium Gray)

---

## 🔌 API Integration Guide

### Transcription API Integration

Replace the mock transcription in `app.js`:

```javascript
async transcribeAudio(audioBlob, fileName) {
    // Example: OpenAI Whisper API
    const formData = new FormData();
    formData.append('file', audioBlob);
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer YOUR_API_KEY`
        },
        body: formData
    });

    const data = await response.json();
    return data.text;
}
```

### Content Generation API Integration

Replace the mock generation in `app.js`:

```javascript
async generateAIContent(tool) {
    const prompt = this.buildPrompt(tool);
    
    // Example: OpenAI GPT-4 API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer YOUR_API_KEY`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'You are an expert content creator and marketer.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}
```

---

## 📝 AI Prompt System

Each tool uses a carefully crafted prompt that includes:
1. **Transcription**: The source content
2. **Global Settings**: Region, emotion, tone, language, preferences
3. **Tool-Specific Instructions**: Unique requirements per tool
4. **Quality Guidelines**: Avoid generic content, optimize for platform

See `prompts.md` for complete prompt templates.

---

## 🎯 Use Cases

### For Content Creators
- Repurpose long-form content into platform-specific posts
- Generate SEO-optimized titles and descriptions
- Create engaging thumbnails and hooks
- Expand content ideas efficiently

### For Marketing Teams
- Generate conversion-focused ad copy
- Create platform-specific campaigns
- Analyze competitive landscape
- Optimize content strategy

### For Social Media Managers
- Batch create content variations
- Maintain consistent brand voice
- Optimize for each platform's algorithm
- Save hours of manual writing

---

## 🔒 Privacy & Data

- **No Database**: All processing happens client-side
- **No Authentication**: No user accounts or login required
- **Session-Based**: Data cleared when you close the browser
- **API Integration**: You control which services to use

---

## 🌐 Browser Compatibility

- **Chrome**: 90+ ✅
- **Firefox**: 88+ ✅
- **Safari**: 14+ ✅
- **Edge**: 90+ ✅

Requires modern browser with ES6+ support.

---

## 📱 Responsive Design

- **Desktop-First**: Optimized for content creation workflows
- **Tablet-Friendly**: Adaptive layout for medium screens
- **Mobile-Compatible**: Functional on smaller devices

---

## 🚧 Future Enhancements

### Planned Features
- [ ] Export to multiple formats (PDF, Markdown, JSON)
- [ ] Batch processing for multiple files
- [ ] Custom prompt templates
- [ ] Content calendar integration
- [ ] Team collaboration features
- [ ] Analytics and performance tracking
- [ ] A/B testing for generated content
- [ ] Browser extension for quick access
- [ ] Mobile app versions

---

## 🤝 Contributing

This is a prototype/template project. To customize:

1. **Modify Prompts**: Edit prompt templates in `app.js`
2. **Add Tools**: Create new tool cards in `index.html`
3. **Customize Styling**: Adjust colors and layouts in `styles.css`
4. **Integrate APIs**: Replace mock functions with real API calls

---

## 📄 License

This project is provided as-is for educational and commercial use.

---

## 💡 Pro Tips

### For Best Results
1. **Clean Audio**: Better transcription = better outputs
2. **Detailed Transcriptions**: Edit and enhance transcriptions
3. **Use Creator Notes**: Guide AI with specific preferences
4. **Experiment with Settings**: Try different emotion/tone combinations
5. **Iterate**: Generate multiple times, pick the best

### Performance
- Process shorter audio clips for faster transcription
- Generate outputs one at a time for accuracy
- Clear outputs regularly to keep interface clean

---

## 📞 Support & Documentation

For questions, issues, or feature requests:
- Review the code comments in `app.js`
- Check AI prompt templates in `prompts.md`
- Examine the HTML structure in `index.html`

---

## 🎓 Learning Resources

### Recommended APIs
- **OpenAI**: GPT-4, Whisper (https://openai.com/api)
- **Anthropic**: Claude (https://anthropic.com)
- **AssemblyAI**: Speech-to-text (https://assemblyai.com)
- **Deepgram**: Audio transcription (https://deepgram.com)

### Integration Tutorials
- OpenAI API Documentation
- Fetch API MDN Guide
- FormData for file uploads
- CORS and API security best practices

---

**Built with precision. Designed for creators. Powered by intelligence.**

**Alphagon** - *Intelligence over volume.*
