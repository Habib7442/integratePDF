
import React from 'react';
import type { Integration } from '../types';
import { INTEGRATIONS } from '../constants';

interface IntegrationSelectorProps {
  selectedIntegration: string | null;
  onSelect: (id: Integration['id']) => void;
}

const IntegrationSelector: React.FC<IntegrationSelectorProps> = ({ selectedIntegration, onSelect }) => {
  return (
    <div className="w-full">
      <h3 className="block mb-3 text-sm font-medium text-slate-300">Push to...</h3>
      <div className="grid grid-cols-3 gap-4">
        {INTEGRATIONS.map((integration) => (
          <button
            key={integration.id}
            type="button"
            onClick={() => onSelect(integration.id)}
            className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all duration-200
            ${selectedIntegration === integration.id
              ? 'border-indigo-500 bg-indigo-900/50 text-white shadow-lg'
              : 'border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-slate-500 text-slate-300'
            }`}
          >
            {integration.icon}
            <span className="mt-2 text-sm font-semibold">{integration.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default IntegrationSelector;
