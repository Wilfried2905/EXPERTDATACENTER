CREATE TABLE "calculators" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" text NOT NULL,
	"categorie" text NOT NULL,
	"parametres" jsonb,
	"formules" jsonb,
	"validations" jsonb,
	"inputs_schema" jsonb,
	"outputs_schema" jsonb,
	"conformite_tia" boolean DEFAULT true,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" text NOT NULL,
	"description" text,
	"couleur" text,
	"icone" text,
	"ordre" integer,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" text NOT NULL,
	"secteur" text,
	"contact" text,
	"adresse" text,
	"statut" text DEFAULT 'actif' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "datacenters" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"nom" text NOT NULL,
	"localisation" text,
	"superficie" numeric,
	"tier_actuel" text,
	"tier_cible" text,
	"caracteristiques" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "generated_deliverables" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"sub_category_id" integer,
	"sub_category_name" text NOT NULL,
	"deliverables_list" jsonb NOT NULL,
	"context_analysis" text,
	"total_count" integer,
	"generated_at" timestamp DEFAULT now(),
	"is_validated" boolean DEFAULT false,
	"validated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "generated_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"template_id" integer NOT NULL,
	"nom" text,
	"content" text,
	"data_used" jsonb,
	"quality_score" text,
	"status" text DEFAULT 'generated',
	"version" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "joseph_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"project_id" integer,
	"conversation_history" jsonb,
	"recommendations" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mcp_job_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"message" text NOT NULL,
	"type" varchar NOT NULL,
	"read" boolean DEFAULT false,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mcp_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"service" varchar NOT NULL,
	"deliverable" varchar NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"phase_data" jsonb,
	"generated_content" jsonb,
	"error_message" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"estimated_duration" integer,
	"progress" integer DEFAULT 0,
	"agent_type" varchar,
	"tools_used" jsonb
);
--> statement-breakpoint
CREATE TABLE "mcp_knowledge_base" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar NOT NULL,
	"subcategory" varchar,
	"title" text NOT NULL,
	"content" jsonb NOT NULL,
	"tags" jsonb,
	"version" varchar DEFAULT '1.0' NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"source" varchar,
	"validated_by" integer
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"datacenter_id" integer,
	"nom" text NOT NULL,
	"description" text,
	"services_selected" jsonb,
	"status" text DEFAULT 'planifie' NOT NULL,
	"timeline" jsonb,
	"budget" numeric,
	"progression" integer DEFAULT 0,
	"donnees" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" text NOT NULL,
	"module" text NOT NULL,
	"description" text,
	"workflow" jsonb,
	"duree_estimee" integer,
	"prerequis" text,
	"livrables" text,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "sub_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"nom" text NOT NULL,
	"description" text,
	"ordre" integer,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" text NOT NULL,
	"categorie" text NOT NULL,
	"sous_categorie" text,
	"description" text,
	"structure" jsonb,
	"prompts" jsonb,
	"variables" jsonb,
	"metadonnees" jsonb,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"preferences" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "validated_prompts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"project_id" integer,
	"livrable" text NOT NULL,
	"analysis_prompt" text NOT NULL,
	"redaction_prompt" text NOT NULL,
	"document_summary" text NOT NULL,
	"validated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "datacenters" ADD CONSTRAINT "datacenters_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_deliverables" ADD CONSTRAINT "generated_deliverables_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_deliverables" ADD CONSTRAINT "generated_deliverables_sub_category_id_sub_categories_id_fk" FOREIGN KEY ("sub_category_id") REFERENCES "public"."sub_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "joseph_sessions" ADD CONSTRAINT "joseph_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "joseph_sessions" ADD CONSTRAINT "joseph_sessions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mcp_job_notifications" ADD CONSTRAINT "mcp_job_notifications_job_id_mcp_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."mcp_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mcp_job_notifications" ADD CONSTRAINT "mcp_job_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mcp_jobs" ADD CONSTRAINT "mcp_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mcp_knowledge_base" ADD CONSTRAINT "mcp_knowledge_base_validated_by_users_id_fk" FOREIGN KEY ("validated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_datacenter_id_datacenters_id_fk" FOREIGN KEY ("datacenter_id") REFERENCES "public"."datacenters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_categories" ADD CONSTRAINT "sub_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "validated_prompts" ADD CONSTRAINT "validated_prompts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "validated_prompts" ADD CONSTRAINT "validated_prompts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;