
import React from 'react';
import { X, Check, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import { PRICING_PLANS } from '../constants';

interface CreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (credits: number) => void;
}

const CreditModal: React.FC<CreditModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="p-12 md:p-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-display font-bold text-white tracking-tight">Scale Your <span className="text-indigo-400">Intelligence.</span></h2>
              <p className="text-zinc-500 text-lg leading-relaxed">
                Buy what you use. No hidden fees for volume. High ROI generation on-demand.
              </p>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center space-x-3 text-zinc-400">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-medium">Encrypted Checkout</span>
              </div>
              <div className="flex items-center space-x-3 text-zinc-400">
                <Zap className="w-5 h-5 text-cyan-500" />
                <span className="text-sm font-medium">Instant Credit Delivery</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_PLANS.map((plan) => (
              <div 
                key={plan.id}
                className={`relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-500 group ${
                  plan.recommended 
                    ? 'bg-indigo-600/10 border-indigo-500 shadow-2xl shadow-indigo-500/10 scale-105 z-10' 
                    : 'bg-zinc-800/30 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-500 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white">
                    Recommended
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-xl font-display font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-zinc-500 text-sm font-medium">/once</span>
                  </div>
                </div>

                <div className="bg-black/20 rounded-2xl p-4 mb-8 border border-white/5">
                  <span className="text-2xl font-bold text-indigo-400 block">{plan.credits.toLocaleString()}</span>
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">Intelligence Credits</span>
                </div>

                <div className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <Check className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-zinc-400 leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => onSelect(plan.credits)}
                  className={`w-full py-4 rounded-2xl text-[10px] font-extrabold uppercase tracking-[0.2em] transition-all ${
                    plan.recommended 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl' 
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                  }`}
                >
                  Acquire Credits
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditModal;
