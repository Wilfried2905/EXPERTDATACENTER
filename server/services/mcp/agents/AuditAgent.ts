// server/services/mcp/agents/AuditAgent.ts

import { EnhancedBaseAgent, GenerationContext, FormSection } from './EnhancedBaseAgent';
import { OfficialStandard } from '../KnowledgeBaseService';

export class AuditAgent extends EnhancedBaseAgent {
  
  constructor() {
    super('AUDIT');
  }

  protected getCategorySpecificRequirements(category: string) {
    return {
      objective: "auditer la conformité de l'infrastructure datacenter selon les standards TIA-942 et réglementations en vigueur",
      methodology: `## MÉTHODOLOGIE AUDIT TIA-942
1. **Préparation Audit** - Analyse documentaire et planification
2. **Audit Terrain** - Contrôles physiques et tests conformité
3. **Analyse Écarts** - Identification non-conformités et risques
4. **Rapport Audit** - Documentation détaillée et recommandations
5. **Plan d'Actions** - Prioritisation et échéancier correctifs`,
      deliverables: `## LIVRABLES AUDIT
- Rapport d'audit conformité TIA-942 complet
- Matrice de conformité détaillée par article
- Liste des non-conformités avec criticité
- Plan d'actions correctives priorisé
- Certificat de conformité (si applicable)`
    };
  }

  protected async generateCategorySpecificSections(context: GenerationContext, standards: OfficialStandard[]): Promise<FormSection[]> {
    return [
      // Section périmètre audit
      {
        id: 'audit_scope',
        title: 'Périmètre et Préparation Audit',
        description: 'Définition du périmètre et préparation de l\'audit conformité',
        fields: [
          {
            type: 'checkbox',
            name: 'audit_domains',
            label: 'Domaines à auditer',
            required: true,
            options: [
              'Infrastructure site (Article 4 TIA-942)',
              'Systèmes électriques (Article 5)',
              'Systèmes mécaniques (Article 6)',
              'Télécommunications (Article 7)',
              'Sécurité physique (Article 8)',
              'Détection incendie (Article 9)',
              'Management opérationnel'
            ]
          },
          {
            type: 'select',
            name: 'audit_type',
            label: 'Type d\'audit',
            required: true,
            options: [
              { value: 'initial', label: 'Audit initial de conformité' },
              { value: 'periodic', label: 'Audit périodique de suivi' },
              { value: 'certification', label: 'Audit de certification' },
              { value: 'post_incident', label: 'Audit post-incident' }
            ]
          },
          {
            type: 'date',
            name: 'audit_date',
            label: 'Date prévue de l\'audit',
            required: true
          }
        ]
      },

      // Section référentiels conformité
      {
        id: 'compliance_standards',
        title: 'Référentiels de Conformité',
        description: 'Standards et normes à vérifier lors de l\'audit',
        fields: [
          {
            type: 'checkbox',
            name: 'mandatory_standards',
            label: 'Standards obligatoires',
            options: [
              'TIA-942-A (Infrastructure)',
              'TIA-942-B (Sustainability)',
              'ISO-27001 (Sécurité information)',
              'NFPA-75 (Protection incendie)',
              'IEC-62305 (Protection foudre)'
            ]
          },
          {
            type: 'textarea',
            name: 'specific_requirements',
            label: 'Exigences réglementaires spécifiques',
            help: 'Réglementations sectorielles ou locales à vérifier'
          },
          {
            type: 'select',
            name: 'certification_target',
            label: 'Certification visée',
            options: [
              { value: 'none', label: 'Aucune certification' },
              { value: 'tier1', label: 'Certification Tier I' },
              { value: 'tier2', label: 'Certification Tier II' },
              { value: 'tier3', label: 'Certification Tier III' },
              { value: 'tier4', label: 'Certification Tier IV' }
            ]
          }
        ]
      },

      // Section tests et mesures
      {
        id: 'tests_measurements',
        title: 'Tests et Mesures d\'Audit',
        description: 'Tests techniques et mesures à réaliser',
        fields: [
          {
            type: 'checkbox',
            name: 'required_tests',
            label: 'Tests techniques requis',
            options: [
              'Tests électriques et continuité',
              'Mesures PUE et efficacité',
              'Tests systèmes secours (UPS, générateurs)',
              'Vérification redondances',
              'Tests détection incendie',
              'Contrôle systèmes refroidissement',
              'Audit câblage structuré'
            ]
          },
          {
            type: 'number',
            name: 'audit_duration',
            label: 'Durée estimée audit (jours)',
            validation: { min: 1, max: 30 }
          }
        ]
      }
    ];
  }

