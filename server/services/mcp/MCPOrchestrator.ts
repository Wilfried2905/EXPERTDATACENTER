// server/services/mcp/MCPOrchestrator.ts

import { KnowledgeBaseService } from './KnowledgeBaseService';
import { DynamicInjectionService } from './injection/DynamicInjectionService';
import { IntelligentEvolutiveAgentFactory } from './agents/IntelligentEvolutiveAgentFactory';
import { GenerationContext, GeneratedContent } from './agents/EnhancedBaseAgent';

export interface GenerationRequest {
  deliverableName: string;
  serviceId: number;
  templateId: number;
  category: string;
  priority: number;
  type?: 'prompt' | 'questionnaire' | 'business' | 'summary' | 'complete';
}

export interface GenerationJob {
  id: string;
  request: GenerationRequest;
  status: 'PENDING' | 'GENERATING' | 'VALIDATING' | 'COMPLETED' | 'FAILED';
  progress: number;
  generatedContent?: GeneratedContent;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export class MCPOrchestrator {
  private knowledgeService: KnowledgeBaseService;
  private injectionService: DynamicInjectionService;
  private activeJobs: Map<string, GenerationJob> = new Map();

  constructor() {
    this.knowledgeService = new KnowledgeBaseService();
    this.injectionService = new DynamicInjectionService();
    this.initializeAgentSystem();
  }

  private initializeAgentSystem() {
    // Initialisation du système intelligent évolutif d'agents
    IntelligentEvolutiveAgentFactory.preloadIntelligentAgents();
    console.log('✅ Système MCP intelligent initialisé avec succès');
  }

  async generatePreview(request: GenerationRequest): Promise<GeneratedContent> {
    try {
      // Récupération de l'agent intelligent via le factory avancé
      const agent = IntelligentEvolutiveAgentFactory.getAgent(request.category);

      // Contexte de génération
      const context: GenerationContext = {
        deliverableName: request.deliverableName,
        category: request.category,
        serviceId: request.serviceId,
        serviceName: 'Service Name', // À récupérer depuis la DB
        templateId: request.templateId,
        priority: request.priority,
        type: request.type || 'complete'
      };

      // Génération du contenu par l'agent spécialisé
      const generatedContent = await agent.generateContent(context);
      
      return generatedContent;

    } catch (error) {
      console.error('Erreur génération prévisualisation:', error);
      throw error;
    }
  }

  async startGeneration(request: GenerationRequest): Promise<GenerationJob> {
    const jobId = this.generateJobId();
    
    const job: GenerationJob = {
      id: jobId,
      request,
      status: 'PENDING',
      progress: 0,
      createdAt: new Date()
    };

    this.activeJobs.set(jobId, job);

    // Lancement génération asynchrone
    this.processGeneration(jobId).catch(error => {
      console.error(`Erreur job génération ${jobId}:`, error);
      if (this.activeJobs.has(jobId)) {
        const failedJob = this.activeJobs.get(jobId)!;
        failedJob.status = 'FAILED';
        failedJob.error = error.message;
      }
    });

    return job;
  }

  private async processGeneration(jobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    try {
      job.status = 'GENERATING';
      job.progress = 10;

      // 1. Génération du contenu
      const generatedContent = await this.generatePreview(job.request);
      job.generatedContent = generatedContent;
      job.progress = 50;

      // 2. Validation par agent expert (simulation)
      job.status = 'VALIDATING';
      await this.validateGeneration(generatedContent);
      job.progress = 80;

      // 3. Injection dans les composants
      await this.injectionService.injectContent(
        job.request.templateId,
        job.request.deliverableName,
        {
          phase2Form: generatedContent.phase2Form,
          phase25Form: generatedContent.phase25Form,
          phase3Prompt: generatedContent.phase3Prompt,
          sommaire: generatedContent.sommaire,
          metadata: generatedContent.metadata
        }
      );
      job.progress = 100;

      job.status = 'COMPLETED';
      job.completedAt = new Date();

      console.log(`✅ Génération terminée - Job ${jobId}`);

    } catch (error) {
      job.status = 'FAILED';
      job.error = error instanceof Error ? error.message : String(error);
      console.error(`❌ Erreur génération job ${jobId}:`, error);
    }
  }

  private async validateGeneration(content: GeneratedContent): Promise<boolean> {
    // Simulation validation experte
    // TODO: Intégrer le vrai système de scoring
    
    const hasRequiredSections = content.sommaire.length > 200 &&
                               content.phase2Form.sections.length > 0 &&
                               content.phase25Form.sections.length > 0 &&
                               content.phase3Prompt.length > 500;

    if (!hasRequiredSections) {
      throw new Error('Contenu généré ne respecte pas les exigences minimales');
    }

    return true;
  }

  private generateJobId(): string {
    return `mcp_gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Méthodes publiques pour l'API
  getJob(jobId: string): GenerationJob | undefined {
    return this.activeJobs.get(jobId);
  }

  getAllJobs(): GenerationJob[] {
    return Array.from(this.activeJobs.values());
  }

  getJobsByStatus(status: GenerationJob['status']): GenerationJob[] {
    return this.getAllJobs().filter(job => job.status === status);
  }

  async getStats() {
    const jobs = this.getAllJobs();
    const completed = jobs.filter(j => j.status === 'COMPLETED').length;
    const failed = jobs.filter(j => j.status === 'FAILED').length;
    const factoryStats = IntelligentEvolutiveAgentFactory.getFactoryStats();
    
    return {
      totalJobs: jobs.length,
      completedJobs: completed,
      failedJobs: failed,
      successRate: jobs.length > 0 ? Math.round((completed / jobs.length) * 100) : 0,
      activeJobs: jobs.filter(j => ['PENDING', 'GENERATING', 'VALIDATING'].includes(j.status)).length,
      agentSystem: {
        isEvolutive: factoryStats.isEvolutive,
        specializedAgents: factoryStats.specializedAgentsCount,
        supportedCategories: factoryStats.supportedCategories,
        supportsGenericFallback: factoryStats.supportsGenericFallback
      }
    };
  }

  async getKnowledgeBaseStats() {
    return await this.knowledgeService.getKnowledgeBaseStats();
  }
}