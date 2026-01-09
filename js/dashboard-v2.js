// ============================================
// ALPHAGON - AI Content Intelligence Platform
// CONFIG-DRIVEN CLIENT (reads from admin panel)
// ============================================

const API_BASE = '/api';
let systemConfig = {};
let availableTools = [];

class AlphagonApp {
  constructor() {
    this.transcription = '';
    this.audioBlob = null;
    this.settings = {
      targetRegion: 'global',
      emotion: 'emotional',
      tone: 'casual',
      language: 'english',
      creatorNotes: '',
    };
    this.token = localStorage.getItem('token');
    this.init();
  }

  async init() {
    // Load system configuration from backend (admin-controlled)
    await this.loadSystemConfig();

    // Check if system is in maintenance mode
    if (systemConfig.maintenance_mode) {
      this.showMaintenanceMode();
      return;
    }

    // Load available tools from backend (admin-controlled)
    await this.loadTools();

    // Setup UI
    this.setupFileUpload();
    this.setupSettingsListeners();
    this.setupOutputActions();
    this.setupTranscriptionEdit();

    // Render tools dynamically
    this.renderTools();
  }

  // ============================================
  // CONFIGURATION LOADING (FROM ADMIN PANEL)
  // ============================================

  async loadSystemConfig() {
    try {
      const response = await fetch(`${API_BASE}/config/settings`);
      if (!response.ok) throw new Error('Failed to load system config');

      systemConfig = await response.json();

      // Apply default settings from admin config
      this.settings.targetRegion = systemConfig.default_region || 'global';
      this.settings.tone = systemConfig.default_tone || 'casual';
      this.settings.language = systemConfig.default_language || 'english';

      console.log('✓ System configuration loaded from admin panel');
    } catch (error) {
      console.error('Failed to load system configuration:', error);
      systemConfig = {}; // Fallback to empty config
    }
  }

  async loadTools() {
    try {
      const response = await fetch(`${API_BASE}/config/tools`);
      if (!response.ok) throw new Error('Failed to load tools');

      availableTools = await response.json();

      console.log(`✓ Loaded ${availableTools.length} tools from admin panel`);
    } catch (error) {
      console.error('Failed to load tools:', error);
      availableTools = []; // Fallback to empty array
    }
  }

