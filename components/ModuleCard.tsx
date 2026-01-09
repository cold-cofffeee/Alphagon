
import React, { useState } from 'react';
import { Loader2, Copy, Check, ChevronDown, ChevronUp, Share2, Sparkles } from 'lucide-react';
import { Platform } from '../types';
import { PLATFORM_ICONS } from '../constants';

interface ModuleCardProps {
  platform: Platform;
  description: string;
  onGenerate: () => Promise<string>;
  content?: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ platform, description, onGenerate, content: initialContent }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState(initialContent || '');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await onGenerate();
      setContent(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden transition-all duration-500 hover:border-indigo-500/40 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] group flex flex-col h-fit">
      <div className="p-7 flex items-center justify-between border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-zinc-800 border border-zinc-700/50 rounded-2xl text-indigo-400 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all duration-500 group-hover:scale-110 shadow-lg">
            {PLATFORM_ICONS[platform] || <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-lg tracking-tight group-hover:text-indigo-300 transition-colors">
              {platform === 'Shorts' ? 'YouTube Shorts' : (platform === 'Hooks' ? 'Viral Hooks' : platform)}
            </h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {content && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-zinc-600 hover:text-white transition-all bg-zinc-800/50 rounded-xl border border-transparent hover:border-zinc-700"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          )}
          <button 
            disabled={isLoading}
            onClick={handleGenerate}
            className={`px-6 py-2.5 rounded-2xl text-[11px] font-extrabold uppercase tracking-widest transition-all ${
              content 
                ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 border border-indigo-400/20 active:scale-95'
            }`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (content ? 'Regenerate' : 'Generate')}
          </button>
        </div>
      </div>
      
      {isExpanded && content && (
        <div className="p-8 bg-black/40 border-t border-zinc-800/20 relative animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col space-y-4">
             <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Output Transcript</span>
                <div className="flex items-center space-x-2">
                   <button 
                    onClick={copyToClipboard}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-800/80 rounded-xl text-zinc-400 transition-all hover:text-white hover:bg-zinc-700 border border-zinc-700/50"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    <span className="text-[10px] font-bold uppercase tracking-widest">{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
             </div>
             <div className="relative group/content max-h-[500px] overflow-y-auto pr-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                <div className="whitespace-pre-wrap text-sm text-zinc-300 leading-[1.8] font-medium tracking-tight">
                  {content}
                </div>
             </div>
             <div className="pt-6 border-t border-zinc-800/50 mt-4 flex items-center justify-between">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Saved to Alpha History</p>
                <div className="flex space-x-4">
                  <Share2 className="w-4 h-4 text-zinc-700 hover:text-indigo-400 cursor-pointer transition-colors" />
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleCard;
