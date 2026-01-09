
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

export type UserRole = 'Admin' | 'Support' | 'User';
export type UserStatus = 'Active' | 'Suspended' | 'Banned';

export interface UserAccount {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  credits: number;
  tokensConsumed: number;
  lastActive: number;
}

export interface AIModuleConfig {
  id: Platform;
  isEnabled: boolean;
  model: 'gemini-3-pro-preview' | 'gemini-3-flash-preview';
  systemPrompt: string;
  creditCost: number;
  safetyThreshold: number;
}

export interface SystemLog {
  id: string;
  timestamp: number;
  level: 'INFO' | 'WARNING' | 'ERROR';
  event: string;
  user?: string;
}

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
  score: number;
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
