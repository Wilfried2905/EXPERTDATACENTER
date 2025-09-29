import { db } from '../server/db'
import { 
  unifiedCategories, 
  unifiedServices, 
  unifiedDeliverables,
  type NewUnifiedCategory,
  type NewUnifiedService,
  type NewUnifiedDeliverable
} from '../shared/unified-schema'
import { templates } from '../shared/schema'
import { sql } from 'drizzle-orm'

// ===== EXTRACTION COMPLÈTE DU CATEGORYDATA =====
const categoryData = {
  survey: {
    nom: "SURVEY",
    color: "#3B82F6",
    description: "Module autonome pour les évaluations et études techniques",
    services: [
      "Évaluation d'infrastructure",
      "Études de localisation", 
      "Étude de Faisabilité",
      "Étude de Résilience",
      "Optimisation Énergétique",
      "Évaluations Spécialisées",
      "Études Comparatives",
      "Audit de capacité",
      "Évaluation environnementale",
      "Évaluations de centres de données périphériques (Edge & µEDC)",
      "Évaluations haute densité (AI/ML Computing)",
      "Évaluations de refroidissement par immersion"
    ]
  },
  audit: {
    nom: "AUDIT", 
    color: "#10B981",
    description: "Module autonome pour la conformité et certifications",
    services: [
      "Conformité et certification",
      "Audit documentaire",
      "Évaluations périodiques",
      "Sécurité physique",
      "Préparation certification",
      "Analyse des écarts",
      "Audit de conformité TIA-942",
      "Audit de redondance",
      "Évaluation des performances",
      "Audit de durabilité énergétique",
      "Audit de systèmes modulaires",
      "Audit de technologies émergentes"
    ]
  },
  conseil: {
    nom: "CONSEIL",
    color: "#F59E0B", 
    description: "Module autonome pour la stratégie et planification",
    services: [
      "Stratégie et planification",
      "Transformation infrastructure",
      "Formation TIA-942",
      "Optimisation opérationnelle",
      "Gestion des risques",
      "Optimisation énergétique",
      "Planification de la croissance",
      "Conseil en refroidissement liquide",
      "Stratégie infrastructure Edge",
      "Transition énergétique"
    ]
  },
  amoa: {
    nom: "AMOA",
    color: "#EC4899",
    description: "Module autonome pour l'assistance maîtrise d'ouvrage",
    services: [
      "Architecture Technique Infrastructure",
      "Conception technique",
      "Conception générale",
      "Pilotage et planification",
      "Étude préliminaire",
      "Analyse des besoins",
      "Spécifications techniques détaillées",
      "Validation des livrables",
      "Spécifications Edge Computing",
      "Analyse besoins haute densité",
      "Cahier des charges durabilité"
    ]
  },
  support: {
    nom: "SUPPORT",
    color: "#8B5CF6",
    description: "Module autonome pour la production et transfert",
    services: [
      "Production documentaire",
      "Transfert de compétences", 
      "Suivi des recommandations",
      "Gestion de la documentation",
      "Accompagnement Projet",
      "Support Opérationnel",
      "Assistance Technique",
      "Formation Technologies Émergentes",
      "Accompagnement transition Edge",
      "Support durabilité"
    ]
  },
  amenagement: {
    nom: "AMENAGEMENT PHYSIQUE",
    color: "#06B6D4", 
    description: "Module autonome pour l'infrastructure physique",
    services: [
      "Urbanisation des salles",
      "Distribution électrique",
      "Infrastructure réseau",
      "Optimisation énergétique",
      "Documentation opérationnelle",
      "Systèmes de refroidissement (CVC)",
      "Systèmes de sécurité",
      "Systèmes de détection incendie",
      "Câblage structuré",
      "Refroidissement direct-sur-puce (D2C)",
      "Systèmes de refroidissement par immersion",
      "Architecture Wall Flow",
      "Micro-réseaux électriques"
    ]
  },
  "amenagement-technique": {
    nom: "AMÉNAGEMENT TECHNIQUE",
    color: "#6366F1",
    description: "Module autonome pour la conception spécialisée",
    services: [
      "Conception technique",
      "Conception générale", 
      "Pilotage et planification",
      "Étude préliminaire",
      "Conception haute densité",
      "Edge computing",
      "Conception durable et écologique"
    ]
  },
  nettoyage: {
    nom: "NETTOYAGE",
    color: "#059669",
    description: "Module autonome pour la maintenance propreté",
    services: [
      "Planification des interventions",
      "Méthodologie et protocoles",
      "Assurance qualité",
      "Documentation et rapports",
      "Gestion des prestataires",
      "Nettoyage systèmes immersion",
      "Maintenance circuits liquides",
      "Nettoyage environnements haute densité"
    ]
  },
  commissioning: {
    nom: "COMMISSIONING",
    color: "#F59E0B",
    description: "Module autonome pour les tests et validation",
    services: [
      "Tests de mise en service",
      "Validation des performances",
      "Tests de redondance",
      "Certification finale",
      "Documentation de mise en service",
      "Mise en service refroidissement liquide",
      "Validation haute densité",
      "Tests Edge computing"
    ]
  },
  maintenance: {
    nom: "MAINTENANCE",
    color: "#EC4899",
    description: "Module autonome pour la gestion préventive",
    services: [
      "Maintenance Préventive",
      "Maintenance Corrective",
      "Maintenance Prédictive",
      "Gestion des Contrats de Maintenance",
      "Planification des Interventions",
      "Maintenance Systèmes Liquides",
      "Maintenance Batteries Lithium-Ion",
      "Maintenance Prédictive IA"
    ]
  },
  monitoring: {
    nom: "MONITORING",
    color: "#14B8A6",
    description: "Module autonome pour la surveillance continue",
    services: [
      "Surveillance des performances",
      "Alertes et notifications",
      "Rapports de performance",
      "Analyse des tendances",
      "Optimisation continue",
      "Surveillance haute densité",
      "Monitoring Edge temps réel",
      "Analyse énergétique avancée"
    ]
  }
}

