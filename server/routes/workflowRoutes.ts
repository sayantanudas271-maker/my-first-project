import { Router } from 'express';
import { workflowController } from '../controllers/workflowController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { validateRequest } from '../middleware/validateRequest.ts';
import { createWorkflowSchema, approveWorkflowSchema } from '../utils/zodSchemas.ts';

const router = Router();

router.use(authMiddleware);

router.get('/', workflowController.getWorkflows);
router.get('/:id', workflowController.getWorkflowById);
router.post('/', validateRequest(createWorkflowSchema), workflowController.createWorkflow);
router.post('/:id/execute-step', workflowController.executeStep);
router.post('/:id/run', workflowController.runWorkflow);
router.post('/:id/approve', validateRequest(approveWorkflowSchema), workflowController.approveWorkflow);
router.delete('/:id', workflowController.deleteWorkflow);

export default router;
