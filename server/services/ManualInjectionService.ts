// ManualInjectionService.ts - Nouveau service pour injection contrôlée

import { db } from '../db';
import { generatedDeliverables } from '../../shared/schema';
import { eq, sql } from 'drizzle-orm';

export class ManualInjectionService {
  
  // Injection complète d'un livrable
  async injectDeliverable(deliverableName: string) {
    try {
      console.log(`Début injection manuelle pour: ${deliverableName}`);
      
      // 1. Récupérer le contenu généré depuis la BDD
      const generatedContent = await this.getGeneratedContent(deliverableName);
      
      if (!generatedContent) {
        throw new Error('Aucun contenu généré trouvé pour ce livrable');
      }
      
      // 2. Support des deux structures : nouvelle (cloisonnée) et ancienne (directe)
      const phases = generatedContent.phases || generatedContent;
      
      // 3. Vérifier la présence des 4 éléments AVANT injection
      // Support des différentes structures possibles dans la base
      const elementsStatus = {
        phase2: !!phases?.phase2,
        phase25: !!phases?.phase25,
        // Le summary peut être dans phase3.summary, phase3.content ou directement dans phase3
        summary: !!(phases?.phase3?.summary || phases?.phase3?.content || phases?.phase3),
        // Le prompt peut être dans phase3.prompt, phase3.content ou directement dans phase3
        prompt: !!(phases?.phase3?.prompt || phases?.phase3?.content || phases?.phase3)
      };
      
      const missingElements = [];
      if (!elementsStatus.phase2) missingElements.push('Phase 2 (Questionnaire technique)');
      if (!elementsStatus.phase25) missingElements.push('Phase 2.5 (Questionnaire business)');
      if (!elementsStatus.summary) missingElements.push('Sommaire Phase 3');
      // Ne pas compter le prompt comme manquant s'il y a du contenu phase3
      if (!elementsStatus.prompt && !phases?.phase3) missingElements.push('Prompt Phase 3');
      
      // Si des éléments manquent, retourner un statut partiel
      if (missingElements.length > 0) {
        console.log(`⚠️ Éléments manquants pour ${deliverableName}:`, missingElements);
        
        return {
          success: false,
          status: 'incomplete',
          message: `Optimisation impossible - Éléments manquants: ${missingElements.join(', ')}`,
          missingElements,
          availableElements: {
            phase2: elementsStatus.phase2,
            phase25: elementsStatus.phase25,
            summary: elementsStatus.summary,
            prompt: elementsStatus.prompt
          },
          data: {
            phase2: { success: false, message: elementsStatus.phase2 ? 'Présent' : 'Manquant' },
            phase25: { success: false, message: elementsStatus.phase25 ? 'Présent' : 'Manquant' },
            phase3: { success: false, message: `Sommaire: ${elementsStatus.summary ? 'Présent' : 'Manquant'}, Prompt: ${elementsStatus.prompt ? 'Présent' : 'Manquant'}` }
          }
        };
      }
      
      // 4. Si tous les éléments sont présents, procéder à l'injection
      const injectionResult = {
        phase2: await this.processPhase2Questionnaires(phases?.phase2),
        phase25: await this.processPhase25Questionnaires(phases?.phase25),
        phase3: await this.processPhase3Content(phases?.phase3),
      };
      
      // 4. Compter les injections réussies
      const successCount = [
        injectionResult.phase2.success,
        injectionResult.phase25.success,
        injectionResult.phase3.success
      ].filter(Boolean).length;
      
      const isFullSuccess = successCount === 3;
      
      // 5. Marquer comme optimisé seulement si tout est injecté
      if (isFullSuccess) {
        await this.markAsOptimized(deliverableName);
        console.log(`✅ Injection complète réussie pour: ${deliverableName}`);
      } else {
        console.log(`⚠️ Injection partielle pour: ${deliverableName} (${successCount}/3 réussies)`);
      }
      
      return {
        success: isFullSuccess,
        status: isFullSuccess ? 'complete' : 'partial',
        message: isFullSuccess 
          ? `✅ Livrable "${deliverableName}" entièrement optimisé avec succès`
          : `⚠️ Optimisation partielle de "${deliverableName}" (${successCount}/3 injections réussies)`,
        data: injectionResult,
        stats: {
          totalElements: 4,
          presentElements: 4,
          successfulInjections: successCount,
          failedInjections: 3 - successCount
        }
      };
      
    } catch (error: any) {
      console.error('Erreur injection manuelle:', error);
      throw new Error(`Erreur lors de l'injection: ${error.message}`);
    }
  }
  
