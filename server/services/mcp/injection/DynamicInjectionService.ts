import fs from 'fs/promises';
import path from 'path';
import { DeliverableComponentGenerator } from './DeliverableComponentGenerator.js';

// ===== TYPES =====
export interface InjectionJob {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  deliverableName: string;
  content: {
    phase2Form?: { sections: any };
    phase25Form?: { sections: any };
    phase3Prompt?: string;
    sommaire?: string;
    metadata?: any;
  };
  targets: Array<{
    name: string;
    componentPath: string;
    line: number;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
  }>;
  templateId: string;
  createdAt: Date;
  completedAt?: Date;
  backupPaths: string[];
}

// ===== SERVICE PRINCIPAL =====
export class DynamicInjectionService {
  private activeJobs = new Map<string, InjectionJob>();
  private injectionHistory: Array<{
    id: string;
    deliverableName: string;
    categoryName: string;
    serviceName: string;
    componentPath: string;
    injectedAt: string;
    phases: string[];
    status: string;
  }> = [];
  private readonly clientPath = path.join(process.cwd(), 'client', 'src');
  private readonly backupDir = './backups';
  private componentGenerator = new DeliverableComponentGenerator();

  async injectValidatedContent(
    deliverableName: string,
    content: any,
    approved: boolean = true,
    comments?: string
  ): Promise<InjectionJob> {
    
    const jobId = this.generateJobId();
    console.log(`🔴 INJECTION AUTOMATIQUE DÉSACTIVÉE pour "${deliverableName}"`);
    console.log('📌 Utiliser injection manuelle depuis l\'interface utilisateur');

    // Créer job factice sans injection
    const job: InjectionJob = {
      id: jobId,
      status: 'FAILED',
      deliverableName,
      content,
      targets: [],
      templateId: `${Date.now()}`,
      createdAt: new Date(),
      backupPaths: []
    };

    this.activeJobs.set(jobId, job);
    
    return job;
  }

  getJobStatus(jobId: string): InjectionJob | null {
    return this.activeJobs.get(jobId) || null;
  }

  // ===== MÉTHODES PRIVÉES =====
  private generateJobId(): string {
    return `inj_${Date.now()}`;
  }

  private async executeInjection(job: InjectionJob): Promise<void> {
    console.log(`🏗️ INJECTION RÉELLE pour: ${job.deliverableName}`);
    console.log('🎯 Contenu reçu:', {
      phase2Sections: job.content?.phase2Form?.sections?.length || 0,
      phase25Sections: job.content?.phase25Form?.sections?.length || 0,
      phase3Prompt: job.content?.phase3Prompt ? 'Présent' : 'Absent',
      sommaire: job.content?.sommaire ? 'Présent' : 'Absent',
      metadata: job.content?.metadata ? 'Présent' : 'Absent'
    });

    console.log('📝 Détail contenu:', {
      type: job.content?.phase3Prompt ? 'prompt' : job.content?.sommaire ? 'sommaire' : 'questionnaire',
      hasPhase2: !!job.content?.phase2Form?.sections?.length,
      hasPhase25: !!job.content?.phase25Form?.sections?.length,
      hasPhase3: !!job.content?.phase3Prompt,
      hasSommaire: !!job.content?.sommaire
    });

    // VRAIE INJECTION DANS LES FICHIERS
    for (const target of job.targets) {
      try {
        await this.injectIntoComponent(target, job.content, job.deliverableName);
        target.status = 'COMPLETED';
        console.log(`✅ Injection réussie: ${target.name}`);
      } catch (error) {
        target.status = 'FAILED';
        console.error(`❌ Échec injection ${target.name}:`, error);
      }
    }

    job.status = 'COMPLETED';
    job.completedAt = new Date();
    
    // Ajouter à l'historique
    this.injectionHistory.push({
      id: job.id,
      deliverableName: job.deliverableName,
      categoryName: 'SURVEY', // TODO: récupérer depuis les métadonnées
      serviceName: 'Étude de faisabilité', // TODO: récupérer depuis les métadonnées
      componentPath: `client/src/${job.targets[0]?.componentPath || 'unknown'}`,
      injectedAt: new Date().toISOString(),
      phases: ['phase2', 'phase25', 'phase3'],
      status: 'COMPLETED'
    });
    
    console.log('✅ Injection terminée avec succès et ajoutée à l\'historique');
  }

