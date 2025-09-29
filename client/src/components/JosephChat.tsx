import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { JosephMessage, JosephResponse } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getAuthToken } from "@/lib/auth";

const josephResponses = [
  "Excellente question ! Pour les calculs TIA-942, je recommande de commencer par le dimensionnement UPS.",
  "Je peux vous aider avec ce calcul. Avez-vous les données de puissance IT ?",
  "Selon les normes TIA-942, voici mes recommandations...",
  "Puis-je vous guider dans cette étape ? Cliquez sur le calculateur approprié.",
  "Pour un datacenter de cette taille, je suggère une configuration N+1.",
  "Attention aux contraintes thermiques dans cette zone.",
  "Votre dimensionnement semble correct selon les standards TIA-942."
];

export default function JosephChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<JosephMessage[]>([
    {
      id: "1",
      type: "joseph",
      content: "Bonjour ! Je suis Joseph, votre assistant expert datacenter. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date()
    },
    {
      id: "2",
      type: "joseph",
      content: "Je peux vous guider dans vos calculs TIA-942, vous recommander des templates ou vous aider avec vos workflows.",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/joseph', {
        message,
        userId: 1, // TODO: Get from auth context
        projectId: null, // TODO: Get from current project context
        context: { currentPage: window.location.pathname }
      });
      return response;
    },
    onSuccess: (data: JosephResponse) => {
      const josephMessage: JosephMessage = {
        id: Date.now().toString(),
        type: "joseph",
        content: data.message,
        timestamp: new Date(),
        context: { suggestions: data.suggestions, actions: data.actions }
      };
      setMessages(prev => [...prev, josephMessage]);
    },
    onError: (error) => {
      console.error('Joseph AI error:', error);
      const errorMessage: JosephMessage = {
        id: Date.now().toString(),
        type: "joseph",
        content: "Désolé, je rencontre des difficultés techniques avec l'API Claude. Veuillez réessayer dans quelques instants.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: JosephMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    // Send to Joseph AI
    chatMutation.mutate(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Chat Toggle Button */}
      <Button
        size="icon"
        className="bg-dc-orange hover:bg-orange-600 text-white rounded-full w-14 h-14 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 shadow-xl">
          <CardHeader className="bg-dc-navy text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-dc-orange rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Joseph</h3>
                  <p className="text-xs opacity-75">Assistant expert datacenter</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-blue-800"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${message.type === 'user' ? 'justify-end' : ''}`}
                >
                  {message.type === 'joseph' && (
                    <div className="w-6 h-6 bg-dc-orange rounded-full flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  
                  <div className={`rounded-lg p-3 max-w-xs ${
                    message.type === 'user' 
                      ? 'bg-dc-orange text-white' 
                      : 'bg-gray-100 text-dc-navy'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Show suggestions for Joseph messages */}
                    {message.type === "joseph" && message.context?.suggestions && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500 font-medium">Suggestions:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.context.suggestions.map((suggestion: string, index: number) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs cursor-pointer hover:bg-blue-100"
                              onClick={() => setInputMessage(suggestion)}
                            >
                              {suggestion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Show actions for Joseph messages */}
                    {message.type === "joseph" && message.context?.actions && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500 font-medium">Actions:</p>
                        <div className="space-y-1">
                          {message.context.actions.map((action: any, index: number) => (
                            <Button 
                              key={index} 
                              variant="outline" 
                              size="sm" 
                              className="text-xs h-6 w-full"
                              onClick={() => {
                                console.log('Action clicked:', action);
                              }}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {message.type === 'user' && (
                    <div className="w-6 h-6 bg-dc-navy rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {chatMutation.isPending && (
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-dc-orange rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                    <p className="text-sm text-dc-navy">Joseph réfléchit...</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-dc-border">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Tapez votre message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  size="icon"
                  className="bg-dc-orange hover:bg-orange-600 text-white"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || chatMutation.isPending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
