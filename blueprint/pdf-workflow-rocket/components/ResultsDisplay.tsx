import React from 'react';
import type { ExtractedData, Integration } from '../types';
import { INTEGRATIONS } from '../constants';

interface ResultsDisplayProps {
  data: ExtractedData;
  integrationId: string;
  onReset: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, integrationId, onReset }) => {
  const selectedIntegration = INTEGRATIONS.find(i => i.id === integrationId);

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 rounded-xl shadow-2xl p-8 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Extraction Complete!</h2>
        <p className="text-slate-400 mt-2">
          Data from <span className="font-semibold text-indigo-300">{data.fileName}</span> has been successfully processed.
        </p>
      </div>

      {selectedIntegration && (
        <div className="flex items-center justify-center gap-4 bg-green-900/50 border border-green-700 text-green-300 rounded-lg p-3 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <p className="font-semibold">Successfully pushed to {selectedIntegration.name}</p>
          <div className="text-green-300">
            {React.isValidElement(selectedIntegration.icon) &&
              React.cloneElement(selectedIntegration.icon, { className: 'w-6 h-6' })}
          </div>
        </div>
      )}

      <div className="bg-slate-900 rounded-lg p-6 mb-6 max-h-80 overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-4">Extracted Data</h3>
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-800">
            <tr>
              <th scope="col" className="px-4 py-3 rounded-l-lg">Key</th>
              <th scope="col" className="px-4 py-3 rounded-r-lg">Value</th>
            </tr>
          </thead>
          <tbody>
            {data.structuredData.map((item, index) => (
              <tr key={index} className="border-b border-slate-700">
                <td className="px-4 py-3 font-medium text-slate-200 whitespace-nowrap">{item.key}</td>
                <td className="px-4 py-3">{item.value}</td>
              </tr>
            ))}
             {data.structuredData.length === 0 && (
                <tr>
                    <td colSpan={2} className="text-center py-4 text-slate-500">No structured data was extracted.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-center">
        <button
          onClick={onReset}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
        >
          Process Another Document
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
