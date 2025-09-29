import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Clock, 
  FileText, 
  Users,
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react";
import { Service } from "@shared/schema";

interface SimpleServiceModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SimpleServiceModal({ service, isOpen, onClose }: SimpleServiceModalProps) {
  if (!service) return null;

  let workflowSteps: any[] = [];
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-dc-navy">
              {service.nom}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-dc-gray">Module</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-dc-navy">
                  {service.module}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-dc-gray">Durée Estimée</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-dc-gray" />
                  <span className="text-lg font-semibold text-dc-navy">{service.dureeEstimee}h</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-dc-gray">Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-dc-gray" />
                  <span className="text-lg font-semibold text-dc-navy">
                    {service.livrables ? service.livrables.split(':')[0] : 'Inclus'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-dc-navy">Description du Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-dc-gray leading-relaxed">{service.description}</p>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          {service.prerequis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-dc-navy">Prérequis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dc-gray">{service.prerequis}</p>
              </CardContent>
            </Card>
          )}

          {/* Workflow Steps */}
          {workflowSteps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-dc-navy">Workflow - Étapes du Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflowSteps.map((step, index) => (
                    <div key={step.id || index} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200">
                      <div className="flex-shrink-0">
                        {getStatusIcon(step.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-dc-navy">{step.nom}</h4>
                          <Badge className={getStatusColor(step.status)} variant="outline">
                            {step.status === 'planifie' ? 'Planifié' : 
                             step.status === 'en_cours' ? 'En cours' : 
                             step.status === 'termine' ? 'Terminé' : step.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-dc-gray mt-1">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deliverables */}
          {service.livrables && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-dc-navy">Livrables</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dc-gray">{service.livrables}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button className="bg-dc-orange hover:bg-orange-600">
              Démarrer le Service
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}