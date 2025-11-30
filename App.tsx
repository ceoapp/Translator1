import React, { useState, useEffect, useRef } from 'react';
import { translateTextToThai } from './services/geminiService.ts';
import { TranslationItem } from './types.ts';
import { 
  ArrowRightIcon, 
  CheckIcon, 
  CopyIcon, 
  SparklesIcon, 
  TrashIcon, 
  XMarkIcon,
  SpeakerIcon,
  SwapIcon
} from './components/Icons.tsx';

// --- Background Components ---

const AuroraBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden bg-slate-900 selection:bg-cyan-500/30 selection:text-white">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] animate-blob" />
    <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-cyan-600/20 blur-[120px] animate-blob animation-delay-2000" />
    <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] rounded-full bg-blue-700/20 blur-[120px] animate-blob animation-delay-4000" />
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px]" />
  </div>
);

// --- Helper Components ---

const Header = () => (
  <header className="w-full relative z-50 pt-6 pb-2">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg blur opacity-40"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-lg p-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 font-bold text-xl leading-none">T</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Thai<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Flow</span>
        </h1>
      </div>
      <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-slate-400">
        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
        AI Neural Engine Active
      </div>
    </div>
  </header>
);

type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'secondary' | 'glass' | 'icon';
};

const Button = ({ 
  onClick, 
  disabled, 
  children, 
  variant = 'primary', 
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white shadow-lg hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] rounded-xl px-8 py-4 text-base tracking-wide border border-white/10",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm rounded-xl px-4 py-2 text-sm",
    glass: "bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl px-4 py-2 text-sm backdrop-blur-md",
    icon: "p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const LanguageSelector = ({ lang, active }: { lang: string, active?: boolean }) => (
  <div className={`px-4 py-2 rounded-xl text-sm font-semibold tracking-wide transition-all ${
    active 
      ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
      : 'text-slate-500 hover:text-slate-300'
  }`}>
    {lang}
  </div>
);

// --- Main App Component ---

