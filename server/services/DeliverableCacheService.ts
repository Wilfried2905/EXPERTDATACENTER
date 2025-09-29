import { LRUCache } from 'lru-cache';
import { db } from '../db.js';
import { generatedDeliverables } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

interface CachedDeliverable {
  id: number;
  name: string;
  content: any;
  isLocked: boolean;
  isOptimized: boolean;
  lockedAt?: Date;
  exportedPath?: string;
  cachedAt: Date;
}

class DeliverableCacheService {
  private cache: LRUCache<string, CachedDeliverable>;
  private readonly CACHE_TTL = 3600000; // 1 heure en millisecondes
  private readonly MAX_CACHE_SIZE = 100; // Maximum 100 livrables en cache
  
  constructor() {
    this.cache = new LRUCache<string, CachedDeliverable>({
      max: this.MAX_CACHE_SIZE,
      ttl: this.CACHE_TTL,
      updateAgeOnGet: true, // Rafraîchir le TTL à chaque accès
      updateAgeOnHas: false
    });

    console.log(`💾 Service de cache initialisé: ${this.MAX_CACHE_SIZE} entrées max, TTL ${this.CACHE_TTL / 1000}s`);
  }

  /**
   * Générer une clé de cache unique
   */
  private getCacheKey(deliverableId: number): string {
    return `deliverable_${deliverableId}`;
  }

  /**
   * Récupérer un livrable depuis le cache
   */
  async get(deliverableId: number): Promise<CachedDeliverable | null> {
    const key = this.getCacheKey(deliverableId);
    const cached = this.cache.get(key);
    
    if (cached) {
      console.log(`✅ Cache HIT pour livrable ${deliverableId}`);
      return cached;
    }

    console.log(`❌ Cache MISS pour livrable ${deliverableId}`);
    
    // Si pas en cache et le livrable est verrouillé, le charger et le mettre en cache
    const deliverable = await this.loadAndCache(deliverableId);
    return deliverable;
  }

  /**
   * Charger un livrable depuis la DB et le mettre en cache s'il est verrouillé
   */
  private async loadAndCache(deliverableId: number): Promise<CachedDeliverable | null> {
    try {
      const deliverables = await db.select()
        .from(generatedDeliverables)
        .where(eq(generatedDeliverables.id, deliverableId))
        .limit(1);

      if (deliverables.length === 0) {
        return null;
      }

      const deliverable = deliverables[0];
      
      // Ne mettre en cache que les livrables verrouillés (qui ne changeront plus)
      if (deliverable.isLocked) {
        const cachedData: CachedDeliverable = {
          id: deliverable.id,
          name: deliverable.subCategoryName,
          content: deliverable.generatedContent,
          isLocked: deliverable.isLocked || false,
          isOptimized: deliverable.isOptimized || false,
          lockedAt: deliverable.lockedAt || undefined,
          exportedPath: deliverable.exportedPath || undefined,
          cachedAt: new Date()
        };

        const key = this.getCacheKey(deliverableId);
        this.cache.set(key, cachedData);
        console.log(`💾 Livrable ${deliverableId} ajouté au cache (verrouillé)`);
        
        return cachedData;
      }

      // Si pas verrouillé, retourner sans mettre en cache
      return {
        id: deliverable.id,
        name: deliverable.subCategoryName,
        content: deliverable.generatedContent,
        isLocked: false,
        isOptimized: deliverable.isOptimized || false,
        cachedAt: new Date()
      };

    } catch (error) {
      console.error('❌ Erreur chargement livrable:', error);
      return null;
    }
  }

  /**
   * Mettre à jour le cache pour un livrable
   */
  async update(deliverableId: number, data: Partial<CachedDeliverable>): Promise<void> {
    const key = this.getCacheKey(deliverableId);
    const existing = this.cache.get(key);
    
    if (existing) {
      const updated = {
        ...existing,
        ...data,
        cachedAt: new Date()
      };
      this.cache.set(key, updated);
      console.log(`🔄 Cache mis à jour pour livrable ${deliverableId}`);
    }
  }

