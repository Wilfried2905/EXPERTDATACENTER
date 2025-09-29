// InjectionStatusService.ts - Service pour gérer le statut d'injection

import { db } from '../db';
import { generatedDeliverables } from '../../shared/schema';
import { sql } from 'drizzle-orm';

export class InjectionStatusService {
  
  // Récupérer le statut d'injection d'un livrable
  async getStatus(deliverableName: string): Promise<'generic' | 'optimized'> {
    try {
      const result = await db
        .select()
        .from(generatedDeliverables)
        .where(sql`generated_content ? ${deliverableName}`)
        .limit(1);
      
      if (result.length === 0) {
        return 'generic';
      }
      
      // Vérifier si le livrable a été marqué comme optimisé
      const deliverable = result[0] as any;
      
      // Vérifier dans les métadonnées ou un champ spécifique
      if (deliverable.injection_status === 'optimized') {
        return 'optimized';
      }
      
      // Vérifier dans le contenu généré
      const generatedContent = deliverable.generatedContent as any;
      if (generatedContent?.[deliverableName]?.injectionStatus === 'optimized') {
        return 'optimized';
      }
      
      return 'generic';
      
    } catch (error: any) {
      console.error('Erreur getStatus:', error);
      return 'generic';
    }
  }
  
  // Marquer un livrable comme optimisé
  async markAsOptimized(deliverableName: string): Promise<boolean> {
    try {
      await db
        .update(generatedDeliverables)
        .set({ 
          injection_status: 'optimized',
          updated_at: new Date() 
        } as any)
        .where(sql`generated_content ? ${deliverableName}`);
      
      console.log(`✅ Livrable "${deliverableName}" marqué comme optimisé`);
      return true;
      
    } catch (error: any) {
      console.error('Erreur markAsOptimized:', error);
      return false;
    }
  }
  
  // Récupérer tous les livrables avec leur statut
  async getAllStatuses(): Promise<Map<string, 'generic' | 'optimized'>> {
    try {
      const results = await db
        .select()
        .from(generatedDeliverables);
      
      const statuses = new Map<string, 'generic' | 'optimized'>();
      
      for (const deliverable of results) {
        const content = deliverable.generatedContent as any;
        if (content) {
          const deliverableNames = Object.keys(content);
          for (const name of deliverableNames) {
            const status = (deliverable as any).injection_status === 'optimized' 
              ? 'optimized' 
              : 'generic';
            statuses.set(name, status);
          }
        }
      }
      
      return statuses;
      
    } catch (error: any) {
      console.error('Erreur getAllStatuses:', error);
      return new Map();
    }
  }
}