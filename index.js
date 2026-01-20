// index.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const { initWoT } = require("./wotClient");
const { initLamp, getLampState, setLampState } = require("./lampService");

const app = express();
app.use(cors({ origin: "*" }));

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// Socket.IO : synchronisation temps réel
io.on("connection", async (socket) => {
  console.log("Nouvelle connexion Socket.IO");

  // Envoyer l'état actuel dès la connexion
  try {
    const state = await getLampState();
    socket.emit("lampStateUpdate", state);
  } catch (err) {
    socket.emit("error", { message: "Lampe WoT indisponible" });
  }

  // Réception d'un changement d'état depuis le front
  socket.on("setLampState", async (data) => {
    try {
      if (!data.powerState || !["on", "off"].includes(data.powerState)) return;

      const newState = await setLampState(data.powerState);
      io.emit("lampStateUpdate", newState); // synchroniser tous les clients
      console.log("Lampe WoT mise à jour :", newState);
    } catch (err) {
      console.error(err);
      socket.emit("error", { message: "Erreur set Lampe WoT" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client déconnecté");
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
