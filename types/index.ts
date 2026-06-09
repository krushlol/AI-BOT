// Component types
export type ComponentType = 
  | 'GPU' 
  | 'CPU' 
  | 'Motherboard' 
  | 'RAM' 
  | 'Storage' 
  | 'PSU' 
  | 'Case' 
  | 'CPU_Cooler'

// Purchase status types
export type PurchaseStatus = 
  | 'pending' 
  | 'approved' 
  | 'executed' 
  | 'completed' 
  | 'failed'

// Component specifications interface
export interface ComponentSpecs {
  [key: string]: any // Flexible structure for different component types
}

// System profile structure
export interface SystemComponents {
  GPU?: ComponentSpecs
  CPU?: ComponentSpecs
  Motherboard?: ComponentSpecs
  RAM?: ComponentSpecs
  Storage?: ComponentSpecs
  PSU?: ComponentSpecs
  Case?: ComponentSpecs
  CPU_Cooler?: ComponentSpecs
}

// Recommendation option structure
export interface RecommendationOption {
  componentId?: string
  brand: string
  model: string
  price: number
  compatibilityScore: number
  reasoning: string
  warnings?: string[]
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
