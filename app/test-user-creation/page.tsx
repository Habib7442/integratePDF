'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, User, Database, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface TestResult {
  step: string
  status: 'pending' | 'running' | 'success' | 'error'
  message?: string
  data?: any
}

export default function TestUserCreationPage() {
  const { user, isLoaded } = useUser()
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])

  const updateResult = (step: string, status: TestResult['status'], message?: string, data?: any) => {
    setResults(prev => {
      const existing = prev.find(r => r.step === step)
      if (existing) {
        return prev.map(r => r.step === step ? { ...r, status, message, data } : r)
      } else {
        return [...prev, { step, status, message, data }]
      }
    })
  }

  const runTest = async () => {
    if (!user?.id) return

    setIsRunning(true)
    setResults([])

    try {
      // Step 1: Check current user count
      updateResult('count-before', 'running', 'Checking current user count...')
      const beforeResponse = await fetch('/api/test/user-count')

      if (!beforeResponse.ok) {
        const beforeError = await beforeResponse.json()
        updateResult('count-before', 'error', `Failed to get user count: ${beforeError.error}`, beforeError)
        return
      }

      const beforeData = await beforeResponse.json()
      const beforeCount = typeof beforeData.count === 'number' ? beforeData.count : 0
      updateResult('count-before', 'success', `Found ${beforeCount} users before test`, beforeData)

      // Step 2: Check if user exists (webhook should have created it)
      updateResult('sync-call', 'running', 'Checking if user exists in database...')
      const userCheckResponse = await fetch('/api/protected/user')

      if (userCheckResponse.ok) {
        const userData = await userCheckResponse.json()
        updateResult('sync-call', 'success', `User found in database: ${userData.user.email}`, userData)
      } else {
        const userError = await userCheckResponse.json()
        updateResult('sync-call', 'error', `User not found: ${userError.error}`, userError)
        return
      }

      // Step 3: Check user count after
      updateResult('count-after', 'running', 'Checking user count after sync...')
      const afterResponse = await fetch('/api/test/user-count')

      if (!afterResponse.ok) {
        const afterError = await afterResponse.json()
        updateResult('count-after', 'error', `Failed to get user count: ${afterError.error}`, afterError)
        return
      }

      const afterData = await afterResponse.json()
      const afterCount = typeof afterData.count === 'number' ? afterData.count : 0
      updateResult('count-after', 'success', `Found ${afterCount} users after test`, afterData)

      // Step 4: Check user again to verify consistency
      updateResult('sync-duplicate', 'running', 'Verifying user consistency...')
      const verifyResponse = await fetch('/api/protected/user')

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json()
        updateResult('sync-duplicate', 'success', `User verified: ${verifyData.user.email}`, verifyData)
      } else {
        const verifyError = await verifyResponse.json()
        updateResult('sync-duplicate', 'error', `Verification failed: ${verifyError.error}`, verifyError)
      }

      // Step 5: Final count check
      updateResult('count-final', 'running', 'Final user count check...')
      const finalResponse = await fetch('/api/test/user-count')

      if (!finalResponse.ok) {
        const finalError = await finalResponse.json()
        updateResult('count-final', 'error', `Failed to get user count: ${finalError.error}`, finalError)
        return
      }

      const finalData = await finalResponse.json()
      const finalCount = typeof finalData.count === 'number' ? finalData.count : 0
      updateResult('count-final', 'success', `Final count: ${finalCount} users`, finalData)

      // Analysis
      const countBefore = beforeCount
      const countAfter = afterCount
      const countFinal = finalCount

      console.log('Analysis data:', { countBefore, countAfter, countFinal })

      if (typeof countBefore !== 'number' || typeof countAfter !== 'number' || typeof countFinal !== 'number') {
        updateResult('analysis', 'error', `Invalid count data: Before=${countBefore}, After=${countAfter}, Final=${countFinal}`)
      } else if (countAfter === countBefore + 1 && countFinal === countAfter) {
        updateResult('analysis', 'success', 'Perfect! User created once, no duplicates')
      } else if (countAfter === countBefore && countFinal === countAfter) {
        updateResult('analysis', 'success', 'Good! User already existed, no duplicates created')
      } else {
        updateResult('analysis', 'error', `Issue detected: Before=${countBefore}, After=${countAfter}, Final=${countFinal}`)
      }

    } catch (error) {
      updateResult('error', 'error', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return 'border-blue-200 bg-blue-50'
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Creation Test
            </CardTitle>
            <p className="text-sm text-gray-600">
              Test the user sync API to ensure no duplicate users are created
            </p>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <p><strong>Clerk User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              </div>
            ) : (
              <p className="text-red-600">Please sign in to run the test</p>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.length === 0 && !isRunning && (
              <p className="text-gray-500 text-center py-8">Click "Run Test" to start</p>
            )}

            {results.map((result, index) => (
              <motion.div
                key={result.step}
                className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.step}</span>
                  </div>
                  <Badge variant={result.status === 'success' ? 'default' : 'secondary'}>
                    {result.status}
                  </Badge>
                </div>
                {result.message && (
                  <p className="text-sm text-gray-600 mt-2 ml-7">{result.message}</p>
                )}
                {result.data && (
                  <details className="mt-2 ml-7">
                    <summary className="text-xs text-gray-500 cursor-pointer">View Data</summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={runTest}
            disabled={isRunning || !user}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running Test...
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Run Test
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => setResults([])}
            disabled={isRunning}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Results
          </Button>
        </div>
      </div>
    </div>
  )
}