export default function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<TranslationItem[]>([]);
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem('translationHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('translationHistory', JSON.stringify(history));
  }, [history]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setOutputText('');

    try {
      const result = await translateTextToThai(inputText);
      setOutputText(result);
      
      const newItem: TranslationItem = {
        id: Date.now().toString(),
        original: inputText,
        translated: result,
        timestamp: Date.now()
      };
      setHistory(prev => [newItem, ...prev].slice(0, 8)); // Keep last 8
    } catch (err) {
      setError("Connection interrupted. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, isInput: boolean) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (isInput) {
        setCopiedInput(true);
        setTimeout(() => setCopiedInput(false), 2000);
      } else {
        setCopiedOutput(true);
        setTimeout(() => setCopiedOutput(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setError(null);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const loadFromHistory = (item: TranslationItem) => {
    setInputText(item.original);
    setOutputText(item.translated);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const speakText = (text: string, lang: 'en-US' | 'th-TH') => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = lang === 'th-TH' ? 0.9 : 1.0;
    
    if (lang === 'th-TH') {
      const voices = window.speechSynthesis.getVoices();
      const thaiVoice = voices.find(v => v.lang.includes('th'));
      if (thaiVoice) utterance.voice = thaiVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen relative font-sans text-slate-100 flex flex-col">
      <AuroraBackground />

      <Header />

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
        
        {/* Main Glass Card */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden relative">
          
          {/* Top Bar */}
          <div className="border-b border-white/5 p-4 sm:p-6 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <LanguageSelector lang="English" active />
                <div className="text-slate-500">
                  <ArrowRightIcon className="w-4 h-4 opacity-50" />
                </div>
                <LanguageSelector lang="Thai" active />
             </div>
             {inputText && (
               <Button variant="glass" onClick={clearAll} className="text-xs h-8 px-3 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20">
                 Clear
               </Button>
             )}
          </div>

          <div className="flex flex-col md:flex-row min-h-[400px] relative group">
            
            {/* Input Section */}
            <div className="flex-1 p-8 flex flex-col relative transition-colors hover:bg-white/[0.02]">
              <textarea
                className="w-full h-full resize-none bg-transparent border-none focus:ring-0 text-2xl text-white placeholder-white/30 leading-relaxed outline-none"
                placeholder="Type to translate..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                maxLength={5000}
                spellCheck="false"
              />
              <div className="mt-4 flex items-center justify-between text-slate-500">
                 <div className="flex gap-1">
                    <Button variant="icon" onClick={() => speakText(inputText, 'en-US')} title="Listen to English">
                      <SpeakerIcon />
                    </Button>
                    <Button variant="icon" onClick={() => copyToClipboard(inputText, true)} title="Copy English">
                      {copiedInput ? <CheckIcon className="text-green-400" /> : <CopyIcon />}
                    </Button>
                 </div>
                 <span className="text-xs opacity-50 font-mono">{inputText.length} chars</span>
              </div>
            </div>

            {/* Divider & Swap Button */}
            <div className="h-px w-full md:w-px md:h-auto bg-gradient-to-b from-transparent via-white/10 to-transparent relative z-20 flex items-center justify-center my-4 md:my-0">
               <div className="absolute bg-slate-800/80 backdrop-blur-md p-3 rounded-full border border-white/10 shadow-lg text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer hover:rotate-180 duration-500 hover:border-cyan-500/30">
                 <SwapIcon className="w-5 h-5" />
               </div>
            </div>

            {/* Output Section */}
            <div className="flex-1 p-8 flex flex-col relative bg-white/[0.02] transition-colors hover:bg-white/[0.04]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 animate-pulse">
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse"></div>
                    <SparklesIcon className="w-10 h-10 text-cyan-300 animate-spin-slow relative z-10" />
                  </div>
                  <span className="text-sm font-medium text-cyan-200/70 tracking-wider uppercase">Translating...</span>
                </div>
              ) : outputText ? (
                <>
                  <div className="w-full h-full overflow-auto">
                     <p className="text-2xl text-cyan-50 leading-relaxed font-prompt font-light">
                        {outputText}
                     </p>
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-1">
                     <Button variant="icon" onClick={() => speakText(outputText, 'th-TH')} title="Listen to Thai">
                       <SpeakerIcon />
                     </Button>
                     <Button variant="icon" onClick={() => copyToClipboard(outputText, false)} title="Copy Thai">
                       {copiedOutput ? <CheckIcon className="text-green-400" /> : <CopyIcon />}
                     </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
                  <span className="text-sm font-light italic opacity-50">Translation appears here</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button Area */}
        <div className="mt-8 flex justify-center relative z-20">
            <Button 
              onClick={handleTranslate} 
              disabled={isLoading || !inputText.trim()}
              className="w-full sm:w-auto min-w-[240px] transform hover:scale-105 transition-transform"
            >
              {isLoading ? 'Processing...' : (
                <span className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  <span>Translate Now</span>
                </span>
              )}
            </Button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 text-red-200 rounded-xl text-center text-sm border border-red-500/20 backdrop-blur-md">
            {error}
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-20">
            <h2 className="text-lg font-medium text-slate-300 mb-6 px-2 flex items-center gap-2">
              <span className="w-1 h-5 bg-cyan-500 rounded-full"></span>
              Recent History
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="group bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/5 hover:border-white/20 backdrop-blur-sm transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-white/5 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <p className="text-sm font-medium text-slate-300 truncate pr-8">{item.original}</p>
                    <button 
                      onClick={(e) => deleteHistoryItem(item.id, e)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-lg text-white font-prompt font-light truncate relative z-10">{item.translated}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
      
      {/* Footer */}
      <footer className="py-8 text-center text-slate-600 text-sm relative z-10">
        <p>&copy; {new Date().getFullYear()} ThaiFlow. Powered by Gemini AI.</p>
      </footer>
    </div>
  );
}