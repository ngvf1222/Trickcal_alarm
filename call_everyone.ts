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
  import { token } from "./config.json";
  import { initializeApp } from "firebase/app";
  import {
    getFirestore,
    Firestore,
    collection,
    getDocs,
  } from "firebase/firestore";
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  declare module "discord.js" {
    interface Client {
      commands: Collection<string, command_type>;
    }
  }
  type command_type = {
    data: SlashCommandBuilder;
    execute: (interaction: Interaction<CacheType>, db: Firestore) => Promise<any>;
  };
  const firebaseConfig = {
    apiKey: "AIzaSyB9tOjkqP0HiIrwzkd1mIAHGfZKrV2HMGs",
    authDomain: "trickcal-alarm.firebaseapp.com",
    projectId: "trickcal-alarm",
    storageBucket: "trickcal-alarm.appspot.com",
    messagingSenderId: "414738723761",
    appId: "1:414738723761:web:2d2d2ff5428eabbc08c390",
  };
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  client.once(Events.ClientReady, async () => {
    const docs = await getDocs(collection(db, "trickcal-alarm"));
    docs.forEach(async (e) => {
        const data=await e.data()
        const channel_id='evet_alarm' in data?data.evet_alarm:data.ticket_alarm
        try{
          await (client.channels.cache.get(channel_id) as TextChannel)
            .send('개발자에 실수로 이전이 내일로 미뤄질 예정입니다. 죄송합니다.');
        }catch{
          console.log(`${channel_id} is missing (crying)`)
        }
        });
  });
  // Log in to Discord with your client's token
  client.login(token);
  