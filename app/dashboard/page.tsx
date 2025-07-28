'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth, useDocuments, useNotifications, useIntegrations } from '@/components/providers/store-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DevUserCreator from '@/components/dev/dev-user-creator'
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
  ExternalLink,
  Home,
  TrendingUp,
  Activity,
  Sparkles
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
      // Refresh documents list to show the new document immediately
      await fetchDocuments()
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgb(59 130 246) 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <motion.div
          className="mb-8 sm:mb-10 lg:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 mt-1 sm:mt-2">
                Welcome back, {clerkUser.firstName || 'User'}!
                <span className="hidden sm:inline text-slate-500"> Ready to process some documents?</span>
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-slate-300 transition-all duration-200 min-h-[44px]"
              >
                <Home className="w-4 h-4" />
                <span className="sm:inline">Home</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Development User Creator */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div
            className="mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <DevUserCreator onUserCreated={() => {
              // Refresh user data after creation
              fetchUserProfile()
              fetchDocuments()
            }} />
          </motion.div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start sm:items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 sm:mt-0 flex-shrink-0" />
              <p className="text-red-700 text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Documents Processed Card */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
                <CardTitle className="text-xs sm:text-sm font-semibold text-slate-700">Documents Processed</CardTitle>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  {profile?.documents_processed || 0}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(((profile?.documents_processed || 0) / (profile?.monthly_limit || 1)) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
                    {profile?.monthly_limit || 0} limit
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
                    {((profile?.documents_processed || 0) / (profile?.monthly_limit || 1) * 100).toFixed(0)}% used this month
                  </span>
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subscription Card */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
                <CardTitle className="text-xs sm:text-sm font-semibold text-slate-700">Subscription</CardTitle>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 capitalize">
                  {profile?.subscription_tier || 'Free'}
                </div>
                <Badge
                  className={`mb-3 text-xs ${
                    profile?.subscription_tier === 'pro'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                      : profile?.subscription_tier === 'business'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                      : 'bg-gradient-to-r from-slate-500 to-slate-600 text-white'
                  }`}
                >
                  {profile?.subscription_tier === 'free' ? 'Starter Plan' :
                   profile?.subscription_tier === 'pro' ? 'Professional' : 'Enterprise'}
                </Badge>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">Active since {new Date().toLocaleDateString()}</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Storage Card */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
                <CardTitle className="text-xs sm:text-sm font-semibold text-slate-700">Storage Used</CardTitle>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Database className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  {documents.length}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mb-2">
                  documents stored
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Activity className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
                    {documents.filter(doc => doc.processing_status === 'completed').length} processed successfully
                  </span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Integrations Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8 sm:mb-10 lg:mb-12"
        >
          <Card className="bg-gradient-to-br from-white to-slate-50/50 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg sm:text-xl text-slate-900">Integrations</CardTitle>
                    <CardDescription className="text-slate-600 mt-1 text-sm sm:text-base">
                      Connect your favorite tools to automate data workflows
                    </CardDescription>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs">
                    {userIntegrations.filter(i => i.is_active).length} Active
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <motion.div
                  className="w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => router.push('/dashboard/integrations')}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg min-h-[44px]"
                    size="lg"
                  >
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Manage Integrations
                  </Button>
                </motion.div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center text-slate-600">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                    <span className="truncate">
                      {userIntegrations.filter(i => i.is_active).length} active integration{userIntegrations.filter(i => i.is_active).length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Zap className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                    <span>Auto-sync enabled</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8 sm:mb-10 lg:mb-12"
        >
          <Card className="bg-gradient-to-br from-white to-blue-50/30 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4 sm:pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl text-slate-900">Upload Document</CardTitle>
                  <CardDescription className="text-slate-600 mt-1 text-sm sm:text-base">
                    Upload a PDF document to extract structured data. Supports drag & drop, up to 10MB.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <motion.div
                className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 lg:p-12 text-center transition-all duration-300 ${
                  isDragging
                    ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105'
                    : isUploading
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-slate-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                whileHover={{ scale: isDragging ? 1.05 : 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleInputChange}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  id="file-upload"
                />

                <div className="space-y-4 sm:space-y-6">
                  {isUploading ? (
                    <motion.div
                      className="flex flex-col items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200 border-t-blue-600 mb-4 sm:mb-6"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-lg sm:text-xl font-semibold text-slate-900">Uploading document...</p>
                      <p className="text-sm text-slate-600">Please wait while we process your file</p>
                    </motion.div>
                  ) : (
                    <>
                      <motion.div
                        className="flex justify-center"
                        animate={{
                          scale: isDragging ? 1.1 : 1,
                          rotate: isDragging ? 5 : 0
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                          isDragging
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                            : 'bg-gradient-to-br from-slate-100 to-slate-200'
                        }`}>
                          <Upload className={`h-10 w-10 ${isDragging ? 'text-white' : 'text-slate-500'}`} />
                        </div>
                      </motion.div>
                      <div>
                        <p className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
                          {isDragging ? 'Drop your PDF here' : 'Upload your PDF document'}
                        </p>
                        <p className="text-sm sm:text-base text-slate-600">
                          <span className="hidden sm:inline">Drag and drop your file here, or </span>
                          <label htmlFor="file-upload" className="text-blue-600 hover:text-blue-700 cursor-pointer font-semibold underline decoration-2 underline-offset-2">
                            <span className="sm:hidden">Tap to choose a file</span>
                            <span className="hidden sm:inline">browse to choose a file</span>
                          </label>
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-4">
                        {[
                          { icon: FileText, text: 'PDF only', color: 'text-blue-600' },
                          { icon: Upload, text: 'Max 10MB', color: 'text-indigo-600' },
                          { icon: CheckCircle, text: 'Secure upload', color: 'text-green-600' }
                        ].map((item, index) => (
                          <motion.div
                            key={item.text}
                            className="flex items-center gap-2 text-xs sm:text-sm font-medium"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <item.icon className={`h-4 w-4 ${item.color} flex-shrink-0`} />
                            <span className="text-slate-600">{item.text}</span>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="bg-gradient-to-br from-white to-slate-50/50 border-slate-200 shadow-lg">
            <CardHeader className="pb-4 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg sm:text-xl text-slate-900">Recent Documents</CardTitle>
                    <CardDescription className="text-slate-600 mt-1 text-sm sm:text-base">
                      Your {Math.min(documents.length, 5)} most recently uploaded documents
                    </CardDescription>
                  </div>
                </div>
                {documents.length > 0 && (
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        onClick={() => router.push('/dashboard/documents')}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-slate-300 min-h-[44px]"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="sm:inline">View All Documents</span>
                      </Button>
                    </motion.div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
            {documents.length === 0 ? (
              <motion.div
                className="text-center py-8 sm:py-12 lg:py-16 px-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">No documents uploaded yet</h3>
                <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 max-w-md mx-auto">Upload your first PDF to get started with AI-powered data extraction</p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 min-h-[44px]"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Your First Document
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {documents.slice(0, 5).filter(doc => doc && doc.id).map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base truncate">
                            {doc.filename || 'Unknown file'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 mt-1">
                            <span className="whitespace-nowrap">{doc.file_size ? (doc.file_size / 1024 / 1024).toFixed(2) : '0.00'} MB</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline truncate">{doc.file_type || 'Unknown type'}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="whitespace-nowrap">{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Unknown date'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-3">
                        {/* Status and Confidence Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {doc.confidence_score !== null && doc.confidence_score !== undefined && !isNaN(doc.confidence_score) && (
                            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 text-xs">
                              {Math.round(doc.confidence_score * 100)}% confidence
                            </Badge>
                          )}
                          <Badge className={`${getStatusColor(doc.processing_status || 'uploaded')} font-medium text-xs`}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(doc.processing_status || 'uploaded')}
                              <span className="capitalize">{doc.processing_status || 'uploaded'}</span>
                            </div>
                          </Badge>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/document/${doc.id}`)}
                              className="w-full sm:w-auto flex items-center justify-center gap-1 bg-white/80 backdrop-blur-sm min-h-[36px]"
                            >
                              <Eye className="h-3 w-3" />
                              <span>View</span>
                            </Button>
                          </motion.div>

                          {(doc.processing_status === 'uploaded' || doc.processing_status === 'pending' || doc.processing_status === 'failed') && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                              <Button
                                size="sm"
                                onClick={() => router.push(`/dashboard/document/${doc.id}`)}
                                className="w-full sm:w-auto flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 min-h-[36px]"
                              >
                                <Zap className="h-3 w-3" />
                                <span>Extract</span>
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {documents.length > 5 && (
                  <motion.div
                    className="pt-4 sm:pt-6 border-t border-slate-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="ghost"
                        onClick={() => router.push('/dashboard/documents')}
                        className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-3 rounded-xl min-h-[44px]"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="text-sm sm:text-base">View All {documents.length} Documents</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
