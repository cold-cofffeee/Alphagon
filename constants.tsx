
import React from 'react';
import { 
  Youtube, 
  Twitter, 
  Instagram, 
  Facebook, 
  FileText, 
  Target, 
  Zap,
  Video,
  Image as ImageIcon,
  AlignLeft,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { CreditPlan } from './types';

export const EMOTIONS = [
  'Logical', 'Emotional', 'Bold', 'Friendly', 'Authoritative', 'Humorous', 'Empathetic', 'Provocative'
];

export const TONES = [
  'Casual', 'Professional', 'Storytelling', 'Educational', 'Corporate', 'Hype', 'Inspirational'
];

export const REGIONS = [
  'Global', 'United States', 'United Kingdom', 'India', 'European Union', 'Southeast Asia', 'Latin America'
];

export const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Chinese', 'Portuguese'
];

export const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  YouTube: <Youtube className="w-5 h-5" />,
  Facebook: <Facebook className="w-5 h-5" />,
  Twitter: <Twitter className="w-5 h-5" />,
  Instagram: <Instagram className="w-5 h-5" />,
  Blog: <FileText className="w-5 h-5" />,
  AdCopy: <Target className="w-5 h-5" />,
  Hooks: <Zap className="w-5 h-5" />,
  Shorts: <Video className="w-5 h-5" />,
  Thumbnail: <ImageIcon className="w-5 h-5" />,
  Descriptions: <AlignLeft className="w-5 h-5" />,
  Growth: <TrendingUp className="w-5 h-5" />
};

export const MODULES = [
  { id: 'YouTube', name: 'YouTube Optimizer', icon: <Youtube />, description: 'SEO titles & Metadata', creditCost: 3 },
  { id: 'Shorts', name: 'YouTube Shorts', icon: <Video />, description: 'Vertical viral scripts', creditCost: 3 },
  { id: 'Facebook', name: 'Facebook Post', icon: <Facebook />, description: 'Community engagement copy', creditCost: 3 },
  { id: 'Twitter', name: 'X / Twitter Thread', icon: <Twitter />, description: 'Viral threads & hooks', creditCost: 3 },
  { id: 'Instagram', name: 'Instagram Reels', icon: <Instagram />, description: 'Captions & Hashtags', creditCost: 3 },
  { id: 'Blog', name: 'Blog / Article', icon: <FileText />, description: 'Structured thought leadership', creditCost: 5 },
  { id: 'Thumbnail', name: 'Thumbnail Copy', icon: <ImageIcon />, description: 'Scroll-stopping overlay text', creditCost: 2 },
  { id: 'Descriptions', name: 'Descriptions Pack', icon: <AlignLeft />, description: 'Short & Long-form versions', creditCost: 2 },
  { id: 'AdCopy', name: 'Ad Copy Generator', icon: <Target />, description: 'Conversion-focused sales copy', creditCost: 5 },
  { id: 'Hooks', name: 'Viral Hooks', icon: <Zap />, description: 'First 5-second retention', creditCost: 2 },
  { id: 'Growth', name: 'Marketing & Growth', icon: <TrendingUp />, description: 'Improvements & Variations', creditCost: 5 }
];

export const PRICING_PLANS: CreditPlan[] = [
  {
    id: 'solo',
    name: 'Solo Creator',
    price: '$29',
    credits: 500,
    features: ['Version History Vault', 'Logic Trace Visibility', 'Priority Flash Models']
  },
  {
    id: 'power',
    name: 'Power User',
    price: '$79',
    credits: 2500,
    features: ['Unlimited Vault Storage', 'Bulk Export (CSV/JSON)', 'Early Access to Veo Video'],
    recommended: true
  },
  {
    id: 'team',
    name: 'Team / Agency',
    price: '$199',
    credits: 10000,
    features: ['Shared Credit Pool', 'Team Collaboration Workspaces', 'API Access Keys']
  }
];
