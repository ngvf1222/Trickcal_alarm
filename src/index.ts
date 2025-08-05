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
  ActivityType,
} from "discord.js";
import { token, firebaseConfig } from "../config.json";
import * as fs from "fs";
import * as path from "path";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  Firestore,
  collection,
  getDocs,
} from "firebase/firestore";
import { get_event, get_ticket } from "./libs/lounge";
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
declare module "discord.js" {
  interface Client {
    commands: Collection<string, command_type>;
  }
}
type command_type = {
  data: SlashCommandBuilder;
  execute: (interaction: Interaction<CacheType>, db: Firestore) => Promise<any>;
  autocomplete?: (interaction: Interaction<CacheType>) => Promise<any>;
};
client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const S_per_MS = 1000;
const H_per_MS = 60 * 60 * S_per_MS;
const movies = [
  "엘프 픽션",
  "사료전선 이상없다.",
  "귀여움의 칼날",
  "양갱과 함께 사라지다",
  "살이있는 밤빵들의 밤",
];
const LAST_DATA_FILE_NAME = "./last_id.json";

let state: { event: any; ticket: any };
function save_state(state) {
  console.log(state, "s");
  const state_text = JSON.stringify(state, null, 2);
  fs.writeFileSync(LAST_DATA_FILE_NAME, state_text);
}
const Event = {
  event: {
    is_change: (e) => state.event !== e.id,
    get: async () => (await get_event(1))[0],
    on: async (e) => {
      state.event = e.id;
      save_state(state);
      const docs = await getDocs(collection(db, "trickcal-alarm"));
      docs.forEach(async (d) => {
        const data = await d.data();
        if ("evet_alarm" in data) {
          const channel = client.channels.cache.get(
            data.evet_alarm
          ) as TextChannel;
          try {
            await channel.send(
              `새로운 이벤트 도착!` + "\n" + `[${e.title}](${e.link})`
            );
          } catch {
            console.log(`${data.evet_alarm} is missing (crying)`);
          }
        }
      });
      return state;
    },
  },
  ticket: {
    is_change: (e) => {
      console.log(state.ticket, e.id);
      return state.ticket !== e.id;
    },
    get: async () => (await get_ticket(1))[0],
    __get_ticket__: (contents) => {
      const TICKET_REGEX = /"value":"[0-9A-Z]{4,}"/g;
      return Array.from(contents.matchAll(TICKET_REGEX)).map((e) =>
        e[0].slice(9, -1)
      );
    },
    on: async (e) => {
      state.ticket = e.id;
      save_state(state);
      console.log(state, e.id, "a");
      const ticket_codes = Event.ticket.__get_ticket__(e.contents);
      const docs = await getDocs(collection(db, "trickcal-alarm"));
      docs.forEach(async (d) => {
        const data = await d.data();
        if ("ticket_alarm" in data) {
          const channel = client.channels.cache.get(
            data.ticket_alarm
          ) as TextChannel;
          try {
            await channel.send(
              `새로운 티켓 도착!` +
                "\n" +
                `코드: ${ticket_codes.join(",")}` +
                "\n" +
                `[${e.title}](${e.link})`
            );
          } catch {
            console.log(`${data.ticket_alarm} is missing (crying)`);
          }
        }
      });
    },
  },
};

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  state = JSON.parse(fs.readFileSync(LAST_DATA_FILE_NAME).toString());
  let i = 0;
  setInterval(async () => {
    const event = await Event.event.get();
    const ticket = await Event.ticket.get();
    if (Event.event.is_change(event)) {
      await Event.event.on(event);
    }
    if (Event.ticket.is_change(ticket)) {
      console.log(await Event.ticket.on(ticket));
    }
    console.log(state, "t");
  }, S_per_MS * 30);
  setInterval(() => {
    client.user.setActivity(movies[i], { type: ActivityType.Watching });
    i = (i + 1) % movies.length;
  }, 2 * H_per_MS);
});

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
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
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
  } else if (interaction.isAutocomplete()) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error(error);
    }
  }
});
// Log in to Discord with your client's token
client.login(token);
