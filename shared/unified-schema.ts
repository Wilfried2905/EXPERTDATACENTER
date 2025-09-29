import { pgTable, serial, varchar, text, integer, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

// ===== CATÉGORIES UNIFIÉES =====
export const unifiedCategories = pgTable('unified_categories', {
  id: serial('id').primaryKey(),
  nom: varchar('nom', { length: 100 }).notNull().unique(),
  color: varchar('color', { length: 7 }).notNull(),
  description: text('description').notNull(),
  ordre: integer('ordre').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// ===== SERVICES UNIFIÉS =====
export const unifiedServices = pgTable('unified_services', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').notNull().references(() => unifiedCategories.id),
  nom: varchar('nom', { length: 200 }).notNull(),
  description: text('description'),
  workflow: jsonb('workflow'),
  dureeEstimee: varchar('duree_estimee', { length: 50 }),
  prerequis: jsonb('prerequis').$type<string[]>().default([]),
  ordre: integer('ordre').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// ===== LIVRABLES UNIFIÉS =====
export const unifiedDeliverables = pgTable('unified_deliverables', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id').notNull().references(() => unifiedServices.id),
  nom: varchar('nom', { length: 300 }).notNull(),
  structure: jsonb('structure'),
  prompts: jsonb('prompts'),
  variables: jsonb('variables'),
  metadonnees: jsonb('metadonnees'),
  description: text('description'),
  ordre: integer('ordre').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// ===== RELATIONS DRIZZLE =====
export const unifiedCategoriesRelations = relations(unifiedCategories, ({ many }) => ({
  services: many(unifiedServices)
}))

export const unifiedServicesRelations = relations(unifiedServices, ({ one, many }) => ({
  category: one(unifiedCategories, {
    fields: [unifiedServices.categoryId],
    references: [unifiedCategories.id]
  }),
  deliverables: many(unifiedDeliverables)
}))

export const unifiedDeliverablesRelations = relations(unifiedDeliverables, ({ one }) => ({
  service: one(unifiedServices, {
    fields: [unifiedDeliverables.serviceId],
    references: [unifiedServices.id]
  })
}))

// ===== TYPES TYPESCRIPT =====
export type UnifiedCategory = typeof unifiedCategories.$inferSelect
export type NewUnifiedCategory = typeof unifiedCategories.$inferInsert

export type UnifiedService = typeof unifiedServices.$inferSelect
export type NewUnifiedService = typeof unifiedServices.$inferInsert

export type UnifiedDeliverable = typeof unifiedDeliverables.$inferSelect
export type NewUnifiedDeliverable = typeof unifiedDeliverables.$inferInsert

// ===== TYPES MÉTIER POUR LES COMPOSANTS =====
export interface CategoryWithServices extends UnifiedCategory {
  services: ServiceWithDeliverables[]
}

export interface ServiceWithDeliverables extends UnifiedService {
  deliverables: UnifiedDeliverable[]
  category?: UnifiedCategory
}

export interface CompleteHierarchy {
  categories: CategoryWithServices[]
  totalServices: number
  totalDeliverables: number
}

// ===== SCHÉMAS ZOD =====
export const insertUnifiedCategorySchema = createInsertSchema(unifiedCategories)
export const insertUnifiedServiceSchema = createInsertSchema(unifiedServices)
export const insertUnifiedDeliverableSchema = createInsertSchema(unifiedDeliverables)

export type InsertUnifiedCategory = z.infer<typeof insertUnifiedCategorySchema>
export type InsertUnifiedService = z.infer<typeof insertUnifiedServiceSchema>
export type InsertUnifiedDeliverable = z.infer<typeof insertUnifiedDeliverableSchema>