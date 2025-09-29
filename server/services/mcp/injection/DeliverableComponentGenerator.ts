import { promises as fs } from 'fs';
import path from 'path';

export class DeliverableComponentGenerator {
  private readonly clientPath = './client/src';
  private readonly componentDir = './client/src/components/livrables';

  constructor() {
    this.ensureDirectoryExists();
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.mkdir(this.componentDir, { recursive: true });
    } catch (error) {
      console.warn('Directory might already exist:', error);
    }
  }

  /**
   * Sanitize deliverable name to create valid component name
   */
  sanitizeComponentName(deliverableName: string): string {
    return deliverableName
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/^(\d)/, 'Livrable_$1') // Prefix if starts with number
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Generate component file path for a deliverable
   */
  getComponentPath(deliverableName: string): string {
    const componentName = this.sanitizeComponentName(deliverableName);
    return `components/livrables/${componentName}.tsx`;
  }

  /**
   * Generate React component template for a specific deliverable
   */
  generateComponentTemplate(deliverableName: string, componentName: string): string {
    return `import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Building2, CheckCircle } from 'lucide-react';

interface ${componentName}Props {
  deliverableId?: number;
  onDataChange?: (phase: string, data: any) => void;
}

export default function ${componentName}({ deliverableId, onDataChange }: ${componentName}Props) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentPhase, setCurrentPhase] = useState<'phase2' | 'phase25' | 'phase3'>('phase2');

  const handleChange = (fieldName: string, value: any) => {
    const newData = { ...formData, [fieldName]: value };
    setFormData(newData);
    onDataChange?.(currentPhase, newData);
  };

  const renderPhase2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Phase 2 - Collecte Existant Technique</h3>
      </div>
      
      {/* 🎯 ZONE D'INJECTION PHASE 2 - Ligne 45 */}
      <Card>
        <CardHeader>
          <CardTitle>Questions générées dynamiquement</CardTitle>
          <p className="text-sm text-muted-foreground">
            Cette section sera remplie automatiquement par l'Orchestrateur MCP
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            En attente d'injection du questionnaire Phase 2 pour "${deliverableName}"
          </p>
        </CardContent>
      </Card>
      {/* 🎯 FIN ZONE D'INJECTION PHASE 2 - Ligne 47 */}
    </div>
  );

  const renderPhase25 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold">Phase 2.5 - Besoins et Objectifs Business</h3>
      </div>
      
      {/* 🎯 ZONE D'INJECTION PHASE 2.5 - Ligne 59 */}
      <Card>
        <CardHeader>
          <CardTitle>Questionnaire business généré</CardTitle>
          <p className="text-sm text-muted-foreground">
            Cette section sera remplie automatiquement par l'Orchestrateur MCP
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            En attente d'injection du questionnaire Phase 2.5 pour "${deliverableName}"
          </p>
        </CardContent>
      </Card>
      {/* 🎯 FIN ZONE D'INJECTION PHASE 2.5 - Ligne 61 */}
    </div>
  );

  const renderPhase3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Phase 3 - Génération du Livrable</h3>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Livrable: ${deliverableName}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Génération automatique basée sur les données collectées en Phase 2 et 2.5
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">Prêt pour la génération</h4>
            <p className="text-muted-foreground mb-4">
              Les données collectées seront utilisées pour générer le livrable final
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Générer le Livrable
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">${deliverableName}</h1>
        <p className="text-gray-600">Processus de génération en 3 phases</p>
      </div>

      {/* Navigation des phases */}
      <div className="flex space-x-4 mb-6">
        <Button
          variant={currentPhase === 'phase2' ? 'default' : 'outline'}
          onClick={() => setCurrentPhase('phase2')}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Phase 2
        </Button>
        <Button
          variant={currentPhase === 'phase25' ? 'default' : 'outline'}
          onClick={() => setCurrentPhase('phase25')}
          className="flex items-center gap-2"
        >
          <Building2 className="h-4 w-4" />
          Phase 2.5
        </Button>
        <Button
          variant={currentPhase === 'phase3' ? 'default' : 'outline'}
          onClick={() => setCurrentPhase('phase3')}
          className="flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Phase 3
        </Button>
      </div>

      {/* Contenu de la phase active */}
      {currentPhase === 'phase2' && renderPhase2()}
      {currentPhase === 'phase25' && renderPhase25()}
      {currentPhase === 'phase3' && renderPhase3()}
    </div>
  );
}
`;
  }

  /**
   * Create or update a deliverable component
   */
  async createDeliverableComponent(deliverableName: string): Promise<{
    componentName: string;
    componentPath: string;
    injectionTargets: Array<{ name: string; line: number; description: string }>;
  }> {
    const componentName = this.sanitizeComponentName(deliverableName);
    const relativePath = `components/livrables/${componentName}.tsx`;
    const fullPath = path.join(this.clientPath, relativePath);

    // Check if component already exists
    try {
      await fs.access(fullPath);
      console.log(`✅ Composant ${componentName} existe déjà`);
    } catch {
      // Component doesn't exist, create it
      console.log(`🏗️ Création nouveau composant: ${componentName}`);
      
      const template = this.generateComponentTemplate(deliverableName, componentName);
      await fs.writeFile(fullPath, template, 'utf8');
      
      console.log(`✅ Composant créé: ${relativePath}`);
    }

    return {
      componentName,
      componentPath: relativePath,
      injectionTargets: [
        { name: `${componentName}_Phase2`, line: 45, description: 'Zone d\'injection Phase 2' },
        { name: `${componentName}_Phase25`, line: 59, description: 'Zone d\'injection Phase 2.5' }
      ]
    };
  }

  /**
   * List all existing deliverable components
   */
  async listDeliverableComponents(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.componentDir);
      return files.filter(file => file.endsWith('.tsx')).map(file => file.replace('.tsx', ''));
    } catch {
      return [];
    }
  }

  /**
   * Update injection targets for a specific deliverable
   */
  getInjectionTargets(deliverableName: string): Array<{
    name: string;
    componentPath: string;
    line: number;
    status: 'PENDING';
  }> {
    const componentName = this.sanitizeComponentName(deliverableName);
    const componentPath = `components/livrables/${componentName}.tsx`;

    return [
      {
        name: `${componentName}_Phase2`,
        componentPath,
        line: 45,
        status: 'PENDING' as const
      },
      {
        name: `${componentName}_Phase25`,
        componentPath,
        line: 59,
        status: 'PENDING' as const
      }
    ];
  }
}