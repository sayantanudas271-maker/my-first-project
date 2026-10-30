import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  WorkflowTask,
  AuditLog,
  InventoryItem,
  Vendor,
  AnalyticsMetrics,
  AnalyticsResponse,
  WorkflowPriority,
} from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';

interface WorkflowContextType {
  workflows: WorkflowTask[];
  activeWorkflow: WorkflowTask | null;
  analytics: AnalyticsResponse | null;
  auditLogs: AuditLog[];
  inventory: InventoryItem[];
  vendors: Vendor[];
  isLoading: boolean;
  isExecuting: boolean;
  selectedStepId: number | null;
  hitlWorkflowToApprove: WorkflowTask | null;
  setSelectedStepId: (stepId: number | null) => void;
  setHitlWorkflowToApprove: (wf: WorkflowTask | null) => void;
  setActiveWorkflow: (wf: WorkflowTask | null) => void;
  refreshAll: () => Promise<void>;
  createWorkflow: (payload: {
    title: string;
    description: string;
    priority: WorkflowPriority;
    targetSku?: string;
    autoExecute?: boolean;
  }) => Promise<WorkflowTask>;
  executeStep: (workflowId: string, stepId: number) => Promise<WorkflowTask>;
  runAutonomous: (workflowId: string) => Promise<WorkflowTask>;
  approveHitlGate: (
    workflowId: string,
    notes?: string,
    decision?: 'APPROVE' | 'REJECT'
  ) => Promise<WorkflowTask>;
  deleteWorkflow: (workflowId: string) => Promise<void>;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<WorkflowTask[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowTask | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const [hitlWorkflowToApprove, setHitlWorkflowToApprove] = useState<WorkflowTask | null>(null);

  const refreshAll = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [wfRes, anRes, logRes, invRes, venRes] = await Promise.all([
        api.workflows.getAll(),
        api.audit.getAnalytics(),
        api.audit.getLogs(),
        api.inventory.getAll(),
        api.inventory.getVendors(),
      ]);

      setWorkflows(wfRes.workflows);
      setAnalytics(anRes);
      setAuditLogs(logRes.logs);
      setInventory(invRes.inventory);
      setVendors(venRes.vendors);

      // If activeWorkflow is open, update its reference
      if (activeWorkflow) {
        const found = wfRes.workflows.find((w) => w.id === activeWorkflow.id);
        if (found) setActiveWorkflow(found);
      }
    } catch (err) {
      console.error('Error fetching system state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, activeWorkflow?.id]);

  useEffect(() => {
    if (user) {
      refreshAll();
    }
  }, [user]);

  const createWorkflow = async (payload: {
    title: string;
    description: string;
    priority: WorkflowPriority;
    targetSku?: string;
    autoExecute?: boolean;
  }) => {
    setIsExecuting(true);
    try {
      const res = await api.workflows.create(payload);
      await refreshAll();
      setActiveWorkflow(res.workflow);
      return res.workflow;
    } finally {
      setIsExecuting(false);
    }
  };

  const executeStep = async (workflowId: string, stepId: number) => {
    setIsExecuting(true);
    try {
      const res = await api.workflows.executeStep(workflowId, stepId);
      await refreshAll();
      setActiveWorkflow(res.workflow);
      return res.workflow;
    } finally {
      setIsExecuting(false);
    }
  };

  const runAutonomous = async (workflowId: string) => {
    setIsExecuting(true);
    try {
      const res = await api.workflows.run(workflowId);
      await refreshAll();
      setActiveWorkflow(res.workflow);
      return res.workflow;
    } finally {
      setIsExecuting(false);
    }
  };

  const approveHitlGate = async (
    workflowId: string,
    notes?: string,
    decision: 'APPROVE' | 'REJECT' = 'APPROVE'
  ) => {
    setIsExecuting(true);
    try {
      const res = await api.workflows.approve(workflowId, notes, decision);
      await refreshAll();
      setActiveWorkflow(res.workflow);
      setHitlWorkflowToApprove(null);
      return res.workflow;
    } finally {
      setIsExecuting(false);
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    await api.workflows.delete(workflowId);
    if (activeWorkflow?.id === workflowId) {
      setActiveWorkflow(null);
    }
    await refreshAll();
  };

  return (
    <WorkflowContext.Provider
      value={{
        workflows,
        activeWorkflow,
        analytics,
        auditLogs,
        inventory,
        vendors,
        isLoading,
        isExecuting,
        selectedStepId,
        hitlWorkflowToApprove,
        setSelectedStepId,
        setHitlWorkflowToApprove,
        setActiveWorkflow,
        refreshAll,
        createWorkflow,
        executeStep,
        runAutonomous,
        approveHitlGate,
        deleteWorkflow,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};
