import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';

/**
 * WebSocketManager - Gestionnaire des notifications temps réel
 * Maintient les connexions WebSocket par utilisateur pour notifications MCP
 */
export class WebSocketManager {
  private wss: WebSocketServer;
  private userConnections: Map<number, WebSocket[]> = new Map();
  private jwtSecret: string;

  constructor(port: number = 8080) {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret';
    this.wss = new WebSocketServer({ port });
    
    this.wss.on('connection', this.handleConnection.bind(this));
    console.log(`WebSocket server démarré sur le port ${port}`);
  }

  /**
   * Gestion nouvelle connexion WebSocket
   */
  private handleConnection(ws: WebSocket, req: IncomingMessage): void {
    try {
      const userId = this.extractUserId(req);
      if (!userId) {
        ws.close(1008, 'Token JWT manquant ou invalide');
        return;
      }

      // Ajouter connexion pour cet utilisateur
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, []);
      }
      this.userConnections.get(userId)!.push(ws);

      console.log(`Utilisateur ${userId} connecté via WebSocket`);

      // Gérer fermeture connexion
      ws.on('close', () => {
        this.removeConnection(userId, ws);
        console.log(`Utilisateur ${userId} déconnecté`);
      });

      // Gérer erreurs
      ws.on('error', (error) => {
        console.error(`Erreur WebSocket utilisateur ${userId}:`, error);
        this.removeConnection(userId, ws);
      });

      // Message de confirmation connexion
      ws.send(JSON.stringify({
        type: 'connection_established',
        message: 'WebSocket connecté avec succès',
        userId
      }));

    } catch (error) {
      console.error('Erreur connexion WebSocket:', error);
      ws.close(1008, 'Erreur authentification');
    }
  }

  /**
   * Extrait l'ID utilisateur du token JWT
   */
  private extractUserId(req: IncomingMessage): number | null {
    try {
      const url = new URL(req.url!, 'http://localhost');
      const token = url.searchParams.get('token');
      
      if (!token) {
        return null;
      }

      const decoded = jwt.verify(token, this.jwtSecret) as any;
      return decoded.id || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Supprime une connexion fermée
   */
  private removeConnection(userId: number, ws: WebSocket): void {
    const connections = this.userConnections.get(userId);
    if (connections) {
      const index = connections.indexOf(ws);
      if (index > -1) {
        connections.splice(index, 1);
      }
      
      // Supprimer utilisateur si plus de connexions
      if (connections.length === 0) {
        this.userConnections.delete(userId);
      }
    }
  }

  /**
   * Envoie notification à un utilisateur spécifique
   */
  async notifyUser(userId: number, notification: {
    type: string;
    message?: string;
    jobId?: number;
    progress?: number;
    metadata?: any;
  }): Promise<void> {
    const connections = this.userConnections.get(userId);
    if (!connections || connections.length === 0) {
      console.log(`Aucune connexion WebSocket pour utilisateur ${userId}`);
      return;
    }

    const message = JSON.stringify({
      ...notification,
      timestamp: new Date().toISOString()
    });

    // Envoyer à toutes les connexions de l'utilisateur
    const deadConnections: WebSocket[] = [];
    
    for (const ws of connections) {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        } else {
          deadConnections.push(ws);
        }
      } catch (error) {
        console.error(`Erreur envoi WebSocket utilisateur ${userId}:`, error);
        deadConnections.push(ws);
      }
    }

    // Nettoyer connexions mortes
    for (const deadWs of deadConnections) {
      this.removeConnection(userId, deadWs);
    }
  }

  /**
   * Diffusion à tous les utilisateurs connectés
   */
  async broadcast(notification: {
    type: string;
    message: string;
    metadata?: any;
  }): Promise<void> {
    const message = JSON.stringify({
      ...notification,
      timestamp: new Date().toISOString()
    });

    for (const [userId, connections] of this.userConnections.entries()) {
      for (const ws of connections) {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
          }
        } catch (error) {
          console.error(`Erreur broadcast utilisateur ${userId}:`, error);
        }
      }
    }
  }

  /**
   * Statistiques WebSocket
   */
  getStats(): {
    connectedUsers: number;
    totalConnections: number;
  } {
    let totalConnections = 0;
    for (const connections of this.userConnections.values()) {
      totalConnections += connections.length;
    }

    return {
      connectedUsers: this.userConnections.size,
      totalConnections
    };
  }

  /**
   * Fermeture propre du serveur WebSocket
   */
  close(): void {
    this.wss.close();
    console.log('WebSocket server fermé');
  }
}