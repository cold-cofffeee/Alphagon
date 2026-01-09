
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Settings2, 
  BarChart3, 
  Zap, 
  MousePointer2,
  Clock,
  History,
  Mic,
  Trash2,
  Loader2,
  CheckCircle2,
  Lightbulb,
  Search
} from 'lucide-react';
import FileUpload from './components/FileUpload';
import ModuleCard from './components/ModuleCard';
import { analyzeMedia, generatePlatformContent, generateInsights, parseVoiceSettings } from './services/geminiService';
import { ContentAnalysis, GenerationSettings, Insight, Platform, HistoryItem } from './types';
import { EMOTIONS, TONES, REGIONS, LANGUAGES, MODULES } from './constants';

const App: React.FC = () => {
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [insights, setInsights] = useState<Insight | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('alphagon_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [view, setView] = useState<'workspace' | 'history'>('workspace');
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [settings, setSettings] = useState<GenerationSettings>({
    emotion: 'Logical',
    tone: 'Professional',
    language: 'English',
    region: 'Global',
    targetAudience: 'General Creators'
  });

  useEffect(() => {
    localStorage.setItem('alphagon_history', JSON.stringify(history));
  }, [history]);

  const handleMediaUpload = async (base64: string, mimeType: string) => {
    setIsProcessing(true);
    try {
      const result = await analyzeMedia(base64, mimeType);
      setAnalysis(result);
      const insightResult = await generateInsights(result);
      setInsights(insightResult);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          setIsVoiceProcessing(true);
          const updates = await parseVoiceSettings(base64);
          setSettings(prev => ({ ...prev, ...updates }));
          setIsVoiceProcessing(false);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleGenerate = async (platform: Platform) => {
    if (!analysis) return "";
    const content = await generatePlatformContent(platform, analysis, settings);
    
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      platform,
      content,
      timestamp: Date.now(),
      sourceTopic: analysis.topics[0] || 'Unstructured Content'
    };
    setHistory(prev => [newItem, ...prev]);
    return content;
  };

  const clearHistory = () => {
    if (confirm('Clear all generation history?')) setHistory([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] selection:bg-indigo-500/30">
      <header className="sticky top-0 z-50 bg-[#000000]/90 backdrop-blur-2xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('workspace')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 border border-indigo-400/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight text-white">Alphagon</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold -mt-1">Intelligence over volume</p>
            </div>
          </div>
          <nav className="flex items-center space-x-1">
            <button onClick={() => setView('workspace')} className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'workspace' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Workspace</button>
            <button onClick={() => setView('history')} className={`px-4 py-2 text-sm font-medium transition-colors flex items-center space-x-2 ${view === 'history' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <span>History</span>
              {history.length > 0 && <span className="bg-indigo-600 text-[10px] px-1.5 py-0.5 rounded-full text-white min-w-[1.2rem] text-center">{history.length}</span>}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {view === 'history' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-display font-bold text-white">History</h2>
                <p className="text-zinc-500 mt-1">Archived intelligence outputs.</p>
              </div>
              <button onClick={clearHistory} className="flex items-center space-x-2 text-zinc-500 hover:text-red-400 transition-colors text-sm font-medium px-4 py-2 hover:bg-red-500/10 rounded-lg">
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>
            {history.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20 text-zinc-600 font-bold uppercase tracking-widest text-xs">No generations found</div>
            ) : (
              <div className="grid gap-4">
                {history.map((item) => (
                  <div key={item.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">{item.platform}</span>
                        <h4 className="text-sm font-semibold text-zinc-200">{item.sourceTopic}</h4>
                      </div>
                      <span className="text-[10px] text-zinc-600">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="bg-black/40 rounded-xl p-4 text-sm text-zinc-400 whitespace-pre-wrap max-h-48 overflow-y-auto border border-zinc-800/50">{item.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : !analysis ? (
          <div className="flex flex-col items-center justify-center min-h-[75vh] space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center space-y-6 max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
                <Zap className="w-3 h-3 text-indigo-400" />
                <span>Creator Intelligence Layer</span>
              </div>
              <h2 className="text-6xl md:text-7xl font-display font-bold text-white tracking-tight leading-[1.1]">
                Build Less. <span className="text-transparent bg-clip-text bg-gradient-to-tr from-indigo-500 via-indigo-400 to-cyan-300">Think Sharper.</span>
              </h2>
              <p className="text-xl text-zinc-500 leading-relaxed max-w-2xl mx-auto">
                Total precision. One upload. Complete platform dominance. Generated only when you need it.
              </p>
            </div>
            <FileUpload onFileSelect={handleMediaUpload} isProcessing={isProcessing} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in zoom-in-95 duration-500">
            <aside className="lg:col-span-3 space-y-8">
              <section className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-7 space-y-8 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <Settings2 className="w-5 h-5" />
                    <h3 className="font-display font-bold text-lg uppercase tracking-tight">Custom Control</h3>
                  </div>
                  <button onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording} className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-800 text-zinc-400 hover:text-indigo-400'}`}>
                    {isRecording ? <Mic className="w-5 h-5" /> : (isVoiceProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />)}
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-extrabold mb-3 block">Emotion Profile</label>
                    <div className="grid grid-cols-2 gap-2">
                      {EMOTIONS.map(e => (
                        <button key={e} onClick={() => setSettings(s => ({...s, emotion: e}))} className={`px-3 py-2 text-[11px] font-bold rounded-xl border transition-all ${settings.emotion === e ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-500'}`}>{e}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-extrabold block">Tone & Language</label>
                    <select value={settings.tone} onChange={e => setSettings(s => ({...s, tone: e.target.value}))} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none appearance-none cursor-pointer">
                      {TONES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <select value={settings.language} onChange={e => setSettings(s => ({...s, language: e.target.value}))} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none appearance-none cursor-pointer">
                      {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                    </select>
                    <select value={settings.region} onChange={e => setSettings(s => ({...s, region: e.target.value}))} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none appearance-none cursor-pointer">
                      {REGIONS.map(r => <option key={r}>{r}</option>)}
                    </select>
                    <input type="text" value={settings.targetAudience} onChange={e => setSettings(s => ({...s, targetAudience: e.target.value}))} placeholder="Target Persona" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none" />
                  </div>
                </div>
              </section>

              {insights && (
                <div className="space-y-6">
                  <section className="bg-indigo-950/20 border border-indigo-500/30 rounded-3xl p-7 space-y-4 shadow-xl">
                    <div className="flex items-center space-x-2 text-indigo-400">
                      <Search className="w-5 h-5" />
                      <h3 className="font-display font-bold text-lg uppercase tracking-tight">Competitor Analysis</h3>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{insights.competitorStrategy}</p>
                  </section>
                  
                  <section className="bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-7 space-y-4 shadow-xl">
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <Lightbulb className="w-5 h-5" />
                      <h3 className="font-display font-bold text-lg uppercase tracking-tight">Market Gaps</h3>
                    </div>
                    <ul className="space-y-2">
                      {insights.gaps.map((gap, i) => (
                        <li key={i} className="text-[11px] text-zinc-400 flex items-start space-x-2">
                          <span className="w-1 h-1 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              )}
            </aside>

            <div className="lg:col-span-9 space-y-10">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
                <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center space-x-2 text-zinc-500 text-[11px] font-bold uppercase tracking-[0.2em]">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>Context Mapped</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">{analysis.topics[0] || 'Unstructured Context'}</h2>
                    <p className="text-zinc-400 text-lg leading-relaxed italic border-l-4 border-indigo-500/30 pl-6">"{analysis.summary}"</p>
                    <div className="flex flex-wrap gap-2.5 pt-4">
                      {analysis.keywords.map((kw, i) => <span key={i} className="px-4 py-1.5 bg-zinc-800 border border-zinc-700/50 rounded-full text-[11px] font-bold text-zinc-300 uppercase tracking-tight">#{kw.replace(/\s+/g, '')}</span>)}
                    </div>
                  </div>
                  <button onClick={() => setAnalysis(null)} className="group text-xs text-zinc-600 hover:text-white transition-colors flex items-center space-x-2 bg-black/40 px-4 py-2 rounded-full border border-zinc-800/50">
                    <Clock className="w-4 h-4" />
                    <span className="font-bold uppercase tracking-widest">New</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-display font-bold text-zinc-400 uppercase tracking-[0.2em]">Execution Modules</h3>
                  <div className="h-px flex-1 bg-zinc-800 mx-6 opacity-30" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {MODULES.map(module => (
                    <ModuleCard 
                      key={module.id} 
                      platform={module.id as Platform} 
                      description={module.description} 
                      onGenerate={() => handleGenerate(module.id as Platform)} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