interface MigrationReport {
  categoriesCreated: number
  servicesCreated: number
  deliverablesLinked: number
  orphanedDeliverables: string[]
  errors: string[]
  duration: number
}

class UnifiedSystemMigration {
  
  async executeFullMigration(): Promise<MigrationReport> {
    const startTime = Date.now()
    console.log('🚀 Début de la migration vers le système unifié')
    
    const report: MigrationReport = {
      categoriesCreated: 0,
      servicesCreated: 0,
      deliverablesLinked: 0,
      orphanedDeliverables: [],
      errors: [],
      duration: 0
    }

    try {
      // ===== 1. VÉRIFICATION PRÉALABLE =====
      await this.performPreMigrationChecks(report)
      
      // ===== 2. CRÉATION DES CATÉGORIES =====
      const categoryMap = await this.migrateCategories(report)
      
      // ===== 3. CRÉATION DES SERVICES =====
      const serviceMap = await this.migrateServices(categoryMap, report)
      
      // ===== 4. MIGRATION DES LIVRABLES =====
      await this.migrateDeliverables(serviceMap, report)
      
      // ===== 5. STATISTIQUES FINALES =====
      await this.printFinalStats(report)
      
      report.duration = Date.now() - startTime
      
      console.log('✅ Migration terminée avec succès')
      this.printMigrationReport(report)
      
      return report
      
    } catch (error) {
      report.errors.push(`Erreur critique: ${error.message}`)
      report.duration = Date.now() - startTime
      
      console.error('❌ Échec de la migration:', error)
      throw error
    }
  }

