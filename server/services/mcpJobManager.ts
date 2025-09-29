import { eq } from "drizzle-orm";
import { db } from "../db";
import { mcpJobs, mcpJobNotifications, MCPJob, InsertMCPJob, PhaseCollectionData, DeliverableContent } from "../../shared/schema";
import { WebSocketManager } from "./websocketManager";
import { MCPAgent } from "./mcpAgents/base";
import { SurveyAgent } from "./mcpAgents/surveyAgent";
import { AuditAgent } from "./mcpAgents/auditAgent";
import { ConseilAgent } from "./mcpAgents/conseilAgent";
import { SupportAgent } from "./mcpAgents/supportAgent";
import { AMOAAgent } from "./mcpAgents/amoaAgent";

/**
 * MCPJobManager - Orchestrateur central des tâches de génération MCP
 * Gère les 5 agents du Cluster 1 : SURVEY, AUDIT, CONSEIL, SUPPORT, AMOA
 */
export class MCPJobManager {
  private websocketManager: WebSocketManager;
  private agents: Map<string, MCPAgent>;
  private activeJobs: Map<number, boolean> = new Map();
  private maxConcurrentJobs = 3; // Limitation concurrence pour éviter surcharge API

  constructor(websocketManager: WebSocketManager) {
    this.websocketManager = websocketManager;
    this.initializeAgents();
  }

  private initializeAgents() {
    this.agents = new Map();
    this.agents.set('SURVEY', new SurveyAgent());
    this.agents.set('AUDIT', new AuditAgent());
    this.agents.set('CONSEIL', new ConseilAgent());
    this.agents.set('SUPPORT', new SupportAgent());
    this.agents.set('AMOA', new AMOAAgent());
  }

  /**
   * Lance une génération asynchrone
   */
  async queueGeneration(data: {
    userId: number;
    service: string;
    deliverable: string;
    phaseData: PhaseCollectionData;
  }): Promise<{ jobId: number; estimatedDuration: number }> {
    
    // Vérifier limites de concurrence
    const activeJobsCount = this.activeJobs.size;
    if (activeJobsCount >= this.maxConcurrentJobs) {
      throw new Error(`Limite de ${this.maxConcurrentJobs} générations simultanées atteinte. Veuillez patienter.`);
    }

    const agent = this.agents.get(data.service);
    if (!agent) {
      throw new Error(`Agent non trouvé pour le service: ${data.service}`);
    }

    // Créer job en base
    const [job] = await db.insert(mcpJobs).values({
      userId: data.userId,
      service: data.service,
      deliverable: data.deliverable,
      status: 'pending',
      phaseData: data.phaseData,
      estimatedDuration: agent.getEstimatedDuration(data.deliverable),
      agentType: agent.constructor.name,
    }).returning();

    // Notification job créé
    await this.notifyUser(data.userId, {
      jobId: job.id,
      message: `Génération lancée: "${data.deliverable}" (≈${Math.ceil(job.estimatedDuration! / 60)}min)`,
      type: 'job_queued',
      metadata: { jobId: job.id, service: data.service }
    });

    // Lancer traitement asynchrone
    this.processJobAsync(job.id);

    return { 
      jobId: job.id, 
      estimatedDuration: job.estimatedDuration! 
    };
  }

  /**
   * Traitement asynchrone d'un job
   */
  private async processJobAsync(jobId: number): Promise<void> {
    try {
      this.activeJobs.set(jobId, true);
      await this.processJob(jobId);
    } catch (error) {
      console.error(`Erreur traitement job ${jobId}:`, error);
    } finally {
      this.activeJobs.delete(jobId);
    }
  }

  /**
   * Traite un job MCP complet
   */
  async processJob(jobId: number): Promise<void> {
    const [job] = await db.select().from(mcpJobs).where(eq(mcpJobs.id, jobId));
    if (!job) {
      throw new Error(`Job ${jobId} non trouvé`);
    }

    const agent = this.agents.get(job.service);
    if (!agent) {
      throw new Error(`Agent non trouvé pour service: ${job.service}`);
    }

    try {
      // Marquer job comme en cours
      await this.updateJobStatus(jobId, 'processing', 'Analyse des données en cours...');
      
      // Callback pour updates de progression
      const progressCallback = (progress: number, message: string) => {
        this.updateProgress(jobId, progress, message);
      };

      // Génération par l'agent spécialisé
      const startTime = Date.now();
      const generatedContent = await agent.generate(
        job.phaseData as PhaseCollectionData, 
        job.deliverable, 
        progressCallback
      );

      const completedAt = new Date();
      const actualDuration = Math.ceil((Date.now() - startTime) / 1000);

      // Mettre à jour job avec résultat
      await db.update(mcpJobs)
        .set({ 
          status: 'completed',
          generatedContent,
          completedAt,
          progress: 100,
          toolsUsed: agent.getToolsUsed()
        })
        .where(eq(mcpJobs.id, jobId));

      // Notification succès
      await this.notifyUser(job.userId, {
        jobId,
        message: `Document généré avec succès ! "${job.deliverable}" (${actualDuration}s)`,
        type: 'job_completed',
        metadata: { 
          jobId, 
          downloadUrl: `/api/mcp/document/${jobId}`,
          actualDuration 
        }
      });

    } catch (error) {
      await this.handleJobError(jobId, job.userId, error as Error);
    }
  }

