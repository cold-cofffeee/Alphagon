
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

export interface AIScore {
  label: string;
  score: number; // 0-100
}

export interface LogicTrace {
  detectedEmotion: string;
  audienceAssumption: string;
  platformBias: string;
}

export interface ContentVersion {
  id: string;
  body: string;
  scores: AIScore[];
  risks: string[];
  trace: LogicTrace;
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  platform: Platform;
  versions: ContentVersion[];
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

export interface CreditPlan {
  id: string;
  name: string;
  price: string;
  credits: number;
  features: string[];
  recommended?: boolean;
}
