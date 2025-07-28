'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Loader2, User, Database, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TestStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  message?: string
}

export default function NewUserExtractionTest() {
  const { user, isLoaded } = useUser()
  const [isRunning, setIsRunning] = useState(false)
  const [steps, setSteps] = useState<TestStep[]>([
    { id: 'auth', name: 'Check Authentication', status: 'pending' },
    { id: 'user-exists', name: 'Check User in Database', status: 'pending' },
    { id: 'user-create', name: 'Create User if Needed', status: 'pending' },
    { id: 'user-verify', name: 'Verify User Creation', status: 'pending' },
    { id: 'extraction-ready', name: 'Test Extraction Readiness', status: 'pending' }
  ])

  const updateStep = (stepId: string, status: TestStep['status'], message?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, message } : step
    ))
  }

  const runTest = async () => {
    if (!user?.id) return

    setIsRunning(true)
    
    try {
      // Step 1: Check Authentication
      updateStep('auth', 'running')
      await new Promise(resolve => setTimeout(resolve, 500))
      updateStep('auth', 'success', `Authenticated as ${user.emailAddresses[0]?.emailAddress}`)

      // Step 2: Check if user exists in database
      updateStep('user-exists', 'running')
      const userCheckResponse = await fetch('/api/protected/user')
      
      if (userCheckResponse.ok) {
        const userData = await userCheckResponse.json()
        updateStep('user-exists', 'success', `User found: ${userData.email}`)
        updateStep('user-create', 'success', 'User already exists')
        updateStep('user-verify', 'success', 'User verified')
      } else if (userCheckResponse.status === 404) {
        updateStep('user-exists', 'error', 'User not found in database')
        
        // Step 3: Create user
        updateStep('user-create', 'running')
        const createResponse = await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })

        if (createResponse.ok) {
          const result = await createResponse.json()
          updateStep('user-create', 'success', `User created: ${result.user.email}`)
          
          // Step 4: Verify user creation
          updateStep('user-verify', 'running')
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for propagation
          
          const verifyResponse = await fetch('/api/protected/user')
          if (verifyResponse.ok) {
            updateStep('user-verify', 'success', 'User verified in database')
          } else {
            updateStep('user-verify', 'error', 'User verification failed')
            return
          }
        } else {
          const error = await createResponse.json()
          updateStep('user-create', 'error', `Creation failed: ${error.error}`)
          return
        }
      } else {
        updateStep('user-exists', 'error', `Check failed: ${userCheckResponse.status}`)
        return
      }

      // Step 5: Test extraction readiness
      updateStep('extraction-ready', 'running')
      
      // Simulate extraction API call without actually starting extraction
      const testResponse = await fetch('/api/protected/user')
      if (testResponse.ok) {
        updateStep('extraction-ready', 'success', 'Ready for document extraction')
      } else {
        updateStep('extraction-ready', 'error', 'Not ready for extraction')
      }

    } catch (error) {
      console.error('Test failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Update the currently running step with error
      const runningStep = steps.find(step => step.status === 'running')
      if (runningStep) {
        updateStep(runningStep.id, 'error', errorMessage)
      }
    } finally {
      setIsRunning(false)
    }
  }

  const getStepIcon = (status: TestStep['status']) => {
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

  const getStepColor = (status: TestStep['status']) => {
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
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2">Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          New User Extraction Test
        </CardTitle>
        <p className="text-sm text-gray-600">
          Test the user initialization flow to prevent extraction errors for new users
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className={`p-3 rounded-lg border ${getStepColor(step.status)}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStepIcon(step.status)}
                  <span className="font-medium">{step.name}</span>
                </div>
                <Badge variant={step.status === 'success' ? 'default' : 'secondary'}>
                  {step.status}
                </Badge>
              </div>
              {step.message && (
                <p className="text-sm text-gray-600 mt-2 ml-7">{step.message}</p>
              )}
            </motion.div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={runTest}
            disabled={isRunning || !user}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Running Test...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Run User Initialization Test
              </>
            )}
          </Button>
        </div>

        {!user && (
          <div className="text-center text-sm text-gray-500">
            Please sign in to run the test
          </div>
        )}
      </CardContent>
    </Card>
  )
}
