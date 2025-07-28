'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, User, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DevUserCreatorProps {
  onUserCreated?: () => void
}

export default function DevUserCreator({ onUserCreated }: DevUserCreatorProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'checking' | 'creating' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [userExists, setUserExists] = useState<boolean | null>(null)

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const checkUserExists = async () => {
    setLoading(true)
    setStatus('checking')
    
    try {
      const response = await fetch('/api/dev/create-user', {
        method: 'GET'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setUserExists(data.exists)
        setMessage(data.exists ? `User exists: ${data.user?.email}` : 'User not found in database')
        setStatus(data.exists ? 'success' : 'idle')
      } else {
        setMessage(data.error || 'Failed to check user')
        setStatus('error')
      }
    } catch (error) {
      setMessage('Network error while checking user')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const createUser = async () => {
    setLoading(true)
    setStatus('creating')
    
    try {
      const response = await fetch('/api/dev/create-user', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setUserExists(true)
        setMessage(data.action === 'created_new' 
          ? `✅ User created: ${data.user?.email}` 
          : `✅ User already exists: ${data.user?.email}`
        )
        setStatus('success')
        
        if (onUserCreated) {
          onUserCreated()
        }
      } else {
        setMessage(data.error || 'Failed to create user')
        setStatus('error')
      }
    } catch (error) {
      setMessage('Network error while creating user')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-orange-600" />
          <CardTitle className="text-sm text-orange-800">Development Mode</CardTitle>
          <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
            DEV ONLY
          </Badge>
        </div>
        <CardDescription className="text-xs text-orange-700">
          Webhook not working? Manually create your user in the database.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {message && (
          <Alert className={`text-xs ${
            status === 'success' ? 'border-green-200 bg-green-50' : 
            status === 'error' ? 'border-red-200 bg-red-50' : 
            'border-blue-200 bg-blue-50'
          }`}>
            <div className="flex items-center gap-2">
              {status === 'success' && <CheckCircle className="w-3 h-3 text-green-600" />}
              {status === 'error' && <AlertCircle className="w-3 h-3 text-red-600" />}
              <AlertDescription className="text-xs">
                {message}
              </AlertDescription>
            </div>
          </Alert>
        )}
        
        <div className="flex gap-2">
          <Button
            onClick={checkUserExists}
            disabled={loading}
            variant="outline"
            size="sm"
            className="text-xs border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            {loading && status === 'checking' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
            Check User
          </Button>
          
          <Button
            onClick={createUser}
            disabled={loading || userExists === true}
            size="sm"
            className="text-xs bg-orange-600 hover:bg-orange-700"
          >
            {loading && status === 'creating' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
            {userExists ? 'User Exists' : 'Create User'}
          </Button>
        </div>
        
        <p className="text-xs text-orange-600">
          💡 For production setup, configure webhooks with ngrok. See docs/LOCAL_WEBHOOK_SETUP.md
        </p>
      </CardContent>
    </Card>
  )
}
