'use client'

import { useUser, useSession } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import { useMemo, useCallback } from 'react'
import type { Database } from '@/lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function useSupabase() {
  const { user: clerkUser } = useUser()
  const { session } = useSession()

  const supabase = useMemo(() => {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      // Session accessed from Clerk SDK
      accessToken: async () => session?.getToken() ?? null,
    })
  }, [session])

  return {
    supabase,
    user: clerkUser,
    isAuthenticated: !!clerkUser && !!session,
  }
}

// Hook for user profile management
export function useUserProfile() {
  const { supabase, user, isAuthenticated } = useSupabase()

  const createOrUpdateProfile = async () => {
    if (!user || !isAuthenticated) {
      console.log('User not authenticated')
      return null
    }

    // First, try to get existing user by clerk_user_id
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', user.id)
      .single()

    if (existingUser) {
      // User exists, update it
      const { data, error } = await supabase
        .from('users')
        .update({
          email: user.emailAddresses[0]?.emailAddress || '',
          first_name: user.firstName,
          last_name: user.lastName,
          avatar_url: user.imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        return null
      }
      return data
    }

    // User doesn't exist, create new one
    const { data, error } = await supabase
      .from('users')
      .insert({
        clerk_user_id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        first_name: user.firstName,
        last_name: user.lastName,
        avatar_url: user.imageUrl,
        subscription_tier: 'free',
        documents_processed: 0,
        monthly_limit: 5,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      return null
    }

    return data
  }

  const getProfile = async () => {
    if (!user || !isAuthenticated) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  }

  const updateSubscription = async (tier: 'free' | 'pro' | 'business') => {
    if (!user) return null

    const monthlyLimits = {
      free: 5,
      pro: 500,
      business: 2500,
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        subscription_tier: tier,
        monthly_limit: monthlyLimits[tier],
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating subscription:', error)
      return null
    }

    return data
  }

  return {
    createOrUpdateProfile,
    getProfile,
    updateSubscription,
  }
}

// Hook for document management
export function useDocuments() {
  const { supabase, user, isAuthenticated } = useSupabase()

  const uploadDocument = async (file: File, documentType?: string) => {
    if (!user || !isAuthenticated) throw new Error('User not authenticated')

    // Get the user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single()

    if (userError || !userData) {
      throw new Error('User profile not found')
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${userData.id}/${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file)

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Create document record
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: userData.id,
        filename: file.name,
        file_size: file.size,
        file_type: file.type,
        document_type: documentType,
        storage_path: uploadData.path,
        processing_status: 'pending',
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Database insert failed: ${error.message}`)
    }

    return data
  }

  const getDocuments = useCallback(async () => {
    if (!user || !isAuthenticated) return []

    // Get the user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single()

    if (userError || !userData) {
      console.error('Error fetching user profile:', userError)
      return []
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
      return []
    }

    return data
  }, [user, isAuthenticated, supabase])

  const updateDocumentStatus = async (
    documentId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    confidenceScore?: number
  ) => {
    if (!user) throw new Error('User not authenticated')

    // Get the Supabase user ID first
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single()

    if (userError || !userData) {
      throw new Error('User profile not found')
    }

    const { data, error } = await supabase
      .from('documents')
      .update({
        processing_status: status,
        confidence_score: confidenceScore,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .eq('user_id', userData.id) // Use Supabase UUID
      .select()
      .single()

    if (error) {
      throw new Error(`Status update failed: ${error.message}`)
    }

    return data
  }

  const deleteDocument = async (documentId: string) => {
    if (!user) throw new Error('User not authenticated')

    // First get the document to find the storage path
    const { data: document } = await supabase
      .from('documents')
      .select('storage_path')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (document) {
      // Delete from storage
      await supabase.storage
        .from('documents')
        .remove([document.storage_path])
    }

    // Delete from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user.id)

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
  }

  const extractData = async (documentId: string, keywords?: string) => {
    if (!user || !isAuthenticated) throw new Error('User not authenticated')

    const response = await fetch(`/api/documents/${documentId}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keywords: keywords || '' }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to start extraction')
    }

    return response.json()
  }

  const getExtractedData = useCallback(async (documentId: string) => {
    if (!user || !isAuthenticated) throw new Error('User not authenticated')

    const response = await fetch(`/api/documents/${documentId}/extracted`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch extracted data')
    }

    return response.json()
  }, [user, isAuthenticated])

  const updateExtractedField = useCallback(async (
    documentId: string,
    fieldId: string,
    fieldValue: string
  ) => {
    if (!user || !isAuthenticated) throw new Error('User not authenticated')

    const response = await fetch(`/api/documents/${documentId}/extracted`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        field_id: fieldId,
        field_value: fieldValue,
        is_corrected: true
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update field')
    }

    return response.json()
  }, [user, isAuthenticated])

  const getDocumentStatus = async (documentId: string) => {
    if (!user || !isAuthenticated) throw new Error('User not authenticated')

    const response = await fetch(`/api/documents/${documentId}/status`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch document status')
    }

    return response.json()
  }

  return {
    uploadDocument,
    getDocuments,
    updateDocumentStatus,
    deleteDocument,
    extractData,
    getExtractedData,
    updateExtractedField,
    getDocumentStatus,
  }
}

// Hook for extracted data management
export function useExtractedData() {
  const { supabase, user } = useSupabase()

  const saveExtractedData = async (
    documentId: string,
    extractedFields: Array<{
      field_key: string
      field_value: string
      data_type: string
      confidence: number
    }>
  ) => {
    if (!user) throw new Error('User not authenticated')

    // Get the Supabase user ID first
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single()

    if (userError || !userData) {
      throw new Error('User profile not found')
    }

    const dataToInsert = extractedFields.map(field => ({
      document_id: documentId,
      user_id: userData.id, // Use Supabase UUID
      ...field,
    }))

    const { data, error } = await supabase
      .from('extracted_data')
      .insert(dataToInsert)
      .select()

    if (error) {
      throw new Error(`Failed to save extracted data: ${error.message}`)
    }

    return data
  }

  const updateExtractedData = async (
    dataId: string,
    updates: {
      field_key?: string
      field_value?: string
      data_type?: string
      confidence?: number
    }
  ) => {
    const { data, error } = await supabase
      .from('extracted_data')
      .update({
        ...updates,
        is_corrected: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dataId)
      .eq('user_id', user?.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update extracted data: ${error.message}`)
    }

    return data
  }

  const getExtractedData = async (documentId: string) => {
    if (!user) return []

    const { data, error } = await supabase
      .from('extracted_data')
      .select('*')
      .eq('document_id', documentId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching extracted data:', error)
      return []
    }

    return data
  }

  return {
    saveExtractedData,
    updateExtractedData,
    getExtractedData,
  }
}
