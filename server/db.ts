import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configuration du pool principal pour les requêtes normales
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum de connexions dans le pool
  min: 5,  // Minimum de connexions maintenues
  connectionTimeoutMillis: 30000, // 30 secondes pour obtenir une connexion
  idleTimeoutMillis: 60000, // 60 secondes avant de fermer les connexions inactives
  // Note: Neon gère automatiquement les timeouts côté serveur
});

// Pool dédié pour les longues opérations (générations MCP)
export const longOperationPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // Moins de connexions pour éviter la surcharge
  min: 1,
  connectionTimeoutMillis: 120000, // 2 minutes pour obtenir une connexion
  idleTimeoutMillis: 300000, // 5 minutes avant de fermer les connexions inactives
  // Les longues opérations peuvent prendre plusieurs minutes
});

// Fonction pour maintenir la connexion active pendant les longues opérations
export async function executeWithHeartbeat<T>(
  operation: () => Promise<T>,
  intervalMs: number = 30000 // Ping toutes les 30 secondes
): Promise<T> {
  let heartbeatInterval: NodeJS.Timeout | null = null;
  
  try {
    // Démarrer le heartbeat
    heartbeatInterval = setInterval(async () => {
      try {
        // Ping léger pour maintenir la connexion active
        await pool.query('SELECT 1');
        console.log('💓 Heartbeat - connexion maintenue');
      } catch (error) {
        console.error('❌ Erreur heartbeat:', error);
      }
    }, intervalMs);

    // Exécuter l'opération longue
    const result = await operation();
    
    return result;
  } finally {
    // Toujours arrêter le heartbeat
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }
  }
}

// Type pour les erreurs PostgreSQL
interface DatabaseError extends Error {
  code?: string;
}

// Fonction pour gérer les erreurs de connexion et éviter les crashes
pool.on('error', (err: DatabaseError, client) => {
  console.error('❌ Erreur de pool inattendue:', err);
  // Ne pas faire crasher l'application sur une erreur de connexion
  if (err.code === '57P01' || err.code === 'ECONNRESET') {
    console.log('🔄 Connexion terminée, le pool créera automatiquement une nouvelle connexion');
  }
});

longOperationPool.on('error', (err: DatabaseError, client) => {
  console.error('❌ Erreur de pool (longues opérations):', err);
  // Ne pas faire crasher l'application sur une erreur de connexion
  if (err.code === '57P01' || err.code === 'ECONNRESET') {
    console.log('🔄 Connexion longue terminée, le pool créera automatiquement une nouvelle connexion');
  }
});

// Gérer les promesses rejetées pour éviter les crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Promesse rejetée non gérée:', reason);
  // Ne pas faire crasher le process
});

// Gérer les erreurs non capturées  
process.on('uncaughtException', (error) => {
  console.error('⚠️ Exception non capturée:', error);
  // Pour les erreurs de base de données, ne pas crasher
  if (error.message && error.message.includes('terminating connection')) {
    console.log('🔄 Erreur de connexion DB gérée, continuation du service...');
  } else {
    // Pour d'autres erreurs critiques, on peut décider de crasher
    console.error('💥 Erreur critique, arrêt du processus...');
    process.exit(1);
  }
});

// Export des instances Drizzle
export const db = drizzle({ client: pool, schema });
export const dbLongOps = drizzle({ client: longOperationPool, schema });