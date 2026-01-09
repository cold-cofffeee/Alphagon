
import React from 'react';
import { 
  Youtube, 
  Twitter, 
  Instagram, 
  Facebook, 
  FileText, 
  Target, 
  Zap,
  Video
} from 'lucide-react';

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
  Shorts: <Video className="w-5 h-5" />
};

export const MODULES = [
  { id: 'youtube', name: 'YouTube Optimizer', icon: <Youtube />, description: 'SEO titles, descriptions, and tags' },
  { id: 'shorts', name: 'YouTube Shorts', icon: <Video />, description: 'Vertical viral video scripts & metadata' },
  { id: 'twitter', name: 'X / Twitter Thread', icon: <Twitter />, description: 'Engagement-focused viral threads' },
  { id: 'instagram', name: 'IG Reels / TikTok', icon: <Instagram />, description: 'Captions and viral hooks' },
  { id: 'blog', name: 'Blog / Article', icon: <FileText />, description: 'Long-form thought leadership' },
  { id: 'adcopy', name: 'Ad Copy Generator', icon: <Target />, description: 'Conversion-focused sales copy' },
  { id: 'hooks', name: 'Hooks & Hooks', icon: <Zap />, description: 'First 5-second retention optimization' }
];
