// index.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const { initWoT } = require("./wotClient");
const { initLamp, getLampState, toggleLamp, setLampState } = require("./lampService");

const app = express();
<<<<<<< HEAD

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
=======
app.use(cors({ origin: "*" }));

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
>>>>>>> 54b1aa6 (feat: ajouter la gestion des lampes avec Web of Things (WoT) et Socket.IO)

// Socket.IO : synchronisation temps réel
io.on("connection", async (socket) => {
  console.log("Nouvelle connexion Socket.IO");

  try {
    const state = await getLampState();
    socket.emit("lampStateUpdate", state);
  } catch (err) {
    socket.emit("error", { message: "Lampe WoT indisponible" });
  }

<<<<<<< HEAD
  socket.on('toggleLamp', (state) => {
    lampState = state;
    io.emit('lampStateUpdate', state);
    console.log('État de la lampe mis à jour:', state);
  });
});

server.listen(3001, () => {
  console.log('Serveur Socket.io sur http://0.0.0.0:3001');
});
=======
  // toggle lampe
  socket.on("toggleLamp", async () => {
    try {
      const newState = await toggleLamp();
      io.emit("lampStateUpdate", newState);
      console.log("Lampe synchronisée WoT :", newState);
    } catch (err) {
      socket.emit("error", { message: "Erreur toggle Lampe WoT" });
    }
  });

  // set explicitement l'état
  socket.on("setLampState", async (data) => {
    try {
      const newState = await setLampState(data.powerState);
      io.emit("lampStateUpdate", newState);
      console.log("Lampe WoT mise à jour :", newState);
    } catch (err) {
      socket.emit("error", { message: "Erreur set Lampe WoT" });
    }
  });
});

// Démarrage backend
async function start() {
  try {
    await initWoT();
    await initLamp();

    server.listen(3001, () => {
      console.log("Backend Socket.io + WoT prêt sur http://0.0.0.0:3001");
    });
  } catch (err) {
    console.error("Impossible de démarrer le backend :", err.message);
  }
}

start();
>>>>>>> 54b1aa6 (feat: ajouter la gestion des lampes avec Web of Things (WoT) et Socket.IO)
