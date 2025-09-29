import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  jsonb,
  varchar,
  boolean
} from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

// Table pour stocker les jobs de génération
export const orchestratorJobs = pgTable('orchestrator_jobs', {
  id: serial('id').primaryKey(),
  jobId: varchar('job_id', { length: 255 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull(), // prompt, summary, questionnaire, business
  categoryName: varchar('category_name', { length: 255 }).notNull(),
  serviceName: varchar('service_name', { length: 255 }).notNull(),
  deliverableName: varchar('deliverable_name', { length: 500 }).notNull(),
  priority: varchar('priority', { length: 20 }).default('Normale'),
  status: varchar('status', { length: 20 }).notNull(), // pending, running, completed, error, injected
  result: text('result'),
  error: text('error'),
  expertValidation: jsonb('expert_validation'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  injectedAt: timestamp('injected_at')
})

// Table pour l'historique des injections
export const injectionHistory = pgTable('injection_history', {
  id: serial('id').primaryKey(),
  injectionId: varchar('injection_id', { length: 255 }).notNull().unique(),
  jobId: varchar('job_id', { length: 255 }),
  deliverableName: varchar('deliverable_name', { length: 500 }).notNull(),
  categoryName: varchar('category_name', { length: 255 }).notNull(),
  serviceName: varchar('service_name', { length: 255 }).notNull(),
  phases: jsonb('phases').notNull(), // Array des phases injectées
  status: varchar('status', { length: 20 }).notNull(), // success, failed
  targets: integer('targets').default(0),
  injectedAt: timestamp('injected_at').defaultNow().notNull()
})

// Table consolidée pour l'historique par livrable (1 ligne = 1 livrable avec 4 états)
export const deliverableGenerationHistory = pgTable('deliverable_generation_history', {
  id: serial('id').primaryKey(),
  deliverableName: varchar('deliverable_name', { length: 500 }).notNull(),
  categoryName: varchar('category_name', { length: 255 }).notNull(),
  serviceName: varchar('service_name', { length: 255 }).notNull(),
  
  // États des 4 éléments
  phase2Status: varchar('phase2_status', { length: 20 }), // pending, completed, error
  phase2GeneratedAt: timestamp('phase2_generated_at'),
  phase2InjectedAt: timestamp('phase2_injected_at'),
  
  phase25Status: varchar('phase25_status', { length: 20 }),
  phase25GeneratedAt: timestamp('phase25_generated_at'),
  phase25InjectedAt: timestamp('phase25_injected_at'),
  
  summaryStatus: varchar('summary_status', { length: 20 }),
  summaryGeneratedAt: timestamp('summary_generated_at'),
  summaryInjectedAt: timestamp('summary_injected_at'),
  
  promptStatus: varchar('prompt_status', { length: 20 }),
  promptGeneratedAt: timestamp('prompt_generated_at'),
  promptInjectedAt: timestamp('prompt_injected_at'),
  
  // Métadonnées globales
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Schemas d'insertion
export const insertOrchestratorJobSchema = createInsertSchema(orchestratorJobs)
export const insertInjectionHistorySchema = createInsertSchema(injectionHistory)
export const insertDeliverableHistorySchema = createInsertSchema(deliverableGenerationHistory)

// Types
export type OrchestratorJob = typeof orchestratorJobs.$inferSelect
export type InsertOrchestratorJob = z.infer<typeof insertOrchestratorJobSchema>

export type InjectionHistory = typeof injectionHistory.$inferSelect
export type InsertInjectionHistory = z.infer<typeof insertInjectionHistorySchema>

export type DeliverableGenerationHistory = typeof deliverableGenerationHistory.$inferSelect
export type InsertDeliverableHistory = z.infer<typeof insertDeliverableHistorySchema>