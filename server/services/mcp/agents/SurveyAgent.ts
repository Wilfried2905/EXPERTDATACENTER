// server/services/mcp/agents/SurveyAgent.ts

import { EnhancedBaseAgent, GenerationContext, FormSection } from './EnhancedBaseAgent';
import { OfficialStandard } from '../KnowledgeBaseService';

export class SurveyAgent extends EnhancedBaseAgent {
  
  constructor() {
    super('SURVEY');
  }

  protected getCategorySpecificRequirements(category: string) {
    return {
      objective: "évaluer l'infrastructure existante et identifier les opportunités d'amélioration selon les standards TIA-942",
      methodology: `## MÉTHODOLOGIE SURVEY TIA-942
1. **Audit Infrastructure Physique** - Évaluation complète des installations
2. **Analyse Conformité Standards** - Vérification TIA-942-A/B/C
3. **Évaluation Performance** - Mesures et analyses techniques
4. **Identification Gaps** - Écarts et non-conformités
5. **Recommandations Priorisées** - Plan d'action structuré`,
      deliverables: `## LIVRABLES SURVEY
- Rapport d'évaluation infrastructure complète
- Matrice de conformité TIA-942 détaillée  
- Analyse des performances actuelles
- Plan de mise à niveau priorisé
- Estimation budgétaire préliminaire`
    };
  }

  protected async generateCategorySpecificSections(context: GenerationContext, standards: OfficialStandard[]): Promise<FormSection[]> {
    return [
      // Section évaluation capacité
      {
        id: 'capacity_evaluation',
        title: 'Évaluation Capacité Infrastructure',
        description: 'Analyse des capacités actuelles et besoins futurs',
        fields: [
          {
            type: 'number',
            name: 'current_rack_count',
            label: 'Nombre de racks actuels',
            required: true,
            validation: { min: 1 }
          },
          {
            type: 'number',
            name: 'max_rack_capacity',
            label: 'Capacité maximale racks possible',
            required: true
          },
          {
            type: 'number',
            name: 'current_power_consumption',
            label: 'Consommation électrique actuelle (kW)',
            required: true
          },
          {
            type: 'select',
            name: 'tier_current',
            label: 'Tier actuel estimé',
            required: true,
            options: [
              { value: 'tier1', label: 'Tier I - 99.671% uptime' },
              { value: 'tier2', label: 'Tier II - 99.741% uptime' },
              { value: 'tier3', label: 'Tier III - 99.982% uptime' },
              { value: 'tier4', label: 'Tier IV - 99.995% uptime' }
            ]
          }
        ]
      },
      
      // Section analyse performance
      {
        id: 'performance_analysis',
        title: 'Analyse Performance Actuelle',
        description: 'Mesures et indicateurs de performance existants',
        fields: [
          {
            type: 'number',
            name: 'pue_current',
            label: 'PUE (Power Usage Effectiveness) actuel',
            help: 'Ratio efficacité énergétique (idéal: 1.0 - 2.0)',
            validation: { min: 1.0, max: 5.0 }
          },
          {
            type: 'number',
            name: 'average_temperature',
            label: 'Température moyenne datacenter (°C)',
            required: true,
            validation: { min: 15, max: 35 }
          },
          {
            type: 'number',
            name: 'humidity_level',
            label: 'Taux d\'humidité moyen (%)',
            required: true,
            validation: { min: 20, max: 80 }
          },
          {
            type: 'select',
            name: 'cooling_efficiency',
            label: 'Efficacité système refroidissement',
            options: [
              { value: 'excellent', label: 'Excellente (< 20°C écart)' },
              { value: 'good', label: 'Bonne (20-25°C écart)' },
              { value: 'average', label: 'Moyenne (25-30°C écart)' },
              { value: 'poor', label: 'Médiocre (> 30°C écart)' }
            ]
          }
        ]
      },

      // Section conformité standards
      {
        id: 'standards_compliance',
        title: 'Conformité Standards TIA-942',
        description: 'Vérification conformité aux exigences TIA-942',
        fields: [
          {
            type: 'checkbox',
            name: 'tia942_compliance',
            label: 'Éléments TIA-942 en place',
            options: [
              'Infrastructure site conforme',
              'Système électrique redondant', 
              'Refroidissement adapté',
              'Câblage structuré certifié',
              'Sécurité physique appropriée',
              'Monitoring temps réel',
              'Procédures maintenance'
            ]
          },
          {
            type: 'textarea',
            name: 'non_compliance_details',
            label: 'Détails non-conformités identifiées',
            help: 'Décrivez les écarts constatés avec TIA-942'
          },
          {
            type: 'select',
            name: 'upgrade_priority',
            label: 'Priorité mise à niveau',
            required: true,
            options: [
              { value: 'critical', label: 'Critique - Immédiat' },
              { value: 'high', label: 'Haute - 3 mois' },
              { value: 'medium', label: 'Moyenne - 6 mois' },
              { value: 'low', label: 'Basse - 12 mois' }
            ]
          }
        ]
      }
    ];
  }

