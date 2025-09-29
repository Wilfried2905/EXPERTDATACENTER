import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  Play,
  X
} from "lucide-react";
import { Service } from "@shared/schema";
import { WorkflowStep } from "@/lib/types";

interface ServiceModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceModal({ service, isOpen, onClose }: ServiceModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>({});

  if (!service) return null;

  // Parse workflow from service data with error handling
  let workflowSteps: WorkflowStep[] = [];
  try {
    workflowSteps = service.workflow ? JSON.parse(service.workflow as string) : [];
  } catch (error) {
    console.error('Error parsing workflow:', error);
    workflowSteps = [];
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'termine': return 'bg-green-100 text-green-800';
      case 'en_cours': return 'bg-yellow-100 text-yellow-800';
      case 'planifie': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'termine': return <CheckCircle className="w-4 h-4" />;
      case 'en_cours': return <Clock className="w-4 h-4" />;
      case 'planifie': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'termine': return 'Terminé';
      case 'en_cours': return 'En cours';
      case 'planifie': return 'Planifié';
      default: return status;
    }
  };

  const handleNextStep = () => {
    if (currentStep < workflowSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStepForm = () => {
    const step = workflowSteps[currentStep];
    
    if (step.id === 2) {
      return (
        <Card className="bg-dc-light-gray">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-dc-navy mb-4">Étape 2 - Analyse du Site</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="soil-type" className="text-dc-navy">Type de sol</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rocky">Rocheux</SelectItem>
                    <SelectItem value="clay">Argileux</SelectItem>
                    <SelectItem value="sandy">Sablonneux</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="seismic-risk" className="text-dc-navy">Risque sismique</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="moderate">Modéré</SelectItem>
                    <SelectItem value="high">Élevé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="heavy-access" className="text-dc-navy">Accès véhicules lourds</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Oui</SelectItem>
                    <SelectItem value="no">Non</SelectItem>
                    <SelectItem value="partial">Partiel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="constraints" className="text-dc-navy">Contraintes environnementales</Label>
                <Textarea
                  id="constraints"
                  placeholder="Décrivez les contraintes..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-dc-light-gray">
        <CardContent className="p-4">
          <h3 className="text-lg font-bold text-dc-navy mb-4">{step.nom}</h3>
          <p className="text-dc-gray mb-4">{step.description}</p>
          <div className="text-center py-8">
            <p className="text-dc-gray">Configuration du formulaire en cours...</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-dc-navy">
              {service.nom}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-dc-gray mt-2">{service.description}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Workflow Steps */}
          <div>
            <h3 className="text-lg font-bold text-dc-navy mb-4">Workflow - Étapes</h3>
            <div className="space-y-4">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === currentStep ? 'bg-dc-orange' : 
                    step.status === 'termine' ? 'bg-green-500' : 
                    step.status === 'en_cours' ? 'bg-yellow-500' : 'bg-gray-300'
                  }`}>
                    <span className="text-white font-bold text-sm">{step.id}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-dc-navy">{step.nom}</h4>
                    <p className="text-sm text-dc-gray">{step.description}</p>
                  </div>
                  <Badge className={getStatusColor(step.status)}>
                    {getStatusIcon(step.status)}
                    <span className="ml-1">{getStatusText(step.status)}</span>
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Current Step Form */}
          {renderCurrentStepForm()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4">
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
              disabled={currentStep === 0}
            >
              Précédent
            </Button>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                className="bg-dc-orange hover:bg-orange-600"
                onClick={handleNextStep}
                disabled={currentStep === workflowSteps.length - 1}
              >
                {currentStep === workflowSteps.length - 1 ? 'Finaliser' : 'Valider étape'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
