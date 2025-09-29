import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Table, 
  Map, 
  Camera, 
  FileBarChart, 
  Settings, 
  Eye, 
  Shield,
  Target,
  Layers,
  Zap,
  Thermometer,
  Wifi,
  Route,
  Clock
} from 'lucide-react';

interface Deliverable {
  id: number;
  title: string;
  type: string;
  description: string;
  code: string;
  icon: any;
  color: string;
}

interface DeliverablesListProps {
  onBack: () => void;
  onSelectDeliverable: (deliverable: Deliverable) => void;
  serviceType?: string;
}

export default function DeliverablesList({ onBack, onSelectDeliverable, serviceType = "infrastructure" }: DeliverablesListProps) {
  
  // Déterminer la sous-catégorie selon le serviceType
  const getSubCategory = (type: string) => {
    switch (type) {
      case "localisation": return "Études de localisation";
      case "faisabilite": return "Étude de Faisabilité";
      case "resilience": return "Étude de Résilience";
      case "energetique": return "Optimisation Énergétique";
      case "specialisees": return "Évaluations Spécialisées";
      case "comparatives": return "Études Comparatives";
      case "audit-capacite": return "Audit de Capacité";
      case "evaluation-environnementale": return "Évaluation Environnementale";
      case "evaluations-edge": return "Évaluations Edge & µEDC";
      case "evaluations-ai-ml": return "Évaluations Haute Densité (AI/ML Computing)";
      case "evaluations-immersion": return "Évaluations de Refroidissement par Immersion";
      case "conformite-certification": return "Conformité et certification";
      case "audit-documentaire": return "Audit documentaire";
      case "evaluations-periodiques": return "Évaluations périodiques";
      case "securite-physique": return "Sécurité physique";
      case "preparation-certification": return "Préparation certification";
      case "analyse-ecarts": return "Analyse des écarts";
      case "audit-conformite-tia-942": return "Audit de conformité TIA-942";
      case "audit-redondance": return "Audit de redondance";
      case "evaluation-performances": return "Évaluation des performances";
      case "audit-durabilite-energetique": return "Audit de durabilité énergétique";
      case "audit-systemes-modulaires": return "Audit de systèmes modulaires";
      case "audit-technologies-emergentes": return "Audit de technologies émergentes";
      case "strategie-planification": return "Stratégie et planification";
      case "transformation-infrastructure": return "Transformation infrastructure";
      case "formation-tia-942": return "Formation TIA-942";
      case "optimisation-operationnelle": return "Optimisation opérationnelle";
      case "gestion-des-risques": return "Gestion des risques";
      case "optimisation-energetique": return "Optimisation énergétique";
      case "planification-de-la-croissance": return "Planification de la croissance";
      case "conseil-en-refroidissement-liquide": return "Conseil en refroidissement liquide";
      case "strategie-infrastructure-edge": return "Stratégie infrastructure Edge";
      case "transition-energetique": return "Transition Énergétique";
      case "production-documentaire": return "Production documentaire";
      case "transfert-competences": return "Transfert de compétences";
      case "suivi-recommandations": return "Suivi des recommandations";
      case "gestion-documentation": return "Gestion de la documentation";
      case "accompagnement-projet": return "Accompagnement Projet";
      case "support-operationnel": return "Support Opérationnel";
      case "assistance-technique": return "Assistance Technique";
      case "formation-technologies-emergentes": return "Formation Technologies Émergentes";
      case "accompagnement-transition-edge": return "Accompagnement transition Edge";
      case "assistance-developpement-durable": return "Assistance Développement Durable";
      case "architecture-technique-infrastructure": return "Architecture Technique Infrastructure";
      case "conception-technique": return "Conception technique";
      case "conception-generale": return "Conception générale";
      case "pilotage-planification": return "Pilotage et planification";
      case "etude-preliminaire": return "Étude préliminaire";
      case "analyse-besoins": return "Analyse des besoins";
      case "specifications-techniques": return "Spécifications techniques détaillées";
      case "validation-livrables": return "Validation des livrables";
      case "specifications-edge-computing": return "Spécifications Edge Computing";
      case "analyse-besoins-haute-densite": return "Analyse besoins haute densité";
      case "cahier-des-charges-durabilite": return "Cahier des charges durabilité";
      case "conception-haute-densite": return "Conception haute densité";
      case "edge-computing": return "Edge computing";
      case "conception-durable-ecologique": return "Conception durable et écologique";
      case "urbanisation-des-salles": return "Urbanisation des salles";
      case "distribution-electrique": return "Distribution électrique";
      case "infrastructure-reseau": return "Infrastructure réseau";
      case "amenagement-optimisation-energetique": return "Optimisation énergétique";
      case "documentation-operationnelle": return "Documentation opérationnelle";
      case "systemes-de-refroidissement-cvc": return "Systèmes de refroidissement (CVC)";
      case "systemes-de-securite": return "Systèmes de sécurité";
      case "systemes-de-detection-incendie": return "Systèmes de détection incendie";
      case "cablage-structure": return "Câblage structuré";
      case "refroidissement-direct-sur-puce-d2c": return "Refroidissement direct-sur-puce (D2C)";
      case "systemes-de-refroidissement-par-immersion": return "Systèmes de refroidissement par immersion";
      case "architecture-wall-flow": return "Architecture Wall Flow";
      case "micro-reseaux-electriques": return "Micro-réseaux électriques";
      // Services NETTOYAGE
      case "planification-des-interventions": return "Planification des interventions";
      case "methodologie-et-protocoles": return "Méthodologie et protocoles";
      case "assurance-qualite": return "Assurance qualité";
      case "documentation-et-rapports": return "Documentation et rapports";
      case "gestion-des-prestataires": return "Gestion des prestataires";
      case "nettoyage-systemes-immersion": return "Nettoyage systèmes immersion";
      case "maintenance-circuits-liquides": return "Maintenance circuits liquides";
      case "nettoyage-environnements-haute-densite": return "Nettoyage environnements haute densité";
      // Services COMMISSIONING
      case "tests-de-mise-en-service": return "Tests de mise en service";
      case "validation-des-performances": return "Validation des performances";
      case "tests-de-redondance": return "Tests de redondance";
      case "certification-finale": return "Certification finale";
      case "documentation-de-mise-en-service": return "Documentation de mise en service";
      case "mise-en-service-refroidissement-liquide": return "Mise en service refroidissement liquide";
      case "validation-haute-densite": return "Validation haute densité";
      case "tests-edge-computing": return "Tests Edge Computing";
      // Services MAINTENANCE
      case "Maintenance Préventive": return "Maintenance Préventive";
      case "Maintenance Corrective": return "Maintenance Corrective";
      case "Maintenance Prédictive": return "Maintenance Prédictive";
      case "Gestion des Contrats de Maintenance": return "Gestion des Contrats de Maintenance";
      case "Planification des Interventions": return "Planification des Interventions";
      case "Maintenance Systèmes Liquides": return "Maintenance Systèmes Liquides";
      case "Maintenance Batteries Lithium-Ion": return "Maintenance Batteries Lithium-Ion";
      case "Maintenance Prédictive IA": return "Maintenance Prédictive IA";
      // Services MONITORING
      case "surveillance-des-performances": return "Surveillance des Performances";
      case "alertes-et-notifications": return "Alertes et Notifications";
      case "rapports-de-performance": return "Rapports de Performance";
      case "analyse-des-tendances": return "Analyse des Tendances";
      case "optimisation-continue": return "Optimisation Continue";
      case "surveillance-haute-densite": return "Surveillance Haute Densité";
      case "monitoring-edge-temps-reel": return "Monitoring Edge Temps Réel";
      case "analyse-energetique-avancee": return "Analyse Énergétique Avancée";
      // Services SURVEY
      case "infrastructure": return "Évaluation d'infrastructure";
      default: return serviceType.charAt(0).toUpperCase() + serviceType.slice(1).replace(/-/g, ' ');
    }
  };
  
  const subCategory = getSubCategory(serviceType);
  
  // Récupérer les livrables depuis la base de données
  const { data: deliverables = [], isLoading } = useQuery({
    queryKey: ['/api/templates', serviceType, subCategory],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      // Déterminer la catégorie selon le serviceType
      const categoryMap: { [key: string]: string } = {
        "conformite-certification": "Audit",
        "audit-documentaire": "Audit",
        "evaluations-periodiques": "Audit",
        "securite-physique": "Audit",
        "preparation-certification": "Audit",
        "analyse-ecarts": "Audit",
        "audit-conformite-tia-942": "Audit",
        "audit-redondance": "Audit",
        "evaluation-performances": "Audit",
        "audit-durabilite-energetique": "Audit",
        "audit-systemes-modulaires": "Audit",
        "audit-technologies-emergentes": "Audit",
        "strategie-planification": "Conseil",
        "transformation-infrastructure": "Conseil",
        "formation-tia-942": "Conseil",
        "optimisation-operationnelle": "Conseil",
        "gestion-des-risques": "Conseil",
        "optimisation-energetique": "Conseil",
        "planification-de-la-croissance": "Conseil",
        "conseil-en-refroidissement-liquide": "Conseil",
        "strategie-infrastructure-edge": "Conseil",
        "transition-energetique": "Conseil",
        // Services SUPPORT
        "production-documentaire": "Support",
        "transfert-competences": "Support",
        "suivi-recommandations": "Support",
        "gestion-documentation": "Support",
        "accompagnement-projet": "Support",
        "support-operationnel": "Support",
        "assistance-technique": "Support",
        "formation-technologies-emergentes": "Support",
        "accompagnement-transition-edge": "Support",
        "assistance-developpement-durable": "Support",
        // Services AMOA
        "architecture-technique-infrastructure": "AMOA",
        "analyse-besoins": "AMOA",
        "specifications-techniques": "AMOA",
        "validation-livrables": "AMOA",
        "specifications-edge-computing": "AMOA",
        "analyse-besoins-haute-densite": "AMOA",
        "cahier-des-charges-durabilite": "AMOA",
        // Services AMÉNAGEMENT TECHNIQUE 
        "conception-technique": "AMENAGEMENT TECHNIQUE",
        "conception-generale": "AMENAGEMENT TECHNIQUE",
        "pilotage-planification": "AMENAGEMENT TECHNIQUE",
        "etude-preliminaire": "AMENAGEMENT TECHNIQUE",
        "conception-haute-densite": "AMENAGEMENT TECHNIQUE",
        "edge-computing": "AMENAGEMENT TECHNIQUE",
        "conception-durable-ecologique": "AMENAGEMENT TECHNIQUE",
        // Services AMENAGEMENT PHYSIQUE
        "urbanisation-des-salles": "AMENAGEMENT PHYSIQUE",
        "distribution-electrique": "AMENAGEMENT PHYSIQUE",
        "infrastructure-reseau": "AMENAGEMENT PHYSIQUE",
        "amenagement-optimisation-energetique": "AMENAGEMENT PHYSIQUE",
        "documentation-operationnelle": "AMENAGEMENT PHYSIQUE",
        "systemes-de-refroidissement-cvc": "AMENAGEMENT PHYSIQUE",
        "systemes-de-securite": "AMENAGEMENT PHYSIQUE",
        "systemes-de-detection-incendie": "AMENAGEMENT PHYSIQUE",
        "cablage-structure": "AMENAGEMENT PHYSIQUE",
        "refroidissement-direct-sur-puce-d2c": "AMENAGEMENT PHYSIQUE",
        "systemes-de-refroidissement-par-immersion": "AMENAGEMENT PHYSIQUE",
        "architecture-wall-flow": "AMENAGEMENT PHYSIQUE",
        "micro-reseaux-electriques": "AMENAGEMENT PHYSIQUE",
        // Services NETTOYAGE
        "planification-des-interventions": "NETTOYAGE",
        "methodologie-et-protocoles": "NETTOYAGE",
        "assurance-qualite": "NETTOYAGE",
        "documentation-et-rapports": "NETTOYAGE",
        "gestion-des-prestataires": "NETTOYAGE",
        "nettoyage-systemes-immersion": "NETTOYAGE",
        "maintenance-circuits-liquides": "NETTOYAGE",
        "nettoyage-environnements-haute-densite": "NETTOYAGE",
        // Services COMMISSIONING
        "tests-de-mise-en-service": "COMMISSIONING",
        "validation-des-performances": "COMMISSIONING",
        "tests-de-redondance": "COMMISSIONING",
        "certification-finale": "COMMISSIONING",
        "documentation-de-mise-en-service": "COMMISSIONING",
        "mise-en-service-refroidissement-liquide": "COMMISSIONING",
        "validation-haute-densite": "COMMISSIONING",
        "tests-edge-computing": "COMMISSIONING",
        // Services MAINTENANCE
        "Maintenance Préventive": "MAINTENANCE",
        "Maintenance Corrective": "MAINTENANCE",
        "Maintenance Prédictive": "MAINTENANCE",
        "Gestion des Contrats de Maintenance": "MAINTENANCE",
        "Planification des Interventions": "MAINTENANCE",
        "Maintenance Systèmes Liquides": "MAINTENANCE",
        "Maintenance Batteries Lithium-Ion": "MAINTENANCE",
        "Maintenance Prédictive IA": "MAINTENANCE",
        // Services MONITORING
        "surveillance-des-performances": "MONITORING",
        "alertes-et-notifications": "MONITORING",
        "rapports-de-performance": "MONITORING",
        "analyse-des-tendances": "MONITORING",
        "optimisation-continue": "MONITORING",
        "surveillance-haute-densite": "MONITORING",
        "monitoring-edge-temps-reel": "MONITORING",
        "analyse-energetique-avancee": "MONITORING",
        // Tous les autres services sont dans Survey par défaut
      };
      const category = categoryMap[serviceType] || "Survey";
      
      const response = await fetch(`/api/templates?category=${category}&subCategory=${encodeURIComponent(subCategory)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch templates');
      const templates = await response.json();
      
      // Transformer les templates en format deliverable avec icônes appropriées
      return templates.map((template: any, index: number) => ({
        id: template.id,
        title: template.nom,
        type: template.metadonnees?.description || "Document technique",
        description: template.description || "Livrable technique spécialisé selon TIA-942",
        code: `${serviceType.toUpperCase()}_${template.id}`,
        icon: getIconForTemplate(template.nom, index),
        color: getColorForIndex(index)
      }));
    }
  });

  // Fonction pour assigner des icônes selon le nom du template
  const getIconForTemplate = (nom: string, index: number) => {
    if (nom.includes('Rapport') || nom.includes('rapport')) return FileText;
    if (nom.includes('Matrice') || nom.includes('Excel')) return Table;
    if (nom.includes('Cartographie') || nom.includes('Plan')) return Map;
    if (nom.includes('photographique') || nom.includes('Photo')) return Camera;
    if (nom.includes('Synthèse') || nom.includes('exécutive')) return FileBarChart;
    if (nom.includes('équipement') || nom.includes('Équipement')) return Settings;
    if (nom.includes('inspection') || nom.includes('visuelle')) return Eye;
    if (nom.includes('conformité') || nom.includes('standard')) return Shield;
    if (nom.includes('Rated') || nom.includes('niveau')) return Target;
    if (nom.includes('redondance') || nom.includes('système')) return Layers;
    if (nom.includes('électrique') || nom.includes('capacité')) return Zap;
    if (nom.includes('HVAC') || nom.includes('thermique')) return Thermometer;
    if (nom.includes('télécoms') || nom.includes('connectivité')) return Wifi;
    if (nom.includes('disponibilité') || nom.includes('temps')) return Clock;
    if (nom.includes('logistique') || nom.includes('accessibilité')) return Route;
    // Icône par défaut selon l'index
    const icons = [FileText, Table, Map, Camera, FileBarChart, Settings, Eye, Shield, Target, Layers, Zap, Thermometer, Wifi, Clock, Route];
    return icons[index % icons.length];
  };

  // Fonction pour assigner des couleurs selon l'index
  const getColorForIndex = (index: number) => {
    const colors = [
      "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4",
      "#84CC16", "#F97316", "#DC2626", "#7C3AED", "#059669", "#0891B2",
      "#C2410C", "#BE123C", "#4C1D95", "#166534", "#0F172A", "#7F1D1D"
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des livrables...</p>
        </div>
      </div>
    );
  }

  // Titre dynamique selon le serviceType
  const getPageInfo = (type: string) => {
    switch (type) {
      case "localisation":
        return {
          title: "Études de localisation",
          description: "15 livrables pour études de localisation selon TIA-942"
        };
      case "faisabilite":
        return {
          title: "Étude de Faisabilité",
          description: "15 livrables pour études de faisabilité selon TIA-942"
        };
      case "resilience":
        return {
          title: "Étude de Résilience",
          description: "15 livrables pour études de résilience selon TIA-942"
        };
      case "energetique":
        return {
          title: "Optimisation Énergétique",
          description: "15 livrables pour optimisation énergétique selon TIA-942"
        };
      case "specialisees":
        return {
          title: "Évaluations Spécialisées",
          description: "15 livrables pour évaluations spécialisées selon TIA-942"
        };
      case "comparatives":
        return {
          title: "Études Comparatives",
          description: "15 livrables pour études comparatives selon TIA-942"
        };
      case "audit-capacite":
        return {
          title: "Audit de Capacité",
          description: "15 livrables pour audit de capacité selon TIA-942"
        };
      case "evaluation-environnementale":
        return {
          title: "Évaluation Environnementale",
          description: "15 livrables pour évaluation environnementale selon TIA-942"
        };
      case "evaluations-edge":
        return {
          title: "Évaluations Edge & µEDC",
          description: "15 livrables pour évaluations Edge & µEDC selon TIA-942"
        };
      case "evaluations-ai-ml":
        return {
          title: "Évaluations Haute Densité (AI/ML Computing)",
          description: "15 livrables pour évaluations haute densité AI/ML selon TIA-942"
        };
      case "evaluations-immersion":
        return {
          title: "Évaluations de Refroidissement par Immersion",
          description: "15 livrables pour évaluations refroidissement par immersion selon TIA-942"
        };
      case "conformite-certification":
        return {
          title: "Conformité et certification",
          description: "20 livrables pour audit conformité et certification selon TIA-942"
        };
      case "audit-documentaire":
        return {
          title: "Audit documentaire",
          description: "20 livrables pour audit documentation et procédures selon TIA-942"
        };
      case "evaluations-periodiques":
        return {
          title: "Évaluations périodiques",
          description: "20 livrables pour évaluations périodiques et monitoring continu selon TIA-942"
        };
      case "securite-physique":
        return {
          title: "Sécurité physique",
          description: "20 livrables pour audit sécurité physique et protection infrastructure selon TIA-942"
        };
      case "preparation-certification":
        return {
          title: "Préparation certification",
          description: "20 livrables pour préparation certifications TIA-942-C, Uptime, ISO et standards internationaux"
        };
      case "analyse-ecarts":
        return {
          title: "Analyse des écarts",
          description: "20 livrables pour gap analysis et écarts conformité, performance et amélioration continue"
        };
      case "audit-conformite-tia-942":
        return {
          title: "Audit de conformité TIA-942",
          description: "20 livrables pour audit conformité TIA-942-C complet selon toutes sections standard"
        };
      case "audit-redondance":
        return {
          title: "Audit de redondance",
          description: "20 livrables pour audit redondance infrastructure, SPOF analysis et resilience engineering"
        };
      case "evaluation-performances":
        return {
          title: "Évaluation des performances",
          description: "20 livrables pour évaluation performance datacenter, benchmarking et optimization excellence"
        };
      case "audit-durabilite-energetique":
        return {
          title: "Audit de durabilité énergétique",
          description: "20 livrables pour audit durabilité, carbon footprint et transition Net-Zero datacenter"
        };
      case "audit-systemes-modulaires":
        return {
          title: "Audit de systèmes modulaires",
          description: "20 livrables pour audit systèmes modulaires, préfabrication et scalability infrastructure"
        };
      case "audit-technologies-emergentes":
        return {
          title: "Audit de technologies émergentes",
          description: "20 livrables pour audit technologies émergentes, quantum computing et infrastructure futuriste"
        };
      case "strategie-planification":
        return {
          title: "Stratégie et planification",
          description: "22 livrables pour stratégie datacenter, roadmap technologique et planification transformation"
        };
      case "transformation-infrastructure":
        return {
          title: "Transformation infrastructure",
          description: "20 livrables pour modernisation infrastructure, cloud-native migration et transformation opérationnelle"
        };
      case "formation-tia-942":
        return {
          title: "Formation TIA-942",
          description: "20 livrables pour programmes formation expert, certification et développement compétences"
        };
      case "optimisation-operationnelle":
        return {
          title: "Optimisation opérationnelle",
          description: "20 livrables pour excellence opérationnelle, performance optimization et continuous improvement"
        };
      case "gestion-des-risques":
        return {
          title: "Gestion des risques",
          description: "20 livrables pour risk management, business continuity et enterprise resilience"
        };
      case "optimisation-energetique":
        return {
          title: "Optimisation énergétique",
          description: "20 livrables pour efficiency énergétique, PUE optimization et sustainability leadership"
        };
      case "planification-de-la-croissance":
        return {
          title: "Planification de la croissance",
          description: "20 livrables pour growth planning, expansion strategy et scaling optimization"
        };
      case "conseil-en-refroidissement-liquide":
        return {
          title: "Conseil en refroidissement liquide",
          description: "20 livrables pour liquid cooling strategy, D2C cooling et thermal management excellence"
        };
      case "strategie-infrastructure-edge":
        return {
          title: "Stratégie infrastructure Edge",
          description: "20 livrables pour edge computing strategy, µEDC deployment et distributed architecture excellence"
        };
      case "transition-energetique":
        return {
          title: "Transition Énergétique",
          description: "22 livrables pour transition énergétique, net-zero roadmap et sustainability excellence"
        };
      case "production-documentaire":
        return {
          title: "Production documentaire",
          description: "22 livrables pour production documentaire et documentation excellence"
        };
      case "transfert-competences":
        return {
          title: "Transfert de compétences",
          description: "22 livrables pour knowledge transfer et formation expertise"
        };
      case "suivi-recommandations":
        return {
          title: "Suivi des recommandations",
          description: "22 livrables pour monitoring et pilotage performance"
        };
      case "gestion-documentation":
        return {
          title: "Gestion de la documentation",
          description: "22 livrables pour lifecycle et versioning documentaire"
        };
      case "accompagnement-projet":
        return {
          title: "Accompagnement Projet",
          description: "22 livrables pour gestion projet et coordination technique"
        };
      case "support-operationnel":
        return {
          title: "Support Opérationnel",
          description: "22 livrables pour assistance opérationnelle continue et excellence service"
        };
      case "assistance-technique":
        return {
          title: "Assistance Technique",
          description: "22 livrables pour support technique spécialisé et expertise avancée"
        };
      case "formation-technologies-emergentes":
        return {
          title: "Formation Technologies Émergentes",
          description: `${deliverables.length} livrables pour formation avancée sur technologies émergentes et innovations futures`
        };
      case "accompagnement-transition-edge":
        return {
          title: "Accompagnement transition Edge",
          description: `${deliverables.length} livrables pour accompagnement transition Edge selon TIA-942`
        };
      case "assistance-developpement-durable":
        return {
          title: "Assistance Développement Durable",
          description: `${deliverables.length} livrables pour assistance développement durable selon TIA-942`
        };
      case "architecture-technique-infrastructure":
        return {
          title: "Architecture Technique Infrastructure",
          description: `${deliverables.length} livrables pour architecture technique infrastructure TIA-942`
        };
      case "conception-technique":
        return {
          title: "Conception technique",
          description: `${deliverables.length} livrables pour conception technique infrastructure et design optimization selon TIA-942`
        };
      case "conception-generale":
        return {
          title: "Conception générale",
          description: `${deliverables.length} livrables pour conception générale et strategic planning selon TIA-942`
        };
      case "pilotage-planification":
        return {
          title: "Pilotage et planification",
          description: `${deliverables.length} livrables pour pilotage projet et planning optimization selon TIA-942`
        };
      case "etude-preliminaire":
        return {
          title: "Étude préliminaire",
          description: `${deliverables.length} livrables pour étude préliminaire et feasibility analysis selon TIA-942`
        };
      case "analyse-besoins":
        return {
          title: "Analyse des besoins",
          description: `${deliverables.length} livrables pour analyse besoins et requirements engineering selon TIA-942`
        };
      case "specifications-techniques":
        return {
          title: "Spécifications techniques détaillées",
          description: `${deliverables.length} livrables pour spécifications techniques et detailed engineering selon TIA-942`
        };
      case "validation-livrables":
        return {
          title: "Validation des livrables",
          description: `${deliverables.length} livrables pour validation et quality assurance selon TIA-942`
        };
      case "specifications-edge-computing":
        return {
          title: "Spécifications Edge Computing",
          description: `${deliverables.length} livrables pour spécifications µEDC et edge infrastructure selon TIA-942`
        };
      case "analyse-besoins-haute-densite":
        return {
          title: "Analyse besoins haute densité",
          description: `${deliverables.length} livrables pour analyse AI/ML et high-density computing selon TIA-942`
        };
      case "cahier-des-charges-durabilite":
        return {
          title: "Cahier des charges durabilité",
          description: `${deliverables.length} livrables pour ESG et sustainability excellence selon TIA-942`
        };
      // Services AMENAGEMENT PHYSIQUE
      case "urbanisation-des-salles":
        return {
          title: "Urbanisation des salles",
          description: `${deliverables.length} livrables pour urbanisation et layout optimization datacenter selon TIA-942`
        };
      case "distribution-electrique":
        return {
          title: "Distribution électrique",
          description: `${deliverables.length} livrables pour electrical systems et power distribution excellence selon TIA-942`
        };
      case "infrastructure-reseau":
        return {
          title: "Infrastructure réseau",
          description: `${deliverables.length} livrables pour network infrastructure et connectivity optimization selon TIA-942`
        };
      case "amenagement-optimisation-energetique":
        return {
          title: "Optimisation énergétique",
          description: `${deliverables.length} livrables pour efficiency énergétique, PUE optimization et sustainability leadership selon TIA-942`
        };
      case "documentation-operationnelle":
        return {
          title: "Documentation opérationnelle",
          description: `${deliverables.length} livrables pour documentation systems, knowledge management et operational excellence selon TIA-942`
        };
      case "systemes-de-refroidissement-cvc":
        return {
          title: "Systèmes de refroidissement (CVC)",
          description: `${deliverables.length} livrables pour HVAC systems, cooling optimization et thermal management excellence selon TIA-942`
        };
      case "systemes-de-securite":
        return {
          title: "Systèmes de sécurité",
          description: `${deliverables.length} livrables pour security systems, access control et physical protection excellence selon TIA-942`
        };
      case "systemes-de-detection-incendie":
        return {
          title: "Systèmes de détection incendie",
          description: `${deliverables.length} livrables pour fire detection, suppression systems et life safety excellence selon TIA-942`
        };
      case "cablage-structure":
        return {
          title: "Câblage structuré",
          description: `${deliverables.length} livrables pour structured cabling, fiber optic infrastructure et connectivity excellence selon TIA-942`
        };
      case "refroidissement-direct-sur-puce-d2c":
        return {
          title: "Refroidissement direct-sur-puce (D2C)",
          description: `${deliverables.length} livrables pour direct-to-chip cooling, thermal management et advanced cooling systems selon TIA-942`
        };
      case "systemes-de-refroidissement-par-immersion":
        return {
          title: "Systèmes de refroidissement par immersion",
          description: `${deliverables.length} livrables pour immersion cooling, fluid management et ultra-high density cooling selon TIA-942`
        };
      case "architecture-wall-flow":
        return {
          title: "Architecture Wall Flow",
          description: `${deliverables.length} livrables pour wall flow systems, directional airflow et intelligent wall integration selon TIA-942`
        };
      case "micro-reseaux-electriques":
        return {
          title: "Micro-réseaux électriques",
          description: `${deliverables.length} livrables pour microgrids, distributed energy et grid independence systems selon TIA-942`
        };
      case "conception-haute-densite":
        return {
          title: "Conception haute densité",
          description: `${deliverables.length} livrables pour high density architecture, AI/ML infrastructure et ultra-dense computing selon TIA-942`
        };
      case "edge-computing":
        return {
          title: "Architecture Edge computing",
          description: `${deliverables.length} livrables pour edge infrastructure, distributed computing et micro datacenters selon TIA-942`
        };
      case "conception-durable-ecologique":
        return {
          title: "Conception durable et écologique",
          description: `${deliverables.length} livrables pour sustainable design, green infrastructure et ecological excellence selon TIA-942`
        };
      // Services NETTOYAGE
      case "planification-des-interventions":
        return {
          title: "Planification des interventions",
          description: `${deliverables.length} livrables pour planning des interventions, scheduling excellence et coordination optimale`
        };
      case "methodologie-et-protocoles":
        return {
          title: "Méthodologie et protocoles",
          description: `${deliverables.length} livrables pour methodologies avancées, protocoles standardisés et clean room excellence`
        };
      case "assurance-qualite":
        return {
          title: "Assurance qualité",
          description: `${deliverables.length} livrables pour quality assurance, quality control et excellence qualité continue`
        };
      case "documentation-et-rapports":
        return {
          title: "Documentation et rapports",
          description: `${deliverables.length} livrables pour documentation technique, reporting excellence et knowledge management`
        };
      case "gestion-des-prestataires":
        return {
          title: "Gestion des prestataires",
          description: `${deliverables.length} livrables pour vendor management, contract excellence et partenariats stratégiques`
        };
      case "nettoyage-systemes-immersion":
        return {
          title: "Nettoyage systèmes immersion",
          description: `${deliverables.length} livrables pour immersion cleaning, fluid management et systèmes de refroidissement liquide`
        };
      case "maintenance-circuits-liquides":
        return {
          title: "Maintenance circuits liquides",
          description: `${deliverables.length} livrables pour liquid circuits, maintenance préventive et gestion des fluides techniques`
        };
      case "nettoyage-environnements-haute-densite":
        return {
          title: "Nettoyage environnements haute densité",
          description: `${deliverables.length} livrables pour high-density environments, espaces confinés et technologies avancées`
        };
      // Services COMMISSIONING
      case "tests-de-mise-en-service":
        return {
          title: "Tests de mise en service",
          description: `${deliverables.length} livrables pour commissioning testing, mise en service excellence et validation des systèmes`
        };
      case "validation-des-performances":
        return {
          title: "Validation des performances",
          description: `${deliverables.length} livrables pour performance validation, benchmarking excellence et optimisation des performances`
        };
      case "tests-de-redondance":
        return {
          title: "Tests de redondance",
          description: `${deliverables.length} livrables pour redundancy testing, failover validation et haute disponibilité`
        };
      case "certification-finale":
        return {
          title: "Certification finale",
          description: `${deliverables.length} livrables pour final certification, audit final et validation TIA-942 complète`
        };
      case "documentation-de-mise-en-service":
        return {
          title: "Documentation de mise en service",
          description: `${deliverables.length} livrables pour commissioning documentation, knowledge management et documentation technique`
        };
      case "mise-en-service-refroidissement-liquide":
        return {
          title: "Mise en service refroidissement liquide",
          description: `${deliverables.length} livrables pour liquid cooling commissioning, circuits liquides et systèmes de refroidissement avancés`
        };
      case "validation-haute-densite":
        return {
          title: "Validation haute densité",
          description: `${deliverables.length} livrables pour high-density validation, infrastructure dense et optimisation des capacités`
        };
      case "tests-edge-computing":
        return {
          title: "Tests Edge Computing",
          description: `${deliverables.length} livrables pour edge testing, latency validation et performance des systèmes distribués`
        };
      // Services MAINTENANCE
      case "Maintenance Préventive":
        return {
          title: "Maintenance Préventive",
          description: `${deliverables.length} livrables pour maintenance préventive et entretien programmé selon TIA-942`
        };
      case "Maintenance Corrective":
        return {
          title: "Maintenance Corrective",
          description: `${deliverables.length} livrables pour maintenance corrective et réparation d'urgence selon TIA-942`
        };
      case "Maintenance Prédictive":
        return {
          title: "Maintenance Prédictive",
          description: `${deliverables.length} livrables pour maintenance prédictive et analytics avancés selon TIA-942`
        };
      case "Gestion des Contrats de Maintenance":
        return {
          title: "Gestion des Contrats de Maintenance",
          description: `${deliverables.length} livrables pour gestion contractuelle et SLA maintenance selon TIA-942`
        };
      case "Planification des Interventions":
        return {
          title: "Planification des Interventions",
          description: `${deliverables.length} livrables pour planification et coordination des interventions selon TIA-942`
        };
      case "Maintenance Systèmes Liquides":
        return {
          title: "Maintenance Systèmes Liquides",
          description: `${deliverables.length} livrables pour maintenance des systèmes de refroidissement liquide selon TIA-942`
        };
      case "Maintenance Batteries Lithium-Ion":
        return {
          title: "Maintenance Batteries Lithium-Ion",
          description: `${deliverables.length} livrables pour maintenance spécialisée batteries lithium-ion selon TIA-942`
        };
      case "Maintenance Prédictive IA":
        return {
          title: "Maintenance Prédictive IA",
          description: `${deliverables.length} livrables pour maintenance prédictive avec intelligence artificielle selon TIA-942`
        };
      // Services MONITORING
      case "surveillance-des-performances":
        return {
          title: "Surveillance des Performances",
          description: `${deliverables.length} livrables pour surveillance continue des performances selon TIA-942`
        };
      case "alertes-et-notifications":
        return {
          title: "Alertes et Notifications",
          description: `${deliverables.length} livrables pour système d'alertes et notifications avancées selon TIA-942`
        };
      case "rapports-de-performance":
        return {
          title: "Rapports de Performance",
          description: `${deliverables.length} livrables pour reporting et analyse de performance selon TIA-942`
        };
      case "analyse-des-tendances":
        return {
          title: "Analyse des Tendances",
          description: `${deliverables.length} livrables pour analyse prédictive et tendances selon TIA-942`
        };
      case "optimisation-continue":
        return {
          title: "Optimisation Continue",
          description: `${deliverables.length} livrables pour optimisation continue et amélioration performance selon TIA-942`
        };
      case "surveillance-haute-densite":
        return {
          title: "Surveillance Haute Densité",
          description: `${deliverables.length} livrables pour monitoring spécialisé haute densité selon TIA-942`
        };
      case "monitoring-edge-temps-reel":
        return {
          title: "Monitoring Edge Temps Réel",
          description: `${deliverables.length} livrables pour surveillance edge computing temps réel selon TIA-942`
        };
      case "analyse-energetique-avancee":
        return {
          title: "Analyse Énergétique Avancée",
          description: `${deliverables.length} livrables pour analyse énergétique et optimisation selon TIA-942`
        };
      default:
        return {
          title: "Évaluation d'infrastructure",
          description: `${deliverables.length} livrables pour évaluation d'infrastructure selon TIA-942`
        };
    }
  };
  
  const { title: pageTitle, description: pageDescription } = getPageInfo(serviceType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button 
            variant="outline" 
            onClick={onBack}
            className="mb-4"
          >
            ← Retour aux services
          </Button>
          <h1 className="text-2xl font-bold text-dc-navy">
            {pageTitle}
          </h1>
          <p className="text-dc-gray">
            {pageDescription}
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {deliverables.length} Livrables
        </Badge>
      </div>

      {/* Grille des livrables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deliverables.map((deliverable: any) => {
          const Icon = deliverable.icon;
          return (
            <Card 
              key={deliverable.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectDeliverable(deliverable)}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: deliverable.color }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight">
                      {deliverable.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  {deliverable.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {deliverable.type}
                  </Badge>
                  <Button size="sm" variant="outline">
                    Sélectionner
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // Code mort supprimé - les livrables viennent maintenant de la base de données
  const staticDeliverables_UNUSED = [
    {
      id: 1,
      title: "Rapport d'évaluation complet",
      type: "Document PDF/Word (30-50 pages)",
      description: "Analyse complète de l'infrastructure selon TIA-942",
      code: "EVAL_INFRA_RAPPORT_COMPLET",
      icon: FileText,
      color: "#3B82F6"
    },
    {
      id: 2,
      title: "Matrice d'évaluation technique",
      type: "Fichier Excel avec tableaux",
      description: "Grille d'évaluation détaillée par composant",
      code: "EVAL_INFRA_MATRICE_TECH",
      icon: Table,
      color: "#10B981"
    },
    {
      id: 3,
      title: "Cartographie des composants",
      type: "Plans et schémas (PDF/Visio)",
      description: "Représentation graphique de l'infrastructure",
      code: "EVAL_INFRA_CARTOGRAPHIE",
      icon: Map,
      color: "#F59E0B"
    },
    {
      id: 4,
      title: "Rapport photographique",
      type: "Document PDF avec images",
      description: "Documentation visuelle de l'infrastructure",
      code: "EVAL_INFRA_PHOTOS",
      icon: Camera,
      color: "#8B5CF6"
    },
    {
      id: 5,
      title: "Synthèse exécutive",
      type: "Document PDF (5-8 pages)",
      description: "Résumé pour la direction",
      code: "EVAL_INFRA_SYNTHESE_EXEC",
      icon: FileBarChart,
      color: "#EF4444"
    },
    {
      id: 6,
      title: "Évaluation des équipements critiques",
      type: "Document PDF/Excel",
      description: "Analyse détaillée des équipements critiques",
      code: "EVAL_INFRA_EQUIPEMENTS_CRIT",
      icon: Settings,
      color: "#06B6D4"
    },
    {
      id: 7,
      title: "Rapport d'inspection visuelle",
      type: "Document PDF avec checklist",
      description: "Constat d'état physique de l'infrastructure",
      code: "EVAL_INFRA_INSPECTION_VIS",
      icon: Eye,
      color: "#84CC16"
    },
    {
      id: 8,
      title: "Analyse de conformité aux standards",
      type: "Document PDF/Excel",
      description: "Vérification conformité TIA-942",
      code: "EVAL_INFRA_CONFORMITE_STD",
      icon: Shield,
      color: "#F97316"
    },
    {
      id: 9,
      title: "Évaluation du niveau Rated",
      type: "Document PDF (8-12 pages)",
      description: "Détermination et justification du niveau Rated atteint",
      code: "EVAL_INFRA_NIVEAU_RATED",
      icon: Target,
      color: "#DC2626"
    },
    {
      id: 10,
      title: "Analyse de redondance par sous-système",
      type: "Document PDF/Excel",
      description: "Évaluation redondance (N, N+1, 2N, 2(N+1)) par sous-système",
      code: "EVAL_INFRA_REDONDANCE",
      icon: Layers,
      color: "#7C3AED"
    },
    {
      id: 11,
      title: "Rapport de capacité électrique",
      type: "Document PDF/Excel avec calculs",
      description: "Analyse capacité électrique selon Article 5 TIA-942",
      code: "EVAL_INFRA_CAPACITE_ELEC",
      icon: Zap,
      color: "#059669"
    },
    {
      id: 12,
      title: "Évaluation HVAC et zones thermiques",
      type: "Document PDF avec mesures",
      description: "Analyse systèmes HVAC selon Article 6 TIA-942",
      code: "EVAL_INFRA_HVAC_ZONES",
      icon: Thermometer,
      color: "#0891B2"
    },
    {
      id: 13,
      title: "Audit des espaces télécoms",
      type: "Document PDF/Excel",
      description: "Vérification espaces télécoms selon Article 7 TIA-942",
      code: "EVAL_INFRA_ESPACES_TELECOM",
      icon: Wifi,
      color: "#DB2777"
    },
    {
      id: 14,
      title: "Analyse des chemins de distribution",
      type: "Document PDF avec plans",
      description: "Évaluation chemins électriques et télécoms",
      code: "EVAL_INFRA_CHEMINS_DISTRIB",
      icon: Route,
      color: "#9333EA"
    },
    {
      id: 15,
      title: "Évaluation de la disponibilité",
      type: "Document PDF/Excel avec calculs",
      description: "Calculs de disponibilité annuelle et temps d'arrêt",
      code: "EVAL_INFRA_DISPONIBILITE",
      icon: Clock,
      color: "#EA580C"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button 
            variant="outline" 
            onClick={onBack}
            className="mb-4"
          >
            ← Retour aux services Survey
          </Button>
          <h1 className="text-2xl font-bold text-dc-navy">
            Livrables - Évaluation d'Infrastructure TIA-942
          </h1>
          <p className="text-dc-gray">
            Sélectionnez le livrable à générer pour démarrer le processus d'évaluation
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          15 Livrables
        </Badge>
      </div>

      {/* Statistics */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">15</div>
              <div className="text-sm text-dc-gray">Livrables Disponibles</div>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tous les Livrables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Livrables Disponibles (15)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {deliverables.map((deliverable: any) => {
              const Icon = deliverable.icon;
              return (
                <Card 
                  key={deliverable.id}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4 hover:-translate-y-1"
                  style={{ borderLeftColor: deliverable.color }}
                  onClick={() => onSelectDeliverable(deliverable)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-start justify-between">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: deliverable.color }}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-dc-navy group-hover:text-dc-orange transition-colors mb-1 text-sm">
                          {deliverable.title}
                        </h3>
                        <p className="text-xs text-dc-gray mb-2">
                          {deliverable.type}
                        </p>
                        <p className="text-xs text-dc-gray">
                          {deliverable.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-gray-500">
                          #{deliverable.id}
                        </span>
                        <span className="text-xs text-dc-gray group-hover:text-dc-orange transition-colors opacity-0 group-hover:opacity-100">
                          Générer →
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info Footer */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-dc-gray">
            <FileText className="h-4 w-4" />
            <span>
              Chaque livrable suit un processus de génération en 5 phases selon la norme TIA-942. 
              Cliquez sur un livrable pour démarrer le processus de collecte de données.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}