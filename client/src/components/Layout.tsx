import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import JosephChat from "./JosephChat";
import sidebarLogoImage from "@assets/image_1752066900250.png";
import { 
  Home, 
  FolderOpen, 
  Users, 
  Settings, 
  Hammer, 
  Cog, 
  Shield, 
  Star,
  Calculator,
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  User,
  FileText,
  Wand2,
  Bot,
  Zap,
  Brain,
  // ✅ AJOUT - Import icône Orchestrateur
  BarChart3,
} from "lucide-react";

// Les 11 catégories TIA-942 avec couleurs dédiées
const tiaCategories = [
  { id: "survey", nom: "SURVEY", color: "#3B82F6", icon: Search },
  { id: "audit", nom: "AUDIT", color: "#10B981", icon: Shield },
  { id: "conseil", nom: "CONSEIL", color: "#F59E0B", icon: User },
  { id: "support", nom: "SUPPORT", color: "#8B5CF6", icon: Settings },
  { id: "amoa", nom: "AMOA", color: "#EF4444", icon: FolderOpen },
  { id: "amenagement", nom: "AMÉNAGEMENT", color: "#06B6D4", icon: Hammer },
  { id: "amenagement-technique", nom: "AMÉNAGEMENT TECHNIQUE", color: "#6366F1", icon: Cog },
  { id: "nettoyage", nom: "NETTOYAGE", color: "#059669", icon: Settings },
  { id: "commissioning", nom: "COMMISSIONING", color: "#F59E0B", icon: Calculator },
  { id: "maintenance", nom: "MAINTENANCE", color: "#EC4899", icon: Settings },
  { id: "monitoring", nom: "MONITORING", color: "#14B8A6", icon: Bell }
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();

  const isActiveRoute = (path: string) => {
    return location === path;
  };

  // Vérifier si on est dans une catégorie TIA
  const isInCategory = location.startsWith('/category/');
  const currentCategory = isInCategory ? location.split('/')[2] : null;
  
  // ✅ AJOUT - Vérifier si on est dans l'orchestrateur
  const isInOrchestrator = location === '/orchestrateur' || location === '/mcp-orchestrator' || location === '/orchestration';

  return (
    <div className="min-h-screen flex bg-dc-light-gray">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r border-dc-border fixed left-0 top-0 h-full overflow-y-auto lg:block hidden z-40">
        {/* Logo Header */}
        <div className="p-4 border-b border-dc-border">
          <div className="flex items-center justify-center">
            <img 
              src={sidebarLogoImage} 
              alt="Datacenter Expert" 
              className="h-10 w-auto max-w-full"
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {!isInCategory ? (
            <>
              {/* Dashboard */}
              <Link href="/">
                <Button 
                  variant={isActiveRoute("/") ? "default" : "ghost"}
                  className={`w-full justify-start ${isActiveRoute("/") ? "bg-blue-50 text-dc-navy" : "text-dc-gray hover:text-dc-navy"}`}
                >
                  <Home className="w-5 h-5 mr-3" />
                  Dashboard
                </Button>
              </Link>

              {/* Clients */}
              <Link href="/clients">
                <Button 
                  variant={isActiveRoute("/clients") ? "default" : "ghost"}
                  className={`w-full justify-start ${isActiveRoute("/clients") ? "bg-blue-50 text-dc-navy" : "text-dc-gray hover:text-dc-navy"}`}
                >
                  <Users className="w-5 h-5 mr-3" />
                  Clients
                </Button>
              </Link>

              {/* Services */}
              <Link href="/services">
                <Button 
                  variant={isActiveRoute("/services") ? "default" : "ghost"}
                  className={`w-full justify-start ${isActiveRoute("/services") ? "bg-blue-50 text-dc-navy" : "text-dc-gray hover:text-dc-navy"}`}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Services
                </Button>
              </Link>

              {/* ✅ AJOUT - Orchestrateur */}
              <Link href="/orchestrateur">
                <Button 
                  variant={isInOrchestrator ? "default" : "ghost"}
                  className={`w-full justify-start ${isInOrchestrator ? "bg-blue-50 text-dc-navy" : "text-dc-gray hover:text-dc-navy"}`}
                >
                  <BarChart3 className="w-5 h-5 mr-3" />
                  Orchestrateur
                </Button>
              </Link>

              {/* Historique */}
              <Link href="/documents">
                <Button 
                  variant={isActiveRoute("/documents") ? "default" : "ghost"}
                  className={`w-full justify-start ${isActiveRoute("/documents") ? "bg-blue-50 text-dc-navy" : "text-dc-gray hover:text-dc-navy"}`}
                >
                  <FileText className="w-5 h-5 mr-3" />
                  Historique
                </Button>
              </Link>








            </>
          ) : (
            <>
              {/* Sidebar spécifique à la catégorie */}
              <div className="space-y-2">
                <Link href="/services">
                  <Button 
                    variant="outline"
                    className="w-full justify-start text-dc-gray hover:text-dc-navy border-dc-border"
                  >
                    ← Retour Services
                  </Button>
                </Link>
                
                {/* Le contenu spécifique de la sidebar sera fourni plus tard */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-dc-navy font-medium">
                    Module {currentCategory?.toUpperCase()}
                  </p>
                  <p className="text-xs text-dc-gray mt-1">
                    Sidebar spécifique à implémenter
                  </p>
                </div>
              </div>
            </>
          )}
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-dc-border z-50 safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          <img 
            src={sidebarLogoImage} 
            alt="Datacenter Expert" 
            className="h-8 w-auto"
          />
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-100 text-green-800 text-xs">
              Claude 4.0 Connecté
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout} 
              className="text-dc-gray hover:text-red-600 px-2 py-1"
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-dc-border z-50 safe-area-bottom">
        <div className="grid grid-cols-5 gap-1 p-2">
          <button
            onClick={() => navigate("/")}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              isActiveRoute("/") 
                ? "bg-blue-50 text-dc-navy" 
                : "text-dc-gray hover:text-dc-navy hover:bg-gray-50"
            }`}
          >
            <Home className="h-4 w-4 mb-1" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </button>
          
          <button
            onClick={() => navigate("/clients")}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              isActiveRoute("/clients")
                ? "bg-blue-50 text-dc-navy" 
                : "text-dc-gray hover:text-dc-navy hover:bg-gray-50"
            }`}
          >
            <Users className="h-4 w-4 mb-1" />
            <span className="text-[10px] font-medium">Clients</span>
          </button>
          
          <button
            onClick={() => navigate("/services")}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              isActiveRoute("/services") || isInCategory
                ? "bg-blue-50 text-dc-navy" 
                : "text-dc-gray hover:text-dc-navy hover:bg-gray-50"
            }`}
          >
            <Settings className="h-4 w-4 mb-1" />
            <span className="text-[10px] font-medium">Services</span>
          </button>
          
          <button
            onClick={() => navigate("/orchestrateur")}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              isInOrchestrator
                ? "bg-blue-50 text-dc-navy" 
                : "text-dc-gray hover:text-dc-navy hover:bg-gray-50"
            }`}
          >
            <BarChart3 className="h-4 w-4 mb-1" />
            <span className="text-[10px] font-medium">Orchestrateur</span>
          </button>
          
          <button
            onClick={() => navigate("/documents")}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              isActiveRoute("/documents")
                ? "bg-blue-50 text-dc-navy" 
                : "text-dc-gray hover:text-dc-navy hover:bg-gray-50"
            }`}
          >
            <FileText className="h-4 w-4 mb-1" />
            <span className="text-[10px] font-medium">Historique</span>
          </button>
          
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 pb-20 lg:pt-0 lg:pb-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-dc-border px-4 lg:px-6 py-4 hidden lg:block">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-dc-navy">
                {location === "/" ? "Dashboard" : 
                 location === "/projects" ? "Projets" :
                 location === "/clients" ? "Clients" :
                 location === "/services" ? "Services" :
                 location === "/calculators" ? "Calculateurs" :
                 location === "/documents" ? "Documents" :
                 location === "/dashboard-agent" ? "Agent Dashboard IA" :
                 isInOrchestrator ? "Orchestrateur MCP" :
                 "DATACENTER EXPERT"}
              </h1>
              <p className="text-dc-gray mt-1">
                {location === "/" ? "Vue d'ensemble de vos projets et activités" :
                 location === "/projects" ? "Gérez tous vos projets datacenter" :
                 location === "/clients" ? "Gestion de votre portefeuille clients" :
                 location === "/services" ? "Services conseil disponibles" :
                 location === "/calculators" ? "Calculateurs TIA-942 spécialisés" :
                 location === "/documents" ? "Générez, visualisez et téléchargez vos documents" :
                 isInOrchestrator ? "Pilotage centralisé des opérations de génération MCP" : ""}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-3 text-dc-gray" />
                <Input 
                  type="text" 
                  placeholder="Rechercher..." 
                  className="pl-10 w-64"
                />
              </div>
              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-dc-gray" />
                <Badge className="absolute -top-1 -right-1 w-3 h-3 p-0 bg-dc-orange">
                  <span className="sr-only">Notifications</span>
                </Badge>
              </Button>
              
              {/* User Profile */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-dc-navy rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-dc-gray font-medium">{user?.username}</span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>

      {/* Joseph Chat Widget */}
      <JosephChat />
    </div>
  );
}