  protected async generateLivrableSpecificClientSections(context: GenerationContext): Promise<FormSection[]> {
    return [
      // Section objectifs survey
      {
        id: 'survey_objectives',
        title: 'Objectifs de l\'Évaluation',
        fields: [
          {
            type: 'textarea',
            name: 'evaluation_goals',
            label: 'Objectifs spécifiques de cette évaluation',
            required: true,
            help: 'Que souhaitez-vous obtenir de cette évaluation infrastructure ?'
          },
          {
            type: 'select',
            name: 'evaluation_scope',
            label: 'Périmètre d\'évaluation',
            required: true,
            options: [
              { value: 'complete', label: 'Évaluation complète infrastructure' },
              { value: 'electrical', label: 'Focus systèmes électriques' },
              { value: 'cooling', label: 'Focus refroidissement' },
              { value: 'network', label: 'Focus télécommunications' },
              { value: 'security', label: 'Focus sécurité physique' }
            ]
          },
          {
            type: 'checkbox',
            name: 'expected_outcomes',
            label: 'Résultats attendus',
            options: [
              'Plan de mise à niveau infrastructure',
              'Estimation budgétaire travaux',
              'Roadmap conformité TIA-942',
              'Analyse retour sur investissement',
              'Recommandations optimisation',
              'Certification tier datacenter'
            ]
          }
        ]
      },

      // Section contraintes spécifiques
      {
        id: 'survey_constraints',
        title: 'Contraintes et Considérations',
        fields: [
          {
            type: 'textarea',
            name: 'operational_constraints',
            label: 'Contraintes opérationnelles',
            help: 'Limitations d\'accès, horaires, services critiques à préserver'
          },
          {
            type: 'number',
            name: 'budget_estimation',
            label: 'Budget approximatif envisagé (€)',
            help: 'Pour dimensionner les recommandations'
          },
          {
            type: 'select',
            name: 'timeline_urgency',
            label: 'Urgence du projet',
            options: [
              { value: 'immediate', label: 'Immédiate - Problèmes critiques' },
              { value: 'short', label: 'Court terme - 3-6 mois' },
              { value: 'medium', label: 'Moyen terme - 6-12 mois' },
              { value: 'long', label: 'Long terme - Planification future' }
            ]
          }
        ]
      }
    ];
  }

  protected getCategoryExpertise(category: string): string[] {
    return [
      '- Infrastructure datacenter et standards TIA-942',
      '- Évaluation conformité et audit technique',
      '- Analyse performance énergétique (PUE, DCiE)',
      '- Systèmes électriques et alimentation critique',
      '- Refroidissement et climatisation datacenter',
      '- Sécurité physique et contrôle d\'accès',
      '- Télécommunications et câblage structuré',
      '- Méthodologies d\'audit et conformité'
    ];
  }

  protected getCategorySpecificAnalysis(category: string): string {
    return `
### Analyse Infrastructure Physique
- Évaluation conformité TIA-942 par section
- Audit capacités actuelles vs besoins futurs
- Analyse gaps de performance et conformité

### Évaluation Systèmes Critiques
- Systèmes électriques et redondance
- Performance refroidissement et PUE
- Infrastructure télécommunications

### Matrice de Conformité
- Conformité par article TIA-942-A/B/C
- Identification écarts critiques
- Priorisation actions correctives

### Recommandations Techniques
- Plan de mise à niveau priorisé
- Estimation budgétaire par phase
- Roadmap conformité sur 12-24 mois`;
  }
}