  private async injectIntoComponent(
    target: any, 
    content: any, 
    deliverableName: string
  ): Promise<void> {
    const fullPath = path.join(this.clientPath, target.componentPath);
    
    try {
      // Lire le fichier existant
      let fileContent = await fs.readFile(fullPath, 'utf-8');
      
      // Créer les données à injecter selon le type de cible
      let injectionData = '';
      
      if (target.name.endsWith('_Phase2') && content.phase2Form?.sections) {
        injectionData = this.formatPhase2Data(content.phase2Form, deliverableName);
      } else if (target.name.endsWith('_Phase25') && content.phase25Form?.sections) {
        injectionData = this.formatPhase25Data(content.phase25Form, deliverableName);
      } else if (target.name === 'MCPPhase3' && content.phase3Prompt) {
        injectionData = this.formatPhase3Data(content.phase3Prompt, content.sommaire, deliverableName);
      }

      if (injectionData) {
        // Trouver et remplacer la zone d'injection appropriée
        if (target.name.endsWith('_Phase2') || target.name.endsWith('_Phase25')) {
          // MÉCANISME CORRIGÉ : Remplacement par marqueurs simples et fiables
          const phaseType = target.name.endsWith('_Phase2') ? 'PHASE 2' : 'PHASE 2.5';
          const startMarker = `{/* 🎯 ZONE D'INJECTION ${phaseType}`;
          const endMarker = `{/* 🎯 FIN ZONE D'INJECTION ${phaseType}`;
          
          console.log(`🔍 Recherche marqueurs ${phaseType}:`, { startMarker, endMarker });
          
          const startIndex = fileContent.indexOf(startMarker);
          const endIndex = fileContent.indexOf(endMarker);
          
          if (startIndex !== -1 && endIndex !== -1) {
            console.log(`✅ Marqueurs trouvés pour ${phaseType}:`, { startIndex, endIndex });
            
            const beforeInjection = fileContent.substring(0, fileContent.indexOf('*/', startIndex) + 2);
            const afterInjection = fileContent.substring(endIndex);
            
            // Remplacer tout le contenu entre les marqueurs
            fileContent = beforeInjection + '\n      ' + injectionData + '\n      ' + afterInjection;
            
            console.log(`🎯 Injection ${phaseType} appliquée - Longueur: ${injectionData.length} caractères`);
            target.status = 'COMPLETED';
          } else {
            console.error(`❌ Marqueurs non trouvés pour ${phaseType}`);
            target.status = 'FAILED';
            target.error = `Marqueurs d'injection non trouvés pour ${phaseType}`;
            return;
          }
        } else {
          // Pour MCPPhase3, remplacer le commentaire d'injection existant
          const injectionMarker = '  // Zone d\'injection MCP Phase 3 - Ligne 36';
          const markerIndex = fileContent.indexOf(injectionMarker);
          
          if (markerIndex !== -1) {
            // Trouver la fin de la ligne du marqueur
            const lineEndIndex = fileContent.indexOf('\n', markerIndex);
            if (lineEndIndex !== -1) {
              const beforeMarker = fileContent.substring(0, lineEndIndex + 1);
              const afterMarker = fileContent.substring(lineEndIndex + 1);
              
              // Injecter le contenu après le marqueur
              fileContent = beforeMarker + injectionData + '\n' + afterMarker;
            }
          } else {
            // Fallback: injecter après la ligne spécifiée
            const lines = fileContent.split('\n');
            if (target.line < lines.length) {
              lines.splice(target.line, 0, injectionData);
              fileContent = lines.join('\n');
            }
          }
        }
        
        // MÉCANISME CORRIGÉ : Force HMR refresh avec timestamp
        await fs.writeFile(fullPath, fileContent, 'utf-8');
        
        // Ajouter timestamp pour forcer Vite à recharger
        const timestampComment = `\n// 🔄 MCP Injection Timestamp: ${new Date().toISOString()}\n`;
        const finalContent = fileContent + timestampComment;
        await fs.writeFile(fullPath, finalContent, 'utf-8');
        
        console.log(`📝 Fichier mis à jour avec refresh forcé: ${target.componentPath}`);
      }
    } catch (error) {
      console.error(`❌ Erreur injection fichier ${target.componentPath}:`, error);
      throw error;
    }
  }

