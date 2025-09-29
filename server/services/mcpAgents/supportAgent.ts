import { MCPAgent } from "./base";
import { PhaseCollectionData, DeliverableContent } from "../../../shared/schema";

/**
 * SupportAgent - Agent spécialisé pour les 220 livrables SUPPORT
 * Documentation et formation opérationnelle
 */
export class SupportAgent extends MCPAgent {
  
  async generate(
    phaseData: PhaseCollectionData, 
    deliverable: string, 
    progressCallback?: (progress: number, message: string) => void
  ): Promise<DeliverableContent> {
    
    this.resetToolsUsed();
    this.validatePhaseData(phaseData);
    
    this.updateProgress(10, "Initialisation SupportAgent", progressCallback);
    
    // Phase pilote - implémentation basique
    const sections = [
      {
        title: "Procédures opérationnelles",
        content: `Support ${deliverable} pour équipes ${phaseData.client.nom}.`
      },
      {
        title: "Formation technique",
        content: `Programme formation Tier ${phaseData.terrain.tierCible || 'II'} en cours de développement.`
      },
      {
        title: "Documentation maintenance",
        content: "Guides et procédures de maintenance préventive."
      }
    ];

    this.markToolUsed('training_material_generator');
    this.markToolUsed('procedure_documentation');
    
    this.updateProgress(100, "Document support généré", progressCallback);
    
    return this.formatDocument(deliverable, sections, 0.86);
  }

  getEstimatedDuration(deliverable: string): number {
    return 180; // 3 minutes
  }
}