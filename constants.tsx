
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
  { id: 'YouTube', name: 'YouTube Optimizer', icon: <Youtube />, description: 'SEO titles & Metadata' },
  { id: 'Shorts', name: 'YouTube Shorts', icon: <Video />, description: 'Vertical viral scripts' },
  { id: 'Facebook', name: 'Facebook Post', icon: <Facebook />, description: 'Community engagement copy' },
  { id: 'Twitter', name: 'X / Twitter Thread', icon: <Twitter />, description: 'Viral threads & hooks' },
  { id: 'Instagram', name: 'Instagram Reels', icon: <Instagram />, description: 'Captions & Hashtags' },
  { id: 'Blog', name: 'Blog / Article', icon: <FileText />, description: 'Structured thought leadership' },
  { id: 'Thumbnail', name: 'Thumbnail Copy', icon: <ImageIcon />, description: 'Scroll-stopping overlay text' },
  { id: 'Descriptions', name: 'Descriptions Pack', icon: <AlignLeft />, description: 'Short & Long-form versions' },
  { id: 'AdCopy', name: 'Ad Copy Generator', icon: <Target />, description: 'Conversion-focused sales copy' },
  { id: 'Hooks', name: 'Viral Hooks', icon: <Zap />, description: 'First 5-second retention' },
  { id: 'Growth', name: 'Marketing & Growth', icon: <TrendingUp />, description: 'Improvements & Variations' }
];
