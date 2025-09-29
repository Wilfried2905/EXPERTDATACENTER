import React from 'react';

/**
 * Phase 2.5 - Questionnaire Business Client
 * Composant pour l'affichage des questionnaires clients
 */
export const Phase25ClientQuestionnaire: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        👥 Phase 2.5 - Questionnaire Business
      </h2>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          Collecte des besoins et objectifs business pour l'alignement stratégique du projet datacenter.
        </p>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">Status d'injection</h3>
          <p className="text-green-800 text-sm">
            En attente d'injection des questionnaires générés par l'orchestrateur MCP.
          </p>
        </div>
      </div>
      
      {/* Zone d'injection - Ligne 2857 */}
      
    </div>
  );
};

export default Phase25ClientQuestionnaire;