  private formatPhase2Data(phase2Form: any, deliverableName: string): string {
    // Générer les champs de formulaire React à partir des questions
    const formFields = this.generateFormFields(phase2Form, 'phase2');
    return formFields;
  }

  private formatPhase25Data(phase25Form: any, deliverableName: string): string {
    // Générer les champs de formulaire React à partir des questions  
    const formFields = this.generateFormFields(phase25Form, 'phase25');
    return formFields;
  }

  private generateFormFields(formData: any, phase: string): string {
    if (!formData?.sections) return '';
    
    let fieldsCode = '';
    
    formData.sections.forEach((section: any, sectionIndex: number) => {
      // SÉCURISÉ : Échapper toutes les chaînes pour éviter la corruption JavaScript
      const safeTitle = this.escapeForJSX(section.title || '');
      const safeDescription = this.escapeForJSX(section.description || '');
      
      fieldsCode += `<Card key="section_${sectionIndex}">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              ${safeTitle}
            </CardTitle>
            <p className="text-sm text-muted-foreground">${safeDescription}</p>
          </CardHeader>
          <CardContent className="space-y-4">`;
      
      if (section.questions) {
        section.questions.forEach((question: any, qIndex: number) => {
          fieldsCode += this.generateFieldCode(question, `${phase}_${sectionIndex}_${qIndex}`);
        });
      }
      
      fieldsCode += `</CardContent>
        </Card>`;
    });
    
    return fieldsCode;
  }

