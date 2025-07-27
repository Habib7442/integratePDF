import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

// Standard Supabase client for public operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Authenticated Supabase client that uses Clerk session token
export async function createClerkSupabaseClient() {
  const { getToken } = await auth()

  return createClient(supabaseUrl, supabaseAnonKey, {
    // Use Clerk session token directly
    accessToken: async () => {
      const token = await getToken()
      return token ?? null
    },
  })
}

// Client-side authenticated Supabase client
export function createClerkSupabaseClientBrowser() {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side')
  }

  // This will be implemented after we set up the client-side hook
  return supabase
}

// Database types (will be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          clerk_user_id: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'pro' | 'business'
          documents_processed: number
          monthly_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_user_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'business'
          documents_processed?: number
          monthly_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_user_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'business'
          documents_processed?: number
          monthly_limit?: number
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          filename: string
          file_size: number
          file_type: string
          document_type: string | null
          processing_status: 'pending' | 'processing' | 'completed' | 'failed'
          confidence_score: number | null
          storage_path: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          file_size: number
          file_type: string
          document_type?: string | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          confidence_score?: number | null
          storage_path: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          file_size?: number
          file_type?: string
          document_type?: string | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          confidence_score?: number | null
          storage_path?: string
          created_at?: string
          updated_at?: string
        }
      }
      extracted_data: {
        Row: {
          id: string
          document_id: string
          user_id: string
          field_key: string
          field_value: string
          data_type: string
          confidence: number
          is_corrected: boolean
          original_value: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          document_id: string
          user_id: string
          field_key: string
          field_value: string
          data_type: string
          confidence: number
          is_corrected?: boolean
          original_value?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          user_id?: string
          field_key?: string
          field_value?: string
          data_type?: string
          confidence?: number
          is_corrected?: boolean
          original_value?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      integrations: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          integration_type: 'notion' | 'airtable' | 'quickbooks'
          integration_name: string
          config: Record<string, any>
          is_active?: boolean
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          integration_type?: 'notion' | 'airtable' | 'quickbooks'
          integration_name?: string
          config?: Record<string, any>
          is_active?: boolean
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      document_templates: {
        Row: {
          id: string
          user_id: string
          template_name: string
          document_type: string
          field_mappings: Record<string, any>
          usage_count: number
          confidence: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          template_name: string
          document_type: string
          field_mappings: Record<string, any>
          usage_count?: number
          confidence?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          template_name?: string
          document_type?: string
          field_mappings?: Record<string, any>
          usage_count?: number
          confidence?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: 'free' | 'pro' | 'business'
      processing_status: 'pending' | 'processing' | 'completed' | 'failed'
      integration_type: 'notion' | 'airtable' | 'quickbooks'
    }
  }
}
