import { db } from '../db.js';
import { generatedDeliverables, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { deliverableCacheService } from './DeliverableCacheService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DeliverableLockService {
  private readonly EXPORT_DIR = path.join(__dirname, '../../static/deliverables');
  
  constructor() {
    this.ensureExportDir();
  }

  private async ensureExportDir() {
    try {
      await fs.mkdir(this.EXPORT_DIR, { recursive: true });
      console.log(`📁 Dossier d'export créé/vérifié: ${this.EXPORT_DIR}`);
    } catch (error) {
      console.error('❌ Erreur création dossier export:', error);
    }
  }

  /**
   * Verrouiller un livrable optimisé et l'exporter en JSON statique
   */
  async lockDeliverable(deliverableId: number): Promise<{ success: boolean; exportPath?: string; error?: string }> {
    try {
      console.log(`🔒 Verrouillage du livrable ID: ${deliverableId}`);

      // Récupérer le livrable
      const deliverables = await db.select()
        .from(generatedDeliverables)
        .where(eq(generatedDeliverables.id, deliverableId))
        .limit(1);

      if (deliverables.length === 0) {
        return { success: false, error: 'Livrable non trouvé' };
      }

      const deliverable = deliverables[0];
      
      // Vérifier qu'il est optimisé
      if (!deliverable.isOptimized) {
        return { success: false, error: 'Le livrable doit être optimisé avant d\'être verrouillé' };
      }

      // Vérifier qu'il n'est pas déjà verrouillé
      if (deliverable.isLocked) {
        return { 
          success: false, 
          error: 'Le livrable est déjà verrouillé',
          exportPath: deliverable.exportedPath || undefined 
        };
      }

      // Exporter en JSON statique
      const exportFileName = `deliverable_${deliverableId}_${Date.now()}.json`;
      const exportPath = path.join(this.EXPORT_DIR, exportFileName);
      const relativeExportPath = `/static/deliverables/${exportFileName}`;

      // Créer le contenu exporté avec métadonnées
      const exportContent = {
        id: deliverable.id,
        name: deliverable.subCategoryName,
        content: deliverable.generatedContent,
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0',
          isLocked: true,
          isOptimized: true,
          checksum: this.generateChecksum(JSON.stringify(deliverable.generatedContent))
        }
      };

      // Sauvegarder le fichier
      await fs.writeFile(exportPath, JSON.stringify(exportContent, null, 2));
      console.log(`💾 Livrable exporté vers: ${exportPath}`);

      // Mettre à jour la base de données
      const lockedAt = new Date();
      await db.update(generatedDeliverables)
        .set({
          isLocked: true,
          lockedAt: lockedAt,
          exportedPath: relativeExportPath
        })
        .where(eq(generatedDeliverables.id, deliverableId));

      // Mettre à jour le cache avec le statut verrouillé
      await deliverableCacheService.update(deliverableId, {
        isLocked: true,
        isOptimized: deliverable.isOptimized || false,
        lockedAt: lockedAt,
        exportedPath: relativeExportPath
      });

      console.log(`✅ Livrable ${deliverableId} verrouillé avec succès`);

      return { 
        success: true, 
        exportPath: relativeExportPath 
      };

    } catch (error) {
      console.error('❌ Erreur verrouillage livrable:', error);
      return { 
        success: false, 
        error: `Erreur lors du verrouillage: ${(error as Error).message}` 
      };
    }
  }

  /**
   * Déverrouiller un livrable (mode admin uniquement avec vérification du mot de passe)
   */
  async unlockDeliverable(deliverableId: number, adminUsername: string, adminPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Récupérer l'utilisateur admin depuis la base
      const adminUsers = await db.select()
        .from(users)
        .where(and(
          eq(users.username, adminUsername),
          eq(users.role, 'admin')
        ))
        .limit(1);
      
      if (adminUsers.length === 0) {
        return { success: false, error: 'Utilisateur admin non trouvé' };
      }
      
      const adminUser = adminUsers[0];
      
      // Vérifier le mot de passe
      const validPassword = await bcrypt.compare(adminPassword, adminUser.password);
      
      if (!validPassword) {
        return { success: false, error: 'Mot de passe incorrect' };
      }

      console.log(`🔓 Déverrouillage admin du livrable ID: ${deliverableId} par ${adminUsername}`);

      // Mettre à jour la base
      await db.update(generatedDeliverables)
        .set({
          isLocked: false,
          lockedAt: null
        })
        .where(eq(generatedDeliverables.id, deliverableId));

      // Invalider le cache car le livrable n'est plus verrouillé
      deliverableCacheService.invalidate(deliverableId);

      console.log(`✅ Livrable ${deliverableId} déverrouillé par l'admin ${adminUsername}`);

      return { success: true };

    } catch (error) {
      console.error('❌ Erreur déverrouillage:', error);
      return { 
        success: false, 
        error: `Erreur lors du déverrouillage: ${(error as Error).message}` 
      };
    }
  }

  /**
   * Récupérer un livrable depuis le cache/export
   */
  async getLockedDeliverable(deliverableId: number): Promise<any | null> {
    try {
      const deliverables = await db.select()
        .from(generatedDeliverables)
        .where(and(
          eq(generatedDeliverables.id, deliverableId),
          eq(generatedDeliverables.isLocked, true)
        ))
        .limit(1);

      if (deliverables.length === 0) {
        return null;
      }

      const deliverable = deliverables[0];
      
      // Si on a un chemin d'export, lire depuis le fichier
      if (deliverable.exportedPath) {
        const fullPath = path.join(__dirname, '../..', deliverable.exportedPath);
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          return JSON.parse(content);
        } catch (error) {
          console.error('❌ Erreur lecture fichier export:', error);
          // Fallback sur la DB
          return deliverable;
        }
      }

      return deliverable;

    } catch (error) {
      console.error('❌ Erreur récupération livrable verrouillé:', error);
      return null;
    }
  }

  /**
   * Vérifier le statut de verrouillage
   */
  async getLockStatus(deliverableId: number): Promise<{
    isLocked: boolean;
    isOptimized: boolean;
    lockedAt?: Date;
    exportPath?: string;
  }> {
    try {
      const deliverables = await db.select()
        .from(generatedDeliverables)
        .where(eq(generatedDeliverables.id, deliverableId))
        .limit(1);

      if (deliverables.length === 0) {
        return { isLocked: false, isOptimized: false };
      }

      const deliverable = deliverables[0];
      
      return {
        isLocked: deliverable.isLocked || false,
        isOptimized: deliverable.isOptimized || false,
        lockedAt: deliverable.lockedAt || undefined,
        exportPath: deliverable.exportedPath || undefined
      };

    } catch (error) {
      console.error('❌ Erreur vérification statut:', error);
      return { isLocked: false, isOptimized: false };
    }
  }

  /**
   * Marquer un livrable comme optimisé (prérequis pour le verrouillage)
   */
  async markAsOptimized(deliverableId: number): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`✅ Marquage comme optimisé - ID: ${deliverableId}`);

      await db.update(generatedDeliverables)
        .set({
          isOptimized: true,
          isValidated: true,
          validatedAt: new Date()
        })
        .where(eq(generatedDeliverables.id, deliverableId));

      // Mettre à jour le cache si le livrable est verrouillé
      const status = await this.getLockStatus(deliverableId);
      if (status.isLocked) {
        await deliverableCacheService.update(deliverableId, {
          isOptimized: true
        });
      }

      return { success: true };

    } catch (error) {
      console.error('❌ Erreur marquage optimisé:', error);
      return { 
        success: false, 
        error: `Erreur: ${(error as Error).message}` 
      };
    }
  }

  /**
   * Générer un checksum simple pour validation
   */
  private generateChecksum(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Exporter tous les livrables optimisés
   */
  async exportAllOptimized(): Promise<{ 
    success: boolean; 
    exported: number; 
    errors: string[] 
  }> {
    try {
      console.log('📦 Export de tous les livrables optimisés...');

      const optimizedDeliverables = await db.select()
        .from(generatedDeliverables)
        .where(and(
          eq(generatedDeliverables.isOptimized, true),
          eq(generatedDeliverables.isLocked, false)
        ));

      let exported = 0;
      const errors: string[] = [];

      for (const deliverable of optimizedDeliverables) {
        const result = await this.lockDeliverable(deliverable.id);
        if (result.success) {
          exported++;
        } else {
          errors.push(`Livrable ${deliverable.id}: ${result.error}`);
        }
      }

      console.log(`✅ Export terminé: ${exported} livrables exportés`);

      return { 
        success: true, 
        exported, 
        errors 
      };

    } catch (error) {
      console.error('❌ Erreur export batch:', error);
      return { 
        success: false, 
        exported: 0, 
        errors: [(error as Error).message] 
      };
    }
  }
}

// Export singleton
export const deliverableLockService = new DeliverableLockService();