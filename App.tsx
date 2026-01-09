
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sparkles, 
  Settings2, 
  BarChart3, 
  Zap, 
  Clock,
  Mic,
  Trash2,
  Loader2,
  Database,
  Coins,
  Plus,
  ShieldCheck,
  Users,
  Cpu,
  Activity,
  CreditCard,
  Settings,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  Download,
  Filter,
  Eye,
  History,
  Lock,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import FileUpload from './components/FileUpload';
import ModuleCard from './components/ModuleCard';
import CreditModal from './components/CreditModal';
import { analyzeMedia, generatePlatformContent, generateInsights, parseVoiceSettings } from './services/geminiService';
import { 
  ContentAnalysis, 
  GenerationSettings, 
  Insight, 
  Platform, 
  HistoryItem, 
  ContentVersion,
  UserAccount,
  AIModuleConfig,
  SystemLog,
  AuditLog,
  AuditAction
} from './types';
import { EMOTIONS, TONES, REGIONS, LANGUAGES, MODULES, PLATFORM_ICONS } from './constants';

const App: React.FC = () => {
  // --- View State ---
  const [view, setView] = useState<'workspace' | 'history' | 'admin'>('workspace');
  const [adminSection, setAdminSection] = useState<'dashboard' | 'users' | 'ai' | 'logs' | 'audit'>('dashboard');

  // --- Workspace State ---
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [insights, setInsights] = useState<Insight | null>(null);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [credits, setCredits] = useState<number>(() => {
    const saved = localStorage.getItem('alphagon_credits');
    return saved ? parseInt(saved) : 20;
  });
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('alphagon_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [settings, setSettings] = useState<GenerationSettings>({
    emotion: 'Logical',
    tone: 'Professional',
    language: 'English',
    region: 'Global',
    targetAudience: 'General Creators'
  });

  // --- Admin State ---
  const [adminUsers, setAdminUsers] = useState<UserAccount[]>([
    { id: '1', email: 'founder@alphagon.ai', role: 'Admin', status: 'Active', credits: 12450, tokensConsumed: 120500, lastActive: Date.now() },
    { id: '2', email: 'creator_x@gmail.com', role: 'User', status: 'Active', credits: 450, tokensConsumed: 8400, lastActive: Date.now() - 1000 * 60 * 60 },
    { id: '3', email: 'bot_suspicious@spam.com', role: 'User', status: 'Suspended', credits: 2, tokensConsumed: 50, lastActive: Date.now() - 1000 * 60 * 60 * 24 },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'aud_1',
      timestamp: Date.now() - 1000 * 60 * 15,
      actor: { id: 'adm_1', email: 'founder@alphagon.ai', role: 'Admin' },
      action: 'AI_MODEL_CHANGE',
      entity: { type: 'AI_MODULE', id: 'AdCopy' },
      context: { before: 'flash-lite', after: 'pro-preview', reason: 'User requested higher precision for conversions' }
    },
    {
      id: 'aud_2',
      timestamp: Date.now() - 1000 * 60 * 60 * 2,
      actor: { id: 'adm_1', email: 'founder@alphagon.ai', role: 'Admin' },
      action: 'CREDIT_GRANT',
      entity: { type: 'USER', id: '2' },
      context: { before: 400, after: 450, reason: 'Manual grant for promotional support' }
    },
    {
      id: 'aud_3',
      timestamp: Date.now() - 1000 * 60 * 60 * 24,
      actor: { id: 'sys_auto', email: 'security@alphagon.ai', role: 'Admin' },
      action: 'USER_SUSPEND',
      entity: { type: 'USER', id: '3' },
      context: { reason: 'Automated flagging for multi-account abuse patterns' }
    }
  ]);

  const [aiConfigs, setAiConfigs] = useState<AIModuleConfig[]>(
    MODULES.map(m => ({
      id: m.id as Platform,
      isEnabled: true,
      model: m.id === 'Blog' || m.id === 'AdCopy' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
      systemPrompt: `Act as a world-class ${m.name} expert...`,
      creditCost: m.creditCost,
      safetyThreshold: 85
    }))
  );

  const [logs, setLogs] = useState<SystemLog[]>([
    { id: 'l1', timestamp: Date.now(), level: 'INFO', event: 'System heartbeat: All modules active', user: 'SYSTEM' },
    { id: 'l2', timestamp: Date.now() - 5000, level: 'WARNING', event: 'Rate limit approaching for user creator_x', user: 'creator_x@gmail.com' },
    { id: 'l3', timestamp: Date.now() - 15000, level: 'ERROR', event: 'Failed to process job #4451: API Timeout', user: 'SYSTEM' },
  ]);

  // --- Search & Filter for Audit ---
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState<AuditLog['entity']['type'] | 'ALL'>('ALL');
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = 
        log.actor.email.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.entity.id.toLowerCase().includes(auditSearch.toLowerCase());
      const matchesType = auditFilter === 'ALL' || log.entity.type === auditFilter;
      return matchesSearch && matchesType;
    });
  }, [auditLogs, auditSearch, auditFilter]);

  // --- Audio Logic ---
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('alphagon_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('alphagon_credits', credits.toString());
  }, [credits]);

  // --- Handlers ---
  const handleMediaUpload = async (base64: string, mimeType: string) => {
    setIsProcessing(true);
    try {
      const result = await analyzeMedia(base64, mimeType);
      setAnalysis(result);
      const insightResult = await generateInsights(result);
      setInsights(insightResult);
    } catch (error) { console.error("Analysis failed:", error); }
    finally { setIsProcessing(false); }
  };

  const handleSelectCredits = (amount: number) => {
    setCredits(prev => prev + amount);
    setIsCreditModalOpen(false);
  };

  const handleGenerate = async (platform: Platform): Promise<Omit<ContentVersion, 'id' | 'timestamp'>> => {
    if (!analysis) throw new Error("No analysis");
    const moduleInfo = MODULES.find(m => m.id === platform);
    const cost = moduleInfo?.creditCost || 1;
    if (credits < cost) {
      setIsCreditModalOpen(true);
      throw new Error("Insufficient credits");
    }
    const result = await generatePlatformContent(platform, analysis, settings);
    setCredits(prev => prev - cost);
    const newVersion: ContentVersion = {
      ...result,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    setHistory(prev => {
      const existing = prev.find(item => item.platform === platform && item.sourceTopic === (analysis.topics[0] || 'Media Source'));
      if (existing) {
        return prev.map(item => item.id === existing.id ? { ...item, versions: [...item.versions, newVersion] } : item);
      }
      return [{ id: Math.random().toString(36).substr(2, 9), platform, versions: [newVersion], timestamp: Date.now(), sourceTopic: analysis.topics[0] || 'Media Source' }, ...prev];
    });
    return result;
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
    } catch (err) { console.error("Mic error:", err); }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setIsRecording(false); };

  // --- Admin Components ---
  const AdminSidebar = () => (
    <div className="w-64 bg-zinc-900/50 border-r border-zinc-800 p-6 flex flex-col h-full sticky top-20">
      <div className="space-y-1">
        <button onClick={() => setAdminSection('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${adminSection === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
          <BarChart3 className="w-4 h-4" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest">Command</span>
        </button>
        <button onClick={() => setAdminSection('users')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${adminSection === 'users' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
          <Users className="w-4 h-4" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest">Directory</span>
        </button>
        <button onClick={() => setAdminSection('ai')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${adminSection === 'ai' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
          <Cpu className="w-4 h-4" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest">AI Systems</span>
        </button>
        <button onClick={() => setAdminSection('logs')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${adminSection === 'logs' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
          <Activity className="w-4 h-4" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest">Logs</span>
        </button>
        <button onClick={() => setAdminSection('audit')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${adminSection === 'audit' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
          <History className="w-4 h-4" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest">Audit Vault</span>
        </button>
      </div>
      <div className="mt-auto border-t border-zinc-800 pt-6">
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700/50">
          <p className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest mb-2 flex items-center space-x-2">
            <Lock className="w-3 h-3" />
            <span>Secure Admin</span>
          </p>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[11px] text-white font-bold">Encrypted Session</span>
          </div>
        </div>
      </div>
    </div>
  );

  const AuditLogsView = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Immutable Audit Vault</h2>
          <p className="text-zinc-500 text-sm">Security logs of every administrative and system critical override.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 rounded-xl text-xs font-bold transition-all">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 rounded-xl text-xs font-bold transition-all">
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-xl">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            value={auditSearch}
            onChange={(e) => setAuditSearch(e.target.value)}
            placeholder="Search by Admin, Action, or Entity ID..." 
            className="w-full bg-black/40 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-all" 
          />
        </div>
        <div className="flex items-center space-x-3 bg-black/40 p-1 border border-zinc-800 rounded-2xl">
          {['ALL', 'USER', 'AI_MODULE', 'BILLING', 'SYSTEM'].map(type => (
            <button 
              key={type}
              onClick={() => setAuditFilter(type as any)}
              className={`px-4 py-2 text-[9px] font-extrabold uppercase tracking-widest rounded-xl transition-all ${auditFilter === type ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-800/30 text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
              <th className="px-8 py-5">Timestamp / ID</th>
              <th className="px-8 py-5">Administrator</th>
              <th className="px-8 py-5">Action</th>
              <th className="px-8 py-5">Target Entity</th>
              <th className="px-8 py-5 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filteredAuditLogs.map(log => (
              <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-300">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="text-[10px] text-zinc-600 font-mono">{new Date(log.timestamp).toLocaleDateString()} • {log.id}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center font-bold text-indigo-400 text-xs">
                      {log.actor.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200 leading-none mb-1">{log.actor.email}</p>
                      <p className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest">{log.actor.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border ${
                    log.action.includes('SUSPEND') || log.action.includes('ERROR') 
                      ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                      : log.action.includes('GRANT') || log.action.includes('ACTIVATE')
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {log.action.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest mb-0.5">{log.entity.type}</span>
                    <span className="text-xs font-mono text-zinc-400">ID: {log.entity.id}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => setSelectedAuditLog(log)}
                    className="p-2.5 bg-zinc-800/50 rounded-xl text-zinc-500 hover:text-indigo-400 transition-all border border-zinc-700 hover:border-indigo-500/30"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAuditLogs.length === 0 && (
          <div className="py-20 text-center text-zinc-600 font-extrabold uppercase tracking-[0.2em] text-xs">
            No audit records match your query
          </div>
        )}
      </div>

      {/* Audit Detail Modal */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedAuditLog(null)} />
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight flex items-center space-x-3">
                <History className="w-5 h-5 text-indigo-400" />
                <span>Audit Detail: {selectedAuditLog.id}</span>
              </h3>
              <button onClick={() => setSelectedAuditLog(null)} className="p-2 bg-zinc-800 rounded-full text-zinc-500 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest mb-2">Timestamp</h4>
                  <p className="text-sm font-bold text-zinc-200">{new Date(selectedAuditLog.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest mb-2">Operator</h4>
                  <p className="text-sm font-bold text-zinc-200">{selectedAuditLog.actor.email}</p>
                </div>
              </div>

              <div className="bg-black/50 border border-zinc-800 rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800/50">
                  <h4 className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">State Changes</h4>
                  <span className="text-[10px] text-indigo-400 font-bold px-2 py-0.5 bg-indigo-500/10 rounded">JSON DIFF</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Original State</p>
                    <pre className="bg-zinc-950 p-4 rounded-xl text-[11px] text-zinc-500 font-mono overflow-auto max-h-40 border border-zinc-900">
                      {selectedAuditLog.context.before ? JSON.stringify(selectedAuditLog.context.before, null, 2) : 'N/A'}
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] text-green-600 font-bold uppercase tracking-widest">Modified State</p>
                    <pre className="bg-zinc-950 p-4 rounded-xl text-[11px] text-green-400 font-mono overflow-auto max-h-40 border border-zinc-900">
                      {selectedAuditLog.context.after ? JSON.stringify(selectedAuditLog.context.after, null, 2) : 'N/A'}
                    </pre>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/50">
                  <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest mb-1">Reason / Notes</p>
                  <p className="text-sm text-zinc-300 italic leading-relaxed">"{selectedAuditLog.context.reason || 'No specific reason provided.'}"</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <p className="text-[11px] text-indigo-300 font-bold leading-tight">This record is cryptographically signed and stored in the immutable cold-storage vault. Action cannot be undone from this interface.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // --- Header/Nav Components ---
  return (
    <div className="min-h-screen flex flex-col bg-[#000000] selection:bg-indigo-500/30">
      <CreditModal isOpen={isCreditModalOpen} onClose={() => setIsCreditModalOpen(false)} onSelect={handleSelectCredits} />

      <header className="sticky top-0 z-50 bg-[#000000]/90 backdrop-blur-2xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4 cursor-pointer flex-shrink-0" onClick={() => setView('workspace')}>
            <div className="w-12 h-12 bg-indigo-600 rounded-[1rem] flex-shrink-0 flex items-center justify-center shadow-2xl border border-indigo-400/20">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col flex-shrink-0">
              <h1 className="text-2xl font-display font-bold tracking-tight text-white leading-none mb-1">Alphagon</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-extrabold">Intelligence over volume</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-1">
              <button onClick={() => setView('workspace')} className={`px-4 py-2 text-sm font-medium transition-colors ${view === 'workspace' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Workspace</button>
              <button onClick={() => setView('history')} className={`px-4 py-2 text-sm font-medium transition-colors flex items-center space-x-2 ${view === 'history' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <Database className="w-4 h-4" />
                <span>Vault</span>
              </button>
              <button onClick={() => setView('admin')} className={`px-4 py-2 text-sm font-medium transition-colors flex items-center space-x-2 ${view === 'admin' ? 'text-indigo-400' : 'text-zinc-500 hover:text-indigo-400'}`}>
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </nav>

            <div className="h-8 w-px bg-zinc-800 hidden md:block" />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2 flex items-center space-x-3 group transition-colors hover:border-indigo-500/50">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg"><Coins className="w-4 h-4 text-indigo-400 group-hover:animate-pulse" /></div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-white font-bold text-sm tracking-tight">{credits.toLocaleString()}</span>
                <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest">Credits</span>
              </div>
              <button onClick={() => setIsCreditModalOpen(true)} className="p-1.5 bg-zinc-800 rounded-lg text-zinc-400 hover:bg-indigo-600 hover:text-white transition-all shadow-inner"><Plus className="w-3 h-3" /></button>
            </div>
          </div>
        </div>
      </header>

      {view === 'admin' ? (
        <div className="flex-1 flex max-w-7xl mx-auto w-full">
          <AdminSidebar />
          <main className="flex-1 p-10 min-h-screen overflow-y-auto">
            {adminSection === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Platform Revenue', value: '$45,210', change: '+12.5%', icon: <CreditCard /> },
                    { label: 'Active Users', value: '1,245', change: '+4.2%', icon: <Users /> },
                    { label: 'Token Burn', value: '12.4M', change: '-2.1%', icon: <Zap /> },
                    { label: 'Success Rate', value: '99.98%', change: 'Stable', icon: <CheckCircle2 /> },
                  ].map((stat, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl group hover:border-indigo-500/50 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-zinc-800 rounded-xl text-indigo-400">{stat.icon}</div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${stat.change.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-500'}`}>{stat.change}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest mb-1">{stat.label}</p>
                      <h4 className="text-2xl font-display font-bold text-white tracking-tight">{stat.value}</h4>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8">
                    <h3 className="text-lg font-display font-bold text-white mb-6 uppercase tracking-tight flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-indigo-400" />
                      <span>Operational Jobs</span>
                    </h3>
                    <div className="space-y-4">
                      {[1, 2, 3].map(j => (
                        <div key={j} className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-2xl border border-zinc-800/50">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center">
                              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">Video_Analysis_{j}.mp4</p>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Deep Transcription • 85%</p>
                            </div>
                          </div>
                          <button className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">Abort</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8">
                    <h3 className="text-lg font-display font-bold text-white mb-6 uppercase tracking-tight flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      <span>Risk Anomaly Queue</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                            <AlertCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">High Frequency Generation</p>
                            <p className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">User: user_bot_99 • AdCopy Module</p>
                          </div>
                        </div>
                        <button className="bg-amber-500 text-black text-[10px] font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-amber-400 transition-all">Review</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {adminSection === 'users' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold text-white tracking-tight">Identity Directory</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input type="text" placeholder="Search ID or Email..." className="bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500" />
                    </div>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 hover:bg-indigo-500">
                      <Plus className="w-4 h-4" />
                      <span>New User</span>
                    </button>
                  </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-zinc-800/30 text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                        <th className="px-6 py-4">User Identity</th>
                        <th className="px-6 py-4">Status / Role</th>
                        <th className="px-6 py-4">Credits</th>
                        <th className="px-6 py-4">Tokens Used</th>
                        <th className="px-6 py-4 text-right">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {adminUsers.map(u => (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-indigo-400">{u.email[0].toUpperCase()}</div>
                              <div><p className="text-sm font-bold text-white">{u.email}</p><p className="text-[10px] text-zinc-600 font-medium">ID: {u.id}</p></div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-4">
                              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest ${u.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{u.status}</span>
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{u.role}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5"><div className="flex items-center space-x-2"><span className="text-sm font-bold text-white">{u.credits.toLocaleString()}</span><button className="text-zinc-500 hover:text-indigo-400"><Plus className="w-3 h-3" /></button></div></td>
                          <td className="px-6 py-5 font-mono text-xs text-zinc-500">{(u.tokensConsumed / 1000).toFixed(1)}k</td>
                          <td className="px-6 py-5 text-right"><div className="flex items-center justify-end space-x-2"><button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"><Settings className="w-4 h-4" /></button><button className={`p-2 hover:bg-zinc-800 rounded-lg ${u.status === 'Active' ? 'text-zinc-400 hover:text-red-400' : 'text-red-400 hover:text-green-500'}`}>{u.status === 'Active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}</button></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {adminSection === 'ai' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-8"><div><h2 className="text-2xl font-display font-bold text-white tracking-tight">Intelligence Orchestrator</h2><p className="text-zinc-500 text-sm">Control underlying models and heuristic thresholds.</p></div></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {aiConfigs.map(config => (
                    <div key={config.id} className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4"><div className="p-3 bg-zinc-800 rounded-2xl text-indigo-400">{PLATFORM_ICONS[config.id]}</div><div><h4 className="text-lg font-bold text-white tracking-tight">{config.id}</h4><div className="flex items-center space-x-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /><span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">Active System</span></div></div></div>
                        <div className="flex items-center bg-black/40 p-1 rounded-xl border border-zinc-800">
                          <button onClick={() => setAiConfigs(prev => prev.map(c => c.id === config.id ? {...c, model: 'gemini-3-flash-preview'} : c))} className={`px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-widest rounded-lg transition-all ${config.model === 'gemini-3-flash-preview' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Flash</button>
                          <button onClick={() => setAiConfigs(prev => prev.map(c => c.id === config.id ? {...c, model: 'gemini-3-pro-preview'} : c))} className={`px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-widest rounded-lg transition-all ${config.model === 'gemini-3-pro-preview' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Pro</button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div><label className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block mb-2">System Instruction Override</label><textarea className="w-full h-32 bg-black/30 border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-400 focus:outline-none focus:border-indigo-500 transition-all font-mono" value={config.systemPrompt} onChange={(e) => setAiConfigs(prev => prev.map(c => c.id === config.id ? {...c, systemPrompt: e.target.value} : c))} /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-black/30 border border-zinc-800 p-4 rounded-2xl"><label className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest block mb-1">Credit Cost</label><input type="number" value={config.creditCost} readOnly className="bg-transparent text-white font-bold text-lg w-full focus:outline-none cursor-default" /></div>
                          <div className="bg-black/30 border border-zinc-800 p-4 rounded-2xl"><label className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest block mb-1">Risk Threshold</label><input type="number" value={config.safetyThreshold} readOnly className="bg-transparent text-white font-bold text-lg w-full focus:outline-none cursor-default" /></div>
                        </div>
                      </div>
                      <button className="w-full py-3 bg-zinc-800 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-2xl hover:bg-zinc-700 transition-all border border-zinc-700">Deploy Changes</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {adminSection === 'logs' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <h2 className="text-2xl font-display font-bold text-white mb-8 tracking-tight">System Operation Logs</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden font-mono text-xs">
                  {logs.map(log => (
                    <div key={log.id} className="flex items-center space-x-6 px-6 py-3 border-b border-zinc-800 hover:bg-white/[0.02] transition-colors">
                      <span className="text-zinc-600 w-32">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className={`w-16 font-extrabold ${log.level === 'ERROR' ? 'text-red-500' : log.level === 'WARNING' ? 'text-amber-500' : 'text-blue-500'}`}>{log.level}</span>
                      <span className="text-zinc-500 w-48 truncate">[{log.user}]</span>
                      <span className="text-zinc-300 flex-1">{log.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {adminSection === 'audit' && <AuditLogsView />}
          </main>
        </div>
      ) : (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
          {view === 'history' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div><h2 className="text-3xl font-display font-bold text-white tracking-tight">Intelligence Vault</h2><p className="text-zinc-500 mt-1">Versioned creative history and audit trails.</p></div>
                <button onClick={() => setHistory([])} className="flex items-center space-x-2 text-zinc-500 hover:text-red-400 transition-colors text-sm font-medium px-4 py-2 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /><span>Clear All</span></button>
              </div>
              {history.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20 text-zinc-600 font-bold uppercase tracking-widest text-xs">No entries found</div>
              ) : (
                <div className="grid gap-6">
                  {history.map((item) => (
                    <div key={item.id} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 hover:border-zinc-700 transition-all group">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4"><span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">{item.platform}</span><h4 className="text-lg font-bold text-zinc-200">{item.sourceTopic}</h4></div>
                        <div className="text-right"><span className="text-[10px] text-zinc-600 block">{new Date(item.timestamp).toLocaleString()}</span><span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">{item.versions.length} Versions</span></div>
                      </div>
                      <div className="bg-black/40 rounded-2xl p-6 text-sm text-zinc-400 whitespace-pre-wrap max-h-60 overflow-y-auto border border-zinc-800/50">{item.versions[item.versions.length - 1].body}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : !analysis ? (
            <div className="flex flex-col items-center justify-center min-h-[75vh] space-y-12 animate-in fade-in duration-700">
              <div className="text-center space-y-6 max-w-3xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4"><Zap className="w-3 h-3 text-indigo-400" /><span>On-Demand Creative Workspace</span></div>
                <h2 className="text-6xl md:text-7xl font-display font-bold text-white tracking-tight leading-[1.1]">Build Less. <span className="text-transparent bg-clip-text bg-gradient-to-tr from-indigo-500 via-indigo-400 to-cyan-300">Think Sharper.</span></h2>
                <p className="text-xl text-zinc-500 leading-relaxed max-w-2xl mx-auto">Precision generation with version control. High contrast intelligence for high-impact creators.</p>
              </div>
              <FileUpload onFileSelect={handleMediaUpload} isProcessing={isProcessing} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in zoom-in-95 duration-500">
              <aside className="lg:col-span-3 space-y-8">
                <section className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-8 space-y-8 shadow-2xl sticky top-24">
                  <div className="flex items-center justify-between"><div className="flex items-center space-x-2 text-indigo-400"><Settings2 className="w-5 h-5" /><h3 className="font-display font-bold text-lg uppercase tracking-tight">Context Layer</h3></div><button onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording} className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-800 text-zinc-400 hover:text-indigo-400'}`}>{isRecording ? <Mic className="w-5 h-5" /> : (isVoiceProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />)}</button></div>
                  <div className="space-y-6">
                    <div><label className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-extrabold mb-3 block">Emotion Profile</label><div className="grid grid-cols-2 gap-2">{EMOTIONS.map(e => <button key={e} onClick={() => setSettings(s => ({...s, emotion: e}))} className={`px-3 py-2 text-[11px] font-bold rounded-xl border transition-all ${settings.emotion === e ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-500'}`}>{e}</button>)}</div></div>
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-extrabold block">Preferences</label>
                      <select value={settings.tone} onChange={e => setSettings(s => ({...s, tone: e.target.value}))} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 appearance-none cursor-pointer">{TONES.map(t => <option key={t}>{t}</option>)}</select>
                      <select value={settings.language} onChange={e => setSettings(s => ({...s, language: e.target.value}))} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 appearance-none cursor-pointer">{LANGUAGES.map(l => <option key={l}>{l}</option>)}</select>
                      <select value={settings.region} onChange={e => setSettings(s => ({...s, region: e.target.value}))} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 appearance-none cursor-pointer">{REGIONS.map(r => <option key={r}>{r}</option>)}</select>
                      <input type="text" value={settings.targetAudience} onChange={e => setSettings(s => ({...s, targetAudience: e.target.value}))} placeholder="Target Persona" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600" />
                    </div>
                  </div>
                </section>
                {insights && (
                  <div className="space-y-6">
                    <section className="bg-indigo-950/20 border border-indigo-500/30 rounded-3xl p-7 space-y-4 shadow-xl"><div className="flex items-center space-x-2 text-indigo-400"><BarChart3 className="w-5 h-5" /><h3 className="font-display font-bold text-lg uppercase tracking-tight">Market Intel</h3></div><p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">Strategy: {insights.competitorStrategy}</p></section>
                  </div>
                )}
              </aside>
              <div className="lg:col-span-9 space-y-10">
                <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[120px] rounded-full -mr-32 -mt-32" />
                  <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-8">
                    <div className="flex-1 space-y-6">
                      <div className="inline-flex items-center space-x-2 text-zinc-500 text-[11px] font-bold uppercase tracking-[0.2em]"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span>Context Mapping: {analysis.topics[0]}</span></div>
                      <h2 className="text-4xl font-display font-bold text-white tracking-tight leading-none">Distilled Core Intent</h2>
                      <p className="text-zinc-400 text-lg leading-relaxed italic border-l-4 border-indigo-500/30 pl-8 max-w-4xl">"{analysis.summary}"</p>
                      <div className="flex flex-wrap gap-2.5 pt-4">{analysis.keywords.map((kw, i) => <span key={i} className="px-4 py-1.5 bg-zinc-800 border border-zinc-700/50 rounded-xl text-[11px] font-bold text-zinc-300 uppercase tracking-tight">#{kw.replace(/\s+/g, '')}</span>)}</div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <button onClick={() => setAnalysis(null)} className="group text-xs text-zinc-600 hover:text-white transition-colors flex items-center space-x-2 bg-black/40 px-5 py-2.5 rounded-full border border-zinc-800 hover:border-zinc-600"><Clock className="w-4 h-4" /><span className="font-bold uppercase tracking-widest">Wipe Session</span></button>
                      <div className="bg-zinc-800/50 px-3 py-1.5 rounded-xl border border-zinc-700/50 flex items-center space-x-2"><Database className="w-3 h-3 text-indigo-400" /><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Transcript Cached (Free)</span></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="flex items-center justify-between px-2"><h3 className="text-xl font-display font-bold text-zinc-200 tracking-tight">Generation Modules</h3><div className="h-px flex-1 bg-zinc-800 mx-8 opacity-20" /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{MODULES.map(module => {
                    const itemInHistory = history.find(h => h.platform === module.id && h.sourceTopic === (analysis.topics[0] || 'Media Source'));
                    return <ModuleCard key={module.id} platform={module.id as Platform} description={module.description} onGenerate={() => handleGenerate(module.id as Platform)} versions={itemInHistory?.versions || []} userCredits={credits} onLowCredits={() => setIsCreditModalOpen(true)} />;
                  })}</div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
};

export default App;
