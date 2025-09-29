import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles,
  RefreshCw,
  CheckCircle,
  FileText,
  Bot,
  Download,
  Eye,
  Edit3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGeneratedContent } from '@/hooks/useGeneratedContent';
// ✅ Hooks selon CODE 1 - Réparation
import { useInjectionStatus } from '@/hooks/useInjectionStatus';
import { useManualInjection } from '@/hooks/useManualInjection';
import { useContentAvailable } from '@/hooks/useContentAvailable';

interface MCPPhase3Props {
  onComplete: () => void;
  data: any;
  onDataUpdate: (data: any) => void;
  phaseData: Record<number, any>;
  deliverable: any;
}

export default function MCPPhase3({ 
  onComplete, 
  data, 
  onDataUpdate, 
  phaseData, 
  deliverable 
}: MCPPhase3Props) {
  console.log('📋 Phase 3 content loaded for deliverable:', deliverable?.nom);
  const [currentTab, setCurrentTab] = useState('generation');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { toast } = useToast();
  
  // ✅ SUIVRE EXACTEMENT CODE 1 DE RÉPARATION
  const { content: generatedContent, loading: isLoading, error } = useGeneratedContent(
    deliverable?.id
  );

  // ✅ Hooks injection manuelle selon VOS CODES
  const { status: injectionStatus } = useInjectionStatus(deliverable?.nom || null);
  const { injectDeliverable } = useManualInjection();
  const { isAvailable } = useContentAvailable(deliverable?.nom || null);

  // ✅ LOGIQUE D'AFFICHAGE (garder comme spécifié dans CODE 1)
  const defaultPromptContent = "Prompt par défaut pour génération du livrable";
  const defaultSommaireContent = "Sommaire par défaut du livrable";
  
  const promptContent = generatedContent?.phases?.phase3?.prompt || defaultPromptContent;
  const sommaireContent = generatedContent?.phases?.phase3?.sommaire || defaultSommaireContent;

  const handleGenerate = async () => {
    console.log("🎯 Génération livrable avec Option B - lecture BDD");
    
    if (!deliverable?.nom) {
      toast({
        title: "Erreur",
        description: "Aucun livrable sélectionné",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/mcp/generate-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deliverableName: deliverable.nom,
          serviceId: 1,
          category: deliverable.category || 'SURVEY',
          userId: 1
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Génération réussie",
          description: `Livrable "${deliverable.nom}" généré et sauvegardé`,
        });
      } else {
        throw new Error(result.error || 'Erreur lors de la génération');
      }
    } catch (error) {
      console.error('Erreur génération:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération du livrable",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          Phase 3 - Génération du Livrable

        </h2>
        <p className="text-muted-foreground">
          Génération automatique basée sur les données collectées et le prompt MCP injecté
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generation">Génération</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
          <TabsTrigger value="download">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="generation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Prompt MCP Injecté
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg max-h-40 overflow-y-auto">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Chargement du prompt depuis la base de données...</p>
                ) : (
                  <pre className="text-sm whitespace-pre-wrap">{promptContent}</pre>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Génération du Livrable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isGenerating && (
                <div className="space-y-2">
                  <Progress value={33} className="w-full" />
                  <p className="text-sm text-muted-foreground">Génération en cours...</p>
                </div>
              )}
              
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Générer le Livrable
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Aperçu du Livrable Généré
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Chargement du contenu...</span>
                </div>
              ) : generatedContent ? (
                <div className="space-y-4">
                  {/* Sommaire depuis le contenu généré */}
                  {sommaireContent && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Sommaire
                      </h4>
                      <div className="bg-muted p-4 rounded-lg max-h-32 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap">{sommaireContent}</pre>
                      </div>
                    </div>
                  )}
                  
                  {/* Prompt Phase 3 depuis le contenu généré */}
                  {promptContent && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        Prompt de Génération
                      </h4>
                      <div className="bg-muted p-4 rounded-lg max-h-32 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap">{promptContent.substring(0, 500)}...</pre>
                      </div>
                    </div>
                  )}
                  
                  {/* Affichage du contenu généré si disponible */}
                  {generatedContent && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Contenu Généré
                      </h4>
                      <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap">{typeof generatedContent === 'string' ? generatedContent : JSON.stringify(generatedContent, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun contenu trouvé</p>
                  <p className="text-sm">
                    {error ? `Erreur: ${error}` : 'Générez d\'abord le livrable depuis l\'onglet Orchestrateur'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="download" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export du Livrable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" disabled={!generatedContent}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" disabled={!generatedContent}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Word
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onComplete}>
            Retour au Dashboard
          </Button>
          
          {/* ✅ BOUTON OPTIMISER SELON VOS CODES */}
          <Button 
            variant="secondary" 
            onClick={() => console.log('Bouton optimiser cliqué')}
            disabled={false}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Optimiser
          </Button>
        </div>
        
        <Button onClick={onComplete} disabled={!generatedContent}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Finaliser
        </Button>
      </div>
    </div>
  );
}
// 🔄 MCP Injection Timestamp: 2025-08-27T14:27:26.894Z

// 🔄 MCP Injection Timestamp: 2025-08-27T14:37:16.513Z

// 🔄 MCP Injection Timestamp: 2025-08-28T08:43:29.306Z

// 🔄 MCP Injection Timestamp: 2025-08-28T09:15:24.996Z

// 🔄 MCP Injection Timestamp: 2025-08-28T10:29:08.658Z

// 🔄 MCP Injection Timestamp: 2025-08-28T11:01:28.732Z
