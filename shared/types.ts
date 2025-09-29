// ===== TYPES POUR L'ORCHESTRATEUR =====

export interface UnifiedCategory {
  id: number
  nom: string
  color: string
  description: string
  ordre: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UnifiedService {
  id: number
  nom: string
  categoryId: number
  description: string
  workflow: any
  dureeEstimee: string
  prerequis: string[]
  ordre: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UnifiedDeliverable {
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
  createdAt?: string
  updatedAt?: string
}

export interface UnifiedStats {
  categories: number
  services: number
  deliverables: number
  timestamp: string
}

export interface GenerationJob {
  id: string
  type: 'prompt' | 'summary' | 'questionnaire'
  categoryName: string
  serviceName: string
  deliverableName: string
  priority: 'Normale' | 'Élevée' | 'Critique'
  status: 'pending' | 'running' | 'completed' | 'error'
  createdAt: Date
  completedAt?: Date
  result?: string
  error?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  timestamp?: string
}

// ===== TYPES POUR LA GÉNÉRATION MCP =====

export interface MCPGenerationRequest {
  serviceId: number
  deliverableId: number
  type: 'prompt' | 'summary' | 'questionnaire'
  priority?: 'Normale' | 'Élevée' | 'Critique'
}

export interface MCPGenerationResult {
  type: string
  serviceName: string
  deliverableName: string
  content: string
  generatedAt: string
  metadata?: any
}