  /**
   * Met à jour la progression d'un job
   */
  private async updateProgress(jobId: number, progress: number, message: string): Promise<void> {
    await db.update(mcpJobs)
      .set({ progress })
      .where(eq(mcpJobs.id, jobId));

    const [job] = await db.select().from(mcpJobs).where(eq(mcpJobs.id, jobId));
    if (job) {
      await this.websocketManager.notifyUser(job.userId, {
        type: 'job_progress',
        jobId,
        progress,
        message
      });
    }
  }

  /**
   * Met à jour le statut d'un job
   */
  private async updateJobStatus(jobId: number, status: string, message?: string): Promise<void> {
    const updateData: any = { status };
    if (status === 'processing') {
      updateData.startedAt = new Date();
    }

    await db.update(mcpJobs).set(updateData).where(eq(mcpJobs.id, jobId));

    if (message) {
      const [job] = await db.select().from(mcpJobs).where(eq(mcpJobs.id, jobId));
      if (job) {
        await this.websocketManager.notifyUser(job.userId, {
          type: 'job_status_update',
          jobId,
          status,
          message
        });
      }
    }
  }

  /**
   * Gestion d'erreur job
   */
  private async handleJobError(jobId: number, userId: number, error: Error): Promise<void> {
    await db.update(mcpJobs)
      .set({ 
        status: 'failed',
        errorMessage: error.message,
        completedAt: new Date()
      })
      .where(eq(mcpJobs.id, jobId));

    await this.notifyUser(userId, {
      jobId,
      message: `Erreur génération: ${error.message}`,
      type: 'job_failed',
      metadata: { jobId, error: error.message }
    });
  }

  /**
   * Envoie notification à un utilisateur
   */
  private async notifyUser(userId: number, notification: {
    jobId: number;
    message: string;
    type: string;
    metadata?: any;
  }): Promise<void> {
    // Enregistrer notification en base
    await db.insert(mcpJobNotifications).values({
      jobId: notification.jobId,
      userId,
      message: notification.message,
      type: notification.type,
      metadata: notification.metadata || {}
    });

    // Envoyer via WebSocket
    await this.websocketManager.notifyUser(userId, notification);
  }

  /**
   * Récupère les jobs d'un utilisateur
   */
  async getUserJobs(userId: number): Promise<MCPJob[]> {
    return await db.select()
      .from(mcpJobs)
      .where(eq(mcpJobs.userId, userId))
      .orderBy(mcpJobs.createdAt);
  }

  /**
   * Récupère un job spécifique
   */
  async getJob(jobId: number): Promise<MCPJob | null> {
    const jobs = await db.select().from(mcpJobs).where(eq(mcpJobs.id, jobId));
    return jobs[0] || null;
  }

  /**
   * Statistiques système MCP
   */
  async getSystemStats(): Promise<{
    activeJobs: number;
    completedToday: number;
    averageDuration: number;
  }> {
    const activeJobs = this.activeJobs.size;
    
    // Jobs complétés aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedJobs = await db.select()
      .from(mcpJobs)
      .where(eq(mcpJobs.status, 'completed'));
    
    const completedToday = completedJobs.filter(job => 
      job.completedAt && job.completedAt >= today
    ).length;

    // Durée moyenne
    const completedWithDuration = completedJobs.filter(job => 
      job.startedAt && job.completedAt
    );
    
    const averageDuration = completedWithDuration.length > 0
      ? completedWithDuration.reduce((sum, job) => {
          const duration = job.completedAt!.getTime() - job.startedAt!.getTime();
          return sum + duration;
        }, 0) / completedWithDuration.length / 1000
      : 0;

    return {
      activeJobs,
      completedToday,
      averageDuration: Math.round(averageDuration)
    };
  }
}