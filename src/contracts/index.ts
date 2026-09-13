/**
 * Phase 2 - Conservative zod API contracts.
 *
 * These schemas intentionally validate structure only. Where the real
 * source semantics were not fully verified (e.g. the full evaluation status
 * list), the schema is documented as a conservative subset and may need
 * widening. `z.uuid()` is deliberately avoided for maximum zod-version
 * compatibility; IDs are validated as nonempty strings (max 128).
 */
import { z } from 'zod';

export const IdSchema = z.string().min(1).max(128);
export const VersionSchema = z.number().int().nonnegative();
export const TimestampSchema = z.string().min(1);
export const ErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
});

export const ApiSuccessSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ ok: z.literal(true), data, version: VersionSchema.optional() });
export const ApiErrorSchema = z.object({
  ok: z.literal(false),
  error: ErrorSchema,
});

export const PaginationSchema = z.object({
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

// Conservative subset; source may contain additional statuses.
export const EvaluationStatusSchema = z.enum([
  'draft',
  'submitted',
  'approved',
  'rejected',
]);

export const ScoreInputSchema = z.object({
  criterionId: IdSchema,
  employeeId: IdSchema,
  value: z.number(),
  comment: z.string().max(2000).optional(),
});

export const EvaluationCreateSchema = z.object({
  workspaceId: IdSchema,
  employeeId: IdSchema,
  cycleId: IdSchema,
  status: EvaluationStatusSchema.default('draft'),
});
export const EvaluationUpdateSchema = z.object({
  status: EvaluationStatusSchema.optional(),
  comment: z.string().max(2000).optional(),
});
export const EvaluationSubmitSchema = z.object({
  evaluationId: IdSchema,
  submittedBy: IdSchema,
});

// Minimal passthrough schemas (conservative; refine against real types later).
export const WorkspaceSchema = z
  .object({ id: IdSchema, name: z.string().min(1).max(256) })
  .passthrough();
export const UserSchema = z
  .object({ id: IdSchema, name: z.string().min(1).max(256) })
  .passthrough();
export const EmployeeSchema = z
  .object({ id: IdSchema, name: z.string().min(1).max(256) })
  .passthrough();
export const EvaluationCoreSchema = z
  .object({
    id: IdSchema,
    workspaceId: IdSchema,
    employeeId: IdSchema,
    status: EvaluationStatusSchema,
    version: VersionSchema.default(1),
  })
  .passthrough();

// Base-like discriminated union for realtime events; source shape not verified.
export const RealtimeEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('evaluation.updated'), id: IdSchema }),
  z.object({ type: z.literal('workspace.updated'), id: IdSchema }),
]);

export const OptimisticConflictSchema = z.object({
  kind: z.literal('optimistic_conflict'),
  expectedVersion: VersionSchema,
  actualVersion: VersionSchema,
  message: z.string().min(1),
});

export type Id = z.infer<typeof IdSchema>;
export type Version = z.infer<typeof VersionSchema>;
export type EvaluationStatus = z.infer<typeof EvaluationStatusSchema>;
export type ScoreInput = z.infer<typeof ScoreInputSchema>;
export type EvaluationCreate = z.infer<typeof EvaluationCreateSchema>;
export type EvaluationUpdate = z.infer<typeof EvaluationUpdateSchema>;
export type EvaluationSubmit = z.infer<typeof EvaluationSubmitSchema>;
export type Workspace = z.infer<typeof WorkspaceSchema>;
export type User = z.infer<typeof UserSchema>;
export type Employee = z.infer<typeof EmployeeSchema>;
export type EvaluationCore = z.infer<typeof EvaluationCoreSchema>;
export type RealtimeEvent = z.infer<typeof RealtimeEventSchema>;
export type OptimisticConflict = z.infer<typeof OptimisticConflictSchema>;