  // Récupérer contenu généré
  private async getGeneratedContent(deliverableName: string) {
    const result = await db
      .select()
      .from(generatedDeliverables)
      .where(sql`generated_content ? ${deliverableName}`)
      .limit(1);
      
    if (result.length === 0) {
      return null;
    }
    
    const generatedContent = result[0].generatedContent as any;
    return generatedContent[deliverableName];
  }
  
  // Traiter questionnaires Phase 2
  private async processPhase2Questionnaires(phase2Data: any) {
    if (!phase2Data?.questionnaire) {
      return { success: false, message: 'Pas de questionnaire Phase 2' };
    }
    
    try {
      // Transformer les questions en formulaires React
      const questions = this.parseQuestions(phase2Data.questionnaire);
      const formComponents = this.generateFormComponents(questions, 'phase2');
      
      return {
        success: true,
        message: `${questions.length} questions transformées en formulaires Phase 2`,
        formComponents
      };
    } catch (error: any) {
      return { success: false, message: `Erreur Phase 2: ${error.message}` };
    }
  }
  
  // Traiter questionnaires Phase 2.5
  private async processPhase25Questionnaires(phase25Data: any) {
    if (!phase25Data?.questionnaire) {
      return { success: false, message: 'Pas de questionnaire Phase 2.5' };
    }
    
    try {
      const questions = this.parseQuestions(phase25Data.questionnaire);
      const formComponents = this.generateFormComponents(questions, 'phase25');
      
      return {
        success: true,
        message: `${questions.length} questions transformées en formulaires Phase 2.5`,
        formComponents
      };
    } catch (error: any) {
      return { success: false, message: `Erreur Phase 2.5: ${error.message}` };
    }
  }
  
  // Traiter contenu Phase 3
  private async processPhase3Content(phase3Data: any) {
    if (!phase3Data) {
      return { success: false, message: 'Pas de contenu Phase 3' };
    }
    
    try {
      // Support des différentes structures : phase3 peut être un objet avec summary/prompt
      // ou directement le contenu
      const result = {
        sommaire: phase3Data.summary || phase3Data.sommaire || phase3Data.content || phase3Data,
        prompt: phase3Data.prompt || phase3Data.content || phase3Data
      };
      
      return {
        success: true,
        message: 'Sommaire et prompt intégrés en Phase 3',
        content: result
      };
    } catch (error: any) {
      return { success: false, message: `Erreur Phase 3: ${error.message}` };
    }
  }
  
  // Parser les questions depuis le texte généré
  private parseQuestions(questionnaireText: string) {
    // Logique pour extraire les questions du texte généré
    const questions = [];
    const lines = questionnaireText.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      if (line.match(/^\d+\.|^-|^\*/)) { // Question numérotée ou avec tiret
        const questionText = line.replace(/^\d+\.|^-|^\*/, '').trim();
        if (questionText) {
          questions.push({
            id: `q_${questions.length + 1}`,
            text: questionText,
            type: this.detectQuestionType(questionText),
            required: true
          });
        }
      }
    }
    
    return questions;
  }
  
  // Détecter le type de question
  private detectQuestionType(questionText: string): 'text' | 'textarea' | 'select' | 'number' {
    if (questionText.toLowerCase().includes('décrivez') || questionText.toLowerCase().includes('expliquez')) {
      return 'textarea';
    }
    if (questionText.toLowerCase().includes('combien') || questionText.toLowerCase().includes('nombre')) {
      return 'number';
    }
    if (questionText.includes('?')) {
      return 'text';
    }
    return 'text';
  }
  
  // Générer composants de formulaire
  private generateFormComponents(questions: any[], phase: string) {
    return questions.map(question => ({
      id: question.id,
      component: 'FormField',
      props: {
        label: question.text,
        type: question.type,
        name: `${phase}_${question.id}`,
        required: question.required
      }
    }));
  }
  
  // Marquer comme optimisé
  private async markAsOptimized(deliverableName: string) {
    // Pour l'instant, on log juste le statut
    // L'injection est déjà tracée dans le composant client
    console.log(`✅ Livrable "${deliverableName}" marqué comme optimisé`);
    
    // Note: On pourrait améliorer cela plus tard avec une table dédiée
    // pour tracker les statuts d'injection si nécessaire
  }
}