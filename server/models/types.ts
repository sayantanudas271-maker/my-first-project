export type UserRole = 'ADMIN' | 'MANAGER' | 'AGENT_OPERATOR';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stockLevel: number;
  reorderPoint: number;
  safetyStock: number;
  unitPrice: number;
  primaryVendorEmail: string;
  primaryVendorName: string;
  leadTimeDays: number;
  warehouseLocation: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  rating: number; // 1-5
  complianceCertifications: string[];
  standardLeadDays: number;
  pricingBySku: Record<string, number>;
  volumeDiscountTier?: { minQuantity: number; discountPercent: number };
  status: 'APPROVED' | 'PROBATION' | 'RESTRICTED';
}

export type WorkflowStatus = 'PENDING' | 'IN_PROGRESS' | 'NEEDS_APPROVAL' | 'COMPLETED' | 'FAILED';
export type WorkflowPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AgentName = 
  | 'OrchestratorAgent'
  | 'InventoryMonitorAgent'
  | 'VendorNegotiatorAgent'
  | 'ComplianceAgent'
  | 'ApprovalRouterAgent'
  | 'DispatcherAgent';

export type StepStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'NEEDS_APPROVAL' | 'FAILED' | 'SKIPPED';

export interface WorkflowStep {
  stepId: number;
  agent: AgentName;
  action: string;
  reasoning: string;
  status: StepStatus;
  toolToExecute?: string;
  toolInput?: Record<string, any>;
  toolOutput?: Record<string, any>;
  confidenceScore?: number;
  tokensUsed?: number;
  startedAt?: string;
  completedAt?: string;
}

export interface ExecutionLog {
  timestamp: string;
  agentName: AgentName;
  action: string;
  result: string;
  level: 'INFO' | 'WARN' | 'ACTION' | 'SUCCESS' | 'ERROR';
  data?: any;
}

export interface PurchaseOrder {
  poNumber: string;
  vendorName: string;
  vendorEmail: string;
  sku: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  deliveryDate: string;
  status: 'DRAFT' | 'APPROVED' | 'DISPATCHED';
  approvedBy?: string;
  approvedAt?: string;
  dispatchedAt?: string;
  complianceChecked: boolean;
}

export interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  status: WorkflowStatus;
  priority: WorkflowPriority;
  targetSku?: string;
  riskScore: number; // 1 - 100
  estimatedSavings: number; // in USD
  agentPlan: {
    goal: string;
    riskScore: number;
    riskAssessmentSummary: string;
    steps: WorkflowStep[];
  };
  executionLogs: ExecutionLog[];
  purchaseOrder?: PurchaseOrder;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  workflowId: string;
  agentId: AgentName;
  action: string;
  decisionReasoning: string;
  confidenceScore: number;
  tokensUsed: number;
  toolInvoked?: string;
  toolInput?: Record<string, any>;
  toolOutput?: Record<string, any>;
  riskScore?: number;
}
