'use client'

import React from 'react'
import { UserIntegration } from '@/stores/types'
import { getIntegrationById } from '@/lib/integrations'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock } from 'lucide-react'

interface UserIntegrationSelectorProps {
  userIntegrations: UserIntegration[]
  selectedIntegration: string | null
  onSelect: (integrationId: string) => void
  className?: string
}

const UserIntegrationSelector: React.FC<UserIntegrationSelectorProps> = ({
  userIntegrations,
  selectedIntegration,
  onSelect,
  className = ""
}) => {
  if (userIntegrations.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-500 mb-2">No integrations connected</div>
        <div className="text-sm text-gray-400">
          Connect an integration to push data automatically
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      <h3 className="block mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
        Select Integration
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {userIntegrations.map((userIntegration) => {
          const integrationConfig = getIntegrationById(userIntegration.integration_type)
          const isSelected = selectedIntegration === userIntegration.id
          
          return (
            <button
              key={userIntegration.id}
              type="button"
              onClick={() => onSelect(userIntegration.id)}
              className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all duration-200 text-left
                ${isSelected
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50 shadow-lg'
                  : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {integrationConfig?.icon()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {userIntegration.integration_name}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                    {userIntegration.integration_type}
                  </div>
                  {userIntegration.last_sync && (
                    <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      Last sync: {new Date(userIntegration.last_sync).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {userIntegration.is_active ? (
                  <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
                
                {isSelected && (
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default UserIntegrationSelector
