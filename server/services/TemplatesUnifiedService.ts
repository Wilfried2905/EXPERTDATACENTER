import { db } from '../db'
import { templates, generatedDeliverables } from '../../shared/schema'
import { eq, and, asc, desc, like, sql } from 'drizzle-orm'

// Types pour compatibilité avec les APIs unified
interface UnifiedCategory {
  id: number
  nom: string
  color: string
  description: string
  ordre: number
  isActive: boolean
}

interface UnifiedService {
  id: number
  nom: string
  categoryId: number
  description: string
  workflow: any
  dureeEstimee: string
  prerequis: string[]
  ordre: number
  isActive: boolean
}

interface UnifiedDeliverable {
  id: number
  nom: string
  serviceId: number
  structure: any
  prompts: any
  variables: any
  metadonnees: any
  description: string
  ordre: number
  isActive: boolean
}

interface CategoryWithServices extends UnifiedCategory {
  services: ServiceWithDeliverables[]
}

interface ServiceWithDeliverables extends UnifiedService {
  deliverables: UnifiedDeliverable[]
}

interface CompleteHierarchy {
  categories: CategoryWithServices[]
  totalServices: number
  totalDeliverables: number
}

interface Stats {
  categories: number
  services: number
  deliverables: number
  timestamp: string
}

export class TemplatesUnifiedService {
  
  // ===== CONVERSION HELPERS =====
  private createCategoryFromTemplates(categorie: string, ordre: number): UnifiedCategory {
    const colorMap: { [key: string]: string } = {
      'SURVEY': '#3B82F6',
      'AUDIT': '#10B981', 
      'CONSEIL': '#F59E0B',
      'SUPPORT': '#EF4444',
      'AMOA': '#8B5CF6',
      'AMENAGEMENT PHYSIQUE': '#06B6D4',
      'AMENAGEMENT TECHNIQUE': '#84CC16',
      'NETTOYAGE': '#F97316',
      'COMMISSIONING': '#EC4899',
      'MAINTENANCE': '#6366F1',
      'MONITORING': '#14B8A6'
    }
    
    return {
      id: ordre, // Utiliser l'ordre comme ID
      nom: categorie,
      color: colorMap[categorie] || '#6B7280',
      description: `Catégorie ${categorie} - Services professionnels TIA-942`,
      ordre,
      isActive: true
    }
  }

  private createServiceFromTemplates(
    sous_categorie: string, 
    categorie: string, 
    categoryId: number,
    serviceOrder: number
  ): UnifiedService {
    return {
      id: serviceOrder, // Utiliser un ID unique basé sur l'ordre
      nom: sous_categorie,
      categoryId,
      description: `Service ${sous_categorie} de la catégorie ${categorie}`,
      workflow: {},
      dureeEstimee: "2-5 jours",
      prerequis: [],
      ordre: serviceOrder,
      isActive: true
    }
  }

  private createDeliverableFromTemplate(template: any, serviceId: number): UnifiedDeliverable {
    return {
      id: template.id,
      nom: template.nom,
      serviceId,
      structure: template.structure,
      prompts: template.prompts,
      variables: template.variables,
      metadonnees: template.metadonnees,
      description: template.description || '',
      ordre: 1,
      isActive: template.isActive
    }
  }

