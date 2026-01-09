
import React, { useState } from 'react';
import { 
  Loader2, Copy, Check, ChevronDown, ChevronUp, Share2, 
  Sparkles, AlertTriangle, Info, Download, FileText, 
  Columns, ChevronLeft, ChevronRight, BarChart2
} from 'lucide-react';
import { Platform, ContentVersion, AIScore } from '../types';
import { PLATFORM_ICONS } from '../constants';

interface ModuleCardProps {
  platform: Platform;
  description: string;
  onGenerate: () => Promise<Omit<ContentVersion, 'id' | 'timestamp'>>;
  versions: ContentVersion[];
}

const ModuleCard: React.FC<ModuleCardProps> = ({ platform, description, onGenerate, versions: initialVersions }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [versions, setVersions] = useState<ContentVersion[]>(initialVersions);
  const [currentVersionIdx, setCurrentVersionIdx] = useState(initialVersions.length > 0 ? initialVersions.length - 1 : -1);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showTrace, setShowTrace] = useState(false);

  const currentVersion = versions[currentVersionIdx];

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await onGenerate();
      const newVersion: ContentVersion = {
        ...result,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
      };
      setVersions(prev => [...prev, newVersion]);
      setCurrentVersionIdx(versions.length);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!currentVersion) return;
    navigator.clipboard.writeText(currentVersion.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportContent = (format: 'md' | 'csv' | 'json') => {
    if (!currentVersion) return;
    let data = '';
    let mime = 'text/plain';
    let ext = 'txt';

    if (format === 'md') {
      data = currentVersion.body;
      ext = 'md';
      mime = 'text/markdown';
    } else if (format === 'csv') {
      data = `"Platform","Version","Timestamp","Content"\n"${platform}","${currentVersionIdx + 1}","${new Date(currentVersion.timestamp).toISOString()}","${currentVersion.body.replace(/"/g, '""')}"`;
      ext = 'csv';
      mime = 'text/csv';
    } else {
      data = JSON.stringify(currentVersion, null, 2);
      ext = 'json';
      mime = 'application/json';
    }

    const blob = new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alphagon_${platform}_v${currentVersionIdx + 1}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden transition-all duration-500 hover:border-indigo-500/40 shadow-xl group flex flex-col h-fit">
      <div className="p-6 flex items-center justify-between border-b border-zinc-800/50 bg-zinc-900/50">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-zinc-800 border border-zinc-700/50 rounded-2xl text-indigo-400 shadow-lg">
            {PLATFORM_ICONS[platform] || <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-lg tracking-tight">
              {platform}
            </h3>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {!currentVersion && !isLoading && (
            <div className="text-right mr-2 hidden md:block">
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Est. Cost: 2.5k Tokens</p>
              <p className="text-[9px] text-indigo-400 font-bold uppercase">1 Credit Required</p>
            </div>
          )}
          <button 
            disabled={isLoading}
            onClick={handleGenerate}
            className={`px-5 py-2.5 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest transition-all ${
              currentVersion 
                ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/30'
            }`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (currentVersion ? 'Regenerate' : 'Generate')}
          </button>
        </div>
      </div>
      
      {currentVersion && (
        <div className="p-6 bg-black/30 space-y-4">
          {/* Version Selector & Scores */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div className="flex items-center space-x-2">
              <button 
                disabled={currentVersionIdx === 0}
                onClick={() => setCurrentVersionIdx(v => v - 1)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-500 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Version {currentVersionIdx + 1} of {versions.length}
              </span>
              <button 
                disabled={currentVersionIdx === versions.length - 1}
                onClick={() => setCurrentVersionIdx(v => v + 1)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-500 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {currentVersion.scores.map((score, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-tighter">{score.label}</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${score.score}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-indigo-400">{score.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risks & Content */}
          <div className="space-y-4">
            {currentVersion.risks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentVersion.risks.map((risk, i) => (
                  <div key={i} className="flex items-center space-x-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-[9px] font-bold uppercase tracking-widest">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="relative group/content bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/50">
              <div className="whitespace-pre-wrap text-sm text-zinc-300 leading-relaxed max-h-80 overflow-y-auto pr-4 scrollbar-thin">
                {currentVersion.body}
              </div>
              <div className="absolute top-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={copyToClipboard} className="p-2 bg-zinc-800 rounded-xl text-zinc-400 hover:text-white">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <button 
              onClick={() => setShowTrace(!showTrace)}
              className="flex items-center space-x-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest hover:text-indigo-400 transition-colors"
            >
              <Info className="w-3 h-3" />
              <span>Why this output?</span>
            </button>

            <div className="flex items-center space-x-3">
              <div className="relative group/export">
                <button className="p-2 bg-zinc-800/50 rounded-xl text-zinc-500 hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <div className="absolute bottom-full right-0 mb-2 w-32 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden hidden group-hover/export:block z-20">
                  <button onClick={() => exportContent('md')} className="w-full text-left px-4 py-2 text-[10px] font-bold text-zinc-400 hover:bg-zinc-700 hover:text-white flex items-center space-x-2 border-b border-zinc-700">
                    <FileText className="w-3 h-3" /> <span>Markdown</span>
                  </button>
                  <button onClick={() => exportContent('csv')} className="w-full text-left px-4 py-2 text-[10px] font-bold text-zinc-400 hover:bg-zinc-700 hover:text-white flex items-center space-x-2 border-b border-zinc-700">
                    <Columns className="w-3 h-3" /> <span>CSV</span>
                  </button>
                  <button onClick={() => exportContent('json')} className="w-full text-left px-4 py-2 text-[10px] font-bold text-zinc-400 hover:bg-zinc-700 hover:text-white flex items-center space-x-2">
                    <BarChart2 className="w-3 h-3" /> <span>JSON</span>
                  </button>
                </div>
              </div>
              <button className="p-2 bg-zinc-800/50 rounded-xl text-zinc-500 hover:text-indigo-400 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showTrace && (
            <div className="mt-4 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-3 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest mb-1">Emotion Logic</h4>
                  <p className="text-[11px] text-zinc-400">{currentVersion.trace.detectedEmotion}</p>
                </div>
                <div>
                  <h4 className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest mb-1">Platform Bias</h4>
                  <p className="text-[11px] text-zinc-400">{currentVersion.trace.platformBias}</p>
                </div>
              </div>
              <div>
                <h4 className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest mb-1">Audience Assumption</h4>
                <p className="text-[11px] text-zinc-400">{currentVersion.trace.audienceAssumption}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleCard;