  // ===== VÉRIFICATIONS PRÉALABLES =====
  private async performPreMigrationChecks(report: MigrationReport) {
    console.log('🔍 Vérifications préalables...')
    
    // Vérifier que les nouvelles tables sont vides
    const existingCategories = await db.select().from(unifiedCategories)
    const existingServices = await db.select().from(unifiedServices)
    const existingDeliverables = await db.select().from(unifiedDeliverables)
    
    if (existingCategories.length > 0 || existingServices.length > 0 || existingDeliverables.length > 0) {
      throw new Error('Les tables unifiées ne sont pas vides. Videz-les avant la migration.')
    }

    // Vérifier les données sources
    const oldTemplates = await db.select().from(templates)
    
    console.log(`📊 Données trouvées:`)
    console.log(`   - Templates existants: ${oldTemplates.length}`)
    console.log(`   - Catégories dans categoryData: ${Object.keys(categoryData).length}`)
    
    // Calculer services total dans categoryData
    const totalCategoryServices = Object.values(categoryData)
      .reduce((sum, cat) => sum + cat.services.length, 0)
    
    console.log(`   - Services dans categoryData: ${totalCategoryServices}`)
    
    if (totalCategoryServices !== 107) {
      console.warn(`⚠️ Attention: ${totalCategoryServices} services dans categoryData, attendu 107`)
    }
  }

  // ===== MIGRATION DES CATÉGORIES =====
  private async migrateCategories(report: MigrationReport): Promise<Map<string, number>> {
    console.log('📁 Migration des catégories...')
    
    const categoryInserts: NewUnifiedCategory[] = []
    let ordre = 1
    
    for (const [key, category] of Object.entries(categoryData)) {
      categoryInserts.push({
        nom: category.nom,
        color: category.color,
        description: category.description,
        ordre: ordre++,
        isActive: true
      })
    }
    
    const insertedCategories = await db
      .insert(unifiedCategories)
      .values(categoryInserts)
      .returning()
    
    report.categoriesCreated = insertedCategories.length
    
    // Créer map nom -> id pour les services
    const categoryMap = new Map<string, number>()
    insertedCategories.forEach(cat => {
      categoryMap.set(cat.nom, cat.id)
    })
    
    console.log(`✅ ${insertedCategories.length} catégories créées`)
    return categoryMap
  }

  // ===== MIGRATION DES SERVICES =====
  private async migrateServices(
    categoryMap: Map<string, number>, 
    report: MigrationReport
  ): Promise<Map<string, number>> {
    console.log('🔧 Migration des services...')
    
    const serviceInserts: NewUnifiedService[] = []
    const serviceMap = new Map<string, number>()
    let ordre = 1
    
    for (const [key, category] of Object.entries(categoryData)) {
      const categoryId = categoryMap.get(category.nom)
      if (!categoryId) {
        report.errors.push(`Catégorie non trouvée: ${category.nom}`)
        continue
      }
      
      for (const serviceName of category.services) {
        const serviceData: NewUnifiedService = {
          categoryId,
          nom: serviceName,
          description: this.generateServiceDescription(serviceName, category.nom),
          workflow: this.generateServiceWorkflow(category.nom),
          dureeEstimee: this.estimateServiceDuration(serviceName),
          prerequis: [],
          ordre: ordre++,
          isActive: true
        }
        
        serviceInserts.push(serviceData)
      }
    }
    
    const insertedServices = await db
      .insert(unifiedServices)
      .values(serviceInserts)
      .returning()
    
    report.servicesCreated = insertedServices.length
    
    // Créer map nom -> id pour les livrables
    insertedServices.forEach(service => {
      serviceMap.set(service.nom, service.id)
    })
    
    console.log(`✅ ${insertedServices.length} services créés`)
    
    return serviceMap
  }

  // ===== MIGRATION DES LIVRABLES =====
  private async migrateDeliverables(
    serviceMap: Map<string, number>,
    report: MigrationReport
  ) {
    console.log('📋 Migration des livrables...')
    
    // Récupérer tous les templates existants
    const existingTemplates = await db.select().from(templates)
    console.log(`📊 ${existingTemplates.length} templates à migrer`)
    
    const deliverableInserts: NewUnifiedDeliverable[] = []
    let ordre = 1
    
    for (const template of existingTemplates) {
      // Trouver le service correspondant via sous_categorie
      const serviceId = serviceMap.get(template.sous_categorie || '')
      
      if (serviceId) {
        deliverableInserts.push({
          serviceId,
          nom: template.nom,
          structure: template.structure,
          prompts: template.prompts,
          variables: template.variables,
          metadonnees: template.metadonnees,
          description: template.description,
          ordre: ordre++,
          isActive: template.is_active ?? true
        })
        report.deliverablesLinked++
      } else {
        // Livrable orphelin - service non trouvé
        report.orphanedDeliverables.push(
          `${template.nom} (categorie: ${template.categorie}, sous_categorie: ${template.sous_categorie})`
        )
        console.warn(`⚠️ Service non trouvé pour: ${template.nom} -> ${template.sous_categorie}`)
      }
    }
    
    if (deliverableInserts.length > 0) {
      const insertedDeliverables = await db
        .insert(unifiedDeliverables)
        .values(deliverableInserts)
        .returning()
      
      console.log(`✅ ${insertedDeliverables.length} livrables migrés`)
    }
    
    if (report.orphanedDeliverables.length > 0) {
      console.warn(`⚠️ ${report.orphanedDeliverables.length} livrables orphelins`)
    }
  }