  private escapeForJSX(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/`/g, '&#x60;')
      .replace(/\n/g, ' ')
      .replace(/\r/g, '');
  }

  private generateFieldCode(question: any, fieldId: string): string {
    const fieldName = `field_${fieldId}`;
    const safeLabel = this.escapeForJSX(question.label || '');
    const safePlaceholder = this.escapeForJSX(question.placeholder || '');
    const safeHelpText = this.escapeForJSX(question.helpText || '');
    
    switch (question.type) {
      case 'text':
        return `<div>
              <Label htmlFor="${fieldName}">${safeLabel}</Label>
              <Input
                id="${fieldName}"
                value={formData.${fieldName} || ''}
                onChange={(e) => handleChange('${fieldName}', e.target.value)}
                placeholder="${safePlaceholder}"
                ${question.required ? 'required' : ''}
              />
              ${safeHelpText ? `<p className="text-xs text-muted-foreground mt-1">${safeHelpText}</p>` : ''}
            </div>`;
            
      case 'number':
        return `
            <div>
              <Label htmlFor="${fieldName}">${question.label}</Label>
              <Input
                id="${fieldName}"
                type="number"
                value={formData.${fieldName} || ''}
                onChange={(e) => handleChange('${fieldName}', e.target.value)}
                placeholder="${question.placeholder || ''}"
                ${question.required ? 'required' : ''}
              />
              ${question.helpText ? `<p className="text-xs text-muted-foreground mt-1">${question.helpText}</p>` : ''}
            </div>`;
            
      case 'select':
        return `
            <div>
              <Label htmlFor="${fieldName}">${question.label}</Label>
              <Select value={formData.${fieldName} || ''} onValueChange={(value) => handleChange('${fieldName}', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="${question.placeholder || 'Sélectionner une option'}" />
                </SelectTrigger>
                <SelectContent>
                  ${question.options?.map((option: string) => 
                    `<SelectItem value="${option}">${option}</SelectItem>`
                  ).join('') || ''}
                </SelectContent>
              </Select>
              ${question.helpText ? `<p className="text-xs text-muted-foreground mt-1">${question.helpText}</p>` : ''}
            </div>`;
            
      case 'textarea':
        return `
            <div>
              <Label htmlFor="${fieldName}">${question.label}</Label>
              <Textarea
                id="${fieldName}"
                value={formData.${fieldName} || ''}
                onChange={(e) => handleChange('${fieldName}', e.target.value)}
                placeholder="${question.placeholder || ''}"
                rows={3}
                ${question.required ? 'required' : ''}
              />
              ${question.helpText ? `<p className="text-xs text-muted-foreground mt-1">${question.helpText}</p>` : ''}
            </div>`;
            
      case 'radio':
        return `
            <div>
              <Label className="text-base">${question.label}</Label>
              <div className="space-y-2 mt-2">
                ${question.options?.map((option: string) => `
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="${fieldName}_${option}"
                    name="${fieldName}"
                    value="${option}"
                    checked={formData.${fieldName} === "${option}"}
                    onChange={() => handleChange('${fieldName}', '${option}')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Label htmlFor="${fieldName}_${option}" className="text-sm font-normal">${option}</Label>
                </div>`).join('') || ''}
              </div>
              ${question.helpText ? `<p className="text-xs text-muted-foreground mt-1">${question.helpText}</p>` : ''}
            </div>`;
            
      default:
        return `
            <div>
              <Label htmlFor="${fieldName}">${question.label}</Label>
              <Input
                id="${fieldName}"
                value={formData.${fieldName} || ''}
                onChange={(e) => handleChange('${fieldName}', e.target.value)}
                placeholder="${question.placeholder || ''}"
              />
            </div>`;
    }
  }

  private formatPhase3Data(prompt: string, sommaire: string, deliverableName: string): string {
    // SÉCURISATION RENFORCÉE: Validation et échappement complet
    if (!prompt || typeof prompt !== 'string') {
      console.warn('⚠️ Prompt Phase 3 invalide ou vide, injection sécurisée ignorée');
      return `  // ⚠️ Injection sécurisée ignorée - prompt invalide pour "${deliverableName}"`;
    }
    
    // Échapper tous les caractères dangereux pour JavaScript
    const safEscapedPrompt = prompt
      .replace(/\\/g, '\\\\')  // Échapper les backslashes
      .replace(/`/g, '\\`')    // Échapper les backticks
      .replace(/\${/g, '\\${') // Échapper les template literals
      .replace(/\n/g, '\\n')   // Échapper les retours à la ligne
      .replace(/\r/g, '\\r')   // Échapper les retours chariot
      .replace(/"/g, '\\"')    // Échapper les guillemets
      .replace(/'/g, "\\'");   // Échapper les apostrophes
    
    const safeEscapedSommaire = (sommaire || 'Sommaire à générer')
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\${/g, '\\${')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'");
    
    return `  // ✅ Contenu injecté par MCP - Phase 3 pour "${deliverableName}" (${new Date().toISOString()})
  const injectedPrompt = \`${safEscapedPrompt}\`;
  const injectedSummary = \`${safeEscapedSommaire}\`;
  console.log('📋 Phase 3 content loaded for:', '${deliverableName}');`;
  }

  /**
   * Récupérer l'historique des injections
   */
  getInjectionHistory() {
    return this.injectionHistory.slice().reverse(); // Plus récentes en premier
  }

  /**
   * Vider l'historique (pour les tests)
   */
  clearInjectionHistory() {
    this.injectionHistory = [];
  }
}

// Export du service singleton
export const injectionService = new DynamicInjectionService();