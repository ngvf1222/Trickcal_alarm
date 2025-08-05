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
declare module "discord.js" {
  interface Client {
    commands: Collection<string, command_type>;
  }
}
type command_type = {
  autocomplete?: (interaction: Interaction<CacheType>) => Promise<any>;
  data: SlashCommandBuilder;
  execute: (interaction: Interaction<CacheType>, db: Firestore) => Promise<any>;
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
client.once(Events.ClientReady, async () => {
  const docs = await getDocs(collection(db, "trickcal-alarm"));
  docs.forEach(async (e) => {
    const data = await e.data();
    const channel_id =
      "evet_alarm" in data ? data.evet_alarm : data.ticket_alarm;
    try {
      await (client.channels.cache.get(channel_id) as TextChannel).send(
        "## 리뉴아 봇 작동 일시적 중단 공지\n모종의 사유로 <@1267694210262372362>의 작동이 ~7.3까지 일시적으로 중단될 예정입니다. 최대한 빠른 시일내로 다시 찾아뵙겠습니다. 감사합니다."
      );
    } catch {
      console.log(`${channel_id} is missing (crying)`);
    }
  });
});
// Log in to Discord with your client's token
client.login(token);
