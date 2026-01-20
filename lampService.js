// lampService.js
const { consumeThing } = require("./wotClient");

let lampThing;

async function initLamp() {
  lampThing = await consumeThing("http://localhost:5555/lamp");
  console.log("💡 Lampe WoT consommée");
}

async function getLampState() {
  const powerState = await lampThing.readProperty("powerState");
  return { powerState };
}

async function setLampState(state) {
  await lampThing.invokeAction("setPowerState", { powerState: state });
  return { powerState: state };
}

async function toggleLamp() {
  const { powerState } = await getLampState();
  const next = powerState === "on" ? "off" : "on";
  return await setLampState(next);
}

module.exports = {
  initLamp,
  getLampState,
  setLampState,
  toggleLamp,
};
