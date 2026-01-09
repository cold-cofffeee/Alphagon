
export type Platform = 
  | 'YouTube' 
  | 'Facebook' 
  | 'Twitter' 
  | 'Instagram' 
  | 'Blog' 
  | 'AdCopy' 
  | 'Hooks' 
  | 'Shorts' 
  | 'Thumbnail' 
  | 'Descriptions' 
  | 'Growth';

export interface ContentAnalysis {
  transcript: string;
  summary: string;
  intent: string;
  keywords: string[];
  topics: string[];
}

export interface GenerationSettings {
  emotion: string;
  tone: string;
  language: string;
  region: string;
  targetAudience: string;
}

export interface HistoryItem {
  id: string;
  platform: Platform;
  content: string;
  timestamp: number;
  sourceTopic: string;
}

export interface Insight {
  niche: string;
  competitorStrategy: string;
  gaps: string[];
  opportunities: string[];
  differentiationIdeas: string[];
}
