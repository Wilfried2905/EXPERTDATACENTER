import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator as CalculatorIcon, 
  Download, 
  Save,
  X
} from "lucide-react";
import { Calculator } from "@shared/schema";
import { UPSCalculationInputs, UPSCalculationResult } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CalculatorModalProps {
  calculator: Calculator | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CalculatorModal({ calculator, isOpen, onClose }: CalculatorModalProps) {
  const [inputs, setInputs] = useState<UPSCalculationInputs>({
    powerIT: 500,
    powerFactor: 0.9,
    autonomy: 15,
    ratedLevel: 'Rated-3',
    safetyFactor: 20
  });

  const [result, setResult] = useState<UPSCalculationResult | null>(null);

  const calculationMutation = useMutation({
    mutationFn: async (data: UPSCalculationInputs) => {
      const response = await apiRequest('POST', '/api/calculators/ups', data);
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error: any) => {
      // Handle calculation errors gracefully
      console.error('Calculation error:', error);
      const errorResult: UPSCalculationResult = {
        puissanceUPS: 0,
        configuration: 'Erreur',
        nombreUnites: 'N/A',
        capaciteBatteries: 'N/A',
        efficacite: 'N/A',
        recommendations: [
          'Erreur lors du calcul. Veuillez vérifier les paramètres saisis.',
          'Contactez le support technique si le problème persiste.'
        ]
      };
      setResult(errorResult);
    }
  });

  const handleInputChange = (field: keyof UPSCalculationInputs, value: string | number) => {
    setInputs(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCalculate = () => {
    calculationMutation.mutate(inputs);
  };

  if (!calculator) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-dc-navy">
              Calculateur - {calculator.nom}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-dc-gray mt-2">Calcul précis selon normes TIA-942</p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-dc-navy">Paramètres d'entrée</h3>
            
            <div>
              <Label htmlFor="power-it" className="text-dc-navy">Puissance IT (kW)</Label>
              <Input
                id="power-it"
                type="number"
                value={inputs.powerIT}
                onChange={(e) => handleInputChange('powerIT', e.target.value)}
                placeholder="Ex: 500"
              />
            </div>
            
            <div>
              <Label htmlFor="power-factor" className="text-dc-navy">Facteur de puissance</Label>
              <Input
                id="power-factor"
                type="number"
                step="0.1"
                min="0.1"
                max="1"
                value={inputs.powerFactor}
                onChange={(e) => handleInputChange('powerFactor', e.target.value)}
                placeholder="Ex: 0.9"
              />
            </div>
            
            <div>
              <Label htmlFor="autonomy" className="text-dc-navy">Autonomie requise (minutes)</Label>
              <Input
                id="autonomy"
                type="number"
                value={inputs.autonomy}
                onChange={(e) => handleInputChange('autonomy', e.target.value)}
                placeholder="Ex: 15"
              />
            </div>
            
            <div>
              <Label htmlFor="rated-level" className="text-dc-navy">Rated Level TIA-942</Label>
              <Select value={inputs.ratedLevel} onValueChange={(value) => handleInputChange('ratedLevel', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rated-1">Rated-1</SelectItem>
                  <SelectItem value="Rated-2">Rated-2</SelectItem>
                  <SelectItem value="Rated-3">Rated-3</SelectItem>
                  <SelectItem value="Rated-4">Rated-4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="safety-factor" className="text-dc-navy">Facteur de sécurité (%)</Label>
              <Input
                id="safety-factor"
                type="number"
                value={inputs.safetyFactor}
                onChange={(e) => handleInputChange('safetyFactor', e.target.value)}
                placeholder="Ex: 20"
              />
            </div>
            
            <Button 
              className="w-full bg-dc-orange hover:bg-orange-600"
              onClick={handleCalculate}
              disabled={calculationMutation.isPending}
            >
              <CalculatorIcon className="w-4 h-4 mr-2" />
              {calculationMutation.isPending ? 'Calcul en cours...' : 'Calculer'}
            </Button>
          </div>
          
          {/* Results Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-dc-navy">Résultats</h3>
            
            {result ? (
              <>
                <Card className="bg-dc-light-gray">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-dc-gray">Puissance UPS requise</p>
                        <p className="text-xl font-bold text-dc-navy">{result.puissanceUPS} kVA</p>
                      </div>
                      <div>
                        <p className="text-sm text-dc-gray">Configuration recommandée</p>
                        <p className="text-xl font-bold text-dc-navy">{result.configuration}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-dc-gray">Nombre d'unités UPS:</span>
                        <span className="text-sm font-medium text-dc-navy">{result.nombreUnites}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-dc-gray">Capacité batteries:</span>
                        <span className="text-sm font-medium text-dc-navy">{result.capaciteBatteries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-dc-gray">Efficacité estimée:</span>
                        <span className="text-sm font-medium text-dc-navy">{result.efficacite}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Recommandations Joseph</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {result.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <div className="flex space-x-3">
                  <Button className="flex-1 bg-dc-navy hover:bg-blue-900">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter PDF
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </>
            ) : (
              <Card className="bg-dc-light-gray">
                <CardContent className="p-8 text-center">
                  <CalculatorIcon className="w-12 h-12 mx-auto mb-4 text-dc-gray opacity-50" />
                  <p className="text-dc-gray">Cliquez sur "Calculer" pour voir les résultats</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
