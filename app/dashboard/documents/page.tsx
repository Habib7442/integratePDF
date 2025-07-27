'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { useDocuments, useNotifications } from '@/components/providers/store-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  FileText,
  Search,
  Filter,
  Trash2,
  Eye,
  ArrowLeft,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Home,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Zap,
  TrendingUp
} from 'lucide-react'
import { Document } from '@/stores/types'

const ITEMS_PER_PAGE = 10

export default function DocumentsPage() {
  const { user: clerkUser, isLoaded } = useUser()
  const router = useRouter()
  const {
    documents,
    isLoading,
    error,
    fetchDocuments,
    deleteDocument,
    deleteMultipleDocuments
  } = useDocuments()
  const { showSuccessNotification, showErrorNotification } = useNotifications()

  // Local state for UI
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingDocuments, setDeletingDocuments] = useState<Set<string>>(new Set())

  // Fetch documents on mount
  useEffect(() => {
    if (isLoaded && clerkUser) {
      fetchDocuments().catch((err) => {
        console.error('Error fetching documents:', err)
        showErrorNotification('Error', 'Failed to load documents')
      })
    }
  }, [isLoaded, clerkUser, fetchDocuments, showErrorNotification])

  // Filter and search documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(doc =>
        doc.filename.toLowerCase().includes(query) ||
        (doc.document_type && doc.document_type.toLowerCase().includes(query))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.processing_status === statusFilter)
    }

    return filtered
  }, [documents, searchQuery, statusFilter])

  // Paginate documents
  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredDocuments.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredDocuments, currentPage])

  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE)

  // Handle document selection
  const toggleDocumentSelection = (documentId: string) => {
    const newSelection = new Set(selectedDocuments)
    if (newSelection.has(documentId)) {
      newSelection.delete(documentId)
    } else {
      newSelection.add(documentId)
    }
    setSelectedDocuments(newSelection)
  }

  const selectAllDocuments = () => {
    if (selectedDocuments.size === paginatedDocuments.length) {
      setSelectedDocuments(new Set())
    } else {
      setSelectedDocuments(new Set(paginatedDocuments.map(doc => doc.id)))
    }
  }

  // Handle single document deletion
  const handleDeleteDocument = async (documentId: string) => {
    setDeletingDocuments(prev => new Set(prev).add(documentId))
    
    try {
      await deleteDocument(documentId)
      showSuccessNotification('Success', 'Document deleted successfully')
      setSelectedDocuments(prev => {
        const newSet = new Set(prev)
        newSet.delete(documentId)
        return newSet
      })
    } catch (error) {
      console.error('Delete error:', error)
      showErrorNotification('Error', 'Failed to delete document')
    } finally {
      setDeletingDocuments(prev => {
        const newSet = new Set(prev)
        newSet.delete(documentId)
        return newSet
      })
    }
  }

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedDocuments.size === 0) return

    setIsDeleting(true)
    const documentsToDelete = Array.from(selectedDocuments)

    try {
      const results = await deleteMultipleDocuments(documentsToDelete)

      setSelectedDocuments(new Set())

      if (results.success.length > 0) {
        showSuccessNotification('Success', `${results.success.length} document(s) deleted successfully`)
      }
      if (results.failed.length > 0) {
        showErrorNotification('Error', `Failed to delete ${results.failed.length} document(s)`)
      }
    } catch (error) {
      console.error('Bulk delete error:', error)
      showErrorNotification('Error', 'Failed to delete documents')
    } finally {
      setIsDeleting(false)
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case 'processing':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        )
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </motion.button>

            <motion.button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home className="h-4 w-4" />
              Home
            </motion.button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Document Management
              </h1>
              <p className="text-xl text-slate-600 mt-2">
                Manage all your uploaded and processed documents
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">{filteredDocuments.length}</div>
                <div className="text-sm text-slate-600">of {documents.length} documents</div>
              </div>
              <AnimatePresence>
                {selectedDocuments.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          disabled={isDeleting}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Delete Selected ({selectedDocuments.size})
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border-slate-200">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-slate-900">Delete Documents</AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-600">
                            Are you sure you want to delete {selectedDocuments.size} selected document(s)?
                            This action cannot be undone and will permanently remove the documents and all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                          >
                            Delete Documents
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-white to-slate-50/50 border-slate-200 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <Input
                      placeholder="Search documents by filename or type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 text-lg bg-white/80 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px] h-12 bg-white/80 backdrop-blur-sm border-slate-200 rounded-xl">
                      <Filter className="h-4 w-4 mr-2 text-slate-500" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 rounded-xl shadow-xl">
                      <SelectItem value="all" className="rounded-lg">All Status</SelectItem>
                      <SelectItem value="completed" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Completed
                        </div>
                      </SelectItem>
                      <SelectItem value="processing" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
                          Processing
                        </div>
                      </SelectItem>
                      <SelectItem value="pending" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-yellow-500" />
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value="failed" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-3 w-3 text-red-500" />
                          Failed
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {(searchQuery || statusFilter !== 'all') && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        onClick={() => { setSearchQuery(''); setStatusFilter('all') }}
                        className="h-12 px-6 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-slate-300 rounded-xl"
                      >
                        Clear Filters
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Documents List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-white to-slate-50/50 border-slate-200 shadow-lg">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900">Documents</CardTitle>
                    <CardDescription className="text-slate-600 mt-1">
                      {filteredDocuments.length} document(s) found
                    </CardDescription>
                  </div>
                </div>
                {paginatedDocuments.length > 0 && (
                  <motion.div
                    className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Checkbox
                      checked={selectedDocuments.size === paginatedDocuments.length && paginatedDocuments.length > 0}
                      onCheckedChange={selectAllDocuments}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <span className="text-sm font-medium text-slate-700">Select All</span>
                  </motion.div>
                )}
              </div>
            </CardHeader>
            <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading documents...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => fetchDocuments()}>Try Again</Button>
              </div>
            ) : paginatedDocuments.length === 0 ? (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <FileText className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {filteredDocuments.length === 0 && documents.length > 0
                    ? 'No documents match your filters'
                    : 'No documents found'
                  }
                </h3>
                <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
                  {filteredDocuments.length === 0 && documents.length > 0
                    ? 'Try adjusting your search or filter criteria to find what you\'re looking for'
                    : 'Upload your first document to get started with AI-powered data extraction'
                  }
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {filteredDocuments.length === 0 && documents.length > 0 ? (
                    <Button
                      onClick={() => { setSearchQuery(''); setStatusFilter('all') }}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-3 text-lg"
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <Button
                      onClick={() => router.push('/dashboard')}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-3 text-lg"
                    >
                      Upload Document
                    </Button>
                  )}
                </motion.div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {paginatedDocuments.map((document, index) => (
                    <motion.div
                      key={document.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -2, scale: 1.01 }}
                      className="group"
                    >
                      <div className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-6">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Checkbox
                              checked={selectedDocuments.has(document.id)}
                              onCheckedChange={() => toggleDocumentSelection(document.id)}
                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 w-5 h-5"
                            />
                          </motion.div>
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <FileText className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors text-lg">
                                {document.filename}
                              </h3>
                              {getStatusBadge(document.processing_status)}
                            </div>
                            <div className="flex items-center gap-6 text-sm text-slate-500">
                              <span className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {new Date(document.created_at).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                {formatFileSize(document.file_size)}
                              </span>
                              {document.document_type && (
                                <span className="capitalize bg-slate-100 px-2 py-1 rounded-lg text-xs font-medium">
                                  {document.document_type}
                                </span>
                              )}
                              {document.confidence_score && (
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">
                                  {Math.round(document.confidence_score * 100)}% confidence
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/document/${document.id}`)}
                              className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-slate-300"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </motion.div>

                          {document.processing_status === 'completed' && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/dashboard/document/${document.id}`)}
                                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              >
                                <Zap className="h-4 w-4 mr-2" />
                                Extract
                              </Button>
                            </motion.div>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={deletingDocuments.has(document.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                  {deletingDocuments.has(document.id) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </motion.div>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white border-slate-200">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-slate-900">Delete Document</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-600">
                                  Are you sure you want to delete "{document.filename}"?
                                  This action cannot be undone and will permanently remove the document and all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteDocument(document.id)}
                                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                                >
                                  Delete Document
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                className="flex items-center justify-between mt-8 pt-8 border-t border-slate-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="text-sm text-slate-600 font-medium">
                  Showing <span className="text-slate-900 font-semibold">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to{' '}
                  <span className="text-slate-900 font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredDocuments.length)}</span> of{' '}
                  <span className="text-slate-900 font-semibold">{filteredDocuments.length}</span> documents
                </div>
                <div className="flex items-center gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-slate-300 disabled:opacity-50"
                    >
                      Previous
                    </Button>
                  </motion.div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Page</span>
                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold">
                      {currentPage}
                    </div>
                    <span className="text-sm text-slate-600">of {totalPages}</span>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-slate-300 disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