  showMaintenanceMode() {
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; padding: 20px;">
        <div>
          <h1 style="font-size: 48px; margin-bottom: 16px;">🔧</h1>
          <h2 style="margin-bottom: 12px;">System Maintenance</h2>
          <p style="color: #666;">We're performing scheduled maintenance. Please check back soon.</p>
        </div>
      </div>
    `;
  }

  // ============================================
  // DYNAMIC TOOL RENDERING
  // ============================================

  renderTools() {
    const toolsContainer = document.querySelector('.tools-grid');
    if (!toolsContainer) {
      console.error('Tools container not found');
      return;
    }

    // Clear existing tools
    toolsContainer.innerHTML = '';

    // Sort tools by display_order
    const sortedTools = [...availableTools].sort((a, b) => a.display_order - b.display_order);

    // Render each tool
    sortedTools.forEach((tool) => {
      const toolCard = this.createToolCard(tool);
      toolsContainer.appendChild(toolCard);
    });

    console.log(`✓ Rendered ${sortedTools.length} tools`);
  }

  createToolCard(tool) {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.innerHTML = `
      <h3>${tool.display_name}</h3>
      <p>${tool.description}</p>
      <button class="btn-generate" data-tool="${tool.tool_name}">
        Generate ${tool.display_name}
      </button>
    `;

    // Add click listener
    const button = card.querySelector('.btn-generate');
    button.addEventListener('click', () => {
      this.generateContent(tool.tool_name, button, tool);
    });

    return card;
  }

  // ============================================
  // FILE UPLOAD & PROCESSING
  // ============================================

  setupFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');

    if (!fileInput || !uploadArea) return;

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
  }

  async handleFile(file) {
    if (!this.validateFile(file)) return;

    // Store audio blob
    this.audioBlob = file;

    // Show transcription section
    const transcriptionSection = document.querySelector('.transcription-section');
    if (transcriptionSection) {
      transcriptionSection.style.display = 'block';
    }

    // Show loading state
    const transcriptionText = document.getElementById('transcriptionText');
    if (transcriptionText) {
      transcriptionText.textContent = 'Transcribing...';
      transcriptionText.style.opacity = '0.5';
    }

    try {
      // Call backend transcription API
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/generate/transcribe`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      this.transcription = data.transcription;

      // Display transcription
      if (transcriptionText) {
        transcriptionText.textContent = this.transcription;
        transcriptionText.style.opacity = '1';
      }

      // Show tools section
      const toolsSection = document.querySelector('.tools-section');
      if (toolsSection) {
        toolsSection.style.display = 'block';
      }

      console.log('✓ Transcription complete');
    } catch (error) {
      console.error('Transcription error:', error);
      if (transcriptionText) {
        transcriptionText.textContent = 'Transcription failed. Please try again.';
        transcriptionText.style.opacity = '1';
      }
      alert('Failed to transcribe file. Please try again.');
    }
  }

  validateFile(file) {
    const maxSize = systemConfig.max_file_size_mb || 10; // Admin-controlled
    const allowedTypes = ['audio/', 'video/'];

    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return false;
    }

    if (!allowedTypes.some((type) => file.type.startsWith(type))) {
      alert('Please upload an audio or video file');
      return false;
    }

    return true;
  }

  // ============================================
  // SETTINGS MANAGEMENT
  // ============================================

  setupSettingsListeners() {
    const settingsInputs = document.querySelectorAll('[data-setting]');
    settingsInputs.forEach((input) => {
      input.addEventListener('change', (e) => {
        const setting = e.target.getAttribute('data-setting');
        this.settings[setting] = e.target.value;
        console.log(`Setting updated: ${setting} = ${e.target.value}`);
      });
    });
  }

  setupTranscriptionEdit() {
    const transcriptionText = document.getElementById('transcriptionText');
    if (transcriptionText) {
      transcriptionText.addEventListener('input', (e) => {
        this.transcription = e.target.textContent;
      });
    }
  }

  // ============================================
  // CONTENT GENERATION (BACKEND CALL)
  // ============================================

  async generateContent(toolName, button, toolConfig) {
    if (!this.transcription) {
      alert('Please upload and transcribe a video or audio file first.');
      return;
    }

    // Check if AI generation is enabled (admin-controlled)
    if (!systemConfig.ai_generation_enabled) {
      alert('AI generation is temporarily disabled. Please try again later.');
      return;
    }

    // Check rate limits (admin-controlled)
    if (toolConfig.rate_limit_per_hour && !this.checkRateLimit(toolName, toolConfig)) {
      alert(
        `Rate limit reached. This tool is limited to ${toolConfig.rate_limit_per_hour} generations per hour.`
      );
      return;
    }

    // Disable button and show loading
    button.disabled = true;
    button.classList.add('loading');
    const originalText = button.textContent;
    button.textContent = 'Generating...';

    try {
      const response = await fetch(`${API_BASE}/generate/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          tool_name: toolName,
          transcription: this.transcription,
          settings: this.settings,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }

      const data = await response.json();

      // Display output
      this.addOutput(toolName, toolConfig.display_name, data.generated_content, data.cached);

      // Update rate limit tracker
      this.trackRateLimit(toolName);

      console.log(`✓ Generated content for ${toolName}${data.cached ? ' (cached)' : ''}`);
    } catch (error) {
      console.error('Generation error:', error);
      alert(error.message || 'An error occurred during generation. Please try again.');
    } finally {
      // Re-enable button
      button.disabled = false;
      button.classList.remove('loading');
      button.textContent = originalText;
    }
  }

  checkRateLimit(toolName, toolConfig) {
    const rateLimits = JSON.parse(localStorage.getItem('rateLimits') || '{}');
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;

    if (!rateLimits[toolName]) {
      return true;
    }

    // Remove old entries
    rateLimits[toolName] = rateLimits[toolName].filter((timestamp) => timestamp > hourAgo);

    // Check if under limit
    return rateLimits[toolName].length < toolConfig.rate_limit_per_hour;
  }

  trackRateLimit(toolName) {
    const rateLimits = JSON.parse(localStorage.getItem('rateLimits') || '{}');
    if (!rateLimits[toolName]) {
      rateLimits[toolName] = [];
    }
    rateLimits[toolName].push(Date.now());
    localStorage.setItem('rateLimits', JSON.stringify(rateLimits));
  }

  // ============================================
  // OUTPUT DISPLAY
  // ============================================

  addOutput(toolName, toolDisplayName, content, cached = false) {
    const outputSection = document.querySelector('.output-section');
    if (!outputSection) return;

    outputSection.style.display = 'block';

    const outputContainer = document.getElementById('outputContainer');
    if (!outputContainer) return;

    const outputCard = document.createElement('div');
    outputCard.className = 'output-card';
    outputCard.innerHTML = `
      <div class="output-header">
        <h3>${toolDisplayName}</h3>
        <div class="output-actions">
          ${cached ? '<span class="badge cached">Cached</span>' : ''}
          <button class="btn-icon" onclick="copyToClipboard(this)" title="Copy">📋</button>
          <button class="btn-icon" onclick="downloadText(this)" title="Download">⬇️</button>
          <button class="btn-icon" onclick="deleteOutput(this)" title="Delete">🗑️</button>
        </div>
      </div>
      <div class="output-content" contenteditable="true">${content}</div>
      <div class="output-footer">
        <small>Generated ${new Date().toLocaleTimeString()}</small>
      </div>
    `;

    outputContainer.insertBefore(outputCard, outputContainer.firstChild);
  }

  setupOutputActions() {
    // These are global functions called from the output card buttons
    window.copyToClipboard = (button) => {
      const content = button.closest('.output-card').querySelector('.output-content').textContent;
      navigator.clipboard.writeText(content);
      button.textContent = '✓';
      setTimeout(() => {
        button.textContent = '📋';
      }, 2000);
    };

    window.downloadText = (button) => {
      const card = button.closest('.output-card');
      const toolName = card.querySelector('h3').textContent;
      const content = card.querySelector('.output-content').textContent;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${toolName}-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    };

    window.deleteOutput = (button) => {
      if (confirm('Delete this output?')) {
        button.closest('.output-card').remove();
      }
    };
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AlphagonApp();
});
