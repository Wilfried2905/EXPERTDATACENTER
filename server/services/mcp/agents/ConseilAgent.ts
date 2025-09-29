// server/services/mcp/agents/ConseilAgent.ts

import { EnhancedBaseAgent, GenerationContext, FormSection } from './EnhancedBaseAgent';
import { OfficialStandard } from '../KnowledgeBaseService';

export class ConseilAgent extends EnhancedBaseAgent {
  
  constructor() {
    super('CONSEIL');
  }

  protected getCategorySpecificRequirements(category: string) {
    return {
      objective: "fournir un conseil stratégique expert pour l'optimisation et l'évolution de l'infrastructure datacenter",
      methodology: `## MÉTHODOLOGIE CONSEIL STRATÉGIQUE
1. **Analyse Stratégique** - Évaluation besoins business et contraintes
2. **Benchmark Technique** - Étude des meilleures pratiques sectorielles
3. **Conception Solution** - Architecture optimale et roadmap évolution
4. **Analyse ROI** - Évaluation retour sur investissement et bénéfices
5. **Plan d'Implémentation** - Stratégie déploiement et gestion changement`,
      deliverables: `## LIVRABLES CONSEIL
- Étude stratégique infrastructure datacenter
- Recommandations d'architecture optimisée
- Roadmap d'évolution et modernisation
- Analyse coûts-bénéfices détaillée
- Plan d'implémentation avec jalons`
    };
  }

  protected async generateCategorySpecificSections(context: GenerationContext, standards: OfficialStandard[]): Promise<FormSection[]> {
    return [
      {
        id: 'strategic_analysis',
        title: 'Analyse Stratégique Infrastructure',
        description: 'Évaluation stratégique des besoins et enjeux business',
        fields: [
          {
            type: 'select',
            name: 'business_growth',
            label: 'Croissance business prévue (3 ans)',
            required: true,
            options: [
              { value: 'stable', label: 'Stable (0-10%)' },
              { value: 'moderate', label: 'Modérée (10-30%)' },
              { value: 'high', label: 'Forte (30-100%)' },
              { value: 'exponential', label: 'Exponentielle (>100%)' }
            ]
          },
          {
            type: 'checkbox',
            name: 'strategic_objectives',
            label: 'Objectifs stratégiques prioritaires',
            options: [
              'Réduction coûts opérationnels',
              'Amélioration efficacité énergétique',
              'Augmentation capacité/scalabilité',
              'Modernisation technologique',
              'Conformité réglementaire renforcée',
              'Amélioration disponibilité/résilience'
            ]
          },
          {
            type: 'number',
            name: 'investment_budget',
            label: 'Budget d\'investissement disponible (€)',
            help: 'Budget global pour modernisation infrastructure'
          }
        ]
      },

      {
        id: 'technical_optimization',
        title: 'Optimisation Technique',
        description: 'Axes d\'optimisation et modernisation technique',
        fields: [
          {
            type: 'checkbox',
            name: 'optimization_areas',
            label: 'Domaines d\'optimisation prioritaires',
            options: [
              'Efficacité énergétique (PUE)',
              'Densité de puissance racks',
              'Systèmes de refroidissement',
              'Infrastructure réseau',
              'Automatisation et monitoring',
              'Sécurité physique et cyber'
            ]
          },
          {
            type: 'select',
            name: 'technology_adoption',
            label: 'Approche nouvelles technologies',
            options: [
              { value: 'conservative', label: 'Conservatrice - Technologies éprouvées' },
              { value: 'balanced', label: 'Équilibrée - Mix innovation/stabilité' },
              { value: 'innovative', label: 'Innovante - Technologies émergentes' }
            ]
          },
          {
            type: 'textarea',
            name: 'specific_challenges',
            label: 'Défis techniques spécifiques',
            help: 'Problématiques techniques particulières à résoudre'
          }
        ]
      },

      {
        id: 'sustainability_strategy',
        title: 'Stratégie Durabilité et ESG',
        description: 'Intégration des enjeux environnementaux et sociétaux',
        fields: [
          {
            type: 'checkbox',
            name: 'sustainability_goals',
            label: 'Objectifs durabilité',
            options: [
              'Neutralité carbone',
              'Énergies renouvelables',
              'Économie circulaire',
              'Réduction consommation eau',
              'Certification environnementale',
              'Reporting ESG'
            ]
          },
          {
            type: 'select',
            name: 'green_priority',
            label: 'Priorité enjeux environnementaux',
            options: [
              { value: 'low', label: 'Faible - Conformité minimale' },
              { value: 'medium', label: 'Moyenne - Bonnes pratiques' },
              { value: 'high', label: 'Élevée - Leader secteur' }
            ]
          }
        ]
      }
    ];
  }

