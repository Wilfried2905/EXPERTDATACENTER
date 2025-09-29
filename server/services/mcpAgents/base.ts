import { PhaseCollectionData, DeliverableContent } from "../../../shared/schema";

/**
 * MCPAgent - Classe de base pour tous les agents MCP
 * Définit l'interface commune pour SURVEY, AUDIT, CONSEIL, SUPPORT, AMOA
 */
export abstract class MCPAgent {
  protected toolsUsed: string[] = [];

  /**
   * Génère un document via l'agent spécialisé
   */
  abstract generate(
    phaseData: PhaseCollectionData, 
    deliverable: string, 
    progressCallback?: (progress: number, message: string) => void
  ): Promise<DeliverableContent>;

  /**
   * Retourne la durée estimée de génération (en secondes)
   */
  abstract getEstimatedDuration(deliverable: string): number;

  /**
   * Retourne les outils utilisés lors de la dernière génération
   */
  getToolsUsed(): string[] {
    return [...this.toolsUsed];
  }

  /**
   * Réinitialise la liste des outils utilisés
   */
  protected resetToolsUsed(): void {
    this.toolsUsed = [];
  }

  /**
   * Marque un outil comme utilisé
   */
  protected markToolUsed(toolName: string): void {
    if (!this.toolsUsed.includes(toolName)) {
      this.toolsUsed.push(toolName);
    }
  }

  /**
   * Log de progression avec callback optionnel
   */
  protected updateProgress(progress: number, message: string, callback?: (progress: number, message: string) => void): void {
    console.log(`[${this.constructor.name}] ${progress}% - ${message}`);
    if (callback) {
      callback(progress, message);
    }
  }

  /**
   * Validation des données d'entrée
   */
  protected validatePhaseData(phaseData: PhaseCollectionData): void {
    if (!phaseData.client || !phaseData.terrain || !phaseData.parameters) {
      throw new Error('Données de phase incomplètes');
    }
  }

  /**
   * Format standard des documents générés
   */
  protected formatDocument(title: string, sections: Array<{title: string, content: string, charts?: any[]}>, qualityScore: number = 0.85): DeliverableContent {
    return {
      title,
      sections,
      metadata: {
        agent: this.constructor.name,
        tools_used: this.getToolsUsed(),
        generated_at: new Date().toISOString(),
        quality_score: qualityScore
      }
    };
  }
}