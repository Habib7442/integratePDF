// Shared types for Zustand stores

export interface User {
  id: string
  clerk_user_id: string
  email: string
  first_name: string | null
  last_name: string | null
  subscription_tier: 'free' | 'pro' | 'business'
  documents_processed: number
  monthly_limit: number
  avatar_url?: string
  created_at: string
  updated_at?: string
}

export interface Document {
  id: string
  filename: string
  file_size: number
  file_type: string
  processing_status: 'uploaded' | 'pending' | 'processing' | 'completed' | 'failed'
  confidence_score: number | null
  created_at: string
  updated_at?: string
  user_id: string
  storage_path?: string
  document_type?: string
  error_message?: string
}

export interface ExtractedField {
  id: string
  field_key: string
  field_value: string
  confidence: number
  is_corrected: boolean
  data_type: string
  document_id: string
  user_id: string
  created_at: string
  updated_at?: string
}

export interface ExtractedData {
  document: {
    id: string
    filename: string
    processing_status: string
    confidence_score: number
    processing_completed_at?: string
    processing_started_at?: string
    processing_duration_seconds?: number
    error_message?: string
  }
  extracted_data: ExtractedField[]
  statistics: {
    total_fields: number
    average_confidence: number
    corrected_fields: number
    correction_rate: number
  }
}

// Integration types
export interface Integration {
  id: string
  name: string
  type: 'notion' | 'airtable' | 'quickbooks'
  icon: () => React.ReactNode
  description: string
  isAvailable: boolean
  requiresAuth: boolean
  authUrl?: string
  configFields?: IntegrationConfigField[]
}

export interface IntegrationConfigField {
  key: string
  label: string
  type: 'text' | 'select' | 'url' | 'token'
  required: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  description?: string
}

export interface UserIntegration {
  id: string
  user_id: string
  integration_type: 'notion' | 'airtable' | 'quickbooks'
  integration_name: string
  config: Record<string, any>
  is_active: boolean
  last_sync: string | null
  created_at: string
  updated_at: string
}

export interface IntegrationMapping {
  id: string
  user_integration_id: string
  source_field: string
  target_field: string
  transformation?: string
  is_required: boolean
  created_at: string
}

export interface PushResult {
  success: boolean
  integration_id: string
  external_id?: string
  error?: string
  pushed_at: string
}

export interface DocumentStatus {
  id: string
  filename: string
  processing_status: 'uploaded' | 'pending' | 'processing' | 'completed' | 'failed'
  processing_started_at?: string
  processing_completed_at?: string
  processing_duration_seconds?: number
  confidence_score?: number
  error_message?: string
  extracted_fields_count: number
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: number
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface LoadingState {
  [key: string]: boolean
}

export interface ErrorState {
  [key: string]: string | null
}
