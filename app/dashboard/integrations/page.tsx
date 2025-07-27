'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useIntegrations } from '@/stores'
import { INTEGRATIONS, getIntegrationById } from '@/lib/integrations'
import IntegrationSelector from '@/components/integrations/IntegrationSelector'
import NotionDatabaseManager from '@/components/integrations/NotionDatabaseManager'
import {
  ArrowLeft,
  Settings,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Home,
  Zap,
  Sparkles,
  Activity,
  Link
} from 'lucide-react'

export default function IntegrationsPage() {
  const { user: clerkUser, isLoaded } = useUser()
  const router = useRouter()
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)
  const [showConnectForm, setShowConnectForm] = useState(false)

  const {
    userIntegrations,
    isLoading,
    error,
    fetchUserIntegrations,
    disconnectIntegration,
    connectIntegration,
    testIntegrationConnection,
    clearError
  } = useIntegrations()

  useEffect(() => {
    if (isLoaded && clerkUser) {
      fetchUserIntegrations()
    }
  }, [isLoaded, clerkUser, fetchUserIntegrations])

  const handleDisconnect = async (integrationId: string) => {
    if (confirm('Are you sure you want to disconnect this integration?')) {
      await disconnectIntegration(integrationId)
    }
  }

  const handleAddDatabase = async (database: { name: string; api_key: string; database_id: string }) => {
    await connectIntegration('notion', {
      api_key: database.api_key,
      database_id: database.database_id
    }, database.name)
  }

  const handleTestDatabase = async (database: { name: string; api_key: string; database_id: string }) => {
    const result = await testIntegrationConnection('notion', {
      api_key: database.api_key,
      database_id: database.database_id
    })
    return result.success
  }

  const getStatusBadge = (integration: any) => {
    if (integration.is_active) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Connected
        </Badge>
      )
    } else {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Disconnected
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
          <div className="flex items-center gap-4 mb-8">
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
                Integrations
              </h1>
              <p className="text-xl text-slate-600 mt-2">
                Connect your favorite tools to automate data workflows
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setShowConnectForm(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg px-6 py-3 text-lg"
                size="lg"
              >
                <Plus className="h-5 w-5" />
                Add Integration
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                  <motion.button
                    onClick={clearError}
                    className="p-2 hover:bg-red-200 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <XCircle className="h-5 w-5 text-red-600" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Available Integrations */}
        <AnimatePresence>
          {showConnectForm && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-white to-violet-50/50 border-violet-200 shadow-lg">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Link className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-slate-900">Connect New Integration</CardTitle>
                        <CardDescription className="text-slate-600 mt-1">
                          Choose an integration to connect to your account
                        </CardDescription>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => setShowConnectForm(false)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <XCircle className="h-5 w-5 text-slate-500" />
                    </motion.button>
                  </div>
                </CardHeader>
                <CardContent>
                  <IntegrationSelector
                    selectedIntegration={selectedIntegration}
                    onSelect={(id) => {
                      setSelectedIntegration(id)
                      // Navigate to connection flow
                      router.push(`/dashboard/integrations/connect/${id}`)
                    }}
                    showOnlyAvailable={true}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connected Integrations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-white to-slate-50/50 border-slate-200 shadow-lg">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900">Your Integrations</CardTitle>
                  <CardDescription className="text-slate-600 mt-1">
                    Manage your connected integrations and their settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <motion.div
                  className="text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative mx-auto w-16 h-16 mb-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-lg font-medium text-slate-700">Loading integrations...</p>
                </motion.div>
              ) : userIntegrations.length === 0 ? (
                <motion.div
                  className="text-center py-20"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <ExternalLink className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">No integrations connected</h3>
                  <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
                    Connect your first integration to start automating your data workflows
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => setShowConnectForm(true)}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 px-8 py-3 text-lg"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Your First Integration
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {userIntegrations.map((integration, index) => {
                      const integrationDef = getIntegrationById(integration.integration_type)

                      return (
                        <motion.div
                          key={integration.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ y: -2, scale: 1.01 }}
                          className="group"
                        >
                          <div className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center space-x-6">
                              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                {integrationDef?.icon ? integrationDef.icon() : <ExternalLink className="h-7 w-7 text-white" />}
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                                  {integration.integration_name}
                                </h3>
                                <p className="text-slate-600 mt-1">
                                  {integrationDef?.description}
                                </p>
                                <div className="flex items-center gap-4 mt-3">
                                  {getStatusBadge(integration)}
                                  {integration.last_sync && (
                                    <span className="text-sm text-slate-500 flex items-center gap-1">
                                      <Sparkles className="h-3 w-3" />
                                      Last sync: {new Date(integration.last_sync).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/dashboard/integrations/${integration.id}`)}
                                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-slate-300"
                                >
                                  <Settings className="h-4 w-4 mr-2" />
                                  Settings
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDisconnect(integration.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Notion Database Manager */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-white to-blue-50/30 border-blue-200 shadow-lg">
            <CardContent className="p-8">
              <NotionDatabaseManager
                userIntegrations={userIntegrations}
                onAddDatabase={handleAddDatabase}
                onRemoveDatabase={handleDisconnect}
                onTestDatabase={handleTestDatabase}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