  /**
   * Invalider le cache pour un livrable
   */
  invalidate(deliverableId: number): void {
    const key = this.getCacheKey(deliverableId);
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`🗑️ Cache invalidé pour livrable ${deliverableId}`);
    }
  }

  /**
   * Invalider tout le cache
   */
  clear(): void {
    this.cache.clear();
    console.log('🗑️ Cache entièrement vidé');
  }

  /**
   * Précharger les livrables verrouillés en cache
   */
  async preloadLockedDeliverables(): Promise<void> {
    try {
      console.log('📦 Préchargement des livrables verrouillés...');
      
      const lockedDeliverables = await db.select()
        .from(generatedDeliverables)
        .where(eq(generatedDeliverables.isLocked, true))
        .limit(this.MAX_CACHE_SIZE);

      let loaded = 0;
      for (const deliverable of lockedDeliverables) {
        const cachedData: CachedDeliverable = {
          id: deliverable.id,
          name: deliverable.subCategoryName,
          content: deliverable.generatedContent,
          isLocked: true,
          isOptimized: deliverable.isOptimized || false,
          lockedAt: deliverable.lockedAt || undefined,
          exportedPath: deliverable.exportedPath || undefined,
          cachedAt: new Date()
        };

        const key = this.getCacheKey(deliverable.id);
        this.cache.set(key, cachedData);
        loaded++;
      }

      console.log(`✅ ${loaded} livrables verrouillés préchargés en cache`);

    } catch (error) {
      console.error('❌ Erreur préchargement cache:', error);
    }
  }

  /**
   * Obtenir les statistiques du cache
   */
  getStats(): {
    size: number;
    maxSize: number;
    hits: number;
    misses: number;
    usage: string;
  } {
    const size = this.cache.size;
    const maxSize = this.MAX_CACHE_SIZE;
    const usage = `${Math.round((size / maxSize) * 100)}%`;

    return {
      size,
      maxSize,
      hits: 0, // LRUCache ne fournit pas ces stats par défaut
      misses: 0,
      usage
    };
  }

  /**
   * Récupérer plusieurs livrables avec cache
   */
  async getMultiple(deliverableIds: number[]): Promise<Map<number, CachedDeliverable | null>> {
    const results = new Map<number, CachedDeliverable | null>();
    const notInCache: number[] = [];

    // Vérifier le cache en premier
    for (const id of deliverableIds) {
      const key = this.getCacheKey(id);
      const cached = this.cache.get(key);
      
      if (cached) {
        results.set(id, cached);
      } else {
        notInCache.push(id);
      }
    }

    // Charger ceux qui ne sont pas en cache
    if (notInCache.length > 0) {
      const deliverables = await db.select()
        .from(generatedDeliverables)
        .where(and(
          ...notInCache.map(id => eq(generatedDeliverables.id, id))
        ));

      for (const deliverable of deliverables) {
        const cachedData: CachedDeliverable = {
          id: deliverable.id,
          name: deliverable.subCategoryName,
          content: deliverable.generatedContent,
          isLocked: deliverable.isLocked || false,
          isOptimized: deliverable.isOptimized || false,
          lockedAt: deliverable.lockedAt || undefined,
          exportedPath: deliverable.exportedPath || undefined,
          cachedAt: new Date()
        };

        // Mettre en cache seulement si verrouillé
        if (deliverable.isLocked) {
          const key = this.getCacheKey(deliverable.id);
          this.cache.set(key, cachedData);
        }

        results.set(deliverable.id, cachedData);
      }
    }

    return results;
  }

  /**
   * Réchauffer le cache avec les livrables les plus utilisés
   */
  async warmup(deliverableIds: number[]): Promise<void> {
    console.log(`🔥 Réchauffement du cache avec ${deliverableIds.length} livrables...`);
    await this.getMultiple(deliverableIds);
  }
}

// Export singleton
export const deliverableCacheService = new DeliverableCacheService();

// Précharger au démarrage
deliverableCacheService.preloadLockedDeliverables().catch(err => {
  console.error('Erreur préchargement cache au démarrage:', err);
});