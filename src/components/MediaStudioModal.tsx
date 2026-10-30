import React, { useState, useRef } from 'react';
import { api } from '../services/api.ts';
import {
  Image as ImageIcon,
  Video,
  Sparkles,
  Upload,
  Play,
  Download,
  Loader2,
  X,
  Layers,
  Wand2,
  Film,
  Camera,
  RefreshCw,
} from 'lucide-react';

interface MediaStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'IMAGE' | 'VIDEO';

export const MediaStudioModal: React.FC<MediaStudioModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('IMAGE');

  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState(
    'Detailed technical CAD schematic of high-torque industrial brushless servomotor with planetary gearbox, exploded assembly view, clean isometric blueprint style on dark background'
  );
  const [imageRatio, setImageRatio] = useState<string>('1:1');
  const [uploadedImageForEdit, setUploadedImageForEdit] = useState<string | null>(null);
  const [uploadedImageMime, setUploadedImageMime] = useState<string>('image/png');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Video Animation State
  const [videoInputImage, setVideoInputImage] = useState<string | null>(null);
  const [videoInputMime, setVideoInputMime] = useState<string>('image/png');
  const [videoMotionPrompt, setVideoMotionPrompt] = useState(
    'A smooth cinematic 3D camera orbit showing the automated warehouse robot navigating high-bay racks'
  );
  const [videoRatio, setVideoRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoImageRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const imagePresets = [
    'CAD schematic of brushless servomotor with planetary gear drive',
    'Exploded assembly blueprint of high-precision ball screw bearing',
    'Autonomous mobile robot chassis with LiDAR scanner sensor mount',
    'Industrial robotic arm end-effector suction gripper engineering drawing',
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedImageMime(file.type || 'image/png');
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setUploadedImageForEdit(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoInputMime(file.type || 'image/png');
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setVideoInputImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;
    setIsGeneratingImage(true);

    try {
      if (uploadedImageForEdit) {
        // Edit existing image
        const res = await api.media.editImage(
          imagePrompt,
          uploadedImageForEdit,
          uploadedImageMime,
          imageRatio
        );
        setGeneratedImageUrl(res.imageUrl);
      } else {
        // Generate new image
        const res = await api.media.generateImage(imagePrompt, imageRatio);
        setGeneratedImageUrl(res.imageUrl);
      }
    } catch (err) {
      console.error('Image generation failed:', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateVideo = async () => {
    const imageToAnimate = videoInputImage || (generatedImageUrl ? generatedImageUrl.split(',')[1] : null);
    if (!imageToAnimate || isGeneratingVideo) return;
    setIsGeneratingVideo(true);

    try {
      const res = await api.media.animateVideo(
        imageToAnimate,
        videoInputMime,
        videoMotionPrompt,
        videoRatio
      );
      setGeneratedVideoUrl(res.videoUrl);
    } catch (err) {
      console.error('Video animation failed:', err);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-4xl rounded-2xl border border-indigo-500/40 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                AutoOps AI Media Studio
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Multimodal Generative AI
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Generate CAD blueprints (gemini-nano-banana-2.1) & animate into video (gemini-omni-1.1-flash)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-2">
          <button
            onClick={() => setActiveTab('IMAGE')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'IMAGE'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>CAD & Component Image Studio (gemini-nano-banana-2.1)</span>
          </button>
          <button
            onClick={() => setActiveTab('VIDEO')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'VIDEO'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="h-4 w-4" />
            <span>Animate Image to Video (gemini-omni-1.1-flash)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs">
          {activeTab === 'IMAGE' ? (
            /* TAB 1: IMAGE GENERATION & EDITING */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Controls Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 font-semibold block mb-1.5">
                    Component Prompt / CAD Specification:
                  </label>
                  <textarea
                    rows={4}
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe industrial component, schematic, or editing instructions..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                {/* Preset Suggestions */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                    Quick Technical Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {imagePresets.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setImagePrompt(p)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition"
                      >
                        {p.split(' ')[0]} {p.split(' ')[1]} {p.split(' ')[2]}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio & Optional Image-to-Image Input */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                      Aspect Ratio:
                    </label>
                    <select
                      value={imageRatio}
                      onChange={(e) => setImageRatio(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500 font-mono"
                    >
                      <option value="1:1">1:1 Square (1024x1024)</option>
                      <option value="16:9">16:9 Landscape (1024x576)</option>
                      <option value="9:16">9:16 Portrait (576x1024)</option>
                      <option value="4:3">4:3 Standard (1024x768)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                      Edit Existing Image (Optional):
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full p-2 rounded-lg border text-xs flex items-center justify-center space-x-1.5 transition ${
                        uploadedImageForEdit
                          ? 'bg-purple-950/40 border-purple-500 text-purple-300'
                          : 'bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span className="truncate">
                        {uploadedImageForEdit ? 'Change Base Image' : 'Upload for Edit'}
                      </span>
                    </button>
                  </div>
                </div>

                {uploadedImageForEdit && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-purple-950/30 border border-purple-500/30 text-[11px] text-purple-300">
                    <span>Base image loaded for editing (Image-to-Image mode)</span>
                    <button
                      onClick={() => setUploadedImageForEdit(null)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                )}

                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Synthesizing CAD Specification...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      <span>{uploadedImageForEdit ? 'Apply AI Edits' : 'Generate Component Blueprint'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preview Column */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-800 min-h-[300px]">
                {isGeneratingImage ? (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                    <p className="text-slate-400 font-mono text-xs">
                      Rendering via gemini-nano-banana-2.1...
                    </p>
                  </div>
                ) : generatedImageUrl ? (
                  <div className="w-full flex flex-col items-center space-y-3">
                    <div className="relative group rounded-xl overflow-hidden border border-purple-500/40 max-h-[320px] w-full flex items-center justify-center bg-slate-900">
                      <img
                        src={generatedImageUrl}
                        alt="Generated Blueprint"
                        className="object-contain max-h-[320px] rounded-lg"
                      />
                    </div>
                    <div className="flex items-center space-x-2 w-full">
                      <a
                        href={generatedImageUrl}
                        download="AutoOps_CAD_Blueprint.png"
                        className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-center font-semibold text-xs flex items-center justify-center space-x-1.5 transition"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download PNG</span>
                      </a>
                      <button
                        onClick={() => {
                          setVideoInputImage(generatedImageUrl.split(',')[1]);
                          setActiveTab('VIDEO');
                        }}
                        className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-center font-semibold text-xs flex items-center justify-center space-x-1.5 transition"
                      >
                        <Film className="h-3.5 w-3.5" />
                        <span>Send to Video Animator</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 space-y-2">
                    <ImageIcon className="h-10 w-10 mx-auto text-slate-700" />
                    <p className="text-xs">Generated CAD blueprints and components will appear here</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TAB 2: ANIMATE IMAGE TO VIDEO */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Controls Column */}
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs">
                  <span className="font-semibold block mb-0.5">Gemini Omni Flash 1.1 Video Engine</span>
                  Animates still component blueprints or warehouse photos into fluid cinematic video sequences via the Interactions API.
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 font-semibold block mb-1.5">
                    Source Image for Animation:
                  </label>
                  <input
                    type="file"
                    ref={videoImageRef}
                    onChange={handleVideoImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => videoImageRef.current?.click()}
                      className="flex-1 p-2.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs flex items-center justify-center space-x-1.5 transition"
                    >
                      <Upload className="h-4 w-4" />
                      <span>{videoInputImage ? 'Replace Source Image' : 'Upload Still Image'}</span>
                    </button>
                    {generatedImageUrl && !videoInputImage && (
                      <button
                        type="button"
                        onClick={() => setVideoInputImage(generatedImageUrl.split(',')[1])}
                        className="px-3 py-2.5 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:bg-purple-600/50 text-xs transition"
                      >
                        Use Last CAD
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 font-semibold block mb-1.5">
                    Motion & Camera Direction Prompt:
                  </label>
                  <textarea
                    rows={3}
                    value={videoMotionPrompt}
                    onChange={(e) => setVideoMotionPrompt(e.target.value)}
                    placeholder="Describe how the camera or parts should move..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Aspect Ratio Constraint: 16:9 or 9:16 */}
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Aspect Ratio (Mandatory 16:9 or 9:16):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setVideoRatio('16:9')}
                      className={`py-2 px-3 rounded-xl border text-xs font-mono font-semibold transition ${
                        videoRatio === '16:9'
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      16:9 Widescreen Landscape
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoRatio('9:16')}
                      className={`py-2 px-3 rounded-xl border text-xs font-mono font-semibold transition ${
                        videoRatio === '9:16'
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      9:16 Mobile Portrait
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo || (!videoInputImage && !generatedImageUrl)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isGeneratingVideo ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Synthesizing Video Stream via gemini-omni-1.1-flash...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Generate Motion Video</span>
                    </>
                  )}
                </button>
              </div>

              {/* Video Player Column */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-800 min-h-[300px]">
                {isGeneratingVideo ? (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                    <p className="text-slate-400 font-mono text-xs">
                      Interactions API generating video frames...
                    </p>
                  </div>
                ) : generatedVideoUrl ? (
                  <div className="w-full flex flex-col items-center space-y-3">
                    <div className="rounded-xl overflow-hidden border border-indigo-500/40 w-full bg-black shadow-xl">
                      <video
                        src={generatedVideoUrl}
                        controls
                        autoPlay
                        loop
                        className={`w-full object-contain ${
                          videoRatio === '9:16' ? 'max-h-[380px]' : 'max-h-[300px]'
                        }`}
                      />
                    </div>
                    <a
                      href={generatedVideoUrl}
                      download="AutoOps_Simulation_Video.mp4"
                      className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-center font-semibold text-xs flex items-center justify-center space-x-1.5 transition"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download Video (.mp4)</span>
                    </a>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 space-y-2">
                    <Video className="h-10 w-10 mx-auto text-slate-700" />
                    <p className="text-xs">Generated video simulations will play here</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
