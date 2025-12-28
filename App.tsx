import React, { useState, useRef, useEffect } from 'react';
import { analyzeMeeting } from './services/geminiService';
import { MeetingAnalysis } from './types';
import AnalysisView from './components/AnalysisView';
import { 
  Bot, Sparkles, AlertCircle, Loader2, CheckCircle2, ShieldAlert, Zap, ArrowRight, 
  LayoutDashboard, Target, Mic, StopCircle, MicOff, Activity, Terminal,
  ListTodo, BarChart3, Bell, BrainCircuit, Users, FileText, Command
} from 'lucide-react';

// Scroll Reveal Component
const FadeInSection: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (domRef.current) observer.unobserve(domRef.current);
        }
      });
    });
    const current = domRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const App: React.FC = () => {
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MeetingAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Hero Animation State
  const [heroIndex, setHeroIndex] = useState(0);
  const heroWords = ["Every Conversation", "Hidden Decisions", "Project Risks", "Team Velocity"];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulation State
  const [simStep, setSimStep] = useState(1);
  const simEvents = [
    { type: 'log', text: 'Listening to audio stream...', icon: Activity, color: 'text-indigo-500' },
    { type: 'log', text: 'Speaker identified: Sarah', icon: Mic, color: 'text-slate-500' },
    { type: 'decision', text: 'Decision: React Stack approved', icon: CheckCircle2, color: 'text-green-600' },
    { type: 'risk', text: 'Risk: Legacy Backend Latency', icon: ShieldAlert, color: 'text-orange-600' },
    { type: 'action', text: 'Action: Mocks due Friday', icon: Target, color: 'text-blue-600' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSimStep((prev) => {
        if (prev >= simEvents.length) return 1; // Loop back to start
        return prev + 1;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'not-allowed') {
        setError("Microphone access denied. Please allow microphone permissions.");
      } else {
        setError("Error accessing microphone: " + event.error);
      }
      setIsRecording(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscriptChunk = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptChunk += event.results[i][0].transcript + ' ';
        }
      }
      
      if (finalTranscriptChunk) {
        setTranscript(prev => {
           const needsSpace = prev.length > 0 && !prev.endsWith(' ') && !prev.endsWith('\n');
           return prev + (needsSpace ? ' ' : '') + finalTranscriptChunk;
        });
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) return;
    
    if (isRecording && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await analyzeMeeting(transcript);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setTranscript('');
    setError(null);
    if (isRecording && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
    }
  };

  const sampleTranscript = `Project Kickoff Meeting - website redesign.
Attendees: Sarah (PM), Mike (Dev), Jessica (Design), Dave (Marketing).

Sarah: Thanks for joining. The goal today is to agree on the tech stack and the timeline for the new homepage.
Dave: We need this live by Q4 for the holiday campaign. That's hard deadline.
Jessica: I can have high-fidelity mocks by next Friday.
Mike: If we use React and Tailwind, we can move fast. I'm worried about the legacy backend though. It's unstable.
Sarah: Good point. Is that a blocker?
Mike: Potentially. We might need a middleware layer. That adds 2 weeks.
Sarah: Okay, let's decide to use React/Tailwind. 
Mike: Agreed.
Sarah: About the backend... Mike, can you investigate the middleware effort?
Mike: Sure, I'll check it out by Wednesday.
Dave: Can we also make sure the SEO tags are editable?
Sarah: Adding that to the requirements.
Jessica: I feel like we are rushing the design phase. 
Sarah: We have to cut scope if we want Q4.
Decision: We will use React and Tailwind.
Decision: Launch target is Q4, strict.
`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-800">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center group cursor-pointer" onClick={() => window.location.reload()}>
              <div className="flex-shrink-0 flex items-center text-indigo-700 transition-transform group-hover:scale-105">
                <Bot className="h-8 w-8 mr-2" />
                <span className="font-bold text-xl tracking-tight">Meeting Insight Engine</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 hidden sm:inline-block tracking-wide uppercase animate-pulse">
                Live System Ready
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full">
        {!result ? (
          <div className="animate-fade-in-up">
            
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 pb-16 pt-12 lg:pt-20">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-6 mb-12">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight min-h-[1.2em]">
                    Unlock the ROI of <br/>
                    <span className="text-indigo-600 transition-all duration-500 inline-block transform">
                      {heroWords[heroIndex]}
                    </span>
                  </h1>
                  <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 leading-relaxed">
                    Transform unstructured meeting dialogue into executive-grade decisions, risk detection, and prioritized execution plans instantly.
                  </p>
                </div>

                {/* Input Area (Hero CTA) */}
                <FadeInSection delay={200}>
                  <div className="bg-white shadow-2xl shadow-indigo-200/50 rounded-2xl overflow-hidden border border-slate-200 max-w-4xl mx-auto relative z-10 transition-transform hover:scale-[1.005] duration-300">
                    <div className="p-1 bg-slate-50 flex justify-between items-center px-4 py-2 border-b border-slate-200">
                       <div className="flex items-center space-x-4">
                         <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Input Source</span>
                         <button
                           onClick={toggleRecording}
                           className={`flex items-center text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-all duration-300 ${
                             isRecording 
                               ? 'bg-red-100 text-red-600 shadow-inner' 
                               : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                           }`}
                         >
                           {isRecording ? (
                             <>
                               <StopCircle className="w-3 h-3 mr-1.5 animate-pulse" />
                               Recording...
                             </>
                           ) : (
                             <>
                               <Mic className="w-3 h-3 mr-1.5" />
                               Record Live
                             </>
                           )}
                         </button>
                       </div>
                       <button 
                        onClick={() => setTranscript(sampleTranscript)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
                       >
                         <Sparkles className="w-3 h-3 mr-1" />
                         Load Sample Context
                       </button>
                    </div>
                    <div className="relative group">
                      <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder={isRecording ? "Listening..." : "Paste your meeting transcript, notes, or press 'Record Live'..."}
                        className="w-full h-48 p-6 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0 resize-none text-base leading-relaxed bg-transparent relative z-10"
                        spellCheck={false}
                      />
                      {isRecording && (
                        <div className="absolute top-4 right-4 z-20 pointer-events-none">
                          <span className="flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                        </div>
                      )}
                      {/* Subtle gradient overlay on focus/hover hint could go here */}
                    </div>
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <span className="text-xs text-slate-400 hidden sm:block flex items-center">
                         {transcript.length > 0 && (
                            <span className="inline-flex items-center animate-pulse text-indigo-500 font-medium">
                               <Activity className="w-3 h-3 mr-1" />
                               Analysis Ready
                            </span>
                         )}
                      </span>
                      <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !transcript.trim()}
                        className={`w-full sm:w-auto flex items-center justify-center px-8 py-3 rounded-xl text-white font-bold transition-all shadow-lg hover:shadow-indigo-500/30 text-sm tracking-wide uppercase transform
                          ${isAnalyzing || !transcript.trim() 
                            ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                            : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5'
                          }`}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analyze Meeting Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </FadeInSection>
              </div>
            </div>

            {/* Features Section */}
            <div className="py-20 bg-slate-50 relative overflow-hidden">
               {/* Background decoration */}
               <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                  <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-200 rounded-full blur-[100px] animate-pulse"></div>
                  <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[80px]"></div>
               </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <FadeInSection>
                    <div className="text-center mb-16">
                    <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">Capabilities</h2>
                    <h3 className="text-3xl font-bold text-slate-900">Enterprise Intelligence Suite</h3>
                    </div>
                </FadeInSection>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {[
                       { icon: Mic, color: 'text-red-600', bg: 'bg-red-50', title: 'Real-Time Audio Capture', desc: 'Seamlessly record live meetings via microphone. Our engine listens and transcribes in real-time.' },
                       { icon: ListTodo, color: 'text-blue-600', bg: 'bg-blue-50', title: 'Action & Decisions', desc: 'Automatically extract actionable tasks and classify decisions as Final, Tentative, or Needs Approval.' },
                       { icon: ShieldAlert, color: 'text-orange-600', bg: 'bg-orange-50', title: 'Risk Detection', desc: 'Identify ambiguity, vague ownership, and potential risks before they become project blockers.' },
                       { icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50', title: 'Visual Analytics', desc: 'Visualize meeting productivity trends and team velocity with interactive dashboards.' },
                       { icon: Bell, color: 'text-yellow-600', bg: 'bg-yellow-50', title: 'Smart Integrations', desc: 'Push action items directly to Google Calendar, Slack, or Jira with smart reminders.' },
                       { icon: BrainCircuit, color: 'text-purple-600', bg: 'bg-purple-50', title: 'AI Advisory', desc: 'Get proactive, AI-powered suggestions for next steps and strategies to mitigate identified risks.' },
                       { icon: Users, color: 'text-teal-600', bg: 'bg-teal-50', title: 'Team Collaboration', desc: 'Enable multi-user input and confirmation for distributed teams to align instantly.' },
                       { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50', title: 'Universal Export', desc: 'Generate executive summaries instantly in PDF, Email, or Google Doc formats.' },
                       { icon: Command, color: 'text-pink-600', bg: 'bg-pink-50', title: 'Voice Command', desc: 'Trigger summaries, show risks, or query insights using simple voice commands.' }
                   ].map((feature, i) => (
                       <FadeInSection key={i} delay={i * 50}>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-6`}>
                                <feature.icon className={`w-6 h-6 ${feature.color}`} />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                                <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
                            </div>
                       </FadeInSection>
                   ))}
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="py-24 bg-white border-t border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <FadeInSection>
                    <div>
                        <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">Process</h2>
                        <h3 className="text-3xl font-bold text-slate-900 mb-6">From Raw Audio to <br/>Rigorous Action</h3>
                        <div className="space-y-8">
                        {[
                            { step: 1, title: 'Ingest Context', desc: 'Record live audio via microphone or paste transcripts directly from any platform (Zoom, Teams, Meet).' },
                            { step: 2, title: 'AI Reasoning', desc: 'Our model analyzes sentiment, dependencies, and accountability structures to filter noise.' },
                            { step: 3, title: 'Strategic Output', desc: 'Receive a structured JSON/Report with action items, owners, priorities, and deadlines.' }
                        ].map((item) => (
                            <div key={item.step} className="flex group">
                                <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-indigo-100 text-indigo-600 font-bold bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                    {item.step}
                                </div>
                                </div>
                                <div className="ml-4">
                                <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                                <p className="mt-1 text-slate-600">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                  </FadeInSection>
                  
                  {/* Dynamic Simulation Preview */}
                  <FadeInSection delay={200}>
                    <div className="relative group perspective-1000">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-white rounded-3xl transform rotate-3 scale-105 group-hover:rotate-2 transition-transform duration-500"></div>
                        <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 min-h-[320px] overflow-hidden">
                            
                            {/* Terminal Header */}
                            <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-2">
                                <div className="flex items-center space-x-2">
                                    <Terminal className="text-indigo-400 w-5 h-5" />
                                    <span className="font-mono font-semibold text-slate-200 text-sm">Live_Inference_Engine.exe</span>
                                </div>
                                <div className="flex space-x-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                </div>
                            </div>

                            {/* Simulated Logs */}
                            <div className="space-y-3 font-mono text-sm">
                                {simEvents.slice(0, simStep).map((event, idx) => (
                                    <div key={idx} className="flex items-start animate-fade-in-right">
                                        <div className="mr-3 mt-0.5">
                                            <event.icon className={`w-4 h-4 ${event.color}`} />
                                        </div>
                                        <p className="text-slate-300">
                                            <span className="opacity-50 text-xs mr-2">[{new Date().toLocaleTimeString()}]</span>
                                            {event.text}
                                        </p>
                                    </div>
                                ))}
                                <div className="w-2 h-5 bg-indigo-500 animate-pulse inline-block align-middle ml-1"></div>
                            </div>

                            {/* Floating Overlay Card */}
                            <div className={`absolute bottom-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-xl transform transition-all duration-500 ${simStep > 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                                <div className="flex items-center text-white mb-1">
                                    <CheckCircle2 className="w-4 h-4 text-green-400 mr-2" />
                                    <span className="font-bold text-sm">Insight Extracted</span>
                                </div>
                                <div className="h-1 w-32 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-400 w-full animate-progress"></div>
                                </div>
                            </div>

                        </div>
                    </div>
                  </FadeInSection>
                </div>
              </div>
            </div>

            {/* Benefits / Footer CTA */}
            <div className="bg-slate-900 py-24 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] -top-20 -left-20 animate-pulse"></div>
                    <div className="absolute w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] bottom-0 right-0 animate-pulse delay-1000"></div>
                </div>
               <FadeInSection>
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Ready to upgrade your meetings?</h2>
                    <p className="text-indigo-200 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                        Join forward-thinking teams using Meeting Insight Engine to eliminate ambiguity and accelerate project velocity.
                    </p>
                    <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="group inline-flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 transform hover:-translate-y-1"
                    >
                        Start Analysis Now
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
               </FadeInSection>
            </div>

            {error && (
              <div className="max-w-4xl mx-auto mt-8 px-4">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-red-800 font-medium">Analysis Failed</h3>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-12">
             <AnalysisView data={result} onReset={handleReset} />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} Meeting Insight Engine. Enterprise Intelligence.</p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-slate-400 text-sm">
             <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
             <a href="#" className="hover:text-indigo-600 transition-colors">Security</a>
             <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;