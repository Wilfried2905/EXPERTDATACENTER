import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  preferences: jsonb("preferences"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  secteur: text("secteur"),
  contact: text("contact"),
  adresse: text("adresse"),
  statut: text("statut").notNull().default("actif"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const datacenters = pgTable("datacenters", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  nom: text("nom").notNull(),
  localisation: text("localisation"),
  superficie: decimal("superficie"),
  tierActuel: text("tier_actuel"),
  tierCible: text("tier_cible"),
  caracteristiques: jsonb("caracteristiques"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  module: text("module").notNull(),
  description: text("description"),
  workflow: jsonb("workflow"),
  dureeEstimee: integer("duree_estimee"),
  prerequis: text("prerequis"),
  livrables: text("livrables"),
  isActive: boolean("is_active").default(true),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  datacenterId: integer("datacenter_id").references(() => datacenters.id),
  nom: text("nom").notNull(),
  description: text("description"),
  servicesSelected: jsonb("services_selected"),
  status: text("status").notNull().default("planifie"),
  timeline: jsonb("timeline"),
  budget: decimal("budget"),
  progression: integer("progression").default(0),
  donnees: jsonb("donnees"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const josephSessions = pgTable("joseph_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  projectId: integer("project_id").references(() => projects.id),
  conversationHistory: jsonb("conversation_history"),
  recommendations: jsonb("recommendations"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const validatedPrompts = pgTable("validated_prompts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  projectId: integer("project_id").references(() => projects.id),
  livrable: text("livrable").notNull(),
  analysisPrompt: text("analysis_prompt").notNull(),
  redactionPrompt: text("redaction_prompt").notNull(),
  documentSummary: text("document_summary").notNull(),
  validatedAt: timestamp("validated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  description: text("description"),
  couleur: text("couleur"),
  icone: text("icone"),
  ordre: integer("ordre"),
  isActive: boolean("is_active").default(true),
});

export const subCategories = pgTable("sub_categories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  nom: text("nom").notNull(),
  description: text("description"),
  ordre: integer("ordre"),
  isActive: boolean("is_active").default(true),
});

export const generatedDeliverables = pgTable("generated_deliverables", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subCategoryId: integer("sub_category_id").references(() => subCategories.id), // Nullable pour éviter les erreurs FK
  subCategoryName: text("sub_category_name").notNull(),
  deliverablesList: jsonb("deliverables_list").notNull(),
  contextAnalysis: text("context_analysis"),
  totalCount: integer("total_count"),
  generatedAt: timestamp("generated_at").defaultNow(),
  isValidated: boolean("is_validated").default(false),
  validatedAt: timestamp("validated_at"),
  // JSONB column - simple definition without type constraint
  generatedContent: jsonb("generated_content"),
  // Ajout pour la permanence des livrables optimisés
  isOptimized: boolean("is_optimized").default(false),
  isLocked: boolean("is_locked").default(false),
  lockedAt: timestamp("locked_at"),
  exportedPath: text("exported_path"), // Chemin vers le fichier JSON statique
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  categorie: text("categorie").notNull(),
  sous_categorie: text("sous_categorie"),
  description: text("description"),
  structure: jsonb("structure"),
  prompts: jsonb("prompts"),
  variables: jsonb("variables"),
  metadonnees: jsonb("metadonnees"),
  isActive: boolean("is_active").default(true),
});

export const calculators = pgTable("calculators", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  categorie: text("categorie").notNull(),
  parametres: jsonb("parametres"),
  formules: jsonb("formules"),
  validations: jsonb("validations"),
  inputsSchema: jsonb("inputs_schema"),
  outputsSchema: jsonb("outputs_schema"),
  conformiteTIA: boolean("conformite_tia").default(true),
  isActive: boolean("is_active").default(true),
});

export const generatedDocuments = pgTable("generated_documents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  templateId: integer("template_id").notNull().references(() => templates.id),
  nom: text("nom"),
  content: text("content"),
  dataUsed: jsonb("data_used"),
  qualityScore: text("quality_score"),
  status: text("status").default("generated"),
  version: integer("version").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==========================================
// TABLES MCP KNOWLEDGE BASE ÉTENDUE
// ==========================================

// Base de connaissances TIA-942 avec standards officiels
export const mcpKnowledgeBase = pgTable('mcp_knowledge_base', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 500 }),
  content: text('content'),
  category: varchar('category', { length: 100 }),
  tags: varchar('tags', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  // Extensions pour standards officiels
  standardFamily: varchar('standard_family', { length: 50 }), // TIA, ISO, IEC, etc.
  standardCode: varchar('standard_code', { length: 100 }), // TIA-942-A, ISO-27001
  sectionReference: varchar('section_reference', { length: 200 }), // Section 4.1.2
  officialSourceUrl: varchar('official_source_url', { length: 500 }),
  version: varchar('version', { length: 50 }),
  relationshipType: varchar('relationship_type', { length: 20 }), // primary, connected, annex
  connectedStandards: jsonb('connected_standards'),
  verifiedOfficial: boolean('verified_official').default(true),
  officialDocumentRef: varchar('official_document_ref', { length: 200 })
});

// Table pour le mapping dynamique services -> livrables
export const mcpServiceMapping = pgTable('mcp_service_mapping', {
  id: serial('id').primaryKey(),
  categoryName: varchar('category_name', { length: 100 }).notNull(),
  serviceId: integer('service_id'),
  serviceName: varchar('service_name', { length: 200 }).notNull(),
  templateId: integer('template_id').references(() => templates.id),
  livrableName: varchar('livrable_name', { length: 300 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// ==========================================
// TABLES MCP ÉTENDU (Model Context Protocol)
// ==========================================

// Table principale pour les structures de livrables générées
export const deliverableStructures = pgTable("deliverable_structures", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").references(() => templates.id),
  deliverableName: text("deliverable_name").notNull(),
  service: varchar("service", { length: 50 }).notNull(), // SURVEY, AUDIT, CONSEIL, SUPPORT, AMOA
  generationStatus: varchar("generation_status", { length: 30 }).notNull().default("pending"),
  // pending, generated, expert_validated, user_validated, active, rejected
  
  // Structures générées par les agents
  generatedSummary: jsonb("generated_summary"), // Sommaire avec sections
  generatedPhase2Questions: jsonb("generated_phase2_questions"), // Questions TIA-942
  generatedPhase25Questions: jsonb("generated_phase25_questions"), // Questions client
  generatedPrompts: jsonb("generated_prompts"), // Prompts multi-cibles
  
  // Statuts et versioning
  version: integer("version").default(1),
  isActive: boolean("is_active").default(false),
  generatedAt: timestamp("generated_at"),
  userValidatedAt: timestamp("user_validated_at"),
  activatedAt: timestamp("activated_at"),
  lastModifiedAt: timestamp("last_modified_at").defaultNow(),
  
  // Validation et commentaires
  userValidationComment: text("user_validation_comment"),
  rejectionReason: text("rejection_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Table pour gérer les tâches de génération asynchrone
export const mcpJobs = pgTable("mcp_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  structureId: integer("structure_id").references(() => deliverableStructures.id),
  type: varchar("type", { length: 30 }).notNull(), // structure_generation, expert_validation, injection
  service: varchar("service", { length: 50 }).notNull(), // SURVEY, AUDIT, CONSEIL, SUPPORT, AMOA
  deliverableId: integer("deliverable_id"),
  deliverableName: varchar("deliverable_name", { length: 255 }).notNull(),
  
  // Statut et progression
  status: varchar("status", { length: 20 }).notNull().default("queued"), 
  // queued, processing, completed, failed, cancelled
  progress: integer("progress").default(0), // 0-100%
  
  // Paramètres et résultats
  params: jsonb("params"), // Paramètres d'entrée
  result: jsonb("result"), // Résultat de l'exécution
  errorMessage: text("error_message"),
  
  // Timing
  queuedAt: timestamp("queued_at").defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  estimatedDuration: integer("estimated_duration"), // secondes
  
  // Métadonnées
  agentType: varchar("agent_type", { length: 50 }), // Type d'agent utilisé
  toolsUsed: jsonb("tools_used"), // Liste des outils utilisés
  priority: integer("priority").default(5), // 1-10, 1 = haute priorité
});

// Index de la base de connaissances TIA-942 étendue
export const knowledgeBaseIndex = pgTable("knowledge_base_index", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 50 }).notNull(),
  // tia942, iso27001, soc2, nist, datacenter_standards, best_practices
  documentType: varchar("document_type", { length: 50 }).notNull(),
  // standard, template, calculation, guideline, checklist, example
  title: text("title").notNull(),
  filename: varchar("filename", { length: 200 }),
  content: text("content").notNull(),
  
  // Métadonnées de recherche
  keywords: jsonb("keywords"), // Mots-clés indexés
  tags: jsonb("tags"), // Tags structurés
  version: varchar("version", { length: 20 }).notNull().default("1.0"),
  language: varchar("language", { length: 5 }).default("fr"),
  
  // Validation et source
  source: varchar("source", { length: 100 }), // Source du document
  validatedBy: integer("validated_by").references(() => users.id),
  validationDate: timestamp("validation_date"),
  
  // Utilisation
  accessCount: integer("access_count").default(0),
  lastAccessedAt: timestamp("last_accessed_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Validations des agents experts
export const expertValidations = pgTable("expert_validations", {
  id: serial("id").primaryKey(),
  structureId: integer("structure_id").notNull().references(() => deliverableStructures.id),
  
  // Validations par composant
  summaryValidation: jsonb("summary_validation"), // Validation sommaire
  phase2Validation: jsonb("phase2_validation"), // Validation questions Phase 2
  phase25Validation: jsonb("phase25_validation"), // Validation questions Phase 2.5
  promptsValidation: jsonb("prompts_validation"), // Validation prompts
  
  // Scores globaux
  overallScore: decimal("overall_score", { precision: 5, scale: 3 }), // 0.000 - 1.000
  detailedScores: jsonb("detailed_scores"), // Scores détaillés par critère
  
  // Feedback intelligent
  recommendations: jsonb("recommendations"), // Recommandations d'amélioration
  criticalIssues: jsonb("critical_issues"), // Problèmes critiques identifiés
  suggestedFixes: jsonb("suggested_fixes"), // Corrections suggérées
  
  // Métadonnées de validation
  validationAgent: varchar("validation_agent", { length: 50 }).notNull(),
  validationMethod: varchar("validation_method", { length: 30 }).notNull(), // ai_analysis, rule_based, hybrid
  confidenceLevel: decimal("confidence_level", { precision: 5, scale: 3 }),
  
  validatedAt: timestamp("validated_at").defaultNow(),
  validationDuration: integer("validation_duration"), // millisecondes
});

// Routes injectées dynamiquement
export const injectedRoutes = pgTable("injected_routes", {
  id: serial("id").primaryKey(),
  structureId: integer("structure_id").notNull().references(() => deliverableStructures.id),
  
  // Informations du livrable
  deliverableName: text("deliverable_name").notNull(),
  service: varchar("service", { length: 50 }).notNull(),
  
  // Routes créées
  phase2Route: varchar("phase2_route", { length: 200 }),
  phase25Route: varchar("phase25_route", { length: 200 }),
  phase3Route: varchar("phase3_route", { length: 200 }),
  
  // Composants créés
  phase2ComponentPath: varchar("phase2_component_path", { length: 300 }),
  phase25ComponentPath: varchar("phase25_component_path", { length: 300 }),
  phase3ComponentPath: varchar("phase3_component_path", { length: 300 }),
  
  // Statut d'injection
  injectionStatus: varchar("injection_status", { length: 20 }).notNull().default("pending"),
  // pending, injected, active, failed, rolled_back
  
  // Métadonnées d'injection
  injectedAt: timestamp("injected_at"),
  injectedBy: integer("injected_by").references(() => users.id),
  version: integer("version").default(1),
  
  // Sauvegarde et rollback
  backupPath: varchar("backup_path", { length: 400 }),
  rollbackData: jsonb("rollback_data"), // Données pour rollback
  
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Validations utilisateur étendues
export const userValidations = pgTable("user_validations", {
  id: serial("id").primaryKey(),
  structureId: integer("structure_id").notNull().references(() => deliverableStructures.id),
  userId: integer("user_id").notNull().references(() => users.id),
  
  // Validation par composant
  summaryApproved: boolean("summary_approved"),
  phase2Approved: boolean("phase2_approved"),
  phase25Approved: boolean("phase25_approved"),
  promptsApproved: boolean("prompts_approved"),
  
  // Commentaires et feedback
  overallComment: text("overall_comment"),
  summaryComment: text("summary_comment"),
  phase2Comment: text("phase2_comment"),
  phase25Comment: text("phase25_comment"),
  promptsComment: text("prompts_comment"),
  
  // Statut global
  overallApproval: boolean("overall_approval"),
  requiresRevision: boolean("requires_revision").default(false),
  
  // Métadonnées
  validatedAt: timestamp("validated_at").defaultNow(),
  revisionRequested: boolean("revision_requested").default(false),
  revisionComment: text("revision_comment"),
});

// Notifications temps réel pour les jobs MCP
export const mcpJobNotifications = pgTable("mcp_job_notifications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => mcpJobs.id),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // job_queued, job_started, job_progress, job_completed, job_failed
  read: boolean("read").default(false),
  metadata: jsonb("metadata"), // Actions, URLs, boutons d'action
  createdAt: timestamp("created_at").defaultNow(),
});

// ==========================================
// SYSTÈME CENTRALISÉ CONTENU GÉNÉRÉ (Option B)
// ==========================================

// Table principale pour stocker tout le contenu généré
export const generatedContent = pgTable("generated_content", {
  id: serial("id").primaryKey(),
  
  // Identifiants
  deliverableName: text("deliverable_name").notNull(),
  serviceId: integer("service_id").notNull(),
  category: text("category").notNull(), // SURVEY, AUDIT, etc.
  
  // Type de contenu (4 types possibles)
  contentType: varchar("content_type", { length: 50 }).notNull(), // 'sommaire', 'prompt_phase3', 'questionnaire_phase2', 'questionnaire_phase25'
  
  // Contenu généré
  content: text("content").notNull(),
  
  // Métadonnées du contenu
  metadata: jsonb("metadata"), // Infos additionnelles (complexity, estimatedPages, etc.)
  
  // Statut et validation
  status: varchar("status", { length: 20 }).notNull().default("generated"), // generated, validated, approved, injected
  validationScore: decimal("validation_score"), // Score validation experte
  
  // État d'injection (ÉTAPE 2)
  injectionStatus: varchar("injection_status", { length: 20 }).notNull().default("generic"), // generic (🔴), optimized (🟢)
  
  // Traçabilité
  generationJobId: text("generation_job_id"), // Référence au job MCP
  userId: integer("user_id"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Index pour performances
});

// ==========================================
// TYPES MCP ÉTENDU (TypeScript)
// ==========================================

// Structure des questions générées
export type GeneratedQuestions = {
  totalQuestions: number;
  estimatedTime: number; // minutes
  categories: Array<{
    name: string;
    questions: Array<{
      id: string;
      question: string;
      type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean';
      required: boolean;
      options?: string[];
      validation?: {
        min?: number;
        max?: number;
        pattern?: string;
      };
    }>;
  }>;
};

// Structure des prompts multi-cibles
export type GeneratedPrompts = {
  standard: {
    analysisPrompt: string;
    redactionPrompt: string;
    expectedOutput: string;
  };
  dsi: {
    analysisPrompt: string;
    redactionPrompt: string;
    expectedOutput: string;
  };
  dg: {
    analysisPrompt: string;
    redactionPrompt: string;
    expectedOutput: string;
  };
  actionnaires: {
    analysisPrompt: string;
    redactionPrompt: string;
    expectedOutput: string;
  };
  technique: {
    analysisPrompt: string;
    redactionPrompt: string;
    expectedOutput: string;
  };
};

// Structure des sommaires générés
export type GeneratedSummary = {
  sections: Array<{
    title: string;
    subsections: string[];
    requiredData: string[];
    estimatedLength: number; // pages
  }>;
  estimatedPages: number;
  complexity: 'simple' | 'moderate' | 'complex' | 'advanced';
  keywords: string[];
  prerequisites: string[];
};

// Validation des agents experts (détails)
export type ExpertValidationDetails = {
  score: number; // 0.0 - 1.0
  issues: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    suggestion: string;
  }>;
  strengths: string[];
  recommendations: string[];
};

// Paramètres d'injection
export type InjectionParams = {
  structureId: number;
  components: {
    phase2: boolean;
    phase25: boolean;
    phase3: boolean;
    navigation: boolean;
  };
  settings: {
    createBackup: boolean;
    hotReload: boolean;
    validateRoutes: boolean;
    updateNavigation: boolean;
  };
  deliverableName: string;
  service: string;
};

// ==========================================
// SCHEMAS ZOD MCP ÉTENDU
// ==========================================

// Schémas d'insertion pour les nouvelles tables
export const insertDeliverableStructureSchema = createInsertSchema(deliverableStructures).omit({
  id: true,
  createdAt: true,
  lastModifiedAt: true,
});

export const insertMCPJobSchema = createInsertSchema(mcpJobs).omit({
  id: true,
  queuedAt: true,
});

export const insertKnowledgeBaseIndexSchema = createInsertSchema(knowledgeBaseIndex).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  accessCount: true,
  lastAccessedAt: true,
});

export const insertExpertValidationSchema = createInsertSchema(expertValidations).omit({
  id: true,
  validatedAt: true,
});

// ==========================================
// SCHEMAS ZOD POUR CONTENU GÉNÉRÉ
// ==========================================

export const insertGeneratedContentSchema = createInsertSchema(generatedContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGeneratedContent = z.infer<typeof insertGeneratedContentSchema>;
export type SelectGeneratedContent = typeof generatedContent.$inferSelect;

// Schéma de validation pour les types de contenu
export const contentTypeSchema = z.enum(['sommaire', 'prompt_phase3', 'questionnaire_phase2', 'questionnaire_phase25']);

// Schéma pour les requêtes de contenu
export const generateContentRequestSchema = z.object({
  deliverableName: z.string().min(1),
  serviceId: z.number().positive(),
  category: z.string().min(1),
  contentType: contentTypeSchema,
  userId: z.number().positive().optional(),
});

export const insertInjectedRouteSchema = createInsertSchema(injectedRoutes).omit({
  id: true,
  createdAt: true,
});

export const insertUserValidationSchema = createInsertSchema(userValidations).omit({
  id: true,
  validatedAt: true,
});

export const insertMCPJobNotificationSchema = createInsertSchema(mcpJobNotifications).omit({
  id: true,
  createdAt: true,
});

// Types TypeScript correspondants
export type InsertDeliverableStructure = z.infer<typeof insertDeliverableStructureSchema>;
export type InsertMCPJob = z.infer<typeof insertMCPJobSchema>;
export type InsertKnowledgeBaseIndex = z.infer<typeof insertKnowledgeBaseIndexSchema>;
export type InsertExpertValidation = z.infer<typeof insertExpertValidationSchema>;
export type InsertInjectedRoute = z.infer<typeof insertInjectedRouteSchema>;
export type InsertUserValidation = z.infer<typeof insertUserValidationSchema>;
export type InsertMCPJobNotification = z.infer<typeof insertMCPJobNotificationSchema>;

// Types de sélection
export type DeliverableStructure = typeof deliverableStructures.$inferSelect;
export type MCPJob = typeof mcpJobs.$inferSelect;
export type KnowledgeBaseIndex = typeof knowledgeBaseIndex.$inferSelect;
export type ExpertValidation = typeof expertValidations.$inferSelect;
export type InjectedRoute = typeof injectedRoutes.$inferSelect;
export type UserValidation = typeof userValidations.$inferSelect;
export type MCPJobNotification = typeof mcpJobNotifications.$inferSelect;

// ==========================================
// RELATIONS MCP ÉTENDU
// ==========================================

// Relations étendues pour les utilisateurs
export const usersRelations = relations(users, ({ many }) => ({
  josephSessions: many(josephSessions),
  validatedPrompts: many(validatedPrompts),
  generatedDeliverables: many(generatedDeliverables),
  mcpJobs: many(mcpJobs),
  mcpJobNotifications: many(mcpJobNotifications),
  userValidations: many(userValidations),
  knowledgeBaseValidations: many(knowledgeBaseIndex),
  injectedRoutes: many(injectedRoutes),
}));

// Relations pour les structures de livrables
export const deliverableStructuresRelations = relations(deliverableStructures, ({ one, many }) => ({
  template: one(templates, {
    fields: [deliverableStructures.templateId],
    references: [templates.id],
  }),
  mcpJobs: many(mcpJobs),
  expertValidations: many(expertValidations),
  userValidations: many(userValidations),
  injectedRoutes: many(injectedRoutes),
}));

// Relations pour les jobs MCP
export const mcpJobsRelations = relations(mcpJobs, ({ one, many }) => ({
  user: one(users, {
    fields: [mcpJobs.userId],
    references: [users.id],
  }),
  structure: one(deliverableStructures, {
    fields: [mcpJobs.structureId],
    references: [deliverableStructures.id],
  }),
  notifications: many(mcpJobNotifications),
}));

// Relations pour l'index de la base de connaissances
export const knowledgeBaseIndexRelations = relations(knowledgeBaseIndex, ({ one }) => ({
  validator: one(users, {
    fields: [knowledgeBaseIndex.validatedBy],
    references: [users.id],
  }),
}));

// Relations pour les validations d'experts
export const expertValidationsRelations = relations(expertValidations, ({ one }) => ({
  structure: one(deliverableStructures, {
    fields: [expertValidations.structureId],
    references: [deliverableStructures.id],
  }),
}));

// Relations pour les routes injectées
export const injectedRoutesRelations = relations(injectedRoutes, ({ one }) => ({
  structure: one(deliverableStructures, {
    fields: [injectedRoutes.structureId],
    references: [deliverableStructures.id],
  }),
  injectedByUser: one(users, {
    fields: [injectedRoutes.injectedBy],
    references: [users.id],
  }),
}));

// Relations pour les validations utilisateur
export const userValidationsRelations = relations(userValidations, ({ one }) => ({
  structure: one(deliverableStructures, {
    fields: [userValidations.structureId],
    references: [deliverableStructures.id],
  }),
  user: one(users, {
    fields: [userValidations.userId],
    references: [users.id],
  }),
}));

// Relations pour les notifications MCP
export const mcpJobNotificationsRelations = relations(mcpJobNotifications, ({ one }) => ({
  job: one(mcpJobs, {
    fields: [mcpJobNotifications.jobId],
    references: [mcpJobs.id],
  }),
  user: one(users, {
    fields: [mcpJobNotifications.userId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  subCategories: many(subCategories),
}));

export const subCategoriesRelations = relations(subCategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subCategories.categoryId],
    references: [categories.id],
  }),
  generatedDeliverables: many(generatedDeliverables),
}));

export const generatedDeliverablesRelations = relations(generatedDeliverables, ({ one }) => ({
  user: one(users, {
    fields: [generatedDeliverables.userId],
    references: [users.id],
  }),
  subCategory: one(subCategories, {
    fields: [generatedDeliverables.subCategoryId],
    references: [subCategories.id],
  }),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  datacenters: many(datacenters),
  projects: many(projects),
}));

export const datacentersRelations = relations(datacenters, ({ one, many }) => ({
  client: one(clients, {
    fields: [datacenters.clientId],
    references: [clients.id],
  }),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  datacenter: one(datacenters, {
    fields: [projects.datacenterId],
    references: [datacenters.id],
  }),
  josephSessions: many(josephSessions),
  generatedDocuments: many(generatedDocuments),
  validatedPrompts: many(validatedPrompts),
}));

export const josephSessionsRelations = relations(josephSessions, ({ one }) => ({
  user: one(users, {
    fields: [josephSessions.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [josephSessions.projectId],
    references: [projects.id],
  }),
}));

export const templatesRelations = relations(templates, ({ many }) => ({
  generatedDocuments: many(generatedDocuments),
}));

export const generatedDocumentsRelations = relations(generatedDocuments, ({ one }) => ({
  project: one(projects, {
    fields: [generatedDocuments.projectId],
    references: [projects.id],
  }),
  template: one(templates, {
    fields: [generatedDocuments.templateId],
    references: [templates.id],
  }),
}));

export const validatedPromptsRelations = relations(validatedPrompts, ({ one }) => ({
  user: one(users, {
    fields: [validatedPrompts.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [validatedPrompts.projectId],
    references: [projects.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertDatacenterSchema = createInsertSchema(datacenters).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
});

export const insertCalculatorSchema = createInsertSchema(calculators).omit({
  id: true,
});

export const insertGeneratedDocumentSchema = createInsertSchema(generatedDocuments).omit({
  id: true,
  createdAt: true,
});

export const insertValidatedPromptsSchema = createInsertSchema(validatedPrompts).omit({
  id: true,
  validatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertSubCategorySchema = createInsertSchema(subCategories).omit({
  id: true,
});

export const insertGeneratedDeliverablesSchema = createInsertSchema(generatedDeliverables).omit({
  id: true,
  generatedAt: true,
  validatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Datacenter = typeof datacenters.$inferSelect;
export type InsertDatacenter = z.infer<typeof insertDatacenterSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Service = typeof services.$inferSelect;

export type JosephSession = typeof josephSessions.$inferSelect;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type Calculator = typeof calculators.$inferSelect;
export type InsertCalculator = z.infer<typeof insertCalculatorSchema>;

export type GeneratedDocument = typeof generatedDocuments.$inferSelect;
export type InsertGeneratedDocument = z.infer<typeof insertGeneratedDocumentSchema>;

export type ValidatedPrompts = typeof validatedPrompts.$inferSelect;
export type InsertValidatedPrompts = z.infer<typeof insertValidatedPromptsSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type SubCategory = typeof subCategories.$inferSelect;
export type InsertSubCategory = z.infer<typeof insertSubCategorySchema>;

export type GeneratedDeliverables = typeof generatedDeliverables.$inferSelect;
export type InsertGeneratedDeliverables = z.infer<typeof insertGeneratedDeliverablesSchema>;

// ==========================================
// SYSTÈME D'ARCHIVES DOCUMENTAIRES PAR CLIENT
// ==========================================

// Table pour stocker l'historique des documents générés et exportés par client
export const documentArchives = pgTable("document_archives", {
  id: serial("id").primaryKey(),
  
  // Relations client/projet
  clientId: integer("client_id").notNull().references(() => clients.id),
  projectId: integer("project_id").references(() => projects.id),
  userId: integer("user_id").notNull().references(() => users.id),
  
  // Information du document
  deliverableName: text("deliverable_name").notNull(),
  categoryName: text("category_name").notNull(), // SURVEY, AUDIT, CONSEIL, etc.
  serviceName: text("service_name").notNull(),
  
  // Type et format du document
  documentType: varchar("document_type", { length: 50 }).notNull(), // final, draft, template, export
  exportFormat: varchar("export_format", { length: 20 }).notNull(), // pdf, word, excel, powerpoint
  
  // Versioning
  version: integer("version").default(1),
  isLatestVersion: boolean("is_latest_version").default(true),
  parentVersionId: integer("parent_version_id"),
  
  // Statut du document
  status: varchar("status", { length: 30 }).notNull().default("draft"),
  // draft, validated, archived, deleted
  
  // Stockage fichier
  filePath: text("file_path"), // Chemin relatif: /archives/[client_id]/[project_id]/[document_name]_v[version].[format]
  fileSize: integer("file_size"), // Taille en octets
  checksum: varchar("checksum", { length: 64 }), // SHA256 pour intégrité
  
  // Contenu et métadonnées
  contentSnapshot: jsonb("content_snapshot"), // Snapshot du contenu généré
  metadata: jsonb("metadata"), // Métadonnées supplémentaires (auteur, tags, etc.)
  
  // Phases complétées
  phase2Completed: boolean("phase2_completed").default(false),
  phase25Completed: boolean("phase25_completed").default(false),
  phase3Completed: boolean("phase3_completed").default(false),
  promptCompleted: boolean("prompt_completed").default(false),
  
  // Références aux contenus générés
  generatedContentIds: jsonb("generated_content_ids"), // IDs des contenus dans generatedContent
  deliverableStructureId: integer("deliverable_structure_id"),
  
  // Historique d'export
  exportCount: integer("export_count").default(0),
  lastExportedAt: timestamp("last_exported_at"),
  lastExportedBy: integer("last_exported_by").references(() => users.id),
  exportHistory: jsonb("export_history"), // Historique détaillé des exports
  
  // Validation et approbation
  isValidated: boolean("is_validated").default(false),
  validatedAt: timestamp("validated_at"),
  validatedBy: integer("validated_by").references(() => users.id),
  validationNotes: text("validation_notes"),
  
  // Archive et suppression
  isArchived: boolean("is_archived").default(false),
  archivedAt: timestamp("archived_at"),
  archivedBy: integer("archived_by").references(() => users.id),
  deletedAt: timestamp("deleted_at"), // Soft delete
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations pour documentArchives
export const documentArchivesRelations = relations(documentArchives, ({ one }) => ({
  client: one(clients, {
    fields: [documentArchives.clientId],
    references: [clients.id],
  }),
  project: one(projects, {
    fields: [documentArchives.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [documentArchives.userId],
    references: [users.id],
  }),
}));

// Insert schema pour documentArchives
export const insertDocumentArchiveSchema = createInsertSchema(documentArchives).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type pour documentArchives
export type DocumentArchive = typeof documentArchives.$inferSelect;
export type InsertDocumentArchive = z.infer<typeof insertDocumentArchiveSchema>;

// Export unified schema tables
export * from './unified-schema';
export * from './orchestrator-schema';
