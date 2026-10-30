import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { WorkflowProvider, useWorkflow } from './context/WorkflowContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { WorkflowsPage } from './pages/WorkflowsPage.tsx';
import { WorkflowDetailPage } from './pages/WorkflowDetailPage.tsx';
import { InventoryPage } from './pages/InventoryPage.tsx';
import { AuditTrailPage } from './pages/AuditTrailPage.tsx';
import { DigitalTwinPage } from './pages/DigitalTwinPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { NewWorkflowModal } from './components/NewWorkflowModal.tsx';
import { HitlModal } from './components/HitlModal.tsx';
import { AgenticChatbot } from './components/AgenticChatbot.tsx';
import { MarketSearchModal } from './components/MarketSearchModal.tsx';
import { MediaStudioModal } from './components/MediaStudioModal.tsx';
import { Loader2 } from 'lucide-react';

const ProtectedLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const {
    createWorkflow,
    approveHitlGate,
    hitlWorkflowToApprove,
    setHitlWorkflowToApprove,
    isExecuting,
  } = useWorkflow();
  const [newWorkflowModalOpen, setNewWorkflowModalOpen] = useState(false);
  const [defaultSkuForModal, setDefaultSkuForModal] = useState<string | undefined>();
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isMarketSearchOpen, setIsMarketSearchOpen] = useState(false);
  const [isMediaStudioOpen, setIsMediaStudioOpen] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-400 font-mono tracking-wider">
          Initializing AutoOps AI Agent Mesh...
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleOpenNewWorkflowWithSku = (sku: string) => {
    setDefaultSkuForModal(sku);
    setNewWorkflowModalOpen(true);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation */}
      <Navbar
        onOpenNewWorkflow={() => {
          setDefaultSkuForModal(undefined);
          setNewWorkflowModalOpen(true);
        }}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenMarketSearch={() => setIsMarketSearchOpen(true)}
        onOpenMediaStudio={() => setIsMediaStudioOpen(true)}
      />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          onOpenCopilot={() => setIsCopilotOpen(true)}
          onOpenMarketSearch={() => setIsMarketSearchOpen(true)}
          onOpenMediaStudio={() => setIsMediaStudioOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-950 via-slate-900/20 to-slate-950">
          <Routes>
            <Route path="/" element={<Dashboard onOpenNewWorkflow={() => setNewWorkflowModalOpen(true)} />} />
            <Route path="/digital-twin" element={<DigitalTwinPage onOpenNewWorkflow={() => setNewWorkflowModalOpen(true)} />} />
            <Route path="/workflows" element={<WorkflowsPage onOpenNewWorkflow={() => setNewWorkflowModalOpen(true)} />} />
            <Route path="/simulator" element={<WorkflowDetailPage onOpenNewWorkflow={() => setNewWorkflowModalOpen(true)} />} />
            <Route path="/inventory" element={<InventoryPage onTriggerSkuWorkflow={handleOpenNewWorkflowWithSku} />} />
            <Route path="/audit" element={<AuditTrailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global New Workflow Modal */}
      <NewWorkflowModal
        isOpen={newWorkflowModalOpen}
        defaultSku={defaultSkuForModal}
        onClose={() => setNewWorkflowModalOpen(false)}
        onSubmit={async (payload) => {
          const wf = await createWorkflow(payload);
          navigate('/simulator');
          return wf;
        }}
        isExecuting={isExecuting}
      />

      {/* Global Human-in-the-Loop Sign-off Modal */}
      {hitlWorkflowToApprove && (
        <HitlModal
          workflow={hitlWorkflowToApprove}
          onClose={() => setHitlWorkflowToApprove(null)}
          onApprove={async (id, notes, decision) => {
            await approveHitlGate(id, notes, decision);
          }}
          isExecuting={isExecuting}
        />
      )}

      {/* Gemini Agentic Copilot Chatbot */}
      <AgenticChatbot
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

      {/* Google Search Grounding Market Intelligence & Maps Modal */}
      <MarketSearchModal
        isOpen={isMarketSearchOpen}
        onClose={() => setIsMarketSearchOpen(false)}
      />

      {/* Multimodal Media Studio Modal (Image CAD & Omni Flash Video) */}
      <MediaStudioModal
        isOpen={isMediaStudioOpen}
        onClose={() => setIsMediaStudioOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkflowProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </WorkflowProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
