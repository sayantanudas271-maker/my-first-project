import { Response } from 'express';
import { db } from '../models/store.ts';
import { aiAgentService } from '../services/aiAgentService.ts';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { WorkflowTask } from '../models/types.ts';

export const workflowController = {
  getWorkflows: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const workflows = db.getWorkflows();
    res.json({ workflows });
  },

  getWorkflowById: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const workflow = db.getWorkflowById(id);
    if (!workflow) {
      res.status(404).json({ error: 'Workflow task not found' });
      return;
    }
    res.json({ workflow });
  },

  createWorkflow: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { title, description, priority, targetSku, autoExecute } = req.body;
    const user = req.user!;

    // 1. Generate plan using Gemini or heuristic planner
    const plan = await aiAgentService.planWorkflow(title, description, targetSku);

    const taskId = `wf_${Date.now()}`;
    const newWorkflow: WorkflowTask = {
      id: taskId,
      title,
      description,
      status: 'PENDING',
      priority: priority || 'MEDIUM',
      targetSku: targetSku || 'SKU-9020',
      riskScore: plan.riskScore,
      estimatedSavings: 0,
      agentPlan: plan,
      executionLogs: [
        {
          timestamp: new Date().toISOString(),
          agentName: 'OrchestratorAgent',
          action: 'Task Plan Synthesized',
          result: `Synthesized ${plan.steps.length}-step DAG. Assessed initial risk index: ${plan.riskScore}/100.`,
          level: 'INFO',
          data: { goal: plan.goal, riskScore: plan.riskScore },
        },
      ],
      createdBy: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.saveWorkflow(newWorkflow);

    // If autoExecute requested, run workflow
    if (autoExecute !== false) {
      // Run autonomous workflow
      const executed = await aiAgentService.runAutonomousWorkflow(newWorkflow.id);
      res.status(201).json({ workflow: executed });
      return;
    }

    res.status(201).json({ workflow: newWorkflow });
  },

  executeStep: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { stepId } = req.body;

    if (!stepId) {
      res.status(400).json({ error: 'stepId is required' });
      return;
    }

    try {
      const updated = await aiAgentService.executeSingleStep(id, Number(stepId));
      res.json({ workflow: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Step execution failed' });
    }
  },

  runWorkflow: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const updated = await aiAgentService.runAutonomousWorkflow(id);
      res.json({ workflow: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Workflow execution failed' });
    }
  },

  approveWorkflow: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { notes, decision } = req.body;
    const user = req.user!;

    // Check permissions: only MANAGER or ADMIN can sign off on HITL
    if (user.role === 'AGENT_OPERATOR') {
      res.status(403).json({
        error: 'Manager or Admin sign-off required for Human-in-the-Loop authorization gate.',
      });
      return;
    }

    try {
      const updated = await aiAgentService.approveAndResume(
        id,
        `${user.name} (${user.role})`,
        notes || 'Approved via Human-in-the-Loop Gate',
        decision || 'APPROVE'
      );
      res.json({ workflow: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Approval processing failed' });
    }
  },

  deleteWorkflow: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const deleted = db.deleteWorkflow(id);
    if (!deleted) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }
    res.json({ success: true, id });
  },
};
