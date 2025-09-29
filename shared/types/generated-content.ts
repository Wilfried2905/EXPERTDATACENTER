// Types pour le contenu généré par MCP
export interface GeneratedPhase2 {
  questionnaire: string;
  generated_at: string;
}

export interface GeneratedPhase25 {
  questionnaire: string;
  generated_at: string;
}

export interface GeneratedPhase3 {
  sommaire: string;
  prompt: string;
  generated_at: string;
}

export interface GeneratedPhases {
  phase2?: GeneratedPhase2;
  phase25?: GeneratedPhase25;
  phase3?: GeneratedPhase3;
}

export interface GeneratedDeliverableContent {
  phases: GeneratedPhases;
}

// Structure complète du contenu généré (JSONB)
export interface GeneratedContentData {
  [deliverableName: string]: GeneratedDeliverableContent;
}

// Extension du type existant generated_deliverables
export interface GeneratedDeliverable {
  id: number;
  user_id: number;
  sub_category_id: number;
  sub_category_name: string;
  deliverables_list: any[]; // JSONB existant
  context_analysis: string | null;
  total_count: number;
  generated_at: string;
  generated_content: GeneratedContentData | null; // NOUVELLE COLONNE
}

// Réponses API
export interface GeneratedContentResponse {
  success: boolean;
  data: GeneratedDeliverableContent | null;
  message?: string;
}

export interface GeneratedContentError {
  success: false;
  error: string;
  details?: string;
}

// Paramètres pour les hooks
export interface UseGeneratedContentParams {
  generatedDeliverableId: number;
  deliverableName: string;
}

// États du hook
export interface GeneratedContentState {
  data: GeneratedDeliverableContent | null;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
}