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
  ActivityType
} from "discord.js";
import { token } from "../config.json";
import * as fs from "fs";
import * as path from "path";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  Firestore,
  collection,
  getDocs,
} from "firebase/firestore";
import { get_event, get_ticket } from "./lounge";
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
declare module "discord.js" {
  interface Client {
    commands: Collection<string, command_type>;
  }
}
const movies=['엘프 픽션','사료전선 이상없다.','귀여움의 칼날','양갱과 함께 사라지다','살이있는 밤빵들의 밤']
type command_type = {
  data: SlashCommandBuilder;
  execute: (interaction: Interaction<CacheType>, db: Firestore) => Promise<any>;
};
client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);
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
const S_per_MS = 1000;
const H_per_MS=60*60*S_per_MS
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction, db);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  const LAST_DATA_FILE_NAME="./last_id.json";
  const TICKET_REGEX=/"value":"[0-9A-Z]{4,}"/g
  let {event:event_id,ticket:ticket_id} = JSON.parse(fs.readFileSync(LAST_DATA_FILE_NAME).toString());
  let i=0
  setInterval(async () => {
    const event = (await get_event(1))[0];
    const ticket = (await get_ticket(1))[0];
    const new_event_id = event.id;
    const new_ticket_id=ticket.id
    if (new_event_id !== event_id) {
      event_id = new_event_id;
      fs.writeFileSync(LAST_DATA_FILE_NAME, JSON.stringify({event:event_id,ticket:ticket_id},null,2));
      const docs = await getDocs(collection(db, "trickcal-alarm"));
      docs.forEach(async (e) => {
      const data=await e.data()
      const channel_id='evet_alarm' in data?data.evet_alarm:data.ticket_alarm
        await (client.channels.cache.get(channel_id) as TextChannel)
          .send(`새로운 이벤트 도착!`+'\n'
            +`[${event.title}](${event.link})`);
      });
    }
    if (new_ticket_id !== ticket_id) {
      ticket_id = new_ticket_id;
      fs.writeFileSync(LAST_DATA_FILE_NAME, JSON.stringify({event:event_id,ticket:ticket_id},null,2));
      const docs = await getDocs(collection(db, "trickcal-alarm"));
      let ticket_codes=Array.from(ticket.contents.matchAll(TICKET_REGEX)).map(e=>e[0].slice(9,-1))
      docs.forEach(async (e) => {
        const data=await e.data()
        const channel_id='ticket_alarm' in data?data.ticket_alarm:data.evet_alarm
        const channel_=(client.channels.cache.get(channel_id) as TextChannel)
        try{
        await channel_
          .send(`새로운 티켓 도착!`+'\n'
            +`코드: ${ticket_codes.join(',')}`+'\n'
            +`[${ticket.title}](${ticket.link})`);
        }catch{
          console.log(`${channel_id} is missing (crying)`)
        }
      });
    }
  }, S_per_MS * 30);
  setInterval(()=>{client.user.setActivity(movies[i],{type:ActivityType.Watching});i=(i+1)%movies.length},2*H_per_MS)
});
// Log in to Discord with your client's token
client.login(token);
