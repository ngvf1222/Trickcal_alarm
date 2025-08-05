// Require the necessary discord.js classes
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
  Interaction,
  CacheType,
  TextChannel,
} from "discord.js";
import { token, firebaseConfig } from "./config.json";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  Firestore,
  collection,
  getDocs,
} from "firebase/firestore";
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
type command_type = {
  data: SlashCommandBuilder;
  execute: (interaction: Interaction<CacheType>, db: Firestore) => Promise<any>;
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
client.once(Events.ClientReady, async () => {
  const gs = client.guilds.cache;
  console.log(gs.size);
  gs.forEach((e) => {
    console.log(e.name);
  });
});
// Log in to Discord with your client's token
client.login(token);
