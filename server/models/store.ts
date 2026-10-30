import bcrypt from 'bcryptjs';
import { User, InventoryItem, Vendor, WorkflowTask, AuditLog } from './types.ts';

class DatabaseStore {
  public users: Map<string, User> = new Map();
  public inventory: Map<string, InventoryItem> = new Map();
  public vendors: Map<string, Vendor> = new Map();
  public workflows: Map<string, WorkflowTask> = new Map();
  public auditLogs: AuditLog[] = [];

  constructor() {
    this.seedDatabase();
  }

  private seedDatabase() {
    // 1. Seed Users (passwords hashed with bcrypt)
    const salt = bcrypt.genSaltSync(10);
    const usersData = [
      {
        id: 'usr_admin_1',
        name: 'Sarah Chen',
        email: 'admin@autoops.ai',
        passwordHash: bcrypt.hashSync('AdminPass123!', salt),
        role: 'ADMIN' as const,
        createdAt: '2026-01-15T08:30:00Z',
      },
      {
        id: 'usr_mgr_1',
        name: 'Marcus Vance',
        email: 'manager@autoops.ai',
        passwordHash: bcrypt.hashSync('ManagerPass123!', salt),
        role: 'MANAGER' as const,
        createdAt: '2026-02-01T10:15:00Z',
      },
      {
        id: 'usr_op_1',
        name: 'Elena Rostova',
        email: 'operator@autoops.ai',
        passwordHash: bcrypt.hashSync('OperatorPass123!', salt),
        role: 'AGENT_OPERATOR' as const,
        createdAt: '2026-03-10T14:00:00Z',
      },
    ];

    for (const u of usersData) {
      this.users.set(u.id, u);
    }

    // 2. Seed Vendors
    const vendorsData: Vendor[] = [
      {
        id: 'ven_apex',
        name: 'Apex Dynamics Ltd',
        email: 'orders@apexdynamics.com',
        rating: 4.8,
        complianceCertifications: ['ISO-9001', 'RoHS', 'CE-Compliant'],
        standardLeadDays: 4,
        pricingBySku: {
          'SKU-9020': 48.50,
          'SKU-4011': 11.20,
          'SKU-7730': 35.00,
          'SKU-5524': 138.00,
        },
        volumeDiscountTier: { minQuantity: 100, discountPercent: 8 },
        status: 'APPROVED',
      },
      {
        id: 'ven_novatech',
        name: 'NovaTech Components Inc',
        email: 'b2b@novatech-supply.com',
        rating: 4.6,
        complianceCertifications: ['ISO-9001', 'AS-9100 Aerospace', 'RoHS'],
        standardLeadDays: 6,
        pricingBySku: {
          'SKU-9020': 51.00,
          'SKU-4011': 10.80,
          'SKU-7730': 36.50,
          'SKU-1082': 8.10,
        },
        volumeDiscountTier: { minQuantity: 150, discountPercent: 12 },
        status: 'APPROVED',
      },
      {
        id: 'ven_quantum',
        name: 'Quantum Precision Corp',
        email: 'procurement@quantumprecision.io',
        rating: 4.9,
        complianceCertifications: ['ISO-9001', 'ISO-14001 ESG', 'SOC2', 'ITAR'],
        standardLeadDays: 3,
        pricingBySku: {
          'SKU-9020': 49.20,
          'SKU-4011': 12.00,
          'SKU-5524': 134.50,
        },
        volumeDiscountTier: { minQuantity: 80, discountPercent: 10 },
        status: 'APPROVED',
      },
      {
        id: 'ven_global',
        name: 'Global Sourcing Alliance',
        email: 'quotes@globalsourcing.net',
        rating: 3.8,
        complianceCertifications: ['ISO-9001'],
        standardLeadDays: 14,
        pricingBySku: {
          'SKU-9020': 42.00, // Very cheap but questionable SLA/lead time
          'SKU-4011': 9.50,
          'SKU-7730': 31.00,
        },
        status: 'PROBATION',
      },
    ];

    for (const v of vendorsData) {
      this.vendors.set(v.id, v);
    }

    // 3. Seed Inventory Items
    const inventoryData: InventoryItem[] = [
      {
        id: 'inv_1',
        sku: 'SKU-9020',
        name: 'High-Precision Servomotor Actuator',
        category: 'Robotics & Automation',
        stockLevel: 14,
        reorderPoint: 50,
        safetyStock: 30,
        unitPrice: 54.00,
        primaryVendorEmail: 'orders@apexdynamics.com',
        primaryVendorName: 'Apex Dynamics Ltd',
        leadTimeDays: 4,
        warehouseLocation: 'Bay-4B / Austin Central Depot',
      },
      {
        id: 'inv_2',
        sku: 'SKU-4011',
        name: 'Titanium Grade-5 Aerospace Fasteners (Box of 500)',
        category: 'Hardware & Fasteners',
        stockLevel: 120,
        reorderPoint: 250,
        safetyStock: 150,
        unitPrice: 12.50,
        primaryVendorEmail: 'b2b@novatech-supply.com',
        primaryVendorName: 'NovaTech Components Inc',
        leadTimeDays: 6,
        warehouseLocation: 'Rack-12 / Chicago Logistics Hub',
      },
      {
        id: 'inv_3',
        sku: 'SKU-7730',
        name: 'Industrial Thermal Heat Sink Modules',
        category: 'Thermal Management',
        stockLevel: 62,
        reorderPoint: 80,
        safetyStock: 50,
        unitPrice: 38.20,
        primaryVendorEmail: 'orders@apexdynamics.com',
        primaryVendorName: 'Apex Dynamics Ltd',
        leadTimeDays: 4,
        warehouseLocation: 'Bay-7A / Reno Fulfillment',
      },
      {
        id: 'inv_4',
        sku: 'SKU-1082',
        name: 'ARM Microcontroller Logic Core v3',
        category: 'Semiconductors',
        stockLevel: 420,
        reorderPoint: 300,
        safetyStock: 200,
        unitPrice: 8.90,
        primaryVendorEmail: 'b2b@novatech-supply.com',
        primaryVendorName: 'NovaTech Components Inc',
        leadTimeDays: 6,
        warehouseLocation: 'Secure Safe / San Jose Hub',
      },
      {
        id: 'inv_5',
        sku: 'SKU-5524',
        name: 'Reinforced Carbon Fiber Enclosure (IP67)',
        category: 'Structural Enclosures',
        stockLevel: 8,
        reorderPoint: 25,
        safetyStock: 15,
        unitPrice: 145.00,
        primaryVendorEmail: 'procurement@quantumprecision.io',
        primaryVendorName: 'Quantum Precision Corp',
        leadTimeDays: 3,
        warehouseLocation: 'Bay-2C / Austin Central Depot',
      },
    ];

    for (const inv of inventoryData) {
      this.inventory.set(inv.id, inv);
    }

    // 4. Seed Historical Workflows
    const wf1: WorkflowTask = {
      id: 'wf_auto_101',
      title: 'Automated Reorder: SKU-7730 Heat Sink Modules',
      description: 'Stock dipped to 62 units (below threshold 80). Multi-agent procurement initiated.',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      targetSku: 'SKU-7730',
      riskScore: 28,
      estimatedSavings: 384,
      agentPlan: {
        goal: 'Replenish SKU-7730 to 180 units with minimum lead time and negotiated quote',
        riskScore: 28,
        riskAssessmentSummary: 'Low financial risk ($4,200 total), proven Tier-1 supplier Apex Dynamics, compliant certifications valid.',
        steps: [
          {
            stepId: 1,
            agent: 'InventoryMonitorAgent',
            action: 'check_stock',
            reasoning: 'Evaluated warehouse inventory telemetry: 62 units on-hand, burn rate 14 units/week. Reorder quantity calculated: 120 units.',
            status: 'COMPLETED',
            toolToExecute: 'check_stock',
            toolInput: { sku: 'SKU-7730' },
            toolOutput: { currentStock: 62, safetyDeficit: 18, recommendedReorder: 120 },
            confidenceScore: 98,
            tokensUsed: 240,
          },
          {
            stepId: 2,
            agent: 'VendorNegotiatorAgent',
            action: 'query_vendor_rates',
            reasoning: 'Queried Apex Dynamics and NovaTech. Apex offered $35.00/unit (original catalog $38.20). Secured $3.20/unit discount saving $384.',
            status: 'COMPLETED',
            toolToExecute: 'query_vendor_rates',
            toolInput: { sku: 'SKU-7730', targetPrice: 36.00, quantity: 120 },
            toolOutput: { selectedVendor: 'Apex Dynamics Ltd', agreedPrice: 35.00, totalCost: 4200, leadDays: 4 },
            confidenceScore: 94,
            tokensUsed: 380,
          },
          {
            stepId: 3,
            agent: 'ComplianceAgent',
            action: 'evaluate_compliance',
            reasoning: 'Verified ISO-9001 and RoHS certificates. Zero export sanctions detected. 99.2% on-time delivery metric verified.',
            status: 'COMPLETED',
            toolToExecute: 'evaluate_compliance',
            toolInput: { vendorId: 'ven_apex', sku: 'SKU-7730' },
            toolOutput: { compliant: true, complianceScore: 99, notes: 'Fully audited Tier-1 supplier' },
            confidenceScore: 99,
            tokensUsed: 210,
          },
          {
            stepId: 4,
            agent: 'ApprovalRouterAgent',
            action: 'calculate_risk_index',
            reasoning: 'Risk score is 28/100, total value is $4,200 (under $5,000 threshold). Autonomous sign-off granted without human escalation.',
            status: 'COMPLETED',
            toolToExecute: 'calculate_risk_index',
            toolInput: { totalAmount: 4200, riskScore: 28 },
            toolOutput: { autoApproved: true, reason: 'Value under $5,000 policy gate' },
            confidenceScore: 96,
            tokensUsed: 190,
          },
          {
            stepId: 5,
            agent: 'DispatcherAgent',
            action: 'draft_po_and_dispatch',
            reasoning: 'Drafted PO-2026-7730, dispatched electronic EDI to orders@apexdynamics.com, updated ERP ledger.',
            status: 'COMPLETED',
            toolToExecute: 'draft_po',
            toolInput: { vendor: 'Apex Dynamics Ltd', amount: 4200, poNumber: 'PO-2026-7730' },
            toolOutput: { dispatched: true, poNumber: 'PO-2026-7730', trackingStatus: 'ACKNOWLEDGED' },
            confidenceScore: 99,
            tokensUsed: 280,
          },
        ],
      },
      executionLogs: [
        { timestamp: '2026-10-29T18:10:02Z', agentName: 'InventoryMonitorAgent', action: 'Telemetry Scan', result: 'Stock depletion detected below threshold', level: 'WARN' },
        { timestamp: '2026-10-29T18:10:05Z', agentName: 'VendorNegotiatorAgent', action: 'B2B RFQ Negotiation', result: 'Secured $35.00/unit pricing (8.3% discount)', level: 'ACTION' },
        { timestamp: '2026-10-29T18:10:08Z', agentName: 'ComplianceAgent', action: 'Supplier Audit', result: 'All environmental & safety covenants met', level: 'SUCCESS' },
        { timestamp: '2026-10-29T18:10:11Z', agentName: 'ApprovalRouterAgent', action: 'Policy Governance', result: 'Auto-approved (Score 28, Amount $4,200)', level: 'INFO' },
        { timestamp: '2026-10-29T18:10:14Z', agentName: 'DispatcherAgent', action: 'PO Dispatch', result: 'PO-2026-7730 sent to Apex Dynamics Ltd', level: 'SUCCESS' },
      ],
      purchaseOrder: {
        poNumber: 'PO-2026-7730',
        vendorName: 'Apex Dynamics Ltd',
        vendorEmail: 'orders@apexdynamics.com',
        sku: 'SKU-7730',
        itemName: 'Industrial Thermal Heat Sink Modules',
        quantity: 120,
        unitPrice: 35.00,
        totalAmount: 4200,
        deliveryDate: '2026-11-04',
        status: 'DISPATCHED',
        dispatchedAt: '2026-10-29T18:10:14Z',
        complianceChecked: true,
      },
      createdBy: 'AutoOps Orchestrator',
      createdAt: '2026-10-29T18:10:00Z',
      updatedAt: '2026-10-29T18:10:15Z',
    };

    const wf2: WorkflowTask = {
      id: 'wf_auto_102',
      title: 'High-Value Replenishment: SKU-9020 Servomotor Actuators',
      description: 'SKU-9020 is critical (14 units on-hand). Evaluated quotes. Order total is $7,275 (> $5,000 threshold), awaiting Human Manager Sign-off.',
      status: 'NEEDS_APPROVAL',
      priority: 'CRITICAL',
      targetSku: 'SKU-9020',
      riskScore: 68,
      estimatedSavings: 825,
      agentPlan: {
        goal: 'Replenish SKU-9020 with 150 units under target $50/unit and verify ITAR / ISO compliance',
        riskScore: 68,
        riskAssessmentSummary: 'Order value ($7,275) exceeds $5,000 autonomous spending limit. Global Sourcing was rejected for bad lead times. Quantum Precision selected. Human Manager approval required before PO dispatch.',
        steps: [
          {
            stepId: 1,
            agent: 'InventoryMonitorAgent',
            action: 'check_stock',
            reasoning: 'Critical deficit detected: 14 units on hand vs 50 unit reorder point. Factory line stoppage risk high if not replenished within 10 days.',
            status: 'COMPLETED',
            toolToExecute: 'check_stock',
            toolInput: { sku: 'SKU-9020' },
            toolOutput: { currentStock: 14, safetyDeficit: 36, recommendedReorder: 150 },
            confidenceScore: 99,
            tokensUsed: 260,
          },
          {
            stepId: 2,
            agent: 'VendorNegotiatorAgent',
            action: 'query_vendor_rates',
            reasoning: 'Evaluated 3 suppliers: Global ($42.00, 14 days lead), NovaTech ($51.00), Quantum Precision ($49.20). Counter-offered Quantum Precision with 150 volume commitment and reached $48.50/unit.',
            status: 'COMPLETED',
            toolToExecute: 'query_vendor_rates',
            toolInput: { sku: 'SKU-9020', targetPrice: 50.00, quantity: 150 },
            toolOutput: { selectedVendor: 'Quantum Precision Corp', agreedPrice: 48.50, totalCost: 7275, leadDays: 3, savings: 825 },
            confidenceScore: 92,
            tokensUsed: 420,
          },
          {
            stepId: 3,
            agent: 'ComplianceAgent',
            action: 'evaluate_compliance',
            reasoning: 'Audited Quantum Precision Corp: Certified ISO-9001, ISO-14001 ESG, SOC2. Full ITAR traceability verified.',
            status: 'COMPLETED',
            toolToExecute: 'evaluate_compliance',
            toolInput: { vendorId: 'ven_quantum', sku: 'SKU-9020' },
            toolOutput: { compliant: true, complianceScore: 98, certifications: ['ISO-9001', 'ISO-14001 ESG', 'SOC2', 'ITAR'] },
            confidenceScore: 97,
            tokensUsed: 230,
          },
          {
            stepId: 4,
            agent: 'ApprovalRouterAgent',
            action: 'calculate_risk_index',
            reasoning: 'Total PO Amount ($7,275) exceeds the $5,000 autonomous threshold policy. Dynamic Risk Score = 68. Enforcing Human-in-the-Loop manager gate.',
            status: 'NEEDS_APPROVAL',
            toolToExecute: 'calculate_risk_index',
            toolInput: { totalAmount: 7275, riskScore: 68 },
            toolOutput: { autoApproved: false, requiresManagerApproval: true, policyReason: 'Total cost > $5,000 threshold' },
            confidenceScore: 95,
            tokensUsed: 210,
          },
          {
            stepId: 5,
            agent: 'DispatcherAgent',
            action: 'draft_po_and_dispatch',
            reasoning: 'Paused awaiting manager signature. Once approved, PO will be transmitted via secure EDI.',
            status: 'PENDING',
            toolToExecute: 'draft_po',
            toolInput: { vendor: 'Quantum Precision Corp', amount: 7275, poNumber: 'PO-2026-9020' },
            confidenceScore: 90,
            tokensUsed: 0,
          },
        ],
      },
      executionLogs: [
        { timestamp: '2026-10-29T21:45:00Z', agentName: 'InventoryMonitorAgent', action: 'Threshold Breach Detected', result: '14 units remaining (safety threshold 30)', level: 'WARN' },
        { timestamp: '2026-10-29T21:45:04Z', agentName: 'VendorNegotiatorAgent', action: 'B2B Dynamic Bidding', result: 'Quantum Precision agreed to $48.50/unit ($825 savings)', level: 'ACTION' },
        { timestamp: '2026-10-29T21:45:08Z', agentName: 'ComplianceAgent', action: 'Vendor Risk Audit', result: 'Quantum Precision certified ISO-9001/ITAR clean', level: 'SUCCESS' },
        { timestamp: '2026-10-29T21:45:12Z', agentName: 'ApprovalRouterAgent', action: 'HITL Gate Triggered', result: 'Cost $7,275 > $5,000 threshold. Escalated to Manager Sign-Off.', level: 'WARN' },
      ],
      purchaseOrder: {
        poNumber: 'PO-2026-9020',
        vendorName: 'Quantum Precision Corp',
        vendorEmail: 'procurement@quantumprecision.io',
        sku: 'SKU-9020',
        itemName: 'High-Precision Servomotor Actuator',
        quantity: 150,
        unitPrice: 48.50,
        totalAmount: 7275,
        deliveryDate: '2026-11-03',
        status: 'DRAFT',
        complianceChecked: true,
      },
      createdBy: 'AutoOps Orchestrator',
      createdAt: '2026-10-29T21:45:00Z',
      updatedAt: '2026-10-29T21:45:15Z',
    };

    this.workflows.set(wf1.id, wf1);
    this.workflows.set(wf2.id, wf2);

    // 5. Seed Audit Logs
    this.auditLogs = [
      {
        id: 'aud_1',
        timestamp: '2026-10-29T18:10:02Z',
        workflowId: 'wf_auto_101',
        agentId: 'InventoryMonitorAgent',
        action: 'check_stock',
        decisionReasoning: 'Warehouse SKU-7730 is at 62 units. Calculated reorder quantity of 120 based on historical 30-day velocity.',
        confidenceScore: 98,
        tokensUsed: 240,
        toolInvoked: 'check_stock',
        toolInput: { sku: 'SKU-7730' },
        toolOutput: { currentStock: 62, safetyStock: 50 },
        riskScore: 20,
      },
      {
        id: 'aud_2',
        timestamp: '2026-10-29T18:10:05Z',
        workflowId: 'wf_auto_101',
        agentId: 'VendorNegotiatorAgent',
        action: 'query_vendor_rates',
        decisionReasoning: 'Apex Dynamics offered $35.00/unit with 4-day delivery SLA. Rejected Global Sourcing due to 14-day SLA risk.',
        confidenceScore: 94,
        tokensUsed: 380,
        toolInvoked: 'query_vendor_rates',
        toolInput: { sku: 'SKU-7730', targetPrice: 36.00 },
        toolOutput: { selectedVendor: 'Apex Dynamics Ltd', savings: 384 },
        riskScore: 28,
      },
      {
        id: 'aud_3',
        timestamp: '2026-10-29T21:45:12Z',
        workflowId: 'wf_auto_102',
        agentId: 'ApprovalRouterAgent',
        action: 'enforce_hitl_policy',
        decisionReasoning: 'Task value ($7,275) exceeds automated procurement delegation limit ($5,000). Pausing workflow and dispatching HITL ticket to Procurement Manager.',
        confidenceScore: 95,
        tokensUsed: 210,
        toolInvoked: 'calculate_risk_index',
        toolInput: { totalAmount: 7275 },
        toolOutput: { status: 'ESCALATED', managerRoleRequired: 'MANAGER' },
        riskScore: 68,
      },
    ];
  }