  // ===== RÉCUPÉRATION HIÉRARCHIE COMPLÈTE =====
  async getCompleteHierarchy(): Promise<CompleteHierarchy> {
    try {
      // Récupérer toutes les données depuis templates
      const templatesData = await db
        .select()
        .from(templates)
        .where(eq(templates.isActive, true))
        .orderBy(asc(templates.categorie), asc(templates.sous_categorie))

      // Grouper par catégorie et sous-catégorie
      const categoriesMap = new Map<string, CategoryWithServices>()
      const servicesMap = new Map<string, ServiceWithDeliverables>()
      
      let categoryOrder = 1
      let serviceOrder = 1

      for (const template of templatesData) {
        const categoryKey = template.categorie
        const serviceKey = `${template.categorie}:${template.sous_categorie}`

        // Créer la catégorie si elle n'existe pas
        if (!categoriesMap.has(categoryKey)) {
          const category = this.createCategoryFromTemplates(template.categorie, categoryOrder++)
          categoriesMap.set(categoryKey, { ...category, services: [] })
        }

        // Créer le service si il n'existe pas
        if (!servicesMap.has(serviceKey)) {
          const category = categoriesMap.get(categoryKey)!
          const service = this.createServiceFromTemplates(
            template.sous_categorie || 'Service',
            template.categorie,
            category.id,
            serviceOrder++
          )
          const serviceWithDeliverables = { ...service, deliverables: [] }
          servicesMap.set(serviceKey, serviceWithDeliverables)
          category.services.push(serviceWithDeliverables)
        }

        // Ajouter le livrable au service
        const service = servicesMap.get(serviceKey)!
        const deliverable = this.createDeliverableFromTemplate(template, service.id)
        service.deliverables.push(deliverable)
      }

      const categories = Array.from(categoriesMap.values())
      const totalServices = Array.from(servicesMap.values()).length
      const totalDeliverables = templatesData.length

      return {
        categories,
        totalServices,
        totalDeliverables
      }
    } catch (error) {
      console.error('❌ Erreur getCompleteHierarchy:', error)
      throw new Error('Échec récupération hiérarchie complète depuis templates')
    }
  }

  // ===== CATÉGORIES =====
  async getAllCategories(): Promise<UnifiedCategory[]> {
    try {
      const templatesData = await db
        .selectDistinct({ categorie: templates.categorie })
        .from(templates)
        .where(eq(templates.isActive, true))
        .orderBy(asc(templates.categorie))

      return templatesData.map((item, index) => 
        this.createCategoryFromTemplates(item.categorie, index + 1)
      )
    } catch (error) {
      console.error('❌ Erreur getAllCategories:', error)
      throw new Error('Échec récupération catégories depuis templates')
    }
  }

  async getCategoryByName(nom: string): Promise<UnifiedCategory | null> {
    try {
      const templateData = await db
        .selectDistinct({ categorie: templates.categorie })
        .from(templates)
        .where(and(
          eq(templates.categorie, nom),
          eq(templates.isActive, true)
        ))
        .limit(1)

      if (templateData.length === 0) return null

      return this.createCategoryFromTemplates(templateData[0].categorie, 1)
    } catch (error) {
      console.error('❌ Erreur getCategoryByName:', error)
      throw new Error(`Échec récupération catégorie: ${nom}`)
    }
  }

  async getCategoryWithServices(categoryId: number): Promise<CategoryWithServices | null> {
    try {
      const hierarchy = await this.getCompleteHierarchy()
      return hierarchy.categories.find(cat => cat.id === categoryId) || null
    } catch (error) {
      console.error('❌ Erreur getCategoryWithServices:', error)
      throw new Error(`Échec récupération catégorie avec services: ${categoryId}`)
    }
  }

  // ===== SERVICES =====
  async getServicesByCategory(categoryName: string): Promise<ServiceWithDeliverables[]> {
    try {
      console.log('🔍 DEBUG: getServicesByCategory appelé avec:', categoryName)
      
      const hierarchy = await this.getCompleteHierarchy()
      const category = hierarchy.categories.find(cat => cat.nom === categoryName)
      
      console.log('🔍 DEBUG: Catégorie trouvée:', category?.nom, 'Services:', category?.services?.length)
      
      return category?.services || []
    } catch (error) {
      console.error('❌ Erreur getServicesByCategory:', error)
      throw new Error(`Échec récupération services pour catégorie: ${categoryName}`)
    }
  }