  protected async generateLivrableSpecificClientSections(context: GenerationContext): Promise<FormSection[]> {
    return [
      {
        id: 'audit_objectives',
        title: 'Objectifs et Attentes Audit',
        fields: [
          {
            type: 'textarea',
            name: 'audit_goals',
            label: 'Objectifs spécifiques de l\'audit',
            required: true,
            help: 'Que souhaitez-vous obtenir de cet audit de conformité ?'
          },
          {
            type: 'select',
            name: 'urgency_reason',
            label: 'Raison de l\'audit',
            required: true,
            options: [
              { value: 'periodic', label: 'Audit périodique planifié' },
              { value: 'certification', label: 'Préparation certification' },
              { value: 'compliance', label: 'Vérification conformité réglementaire' },
              { value: 'incident', label: 'Suite à incident/dysfonctionnement' },
              { value: 'acquisition', label: 'Due diligence acquisition' }
            ]
          },
          {
            type: 'checkbox',
            name: 'deliverables_expected',
            label: 'Livrables attendus',
            options: [
              'Rapport d\'audit détaillé',
              'Matrice de conformité',
              'Plan d\'actions correctives',
              'Présentation direction',
              'Certificat de conformité',
              'Recommandations d\'amélioration'
            ]
          }
        ]
      },

      {
        id: 'audit_constraints',
        title: 'Contraintes et Organisation',
        fields: [
          {
            type: 'textarea',
            name: 'operational_constraints',
            label: 'Contraintes opérationnelles',
            help: 'Contraintes d\'accès, horaires, arrêts systèmes autorisés'
          },
          {
            type: 'text',
            name: 'audit_contact',
            label: 'Contact référent pour l\'audit',
            help: 'Personne responsable coordination audit'
          },
          {
            type: 'select',
            name: 'report_format',
            label: 'Format de rapport souhaité',
            options: [
              { value: 'standard', label: 'Rapport standard TIA-942' },
              { value: 'executive', label: 'Résumé exécutif + rapport détaillé' },
              { value: 'technical', label: 'Focus technique approfondi' },
              { value: 'regulatory', label: 'Focus conformité réglementaire' }
            ]
          }
        ]
      }
    ];
  }

  protected getCategoryExpertise(category: string): string[] {
    return [
      '- Audit conformité TIA-942 et standards datacenter',
      '- Méthodologies d\'audit technique et réglementaire',
      '- Certification infrastructure et processus',
      '- Analyse risques et non-conformités',
      '- Plans d\'actions correctives et préventives',
      '- Tests et mesures techniques datacenter',
      '- Réglementations sectorielles et locales',
      '- Documentation audit et traçabilité'
    ];
  }

  protected getCategorySpecificAnalysis(category: string): string {
    return `
### Audit Conformité Infrastructure
- Vérification conformité TIA-942 par article
- Contrôle respect standards connexes
- Analyse écarts et non-conformités

### Tests et Vérifications Techniques
- Tests systèmes critiques et redondances
- Mesures performance et efficacité
- Validation procédures et documentation

### Évaluation Risques et Criticité
- Classification non-conformités par criticité
- Analyse impact sur continuité service
- Évaluation risques réglementaires et techniques

### Plan d'Actions Correctives
- Priorisation actions selon criticité
- Échéancier réaliste de mise en conformité
- Recommandations d'amélioration continue`;
  }
}