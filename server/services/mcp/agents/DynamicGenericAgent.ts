// server/services/mcp/agents/DynamicGenericAgent.ts

import { EnhancedBaseAgent, GenerationContext, FormSection } from './EnhancedBaseAgent';
import { OfficialStandard } from '../KnowledgeBaseService';

interface CategoryConfig {
  objective: string;
  methodology: string;
  deliverables: string;
  expertise: string[];
  specificSections: any[];
  mandatoryElements: string;
}

export class DynamicGenericAgent extends EnhancedBaseAgent {
  private categoryConfig: CategoryConfig;

  constructor(category: string, config?: CategoryConfig) {
    super(category);
    this.categoryConfig = config || this.generateDefaultConfig(category);
  }

  // Configuration automatique basée sur le nom de catégorie
  private generateDefaultConfig(category: string): CategoryConfig {
    const categoryLower = category.toLowerCase();
    
    return {
      objective: `réaliser les tâches spécialisées de ${category} selon les standards datacenter`,
      methodology: this.inferMethodology(categoryLower),
      deliverables: this.inferDeliverables(categoryLower),
      expertise: this.inferExpertise(categoryLower),
      specificSections: this.inferSpecificSections(categoryLower),
      mandatoryElements: this.inferMandatoryElements(categoryLower)
    };
  }

  private inferMethodology(category: string): string {
    const methodologyMap: Record<string, string> = {
      'survey': '1. Évaluation initiale\n2. Analyse technique\n3. Recommandations',
      'audit': '1. Préparation audit\n2. Contrôles terrain\n3. Rapport conformité',
      'conseil': '1. Analyse besoins\n2. Conception solution\n3. Plan d\'action',
      'maintenance': '1. Planning préventif\n2. Interventions\n3. Suivi performance',
      'monitoring': '1. Mise en place supervision\n2. Alerting\n3. Reporting',
      'support': '1. Analyse demande\n2. Assistance technique\n3. Documentation',
      'amoa': '1. Cahier des charges\n2. Pilotage projet\n3. Validation livrables',
      'aménagement': '1. Conception infrastructure\n2. Réalisation travaux\n3. Mise en service',
      'nettoyage': '1. Protocoles nettoyage\n2. Interventions\n3. Contrôle qualité',
      'commissioning': '1. Tests préparatoires\n2. Mise en service\n3. Validation finale'
    };

    // Recherche par mots-clés
    for (const [key, methodology] of Object.entries(methodologyMap)) {
      if (category.includes(key)) {
        return `## MÉTHODOLOGIE ${category.toUpperCase()}\n${methodology}`;
      }
    }

    // Méthodologie générique
    return `## MÉTHODOLOGIE ${category.toUpperCase()}
1. **Analyse préliminaire** - Étude du contexte et des exigences
2. **Mise en œuvre** - Application des standards TIA-942
3. **Validation** - Contrôle qualité et conformité
4. **Livraison** - Remise des livrables et recommandations`;
  }

  private inferDeliverables(category: string): string {
    const deliverablesMap: Record<string, string> = {
      'survey': '- Rapport d\'évaluation infrastructure\n- Matrice conformité TIA-942\n- Plan de mise à niveau',
      'audit': '- Rapport d\'audit conformité\n- Plan d\'actions correctives\n- Certificat de conformité',
      'conseil': '- Étude stratégique\n- Recommandations techniques\n- Roadmap projet',
      'maintenance': '- Plan maintenance préventive\n- Procédures interventions\n- Tableau de bord KPI',
      'monitoring': '- Système supervision\n- Alertes configurées\n- Rapports performance',
      'support': '- Documentation technique\n- Procédures support\n- Base de connaissances',
      'amoa': '- Cahier des charges\n- Planning projet\n- Rapports de pilotage',
      'aménagement': '- Plans d\'exécution\n- Suivi travaux\n- Procès-verbal réception',
      'nettoyage': '- Protocoles nettoyage\n- Planning interventions\n- Rapports qualité',
      'commissioning': '- Procédures tests\n- Rapports validation\n- Documentation mise en service'
    };

    const categoryLower = category.toLowerCase();
    for (const [key, deliverables] of Object.entries(deliverablesMap)) {
      if (categoryLower.includes(key)) {
        return `## LIVRABLES ${category.toUpperCase()}\n${deliverables}`;
      }
    }

    return `## LIVRABLES ${category.toUpperCase()}
- Documentation technique spécialisée
- Rapports d'analyse et recommandations
- Plans d'action personnalisés
- Validation conformité standards`;
  }

  private inferExpertise(category: string): string[] {
    const expertiseKeywords = {
      'electrical': ['Systèmes électriques', 'UPS', 'Générateurs', 'Distribution électrique'],
      'mechanical': ['Refroidissement', 'CVC', 'Systèmes mécaniques'],
      'network': ['Réseaux', 'Télécommunications', 'Câblage structuré'],
      'security': ['Sécurité physique', 'Contrôle d\'accès', 'Surveillance'],
      'compliance': ['Conformité', 'Audit', 'Certification', 'Standards'],
      'construction': ['Construction', 'Infrastructure', 'Aménagement'],
      'maintenance': ['Maintenance', 'GMAO', 'Préventif', 'Correctif'],
      'monitoring': ['Supervision', 'Monitoring', 'Métrologie', 'Alerting'],
      'survey': ['Évaluation infrastructure', 'Audit technique', 'Analyse conformité'],
      'conseil': ['Stratégie datacenter', 'Optimisation', 'Planification'],
      'support': ['Assistance technique', 'Documentation', 'Formation'],
      'amoa': ['Maîtrise d\'ouvrage', 'Pilotage projet', 'Validation livrables'],
      'nettoyage': ['Propreté datacenter', 'Protocoles hygiène', 'Maintenance propreté'],
      'commissioning': ['Tests mise en service', 'Validation systèmes', 'Réception travaux']
    };

    const categoryLower = category.toLowerCase();
    const expertise: string[] = [];

    // Expertise spécifique basée sur mots-clés
    for (const [key, skills] of Object.entries(expertiseKeywords)) {
      if (categoryLower.includes(key)) {
        expertise.push(...skills.map(s => `- ${s} spécialisé ${category}`));
        break; // Prendre la première correspondance
      }
    }

    // Expertise générique si aucune spécifique trouvée
    if (expertise.length === 0) {
      expertise.push(
        `- Expertise ${category} selon TIA-942`,
        `- Standards et normes du secteur ${category}`,
        `- Bonnes pratiques ${category} datacenter`,
        `- Analyse et recommandations ${category}`
      );
    }

    return expertise;
  }

