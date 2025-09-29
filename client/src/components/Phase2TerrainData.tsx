import React from 'react';

/**
 * Phase 2 - Collecte des données terrain
 * Composant pour l'affichage des questionnaires techniques
 */
export const Phase2TerrainData: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        📋 Phase 2 - Questionnaire Technique
      </h2>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          Collecte des données techniques pour l'évaluation d'infrastructure datacenter selon les standards TIA-942.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Status d'injection</h3>
          <p className="text-blue-800 text-sm">
            En attente d'injection des données générées par l'orchestrateur MCP.
          </p>
        </div>
      </div>
      
      {/* Zone d'injection - Ligne 1016 */}
      
    </div>
  );
};

export default Phase2TerrainData;