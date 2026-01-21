const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// État initial de la lampe
let lampState = { powerState: 'on' };

io.on('connection', (socket) => {
  console.log(`✅ Client connecté: ${socket.id}`);
  
  // Envoyer l'état actuel au nouveau client
  socket.emit('lampStateUpdate', lampState);
  console.log(`📤 État envoyé à ${socket.id}:`, lampState);

  // Écouter les demandes d'état
  socket.on('getLampState', () => {
    console.log(`📥 Demande d'état par ${socket.id}`);
    socket.emit('lampStateUpdate', lampState);
  });

  // Écouter les changements d'état (avec callback optionnel)
  socket.on('setLampState', (data, callback) => {
    console.log(`📥 Changement d'état reçu de ${socket.id}:`, data);
    
    // Valider les données
    if (!data || (data.powerState !== 'on' && data.powerState !== 'off')) {
      console.error('❌ État invalide:', data);
      if (callback) {
        callback({ success: false, error: 'État invalide (doit être "on" ou "off")' });
      }
      return;
    }

    // Mettre à jour l'état
    lampState = { powerState: data.powerState };
    
    // Broadcaster à TOUS les clients connectés
    io.emit('lampStateUpdate', lampState);
    console.log(`📢 État diffusé à tous les clients:`, lampState);
    console.log(`   Nombre de clients: ${io.engine.clientsCount}`);

    // Confirmer au client émetteur
    if (callback) {
      callback({ success: true });
    }
  });

  // Gérer la déconnexion
  socket.on('disconnect', () => {
    console.log(`🔌 Client déconnecté: ${socket.id}`);
    console.log(`   Clients restants: ${io.engine.clientsCount}`);
  });

  // Gérer les erreurs
  socket.on('error', (error) => {
    console.error(`❌ Erreur socket ${socket.id}:`, error);
  });
});

// Afficher l'état toutes les 10 secondes (debug)
setInterval(() => {
  console.log(`📊 État actuel: ${lampState.powerState} | Clients: ${io.engine.clientsCount}`);
}, 10000);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Serveur Socket.io démarré sur http://localhost:${PORT}`);
  console.log(`📡 État initial:`, lampState);
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  io.close(() => {
    server.close(() => {
      console.log('✅ Serveur arrêté proprement');
      process.exit(0);
    });
  });
});