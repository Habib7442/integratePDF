import React from 'react';
import { Integration } from '@/stores/types';
import { INTEGRATIONS, getAvailableIntegrations } from '@/lib/integrations';

interface IntegrationSelectorProps {
  selectedIntegration: string | null;
  onSelect: (id: Integration['id']) => void;
  showOnlyAvailable?: boolean;
  className?: string;
}

const IntegrationSelector: React.FC<IntegrationSelectorProps> = ({ 
  selectedIntegration, 
  onSelect, 
  showOnlyAvailable = true,
  className = ""
}) => {
  const integrations = showOnlyAvailable ? getAvailableIntegrations() : INTEGRATIONS;

  return (
    <div className={`w-full ${className}`}>
      <h3 className="block mb-3 text-sm font-medium text-slate-300">
        Push to...
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <button
            key={integration.id}
            type="button"
            onClick={() => onSelect(integration.id)}
            disabled={!integration.isAvailable}
            className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all duration-200 relative
            ${selectedIntegration === integration.id
              ? 'border-indigo-500 bg-indigo-900/50 text-white shadow-lg'
              : integration.isAvailable
                ? 'border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-slate-500 text-slate-300'
                : 'border-slate-600 bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {!integration.isAvailable && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-200">
                  Soon
                </span>
              </div>
            )}
            
            <div className="mb-2">
              {integration.icon()}
            </div>
            
            <span className="text-sm font-semibold text-center">
              {integration.name}
            </span>
            
            <p className="text-xs text-center mt-1 text-slate-400">
              {integration.description}
            </p>
          </button>
        ))}
      </div>
      
      {integrations.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400">
            No integrations available
          </p>
        </div>
      )}
    </div>
  );
};

export default IntegrationSelector;