  private inferSpecificSections(category: string): any[] {
    // Retourne des sections spécifiques par défaut
    return [];
  }

  private inferMandatoryElements(category: string): string {
    return `Éléments obligatoires pour ${category} selon TIA-942 et standards connexes`;
  }

  // Implémentation des méthodes abstraites avec logique dynamique
  protected getCategorySpecificRequirements(category: string) {
    return {
      objective: this.categoryConfig.objective,
      methodology: this.categoryConfig.methodology,
      deliverables: this.categoryConfig.deliverables
    };
  }

  protected async generateCategorySpecificSections(
    context: GenerationContext, 
    standards: OfficialStandard[]
  ): Promise<FormSection[]> {
    const sections: FormSection[] = [];

    // Section générique adaptative
    sections.push({
      id: `${context.category.toLowerCase()}_specific`,
      title: `Spécificités ${context.category}`,
      description: `Éléments spécifiques aux services ${context.category}`,
      fields: [
        {
          type: 'textarea',
          name: `${context.category.toLowerCase()}_requirements`,
          label: `Exigences spécifiques ${context.category}`,
          required: true,
          help: `Décrivez les exigences particulières pour ${context.deliverableName}`
        },
        {
          type: 'select',
          name: `${context.category.toLowerCase()}_complexity`,
          label: 'Niveau de complexité',
          required: true,
          options: [
            { value: 'simple', label: 'Simple' },
            { value: 'standard', label: 'Standard' },
            { value: 'complex', label: 'Complexe' },
            { value: 'expert', label: 'Expert' }
          ]
        },
        {
          type: 'number',
          name: `${context.category.toLowerCase()}_duration`,
          label: 'Durée estimée (jours)',
          help: 'Estimation durée pour ce livrable'
        }
      ]
    });

    // Section standards connexes dynamique
    const relevantStandards = standards.filter(s => 
      s.standardFamily !== 'TIA' && 
      (s.content.toLowerCase().includes(context.category.toLowerCase()) ||
       s.standardCode.toLowerCase().includes(context.category.toLowerCase()))
    );

    if (relevantStandards.length > 0) {
      sections.push({
        id: `${context.category.toLowerCase()}_standards`,
        title: `Standards ${context.category}`,
        description: 'Standards et normes applicables pour cette catégorie',
        fields: [
          {
            type: 'checkbox',
            name: `required_${context.category.toLowerCase()}_standards`,
            label: 'Standards applicables',
            options: relevantStandards.map(s => ({ value: s.standardCode, label: s.standardCode }))
          }
        ]
      });
    }

    return sections;
  }

  protected async generateLivrableSpecificClientSections(
    context: GenerationContext
  ): Promise<FormSection[]> {
    return [
      {
        id: `${context.category.toLowerCase()}_client_needs`,
        title: `Besoins Client - ${context.category}`,
        description: `Questions spécifiques aux besoins client pour ${context.category}`,
        fields: [
          {
            type: 'textarea',
            name: 'business_context',
            label: 'Contexte métier',
            required: true,
            help: `Expliquez le contexte métier pour ${context.deliverableName}`
          },
          {
            type: 'textarea',
            name: 'specific_challenges',
            label: `Défis spécifiques ${context.category}`,
            help: `Quels sont les défis particuliers à relever dans le domaine ${context.category} ?`
          },
          {
            type: 'select',
            name: 'urgency_level',
            label: 'Niveau d\'urgence',
            required: true,
            options: [
              { value: 'low', label: 'Faible - Planification long terme' },
              { value: 'medium', label: 'Moyen - 3-6 mois' },
              { value: 'high', label: 'Élevé - 1-3 mois' },
              { value: 'critical', label: 'Critique - Immédiat' }
            ]
          },
          {
            type: 'number',
            name: 'budget_range',
            label: 'Budget approximatif (€)',
            help: 'Budget alloué pour adapter les recommandations'
          }
        ]
      }
    ];
  }

  protected getCategoryExpertise(category: string): string[] {
    return this.categoryConfig.expertise;
  }

  protected getCategorySpecificAnalysis(category: string): string {
    return `
### Analyse ${category.toUpperCase()} Spécialisée
- **Évaluation ${category}** : Analyse spécialisée selon standards applicables
- **Conformité** : Vérification conformité réglementaire ${category}
- **Performance** : Analyse performance et optimisation
- **Risques** : Identification et mitigation des risques spécifiques
- **Recommandations** : Plan d'action personnalisé ${category}

### Méthodologie Appliquée
${this.categoryConfig.methodology}

### Standards et Références
- TIA-942 (articles applicables à ${category})
- Standards connexes spécifiques ${category}
- Bonnes pratiques sectorielles`;
  }
}