  // Repository Methods
  public findUserByEmail(email: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }

  public findUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  public createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  public getWorkflows(): WorkflowTask[] {
    return Array.from(this.workflows.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getWorkflowById(id: string): WorkflowTask | undefined {
    return this.workflows.get(id);
  }

  public saveWorkflow(workflow: WorkflowTask): WorkflowTask {
    workflow.updatedAt = new Date().toISOString();
    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  public deleteWorkflow(id: string): boolean {
    return this.workflows.delete(id);
  }

  public getInventory(): InventoryItem[] {
    return Array.from(this.inventory.values());
  }

  public getInventoryBySku(sku: string): InventoryItem | undefined {
    for (const item of this.inventory.values()) {
      if (item.sku.toLowerCase() === sku.toLowerCase()) {
        return item;
      }
    }
    return undefined;
  }

  public updateInventoryStock(sku: string, addedStock: number): InventoryItem | undefined {
    const item = this.getInventoryBySku(sku);
    if (item) {
      item.stockLevel += addedStock;
      this.inventory.set(item.id, item);
      return item;
    }
    return undefined;
  }

  public getVendors(): Vendor[] {
    return Array.from(this.vendors.values());
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public addAuditLog(log: AuditLog): AuditLog {
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return log;
  }
}

export const db = new DatabaseStore();
