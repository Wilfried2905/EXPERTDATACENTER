import { db } from '../db'
import { 
  unifiedCategories, 
  unifiedServices, 
  unifiedDeliverables,
  type UnifiedCategory,
  type UnifiedService,
  type UnifiedDeliverable,
  type CategoryWithServices,
  type ServiceWithDeliverables,
  type CompleteHierarchy
} from '../../shared/unified-schema'
import { eq, and, desc, asc, sql, like } from 'drizzle-orm'

export class UnifiedKnowledgeBaseService {
  
  // ===== RÉCUPÉRATION HIÉRARCHIE COMPLÈTE =====
  async getCompleteHierarchy(): Promise<CompleteHierarchy> {
    try {
      // Récupération avec relations Drizzle
      const categoriesWithServices = await db.query.unifiedCategories.findMany({
        with: {
          services: {
            with: {
              deliverables: {
                where: eq(unifiedDeliverables.isActive, true),
                orderBy: asc(unifiedDeliverables.ordre)
              }
            },
            where: eq(unifiedServices.isActive, true),
            orderBy: asc(unifiedServices.ordre)
          }
        },
        where: eq(unifiedCategories.isActive, true),
        orderBy: asc(unifiedCategories.ordre)
      })

      const totalServices = categoriesWithServices.reduce(
        (sum, cat) => sum + cat.services.length, 0
      )
      
      const totalDeliverables = categoriesWithServices.reduce(
        (sum, cat) => sum + cat.services.reduce(
          (serviceSum, service) => serviceSum + service.deliverables.length, 0
        ), 0
      )

      return {
        categories: categoriesWithServices,
        totalServices,
        totalDeliverables
      }
    } catch (error) {
      console.error('❌ Erreur getCompleteHierarchy:', error)
      throw new Error('Échec récupération hiérarchie complète')
    }
  }

  // ===== CATÉGORIES =====
  async getAllCategories(): Promise<UnifiedCategory[]> {
    try {
      return await db
        .select()
        .from(unifiedCategories)
        .where(eq(unifiedCategories.isActive, true))
        .orderBy(asc(unifiedCategories.ordre))
    } catch (error) {
      console.error('❌ Erreur getAllCategories:', error)
      throw new Error('Échec récupération catégories')
    }
  }

  async getCategoryByName(nom: string): Promise<UnifiedCategory | null> {
    try {
      const categories = await db
        .select()
        .from(unifiedCategories)
        .where(and(
          eq(unifiedCategories.nom, nom),
          eq(unifiedCategories.isActive, true)
        ))
        .limit(1)

      return categories[0] || null
    } catch (error) {
      console.error('❌ Erreur getCategoryByName:', error)
      throw new Error(`Échec récupération catégorie: ${nom}`)
    }
  }

  async getCategoryWithServices(categoryId: number): Promise<CategoryWithServices | null> {
    try {
      const categoryWithServices = await db.query.unifiedCategories.findFirst({
        where: and(
          eq(unifiedCategories.id, categoryId),
          eq(unifiedCategories.isActive, true)
        ),
        with: {
          services: {
            with: {
              deliverables: {
                where: eq(unifiedDeliverables.isActive, true),
                orderBy: asc(unifiedDeliverables.ordre)
              }
            },
            where: eq(unifiedServices.isActive, true),
            orderBy: asc(unifiedServices.ordre)
          }
        }
      })

      return categoryWithServices || null
    } catch (error) {
      console.error('❌ Erreur getCategoryWithServices:', error)
      throw new Error(`Échec récupération catégorie avec services: ${categoryId}`)
    }
  }

  // ===== SERVICES =====
  async getServicesByCategory(categoryName: string): Promise<UnifiedService[]> {
    try {
      // Recherche par nom de catégorie
      const category = await this.getCategoryByName(categoryName)
      if (!category) {
        throw new Error(`Catégorie non trouvée: ${categoryName}`)
      }

      return await db
        .select()
        .from(unifiedServices)
        .where(and(
          eq(unifiedServices.categoryId, category.id),
          eq(unifiedServices.isActive, true)
        ))
        .orderBy(asc(unifiedServices.ordre))
    } catch (error) {
      console.error('❌ Erreur getServicesByCategory:', error)
      throw new Error(`Échec récupération services pour: ${categoryName}`)
    }
  }

  async getServiceById(serviceId: number): Promise<ServiceWithDeliverables | null> {
    try {
      const serviceWithDeliverables = await db.query.unifiedServices.findFirst({
        where: and(
          eq(unifiedServices.id, serviceId),
          eq(unifiedServices.isActive, true)
        ),
        with: {
          category: true,
          deliverables: {
            where: eq(unifiedDeliverables.isActive, true),
            orderBy: asc(unifiedDeliverables.ordre)
          }
        }
      })

      return serviceWithDeliverables || null
    } catch (error) {
      console.error('❌ Erreur getServiceById:', error)
      throw new Error(`Échec récupération service: ${serviceId}`)
    }
  }

  async getServiceByName(serviceName: string): Promise<ServiceWithDeliverables | null> {
    try {
      const serviceWithDeliverables = await db.query.unifiedServices.findFirst({
        where: and(
          eq(unifiedServices.nom, serviceName),
          eq(unifiedServices.isActive, true)
        ),
        with: {
          category: true,
          deliverables: {
            where: eq(unifiedDeliverables.isActive, true),
            orderBy: asc(unifiedDeliverables.ordre)
          }
        }
      })

      return serviceWithDeliverables || null
    } catch (error) {
      console.error('❌ Erreur getServiceByName:', error)
      throw new Error(`Échec récupération service: ${serviceName}`)
    }
  }