  // ===== STATISTIQUES FINALES =====
  private async printFinalStats(report: MigrationReport) {
    console.log('📊 Statistiques finales...')
    
    const [categoriesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(unifiedCategories)
    
    const [servicesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(unifiedServices)
    
    const [deliverablesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(unifiedDeliverables)
    
    console.log('📈 Résultats:')
    console.log(`   - Catégories: ${categoriesCount.count}`)
    console.log(`   - Services: ${servicesCount.count}`)
    console.log(`   - Livrables: ${deliverablesCount.count}`)
  }

  // ===== FONCTIONS UTILITAIRES =====
  private generateServiceDescription(serviceName: string, categoryName: string): string {
    return `Service ${serviceName} du module ${categoryName}. Description générée automatiquement lors de la migration vers le système unifié.`
  }

  private generateServiceWorkflow(categoryName: string): any {
    const baseWorkflow = {
      etapes: [
        { nom: "Analyse des besoins", duree: "1-2 jours" },
        { nom: "Collecte d'informations", duree: "2-3 jours" },
        { nom: "Élaboration", duree: "3-5 jours" },
        { nom: "Validation", duree: "1 jour" },
        { nom: "Livraison", duree: "1 jour" }
      ],
      outils: ["Documentation technique", "Standards TIA-942"],
      validations: ["Contrôle qualité", "Validation client"]
    }
    
    return baseWorkflow
  }

  private estimateServiceDuration(serviceName: string): string {
    const complexityKeywords = ['étude', 'analyse', 'audit', 'conception', 'design']
    const isComplex = complexityKeywords.some(keyword => 
      serviceName.toLowerCase().includes(keyword)
    )
    
    return isComplex ? "5-10 jours" : "2-5 jours"
  }

  private printMigrationReport(report: MigrationReport) {
    console.log('\n📋 RAPPORT DE MIGRATION:')
    console.log(`✅ Catégories créées: ${report.categoriesCreated}`)
    console.log(`✅ Services créés: ${report.servicesCreated}`)
    console.log(`✅ Livrables liés: ${report.deliverablesLinked}`)
    console.log(`⚠️ Livrables orphelins: ${report.orphanedDeliverables.length}`)
    console.log(`❌ Erreurs: ${report.errors.length}`)
    console.log(`⏱️ Durée: ${Math.round(report.duration / 1000)}s`)
    
    if (report.errors.length > 0) {
      console.log('\n❌ ERREURS DÉTAILLÉES:')
      report.errors.forEach(error => console.log(`   - ${error}`))
    }
    
    if (report.orphanedDeliverables.length > 0) {
      console.log('\n⚠️ LIVRABLES ORPHELINS:')
      report.orphanedDeliverables.slice(0, 10).forEach(deliverable => {
        console.log(`   - ${deliverable}`)
      })
      if (report.orphanedDeliverables.length > 10) {
        console.log(`   ... et ${report.orphanedDeliverables.length - 10} autres`)
      }
    }
  }
}

// ===== EXÉCUTION SI SCRIPT DIRECT =====
// Détection si ce fichier est exécuté directement
const isMainModule = import.meta.url === `file://${process.argv[1]}`

if (isMainModule) {
  const migration = new UnifiedSystemMigration()
  migration.executeFullMigration()
    .then(stats => {
      console.log('✅ Migration terminée avec succès:', stats)
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Échec de la migration:', error)
      process.exit(1)
    })
}

export { UnifiedSystemMigration }