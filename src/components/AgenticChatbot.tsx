import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api.ts';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Zap,
  Brain,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Search,
  ExternalLink,
  Mic,
  Square,
  Volume2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

interface AgenticChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgenticChatbot: React.FC<AgenticChatbotProps> = ({ isOpen, onClose }) => {
  const [persona, setPersona] = useState<'FAST_DISPATCHER' | 'OPERATIONS_STRATEGIST' | 'COMPLEX_ARCHITECT'>('OPERATIONS_STRATEGIST');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'model',
      content:
        'Hello! I am your AutoOps AI Agentic Copilot. I can plan multi-agent procurement tasks, audit vendor quotes, calculate dynamic risk indices, and analyze global supply chain disruptions. You can type or click the microphone to dictate instructions.',
      timestamp: new Date().toLocaleTimeString(),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Clean up recorder on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  if (!isOpen) return null;

  const quickPrompts = [
    'Analyze supply risk on SKU-9020 Servomotors',
    'Evaluate NovaTech vs Quantum Precision quote discounts',
    'Explain the $5,000 HITL managerial authorization rule',
    'Calculate reorder point for 30-day velocity lead time',
  ];

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        setIsTranscribing(true);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            if (base64Audio) {
              const res = await api.copilot.transcribeAudio(base64Audio, 'audio/webm');
              if (res.transcript) {
                setInput((prev) => (prev ? `${prev} ${res.transcript}` : res.transcript));
              }
            }
            setIsTranscribing(false);
          };
        } catch (err) {
          console.error('Audio transcription error:', err);
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone permission or access error:', err);
      // Fallback demo speech command
      setInput('Reorder 120 units of SKU-9020 with expedited 3-day delivery.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: userText.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const payload = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.copilot.chat(payload, persona);

      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'model',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString(),
        modelUsed: res.modelUsed,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          role: 'model',
          content: 'Unable to reach the Gemini agent at this moment. Please verify your connection.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col backdrop-blur-xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              AutoOps Agentic Copilot
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Multi-Turn
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Powered by Google Gemini 3.8 & Audio Transcribe
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Persona Role Switcher Tabs */}
      <div className="p-2.5 border-b border-slate-800 bg-slate-950/40 flex items-center gap-1.5 text-xs">
        <button
          onClick={() => setPersona('FAST_DISPATCHER')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center font-mono text-[10px] transition ${
            persona === 'FAST_DISPATCHER'
              ? 'bg-cyan-600 text-white font-bold'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
          title="Fast responses via gemini-3.1-flash-lite"
        >
          ⚡ Fast Dispatcher (Lite)
        </button>
        <button
          onClick={() => setPersona('OPERATIONS_STRATEGIST')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center font-mono text-[10px] transition ${
            persona === 'OPERATIONS_STRATEGIST'
              ? 'bg-indigo-600 text-white font-bold'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
          title="General operations via gemini-3.8-flash"
        >
          🧠 Operations (3.8 Flash)
        </button>
        <button
          onClick={() => setPersona('COMPLEX_ARCHITECT')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center font-mono text-[10px] transition ${
            persona === 'COMPLEX_ARCHITECT'
              ? 'bg-purple-600 text-white font-bold'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
          title="Deep reasoning & complex risk via gemini-4-argon"
        >
          🔬 Complex Architect
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-4 space-y-3.5 overflow-y-auto text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-mono mb-1">
              <span>{msg.role === 'user' ? 'You' : 'AutoOps Agent'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
              {msg.modelUsed && (
                <span className="text-indigo-400 font-semibold px-1 rounded bg-indigo-950/40 border border-indigo-500/20 text-[9px]">
                  {msg.modelUsed}
                </span>
              )}
            </div>

            <div
              className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed text-xs shadow-md ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-indigo-400 p-3 rounded-xl bg-slate-950 border border-slate-800 max-w-[60%]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs font-mono">Agent reasoning & evaluating...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/50 flex items-center space-x-2 overflow-x-auto text-[11px]">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp)}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap transition"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Voice Status Indicator Banner */}
      {isRecording && (
        <div className="px-4 py-2 bg-red-950/70 border-t border-red-500/40 flex items-center justify-between text-xs text-red-300">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="font-mono text-xs font-semibold">Listening (gemini-3.5-transcribe)...</span>
          </div>
          <button
            onClick={stopVoiceRecording}
            className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-[10px] font-bold flex items-center space-x-1"
          >
            <Square className="h-3 w-3 fill-white" />
            <span>Done</span>
          </button>
        </div>
      )}

      {isTranscribing && (
        <div className="px-4 py-2 bg-indigo-950/70 border-t border-indigo-500/40 flex items-center space-x-2 text-xs text-indigo-300">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span className="font-mono text-xs">Transcribing voice recording via gemini-3.5-transcribe...</span>
        </div>
      )}

      {/* Input Box */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center space-x-2"
        >
          {/* Mic Button */}
          <button
            type="button"
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            className={`p-2.5 rounded-xl border transition ${
              isRecording
                ? 'bg-red-600 text-white border-red-500 animate-pulse'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500'
            }`}
            title={isRecording ? 'Stop Recording' : 'Speak voice instructions (gemini-3.5-transcribe)'}
          >
            {isRecording ? <Square className="h-4 w-4 fill-white" /> : <Mic className="h-4 w-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${persona.replace('_', ' ').toLowerCase()} or use mic...`}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