  // ===== LIVRABLES =====
  async getDeliverablesByService(serviceId: number): Promise<UnifiedDeliverable[]> {
    try {
      return await db
        .select()
        .from(unifiedDeliverables)
        .where(and(
          eq(unifiedDeliverables.serviceId, serviceId),
          eq(unifiedDeliverables.isActive, true)
        ))
        .orderBy(asc(unifiedDeliverables.ordre))
    } catch (error) {
      console.error('❌ Erreur getDeliverablesByService:', error)
      throw new Error(`Échec récupération livrables pour service: ${serviceId}`)
    }
  }

  // Récupérer les livrables par nom de service EXACT de la base unifiée
  async getDeliverablesByServiceName(serviceName: string): Promise<(UnifiedDeliverable & { category?: string })[]> {
    try {
      const decodedServiceName = decodeURIComponent(serviceName);
      
      // RECHERCHE DIRECTE avec le nom EXACT de la base unifiée
      const deliverables = await db
        .select({
          id: unifiedDeliverables.id,
          nom: unifiedDeliverables.nom,
          description: unifiedDeliverables.description,
          serviceId: unifiedDeliverables.serviceId,
          ordre: unifiedDeliverables.ordre,
          isActive: unifiedDeliverables.isActive,
          structure: unifiedDeliverables.structure,
          prompts: unifiedDeliverables.prompts,
          variables: unifiedDeliverables.variables,
          metadonnees: unifiedDeliverables.metadonnees,
          createdAt: unifiedDeliverables.createdAt,
          updatedAt: unifiedDeliverables.updatedAt,
          category: unifiedCategories.nom,
        })
        .from(unifiedDeliverables)
        .innerJoin(unifiedServices, eq(unifiedDeliverables.serviceId, unifiedServices.id))
        .innerJoin(unifiedCategories, eq(unifiedServices.categoryId, unifiedCategories.id))
        .where(and(
          eq(unifiedServices.nom, decodedServiceName), // NOM EXACT de la base
          eq(unifiedDeliverables.isActive, true)
        ))
        .orderBy(asc(unifiedDeliverables.ordre));

      if (deliverables.length > 0) {
        console.log(`✅ Service "${decodedServiceName}" trouvé avec ${deliverables.length} livrables`);
      } else {
        console.log(`❌ Service "${decodedServiceName}" non trouvé dans la base unifiée`);
      }

      return deliverables;
    } catch (error) {
      console.error('❌ Erreur getDeliverablesByServiceName:', error);
      return [];
    }
  }

  // ===== RECHERCHE ET FILTRAGE =====
  async searchServices(query: string): Promise<ServiceWithDeliverables[]> {
    try {
      const services = await db.query.unifiedServices.findMany({
        where: and(
          like(unifiedServices.nom, `%${query}%`),
          eq(unifiedServices.isActive, true)
        ),
        with: {
          category: true,
          deliverables: {
            where: eq(unifiedDeliverables.isActive, true),
            orderBy: asc(unifiedDeliverables.ordre)
          }
        }
      })

      return services
    } catch (error) {
      console.error('❌ Erreur searchServices:', error)
      throw new Error(`Échec recherche services: ${query}`)
    }
  }

  // ===== STATISTIQUES =====
  async getStatistics() {
    try {
      const [categoriesCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(unifiedCategories)
        .where(eq(unifiedCategories.isActive, true))

      const [servicesCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(unifiedServices)
        .where(eq(unifiedServices.isActive, true))

      const [deliverablesCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(unifiedDeliverables)
        .where(eq(unifiedDeliverables.isActive, true))

      return {
        categories: categoriesCount?.count || 0,
        services: servicesCount?.count || 0,
        deliverables: deliverablesCount?.count || 0,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ Erreur getStatistics:', error)
      throw new Error('Échec récupération statistiques')
    }
  }

  // ===== COMPATIBILITÉ AVEC L'ANCIEN KNOWLEDGEBASESERVICE =====
  async getCategories(): Promise<UnifiedCategory[]> {
    return this.getAllCategories()
  }

  async getServices(categoryName: string): Promise<UnifiedService[]> {
    return this.getServicesByCategory(categoryName)
  }

  async getDeliverables(serviceName: string): Promise<UnifiedDeliverable[]> {
    const service = await this.getServiceByName(serviceName)
    return service ? service.deliverables : []
  }

  // ===== VALIDATION DE L'INTÉGRITÉ =====
  async validateDataIntegrity(): Promise<{
    isValid: boolean
    issues: string[]
    summary: { categories: number, services: number, deliverables: number }
  }> {
    try {
      const issues: string[] = []
      
      // Vérifier les catégories sans services
      const categoriesWithoutServices = await db.query.unifiedCategories.findMany({
        with: { services: true },
        where: eq(unifiedCategories.isActive, true)
      })
      
      categoriesWithoutServices.forEach(cat => {
        if (cat.services.length === 0) {
          issues.push(`Catégorie sans services: ${cat.nom}`)
        }
      })

      // Vérifier les services sans livrables
      const servicesWithoutDeliverables = await db.query.unifiedServices.findMany({
        with: { deliverables: true },
        where: eq(unifiedServices.isActive, true)
      })
      
      servicesWithoutDeliverables.forEach(service => {
        if (service.deliverables.length === 0) {
          issues.push(`Service sans livrables: ${service.nom}`)
        }
      })

      const stats = await this.getStatistics()
      
      return {
        isValid: issues.length === 0,
        issues,
        summary: stats
      }
    } catch (error) {
      console.error('❌ Erreur validateDataIntegrity:', error)
      return {
        isValid: false,
        issues: ['Erreur lors de la validation'],
        summary: { categories: 0, services: 0, deliverables: 0 }
      }
    }
  }
}

// ===== INSTANCE SINGLETON =====
export const unifiedKnowledgeService = new UnifiedKnowledgeBaseService()