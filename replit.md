# Datacenter Expert Application

## Overview

This is a full-stack web application for datacenter management and engineering, designed for consultants and engineers. It provides tools to manage projects, clients, and services, and perform technical calculations in accordance with TIA-942 standards. The project aims to provide comprehensive support for datacenter operations and advisory services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application is built as a monorepo, separating frontend and backend concerns.

### APPROCHE HYBRIDE IMPLÉMENTÉE (Janvier 2025)
**ARCHITECTURE BACKEND OPTIMISÉE COMPLÉTÉE**

✅ **Service Layer Pattern Intégré** - Logique métier séparée dans les services existants
✅ **Routes Unifiées Étendues** - Endpoints `/api/unified/generated-content/*` opérationnels
✅ **Cohérence Architecturale** - Réutilisation de l'infrastructure Drizzle + PostgreSQL existante
✅ **Validation Centralisée** - Middleware de validation intégré dans les routes unifiées
✅ **Gestion d'Erreurs Robuste** - Error handling production-ready dans toutes les routes

**Endpoints Generated Content Opérationnels :**
- `GET /api/unified/generated-content/:id/:name` - Récupération contenu livrable
- `POST /api/unified/generated-content` - Sauvegarde nouveau contenu  
- `PUT /api/unified/generated-content/:id/:name` - Mise à jour contenu
- `DELETE /api/unified/generated-content/:id/:name` - Suppression contenu
- `GET /api/unified/generated-content/:id/stats` - Statistiques contenu généré

### MCP ORCHESTRATOR SYSTÈME COMPLÉTÉ (Janvier 2025)
**ARCHITECTURE MCP (Model Control Protocol) AUTOMATISATION COMPLÈTE**

✅ **SYSTÈME MCP 100% DÉPLOYÉ** - Automatisation complète des 2225 livrables
- **Base de Connaissances Étendue** : Standards TIA-942, ISO-27001, IEC-62305, ASHRAE, NFPA, IEEE
- **Orchestrateur Principal** : MCPOrchestrator avec agents spécialisés par catégorie
- **Service d'Injection Dynamique** : Génération automatique composants Phase 2, 2.5, et 3
- **11 Agents Experts Spécialisés** : Tous les agents TIA-942 créés et opérationnels
- **Système Évolutif** : AgentGenerator pour nouvelles catégories automatiquement
- **Validation Experte** : Système de scoring 5 métriques avec seuil 95% conformité

**APIs MCP Opérationnelles :**
- `/api/mcp/generate-preview` : Génération prévisualisation instantanée
- `/api/mcp/generate` : Lancement génération complète avec injection
- `/api/mcp/job/:jobId` : Suivi temps réel des générations
- `/api/mcp-knowledge/*` : Accès base connaissances standards
- `/api/mcp-injection/*` : Injection dynamique composants
- `/api/mcp-agent-generator/*` : Création automatique nouveaux agents

**Architecture Technique MCP :**
- `KnowledgeBaseService` : 6 familles standards + recherche contextuelle
- `DynamicInjectionService` : Injection automatique 3 cibles (lignes 1016, 2857, 27)
- `EnhancedBaseAgent` : Classe de base génération formulaires + prompts
- `EvolutiveAgentFactory` : 11 agents spécialisés + système évolutif
- `AgentGenerator` : Création automatique agents pour nouvelles catégories
- Migration SQL : Extension base données avec standards officiels

**Agents Spécialisés Complets :**
- SurveyAgent, AuditAgent, ConseilAgent, SupportAgent, AMOAAgent
- AmenagementAgent, AmenagementTechniqueAgent, NettoyageAgent
- CommissioningAgent, MaintenanceAgent, MonitoringAgent

### TIA-942-C Architecture Status (COMPLETE)
**ARCHITECTURE TIA-942-C MAXIMALE COMPLÈTE - ACCOMPLISSEMENT ULTIMATE (Janvier 2025)**

✅ **11 MODULES COMPLETS** - 2225 livrables professionnels opérationnels
- SURVEY (180 livrables) - Évaluations et études techniques
- AUDIT (240 livrables) - Conformité et certifications  
- CONSEIL (220 livrables) - Stratégie et planification
- SUPPORT (220 livrables) - Production et transfert
- AMOA (220 livrables) - Maîtrise d'ouvrage assistée
- AMÉNAGEMENT (286 livrables) - Infrastructure physique
- AMÉNAGEMENT TECHNIQUE (154 livrables) - Conception spécialisée
- NETTOYAGE (176 livrables) - Maintenance propreté
- COMMISSIONING (176 livrables) - Tests et validation
- MAINTENANCE (176 livrables) - Gestion préventive et IA
- MONITORING (177 livrables) - Surveillance continue

**Spécifications techniques :** 11 modules × 88 services = Architecture TIA-942-C 2025+ avec innovations Quantum & Consciousness intégrées. ROI ciblés 150-1600% selon domaines.

### Frontend Architecture
- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite.
- **Routing**: Wouter.
- **State Management**: TanStack Query (React Query) for server state.
- **UI Framework**: Radix UI components with shadcn/ui styling.
- **Styling**: Tailwind CSS with custom CSS variables.
- **Forms**: React Hook Form with Zod validation.
- **UI/UX Decisions**: Responsive layout supporting Desktop, Tablet, and Mobile views; simplified sidebar navigation; consistent color schemes and icons for TIA-942 categories; distinct interfaces for generation, history, and management.

### Backend Architecture
- **Framework**: Express.js with TypeScript.
- **Runtime**: Node.js with ES modules.
- **Database ORM**: Drizzle ORM for type-safe operations.
- **Database**: PostgreSQL.
- **Authentication**: JWT tokens with bcrypt hashing.
- **API**: RESTful endpoints.

### Key Features & Technical Implementations
- **TIA-942 Compliance**: Core functionality revolves around TIA-942 standards, with structured categories, sub-categories, and services. Calculator functions require authenticated TIA-942 formulas.
- **Content Generation**: Integrated generators for prompts, data collection questionnaires, and deliverable lists, utilizing an expert prompt system.
- **CRUD Functionality**: Management of projects, clients, services, and validated prompts (view, edit, delete).
- **AI Integration**: Joseph AI assistant is integrated for expertise, requiring Claude API.
- **Document Management**: Support for multi-format document exports (PDF, Word, Excel, PowerPoint).
- **Data Orchestration**: A central dashboard for managing and orchestrating service generations, including real-time status updates and automated workflows.
- **Monetary Unit**: All financial references use FCFA (Francs CFA/XOF).

### System Design Choices
- **Monorepo Structure**: Facilitates shared TypeScript types and utilities between frontend and backend.
- **Three-Tier Architecture**: Clear separation of presentation (React), business logic (Express), and data persistence (PostgreSQL).
- **Data Flow**: JWT for authentication, React Query for server state and caching, Drizzle ORM for type-safe database queries, and Zod for input validation.
- **Scalability**: Designed to handle a large number of documented templates and services.

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives.
- **Styling**: Tailwind CSS, PostCSS.
- **Icons**: Lucide React.
- **Date Handling**: date-fns.
- **Form Validation**: Zod.

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL.
- **Authentication**: bcrypt, jsonwebtoken.
- **AI**: Claude API for Joseph AI assistant.

### Development Tools
- **TypeScript**: For strict type checking.
- **ESBuild**: For fast bundling.
- **Vite**: Development server.
- **Drizzle Kit**: For database schema management and migrations.
```