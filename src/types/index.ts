// ============================================
// TYPE DEFINITIONS FOR ALPHAGON
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
  default_emotion: EmotionType;
  default_tone: ToneType;
  default_language: LanguageType;
  default_region: string;
  ui_density: 'compact' | 'comfortable' | 'spacious';
  total_projects: number;
  total_generations: number;
  last_active_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  original_filename: string | null;
  file_type: 'video' | 'audio' | null;
  file_size: number | null;
  duration: number | null;
  transcription: string | null;
  transcription_language: string | null;
  emotion: EmotionType | null;
  tone: ToneType | null;
  language: LanguageType | null;
  target_region: string | null;
  creator_notes: string | null;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  status: 'active' | 'archived' | 'deleted';
}

export interface AIGeneration {
  id: string;
  user_id: string;
  project_id: string;
  tool_name: string;
  tool_label: string;
  input_hash: string;
  emotion: EmotionType;
  tone: ToneType;
  language: LanguageType;
  target_region: string;
  creator_notes: string | null;
  generated_content: string;
  model_used: string;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  generation_time_ms: number | null;
  was_cached: boolean;
  created_at: string;
  user_rating: number | null;
  user_feedback: string | null;
}

export interface ErrorLog {
  id: string;
  user_id: string | null;
  project_id: string | null;
  error_type: string;
  error_message: string;
  error_stack: string | null;
  endpoint: string | null;
  tool_name: string | null;
  request_data: any;
  created_at: string;
  resolved: boolean;
  resolved_at: string | null;
  resolution_notes: string | null;
}

export interface UsageStats {
  id: string;
  user_id: string;
  stat_date: string;
  projects_created: number;
  generations_count: number;
  tokens_used: number;
  cache_hits: number;
  cache_misses: number;
  tool_usage: Record<string, number>;
  created_at: string;
  updated_at: string;
}

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type EmotionType =
  | 'emotional'
  | 'logical'
  | 'inspirational'
  | 'aggressive'
  | 'friendly'
  | 'authoritative';

export type ToneType =
  | 'casual'
  | 'professional'
  | 'storytelling'
  | 'educational';

export type LanguageType =
  | 'english'
  | 'bangla'
  | 'mixed';

export type ToolName =
  | 'thumbnail'
  | 'seo-title'
  | 'youtube'
  | 'facebook'
  | 'twitter'
  | 'instagram'
  | 'blog'
  | 'short-desc'
  | 'long-desc'
  | 'ad-copy'
  | 'hooks'
  | 'more-same'
  | 'more-different'
  | 'improvements'
  | 'competitor';

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

export interface GenerateContentRequest {
  projectId: string;
  toolName: ToolName;
  emotion?: EmotionType;
  tone?: ToneType;
  language?: LanguageType;
  targetRegion?: string;
  creatorNotes?: string;
}

export interface GenerateContentResponse {
  success: boolean;
  data?: {
    id: string;
    content: string;
    wasCached: boolean;
    tokensUsed: number;
    generationTime: number;
  };
  error?: string;
}

export interface TranscribeRequest {
  projectId: string;
  audioData: string; // base64 or file path
}

export interface TranscribeResponse {
  success: boolean;
  data?: {
    transcription: string;
    language: string;
  };
  error?: string;
}

export interface CreateProjectRequest {
  title?: string;
  description?: string;
  originalFilename?: string;
  fileType?: string;
  fileSize?: number;
  transcription?: string;
  transcriptionLanguage?: string;
  emotion?: EmotionType;
  tone?: ToneType;
  language?: LanguageType;
  targetRegion?: string;
  creatorNotes?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  transcription?: string;
  emotion?: EmotionType;
  tone?: ToneType;
  language?: LanguageType;
  targetRegion?: string;
  creatorNotes?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: UserProfile;
    session: any;
  };
  error?: string;
}

// ============================================
// AI SERVICE TYPES
// ============================================

export interface AIPromptContext {
  transcription: string;
  emotion: EmotionType;
  tone: ToneType;
  language: LanguageType;
  targetRegion: string;
  creatorNotes?: string;
  toolName: ToolName;
}

export interface AIGenerationResult {
  content: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  generationTime: number;
  modelUsed: string;
}

// ============================================
// TOOL CONFIGURATION
// ============================================

export interface ToolConfig {
  name: ToolName;
  label: string;
  description: string;
  category: 'generation' | 'platform' | 'description' | 'marketing' | 'expansion' | 'optimization';
  promptTemplate: string;
}

export const TOOLS: ToolConfig[] = [
  // Content Generation
  {
    name: 'thumbnail',
    label: 'Thumbnail Text Copy',
    description: 'Eye-catching text for video thumbnails',
    category: 'generation',
    promptTemplate: 'thumbnail'
  },
  {
    name: 'seo-title',
    label: 'SEO Title',
    description: 'Search-optimized titles that rank',
    category: 'generation',
    promptTemplate: 'seo-title'
  },
  // Platform-Specific
  {
    name: 'youtube',
    label: 'YouTube Content',
    description: 'Optimized title & description',
    category: 'platform',
    promptTemplate: 'youtube'
  },
  {
    name: 'facebook',
    label: 'Facebook Post',
    description: 'Engagement-driven content',
    category: 'platform',
    promptTemplate: 'facebook'
  },
  {
    name: 'twitter',
    label: 'Twitter/X Content',
    description: 'Viral-ready tweets',
    category: 'platform',
    promptTemplate: 'twitter'
  },
  {
    name: 'instagram',
    label: 'Instagram Reels',
    description: 'Hashtag-rich captions',
    category: 'platform',
    promptTemplate: 'instagram'
  },
  {
    name: 'blog',
    label: 'Blog Post',
    description: 'Article title & introduction',
    category: 'platform',
    promptTemplate: 'blog'
  },
  // Descriptions
  {
    name: 'short-desc',
    label: 'Short Description',
    description: '100-150 word summaries',
    category: 'description',
    promptTemplate: 'short-desc'
  },
  {
    name: 'long-desc',
    label: 'Long-Form Description',
    description: 'Comprehensive descriptions',
    category: 'description',
    promptTemplate: 'long-desc'
  },
  // Marketing
  {
    name: 'ad-copy',
    label: 'Ad Copy',
    description: 'Conversion-focused ads',
    category: 'marketing',
    promptTemplate: 'ad-copy'
  },
  {
    name: 'hooks',
    label: 'Hooks',
    description: 'Attention-grabbing openers',
    category: 'marketing',
    promptTemplate: 'hooks'
  },
  // Expansion
  {
    name: 'more-same',
    label: 'More Content Ideas (Same Angle)',
    description: 'Similar content variations',
    category: 'expansion',
    promptTemplate: 'more-same'
  },
  {
    name: 'more-different',
    label: 'More Content Ideas (Fresh Angles)',
    description: 'New perspectives',
    category: 'expansion',
    promptTemplate: 'more-different'
  },
  // Optimization
  {
    name: 'improvements',
    label: 'Improvement Suggestions',
    description: 'Strategic recommendations',
    category: 'optimization',
    promptTemplate: 'improvements'
  },
  {
    name: 'competitor',
    label: 'Competitor Analysis',
    description: 'Niche-based insights',
    category: 'optimization',
    promptTemplate: 'competitor'
  }
];
