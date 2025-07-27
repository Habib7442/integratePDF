'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useAuth, useDocuments, useNotifications, useIntegrations } from '@/components/providers/store-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Upload,
  Database,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Zap,
  Eye,
  Settings,
  ExternalLink
} from 'lucide-react'

type UserProfile = {
  id: string
  clerk_user_id: string
  email: string
  first_name: string | null
  last_name: string | null
  subscription_tier: 'free' | 'pro' | 'business'
  documents_processed: number
  monthly_limit: number
  created_at: string
}

type Document = {
  id: string
  filename: string
  file_size: number
  file_type: string
  document_type: string | null
  processing_status: 'uploaded' | 'pending' | 'processing' | 'completed' | 'failed'
  confidence_score: number | null
  created_at: string
}

export default function Dashboard() {
  const { user: clerkUser, isLoaded } = useUser()
  const router = useRouter()

  // Zustand stores
  const { user: profile, isAuthenticated, isLoading: userLoading } = useAuth()
  const {
    documents,
    isLoading,
    isUploading,
    error,
    fetchDocuments,
    uploadDocument
  } = useDocuments()
  const { showSuccessNotification, showErrorNotification } = useNotifications()
  const { userIntegrations, fetchUserIntegrations } = useIntegrations()

  useEffect(() => {
    if (isLoaded && clerkUser && isAuthenticated) {
      // Fetch documents and integrations when user is authenticated
      fetchDocuments().catch((err) => {
        console.error('Error fetching documents:', err)
        showErrorNotification('Error', 'Failed to load documents')
      })

      fetchUserIntegrations().catch((err) => {
        console.error('Error fetching integrations:', err)
        showErrorNotification('Error', 'Failed to load integrations')
      })
    }
  }, [isLoaded, clerkUser, isAuthenticated, fetchDocuments, fetchUserIntegrations, showErrorNotification])

  const [isDragging, setIsDragging] = useState(false)

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      showErrorNotification('Invalid File Type', 'Please upload a PDF file only')
      return
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      showErrorNotification('File Too Large', 'Please upload a file smaller than 10MB')
      return
    }

    try {
      await uploadDocument(file)
      showSuccessNotification('Success', 'Document uploaded successfully')
    } catch (err) {
      console.error('Upload error:', err)
      showErrorNotification('Upload Failed', err instanceof Error ? err.message : 'Failed to upload document')
    }
  }

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await handleFileUpload(file)
      // Clear the input
      event.target.value = ''
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await handleFileUpload(files[0])
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'processing':
        return <AlertCircle className="w-4 h-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isLoaded || userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!clerkUser || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to access the dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {clerkUser.firstName || 'User'}!</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.documents_processed || 0}</div>
              <p className="text-xs text-muted-foreground">
                of {profile?.monthly_limit || 0} monthly limit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {profile?.subscription_tier || 'Free'}
              </div>
              <p className="text-xs text-muted-foreground">
                Current plan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-muted-foreground">
                documents stored
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Integrations Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Integrations
            </CardTitle>
            <CardDescription>
              Connect your favorite tools to automate data workflows and streamline your document processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => router.push('/dashboard/integrations')}
                variant="outline"
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Integrations
              </Button>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                {userIntegrations.filter(i => i.is_active).length} active integration{userIntegrations.filter(i => i.is_active).length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Document
            </CardTitle>
            <CardDescription>
              Upload a PDF document to extract structured data. Supports drag & drop, up to 10MB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                isDragging
                  ? 'border-blue-400 bg-blue-50'
                  : isUploading
                  ? 'border-gray-300 bg-gray-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleInputChange}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                id="file-upload"
              />

              <div className="space-y-4">
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-lg font-medium text-gray-900">Uploading document...</p>
                    <p className="text-sm text-gray-600">Please wait while we process your file</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center">
                      <Upload className={`h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {isDragging ? 'Drop your PDF here' : 'Upload your PDF document'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Drag and drop your file here, or{' '}
                        <label htmlFor="file-upload" className="text-blue-600 hover:text-blue-500 cursor-pointer font-medium">
                          browse to choose a file
                        </label>
                      </p>
                    </div>
                    <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        PDF only
                      </div>
                      <div className="flex items-center">
                        <Upload className="h-4 w-4 mr-1" />
                        Max 10MB
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Secure upload
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Documents</CardTitle>
                <CardDescription>
                  Your 5 most recently uploaded documents
                </CardDescription>
              </div>
              {documents.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/documents')}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  View All Documents
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No documents uploaded yet</p>
                <p className="text-sm text-gray-400">Upload your first PDF to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex items-center space-x-4">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.filename}</h3>
                        <p className="text-sm text-gray-500">
                          {(doc.file_size / 1024 / 1024).toFixed(2)} MB • {doc.file_type}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {doc.confidence_score && (
                        <Badge variant="outline">
                          {Math.round(doc.confidence_score * 100)}% confidence
                        </Badge>
                      )}
                      <Badge className={getStatusColor(doc.processing_status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(doc.processing_status)}
                          <span className="capitalize">{doc.processing_status}</span>
                        </div>
                      </Badge>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/document/${doc.id}`)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>

                        {(doc.processing_status === 'uploaded' || doc.processing_status === 'pending' || doc.processing_status === 'failed') && (
                          <Button
                            size="sm"
                            onClick={() => router.push(`/dashboard/document/${doc.id}`)}
                            className="flex items-center gap-1"
                          >
                            <Zap className="h-3 w-3" />
                            Extract
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {documents.length > 5 && (
                  <div className="pt-4 border-t">
                    <Button
                      variant="ghost"
                      onClick={() => router.push('/dashboard/documents')}
                      className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <FileText className="h-4 w-4" />
                      View All {documents.length} Documents
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
