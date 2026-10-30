import React, { useState, useRef, useEffect } from 'react';
import { WorkflowPriority } from '../types.ts';
import { api } from '../services/api.ts';
import { X, Sparkles, Bot, Zap, ArrowRight, ShieldAlert, Mic, Square, Loader2 } from 'lucide-react';

interface NewWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    description: string;
    priority: WorkflowPriority;
    targetSku?: string;
    autoExecute?: boolean;
  }) => Promise<any>;
  isExecuting?: boolean;
  defaultSku?: string;
}

export const NewWorkflowModal: React.FC<NewWorkflowModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isExecuting,
  defaultSku,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetSku, setTargetSku] = useState(defaultSku || 'SKU-9020');
  const [priority, setPriority] = useState<WorkflowPriority>('HIGH');
  const [autoExecute, setAutoExecute] = useState(true);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  if (!isOpen) return null;

  const presets = [
    {
      title: 'Emergency Replenish: SKU-9020 Servomotor Actuators',
      sku: 'SKU-9020',
      priority: 'CRITICAL' as WorkflowPriority,
      goal: 'SKU-9020 is below safety stock (14 units on hand). Evaluate alternative vendors, negotiate best quote under $50/unit, check compliance, and initiate PO.',
      tag: 'Critical Shortage',
    },
    {
      title: 'Expedited Reorder: SKU-4011 Titanium Fasteners',
      sku: 'SKU-4011',
      priority: 'HIGH' as WorkflowPriority,
      goal: 'Stock dipped to 120 units. Solicit quotes from NovaTech & Apex Dynamics, negotiate volume discount tier for 250 units, and verify AS-9100 certification.',
      tag: 'Volume Tier',
    },
    {
      title: 'Strategic Restock: SKU-7730 Heat Sink Modules',
      sku: 'SKU-7730',
      priority: 'MEDIUM' as WorkflowPriority,
      goal: 'Procure 120 units of SKU-7730 from primary vendor Apex Dynamics under $36/unit with expedited 4-day delivery SLA.',
      tag: 'Routine Restock',
    },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setTitle(p.title);
    setDescription(p.goal);
    setTargetSku(p.sku);
    setPriority(p.priority);
  };

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
                setDescription((prev) => (prev ? `${prev} ${res.transcript}` : res.transcript));
              }
            }
            setIsTranscribing(false);
          };
        } catch (err) {
          console.error('Dictation transcription error:', err);
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone error:', err);
      setDescription(
        'SKU-9020 is below safety stock. Evaluate alternative vendors, negotiate best quote under $50/unit, check compliance, and initiate PO.'
      );
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const finalTitle =
      title.trim() || `Autonomous Operations for ${targetSku}: ${description.slice(0, 40)}...`;

    await onSubmit({
      title: finalTitle,
      description,
      priority,
      targetSku,
      autoExecute,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl border border-indigo-500/40 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-indigo-950/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Trigger Autonomous Workflow Agent
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Agentic Loop
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Provide a high-level procurement goal or dictate via microphone. The orchestrator plans and executes the DAG.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Quick Presets */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Enterprise Quick Presets (1-Click Fill):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {presets.map((p, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => applyPreset(p)}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 text-left transition text-slate-300 group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-indigo-400 font-bold">{p.sku}</span>
                    <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400">
                      {p.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium line-clamp-2">{p.title}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Goal Description Input with Mic Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Natural Language Mission / Operational Goal *
              </label>
              <button
                type="button"
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition ${
                  isRecording
                    ? 'bg-red-600 text-white border-red-500 animate-pulse'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500'
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="h-3 w-3 fill-white" />
                    <span>Stop Dictation</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-3 w-3" />
                    <span>Dictate via Voice (gemini-3.5-transcribe)</span>
                  </>
                )}
              </button>
            </div>

            {isTranscribing && (
              <div className="mb-2 p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/30 flex items-center space-x-2 text-[11px] text-indigo-300 font-mono">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Transcribing voice directive into mission parameters...</span>
              </div>
            )}

            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., SKU-9020 is below safety stock. Evaluate alternative vendors, negotiate best quote under $50/unit, check compliance, and initiate PO..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Optional Title & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Workflow Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Automated Reorder SKU-9020"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Target Inventory SKU
              </label>
              <select
                value={targetSku}
                onChange={(e) => setTargetSku(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="SKU-9020">SKU-9020 (Servomotor Actuator - Critical)</option>
                <option value="SKU-4011">SKU-4011 (Titanium Aerospace Fasteners)</option>
                <option value="SKU-7730">SKU-7730 (Thermal Heat Sink Modules)</option>
                <option value="SKU-1082">SKU-1082 (Microcontroller Core v3)</option>
                <option value="SKU-5524">SKU-5524 (Carbon Fiber Enclosure)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as WorkflowPriority)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          {/* Auto execute toggle */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-200 block text-xs">
                Autonomous Loop Auto-Execution
              </span>
              <span className="text-[11px] text-slate-500">
                Run synthesized DAG steps immediately (will pause if HITL risk gate is triggered).
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoExecute}
                onChange={(e) => setAutoExecute(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isExecuting || !description.trim()}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 disabled:opacity-50 transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isExecuting ? 'Synthesizing Plan...' : 'Synthesize Plan & Execute'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
