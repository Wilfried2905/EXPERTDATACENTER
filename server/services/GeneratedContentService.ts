import { db } from '../db.js';
import { eq, and, desc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { generatedContent } from '../../shared/schema';

/**
 * Service pour la gestion du contenu généré - Option B
 */
export class GeneratedContentService {
  
  /**
   * Sauvegarder un contenu généré dans la BDD
   */
  async saveContent(data: {
    deliverableName: string;
    serviceId: number;
    category: string;
    contentType: 'sommaire' | 'prompt_phase3' | 'questionnaire_phase2' | 'questionnaire_phase25';
    content: string;
    metadata?: any;
    generationJobId?: string;
    userId?: number;
  }) {
    try {
      const insertData = {
        deliverableName: data.deliverableName,
        serviceId: data.serviceId,
        category: data.category,
        contentType: data.contentType,
        content: data.content,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        generationJobId: data.generationJobId,
        userId: data.userId || 1,
        injectionStatus: 'generic' as const, // ✅ CORRECTION : Ajouter injection_status par défaut
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.insert(generatedContent).values(insertData).returning();

      console.log(`✅ GeneratedContentService: Contenu ${data.contentType} sauvegardé pour ${data.deliverableName}`);
      return result[0];
    } catch (error) {
      console.error(`❌ GeneratedContentService: Erreur sauvegarde ${data.contentType}:`, error);
      throw error;
    }
  }

  /**
   * Sauvegarder tous les contenus générés d'un coup
   */
  async saveAllGeneratedContent(
    deliverableName: string,
    serviceId: number,
    category: string,
    contents: {
      sommaire?: string;
      prompt_phase3?: string;
      questionnaire_phase2?: string;
      questionnaire_phase25?: string;
    },
    generationJobId: string,
    userId?: number
  ) {
    const results: any[] = [];

    for (const [contentType, content] of Object.entries(contents)) {
      if (content && content.trim()) {
        try {
          const result = await this.saveContent({
            deliverableName,
            serviceId,
            category,
            contentType: contentType as any,
            content,
            generationJobId,
            userId
          });
          results.push({ contentType, success: true, result });
        } catch (error) {
          console.error(`❌ Erreur sauvegarde ${contentType}:`, error);
          results.push({ contentType, success: false, error });
        }
      }
    }

    console.log(`💾 Sauvegarde batch terminée: ${results.filter(r => r.success).length}/${results.length} succès`);
    return results;
  }

  /**
   * Récupérer le contenu généré pour un livrable
   */
  async getContentByDeliverable(deliverableName: string) {
    try {
      const results = await db
        .select({
          contentType: generatedContent.contentType,
          content: generatedContent.content,
          metadata: generatedContent.metadata,
          createdAt: generatedContent.createdAt,
          updatedAt: generatedContent.updatedAt
        })
        .from(generatedContent)
        .where(eq(generatedContent.deliverableName, deliverableName))
        .orderBy(desc(generatedContent.updatedAt));

      const contentMap: Record<string, any> = {};
      
      for (const row of results) {
        contentMap[row.contentType] = {
          content: row.content,
          metadata: row.metadata ? JSON.parse(row.metadata as string) : null,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        };
      }

      return Object.keys(contentMap).length > 0 ? contentMap : null;
    } catch (error) {
      console.error(`❌ GeneratedContentService: Erreur récupération contenu pour ${deliverableName}:`, error);
      return null;
    }
  }

  /**
   * Récupérer un type de contenu spécifique
   */
  async getSpecificContent(deliverableName: string, contentType: string) {
    try {
      const results = await db.execute(sql`
        SELECT content, metadata, created_at, updated_at
        FROM generated_content
        WHERE deliverable_name = ${deliverableName} AND content_type = ${contentType}
        ORDER BY updated_at DESC
        LIMIT 1
      `);

      if (results.rows.length > 0) {
        const row = results.rows[0] as any;
        return {
          content: row.content,
          metadata: row.metadata ? JSON.parse(row.metadata) : null,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      }

      return null;
    } catch (error) {
      console.error(`❌ GeneratedContentService: Erreur récupération ${contentType} pour ${deliverableName}:`, error);
      return null;
    }
  }

  /**
   * Lister tous les livrables avec contenu généré
   */
  async getAllDeliverablesWithContent() {
    try {
      const results = await db.execute(sql`
        SELECT 
          deliverable_name,
          category,
          service_id,
          COUNT(*) as content_count,
          MAX(updated_at) as last_update
        FROM generated_content
        GROUP BY deliverable_name, category, service_id
        ORDER BY last_update DESC
      `);

      return results.rows.map((row: any) => ({
        deliverableName: row.deliverable_name,
        category: row.category,
        serviceId: row.service_id,
        contentCount: parseInt(row.content_count),
        lastUpdate: new Date(row.last_update)
      }));
    } catch (error) {
      console.error('❌ GeneratedContentService: Erreur liste livrables:', error);
      return [];
    }
  }

  /**
   * Supprimer le contenu généré pour un livrable
   */
  async deleteContentByDeliverable(deliverableName: string) {
    try {
      await db.execute(sql`
        DELETE FROM generated_content
        WHERE deliverable_name = ${deliverableName}
      `);
      console.log(`🗑️ Contenu supprimé pour ${deliverableName}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur suppression contenu pour ${deliverableName}:`, error);
      return false;
    }
  }
}