// wotClient.js
const axios = require("axios");
const { Servient } = require("@node-wot/core");
const { HttpClientFactory } = require("@node-wot/binding-http");

const servient = new Servient();
servient.addClientFactory(new HttpClientFactory());

let wot;

async function initWoT() {
  wot = await servient.start();
  console.log("✅ WoT client prêt");
}

async function consumeThing(tdUrl) {
  const res = await axios.get(tdUrl);
  const td = res.data;
  return await wot.consume(td);
}

module.exports = { initWoT, consumeThing };