  protected async generateLivrableSpecificClientSections(context: GenerationContext): Promise<FormSection[]> {
    return [
      {
        id: 'strategic_context',
        title: 'Contexte Stratégique Entreprise',
        fields: [
          {
            type: 'textarea',
            name: 'business_strategy',
            label: 'Stratégie business et enjeux métier',
            required: true,
            help: 'Décrivez la stratégie d\'entreprise et les enjeux business'
          },
          {
            type: 'select',
            name: 'market_position',
            label: 'Position concurrentielle',
            options: [
              { value: 'leader', label: 'Leader de marché' },
              { value: 'challenger', label: 'Challenger' },
              { value: 'follower', label: 'Suiveur' },
              { value: 'niche', label: 'Spécialiste niche' }
            ]
          },
          {
            type: 'textarea',
            name: 'competitive_advantages',
            label: 'Avantages concurrentiels recherchés',
            help: 'Quels avantages l\'infrastructure doit-elle apporter ?'
          }
        ]
      },

      {
        id: 'decision_criteria',
        title: 'Critères de Décision et Contraintes',
        fields: [
          {
            type: 'select',
            name: 'roi_timeline',
            label: 'Horizon retour sur investissement',
            required: true,
            options: [
              { value: '1year', label: '1 an - ROI rapide' },
              { value: '2-3years', label: '2-3 ans - ROI standard' },
              { value: '3-5years', label: '3-5 ans - Investissement long terme' },
              { value: '5+years', label: '+5 ans - Vision stratégique' }
            ]
          },
          {
            type: 'checkbox',
            name: 'decision_factors',
            label: 'Facteurs de décision prioritaires',
            options: [
              'Retour sur investissement',
              'Réduction risques opérationnels',
              'Conformité réglementaire',
              'Avantage concurrentiel',
              'Image de marque/ESG',
              'Facilité d\'implémentation'
            ]
          },
          {
            type: 'textarea',
            name: 'regulatory_constraints',
            label: 'Contraintes réglementaires spécifiques',
            help: 'Réglementations sectorielles ou géographiques'
          }
        ]
      }
    ];
  }

  protected getCategoryExpertise(category: string): string[] {
    return [
      '- Stratégie infrastructure et transformation digitale',
      '- Optimisation performance et efficacité datacenter',
      '- Analyse coûts-bénéfices et ROI infrastructure',
      '- Benchmarking sectoriel et meilleures pratiques',
      '- Roadmaps technologiques et modernisation',
      '- Durabilité et stratégies ESG datacenter',
      '- Gestion changement et conduite projet',
      '- Standards TIA-942 et innovation technologique'
    ];
  }

  protected getCategorySpecificAnalysis(category: string): string {
    return `
### Analyse Stratégique Infrastructure
- Alignement infrastructure avec stratégie business
- Évaluation positionnement concurrentiel
- Identification opportunités d'amélioration

### Optimisation Technique et Économique
- Analyse performance actuelle vs potentiel
- Recommandations d'optimisation énergétique
- Stratégies de modernisation progressive

### Roadmap d'Évolution
- Plan de transformation infrastructure
- Priorisation investissements selon ROI
- Gestion des risques et mitigation

### Durabilité et Innovation
- Intégration enjeux environnementaux
- Technologies émergentes et opportunités
- Stratégie différenciation concurrentielle`;
  }
}