  async getServiceById(serviceId: number): Promise<ServiceWithDeliverables | null> {
    try {
      const hierarchy = await this.getCompleteHierarchy()
      
      for (const category of hierarchy.categories) {
        const service = category.services.find(s => s.id === serviceId)
        if (service) return service
      }
      
      return null
    } catch (error) {
      console.error('❌ Erreur getServiceById:', error)
      throw new Error(`Échec récupération service: ${serviceId}`)
    }
  }

  async searchServices(searchTerm: string): Promise<ServiceWithDeliverables[]> {
    try {
      const hierarchy = await this.getCompleteHierarchy()
      const allServices = hierarchy.categories.flatMap(cat => cat.services)
      
      return allServices.filter(service => 
        service.nom.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } catch (error) {
      console.error('❌ Erreur searchServices:', error)
      throw new Error(`Échec recherche services: ${searchTerm}`)
    }
  }

  // ===== LIVRABLES =====
  async getDeliverablesByService(serviceId: number): Promise<UnifiedDeliverable[]> {
    try {
      console.log('🔍 DEBUG TemplatesUnifiedService: getDeliverablesByService appelé avec serviceId:', serviceId)
      
      const service = await this.getServiceById(serviceId)
      const deliverables = service?.deliverables || []
      
      console.log('🔍 DEBUG TemplatesUnifiedService: Service trouvé:', service?.nom)
      console.log('🔍 DEBUG TemplatesUnifiedService: Livrables trouvés:', deliverables.length)
      
      return deliverables
    } catch (error) {
      console.error('❌ Erreur getDeliverablesByService:', error)
      throw new Error(`Échec récupération livrables pour service: ${serviceId}`)
    }
  }

  async getDeliverableById(deliverableId: number): Promise<UnifiedDeliverable | null> {
    try {
      // Récupérer la hiérarchie complète
      const hierarchy = await this.getCompleteHierarchy()
      
      // Chercher le livrable dans toutes les catégories et services
      for (const category of hierarchy.categories) {
        for (const service of category.services) {
          const deliverable = service.deliverables.find(d => d.id === deliverableId)
          if (deliverable) {
            console.log('✅ Livrable trouvé:', deliverable.nom, 'ID:', deliverableId)
            return deliverable
          }
        }
      }
      
      console.log('⚠️ Livrable non trouvé avec ID:', deliverableId)
      return null
    } catch (error) {
      console.error('❌ Erreur getDeliverableById:', error)
      return null
    }
  }

  // ===== STATISTIQUES =====
  async getStatistics(): Promise<Stats> {
    try {
      const hierarchy = await this.getCompleteHierarchy()
      
      return {
        categories: hierarchy.categories.length,
        services: hierarchy.totalServices,
        deliverables: hierarchy.totalDeliverables,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ Erreur getStatistics:', error)
      throw new Error('Échec récupération statistiques depuis templates')
    }
  }

  // ===== VALIDATION =====
  async validateDataIntegrity(): Promise<{ isValid: boolean; details: any }> {
    try {
      const stats = await this.getStatistics()
      
      const isValid = stats.categories > 0 && stats.services > 0 && stats.deliverables > 0
      
      return {
        isValid,
        details: {
          source: 'templates',
          ...stats,
          checks: {
            hasCategories: stats.categories > 0,
            hasServices: stats.services > 0,
            hasDeliverables: stats.deliverables > 0
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur validateDataIntegrity:', error)
      return {
        isValid: false,
        details: { error: error instanceof Error ? error.message : 'Erreur inconnue' }
      }
    }
  }

  // ===== GENERATED CONTENT METHODS =====

  // Récupérer le contenu généré pour un livrable spécifique
  async getGeneratedContent(generatedDeliverableId: number, deliverableName: string) {
    try {
      const result = await db
        .select()
        .from(generatedDeliverables)
        .where(eq(generatedDeliverables.id, generatedDeliverableId))
        .limit(1)

      if (result.length === 0) {
        return null
      }

      const generatedDeliverable = result[0]
      
      // Extraire le contenu pour le livrable spécifique depuis le JSONB
      const generatedContent = generatedDeliverable.generatedContent as any
      
      if (!generatedContent || !generatedContent[deliverableName]) {
        return null
      }

      return {
        deliverableName,
        content: generatedContent[deliverableName],
        generatedDeliverableId,
        lastUpdated: generatedDeliverable.generatedAt
      }
    } catch (error) {
      console.error('❌ Erreur getGeneratedContent:', error)
      throw error
    }
  }

  // Sauvegarder le contenu généré
  async saveGeneratedContent(data: {
    generatedDeliverableId: number | null
    deliverableName: string
    phases?: any  // Ancienne structure pour compatibilité
    deliverableData?: any  // Nouvelle structure cloisonnée
  }) {
    try {
      // IMPORTANT: Chercher d'abord par nom de livrable pour fusionner les phases
      // au lieu de créer de nouvelles entrées à chaque fois
      console.log(`🔍 Recherche entrée existante pour livrable: "${data.deliverableName}"`)
      
      // Chercher la dernière entrée pour ce livrable par sub_category_name
      const existingByName = await db
        .select()
        .from(generatedDeliverables)
        .where(eq(generatedDeliverables.subCategoryName, data.deliverableName))
        .orderBy(desc(generatedDeliverables.generatedAt))
        .limit(1)

      let resultId: number
      let updatedContent: any
      let existing = existingByName

      // Si pas trouvé par nom ET qu'on a un ID valide (pas null et pas 0), chercher par ID
      if (existing.length === 0 && data.generatedDeliverableId && data.generatedDeliverableId > 0) {
        existing = await db
          .select()
          .from(generatedDeliverables)
          .where(eq(generatedDeliverables.id, data.generatedDeliverableId))
          .limit(1)
      }

      // Support de la nouvelle structure cloisonnée
      const newDeliverableContent = data.deliverableData?.[data.deliverableName] || {
        phases: data.phases || {},
        metadata: {
          deliverableId: data.generatedDeliverableId,
          generatedAt: new Date().toISOString()
        }
      }

      if (existing.length === 0) {
        // Créer un nouvel enregistrement s'il n'existe pas
        console.log(`📝 Création NOUVEAU enregistrement pour: "${data.deliverableName}"`)
        
        updatedContent = {
          [data.deliverableName]: newDeliverableContent
        }

        const newRecord = await db
          .insert(generatedDeliverables)
          .values({
            userId: 2, // ID utilisateur admin existant
            // Suppression de deliverableName qui n'existe pas dans la table
            subCategoryName: data.deliverableName,
            deliverablesList: updatedContent,
            generatedContent: updatedContent,
            generatedAt: new Date()
          })
          .returning()

        resultId = newRecord[0].id
        console.log(`✅ Nouvelle entrée créée avec ID: ${resultId}`)
      } else {
        // FUSIONNER avec l'enregistrement existant
        console.log(`🔄 FUSION avec entrée existante ID: ${existing[0].id}`)
        const existingContent = (existing[0].generatedContent as any) || {}
        
        // Récupérer le contenu existant du livrable
        const existingDeliverableContent = existingContent[data.deliverableName] || { phases: {} }
        
        // FUSION INTELLIGENTE des phases
        const mergedPhases = {
          ...existingDeliverableContent.phases  // Garder les phases existantes
        }
        
        // Ajouter ou mettre à jour chaque nouvelle phase
        const newPhases = newDeliverableContent.phases || data.phases || {}
        if (newPhases.phase2) {
          mergedPhases.phase2 = newPhases.phase2
          console.log('✅ Phase 2 ajoutée/mise à jour')
        }
        if (newPhases.phase25) {
          mergedPhases.phase25 = newPhases.phase25
          console.log('✅ Phase 2.5 ajoutée/mise à jour')
        }
        if (newPhases.phase3) {
          // Fusionner également les sous-éléments de phase3
          mergedPhases.phase3 = {
            ...(mergedPhases.phase3 || {}),
            ...(newPhases.phase3 || {})
          }
          console.log('✅ Phase 3 ajoutée/mise à jour')
        }
        
        // Reconstruire le contenu complet
        updatedContent = {
          ...existingContent,
          [data.deliverableName]: {
            phases: mergedPhases,
            metadata: {
              ...existingDeliverableContent.metadata,
              lastUpdated: new Date().toISOString(),
              isComplete: !!(mergedPhases.phase2 && mergedPhases.phase25 && 
                            mergedPhases.phase3?.sommaire && mergedPhases.phase3?.prompt)
            }
          }
        }

        await db
          .update(generatedDeliverables)
          .set({ 
            generatedContent: updatedContent,
            deliverablesList: updatedContent,
            subCategoryName: data.deliverableName
            // Suppression de deliverableName qui n'existe pas dans la table
          })
          .where(eq(generatedDeliverables.id, existing[0].id))  // IMPORTANT: Utiliser l'ID existant, pas celui envoyé (qui est 0)
        
        resultId = existing[0].id  // Utiliser l'ID de l'entrée existante
        console.log(`✅ AJOUT dans cloisonnement existant - ID: ${resultId}, Phases ajoutées`)
      }

      console.log('✅ Contenu sauvegardé avec cloisonnement:', {
        deliverableName: data.deliverableName,
        entryId: resultId,
        totalDeliverables: Object.keys(updatedContent).length
      })

      return {
        success: true,
        deliverableName: data.deliverableName,
        generatedDeliverableId: resultId,
        savedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ Erreur saveGeneratedContent:', error)
      throw error
    }
  }

  // Mettre à jour le contenu généré
  async updateGeneratedContent(generatedDeliverableId: number, deliverableName: string, phases: any) {
    try {
      return await this.saveGeneratedContent({
        generatedDeliverableId,
        deliverableName,
        phases
      })
    } catch (error) {
      console.error('❌ Erreur updateGeneratedContent:', error)
      throw error
    }
  }

  // Supprimer le contenu généré pour un livrable spécifique
  async deleteGeneratedContent(generatedDeliverableId: number, deliverableName: string) {
    try {
      // Récupérer l'enregistrement existant
      const existing = await db
        .select()
        .from(generatedDeliverables)
        .where(eq(generatedDeliverables.id, generatedDeliverableId))
        .limit(1)

      if (existing.length === 0) {
        throw new Error('Generated deliverable non trouvé')
      }

      // Supprimer le livrable spécifique du contenu
      const existingContent = (existing[0].generatedContent as any) || {}
      delete existingContent[deliverableName]

      // Mettre à jour sans le livrable supprimé
      const result = await db
        .update(generatedDeliverables)
        .set({ 
          generatedContent: existingContent
        })
        .where(eq(generatedDeliverables.id, generatedDeliverableId))
        .returning()

      return {
        success: true,
        deliverableName,
        generatedDeliverableId,
        deletedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ Erreur deleteGeneratedContent:', error)
      throw error
    }
  }

  // ===== MÉTHODE POUR VÉRIFICATION CONTENU DISPONIBLE =====
  async checkGeneratedContent(deliverableName: string) {
    try {
      // Récupérer tous les enregistrements
      const results = await db
        .select()
        .from(generatedDeliverables)
        .limit(10);
      
      // Chercher le livrable dans le contenu généré
      for (const record of results) {
        const content = record.generatedContent as any;
        if (content && content[deliverableName]) {
          console.log(`✅ Contenu trouvé pour ${deliverableName}`);
          return record;
        }
      }
      
      console.log(`❌ Aucun contenu trouvé pour ${deliverableName}`);
      return null;
    } catch (error) {
      console.error('Erreur checkGeneratedContent:', error);
      return null;
    }
  }
}

// Instance partagée
export const templatesUnifiedService = new TemplatesUnifiedService()