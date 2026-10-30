import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'MANAGER', 'AGENT_OPERATOR']).default('AGENT_OPERATOR'),
});

export const createWorkflowSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(5, 'Task goal/description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  targetSku: z.string().optional(),
  autoExecute: z.boolean().optional().default(true),
});

export const approveWorkflowSchema = z.object({
  notes: z.string().optional().default('Approved by manager sign-off'),
  decision: z.enum(['APPROVE', 'REJECT']).default('APPROVE'),
});

export const updateInventorySchema = z.object({
  sku: z.string(),
  stockAdjustment: z.number(),
  reason: z.string().optional(),
});
