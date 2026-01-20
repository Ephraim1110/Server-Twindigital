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
  console.log("➡️ Nouvelle connexion Socket.IO :", socket.id);

  // Envoyer l'état actuel dès la connexion
  try {
    const state = await getLampState();
    console.log("🔹 État initial envoyé au client :", state);
    socket.emit("lampStateUpdate", state);
  } catch (err) {
    console.error("⚠️ Lampe WoT indisponible :", err);
    socket.emit("error", { message: "Lampe WoT indisponible" });
  }

  // Réception d'un changement d'état depuis le front
  socket.on("setLampState", async (data) => {
    console.log("⬅️ Reçu setLampState depuis client :", data, "socket id:", socket.id);

    try {
      if (!data.powerState || !["on", "off"].includes(data.powerState)) {
        console.warn("⚠️ Valeur powerState invalide :", data.powerState);
        return;
      }

      const newState = await setLampState(data.powerState);
      console.log("🔹 Nouvel état appliqué :", newState);

      // Synchroniser tous les clients
      io.emit("lampStateUpdate", newState);
      console.log("🔄 Tous les clients synchronisés avec :", newState);
    } catch (err) {
      console.error("❌ Erreur set Lampe WoT :", err);
      socket.emit("error", { message: "Erreur set Lampe WoT" });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client déconnecté :", socket.id);
  });
});

// Démarrage backend
async function start() {
  try {
    await initWoT();
    await initLamp();

    server.listen(3001, () => {
      console.log("✅ Backend Socket.io + WoT prêt sur http://0.0.0.0:3001");
    });
  } catch (err) {
    console.error("❌ Impossible de démarrer le backend :", err.message);
  }
}

start();
