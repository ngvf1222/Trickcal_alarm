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
import { readFile, readdir } from "fs/promises";
import { token } from "./config.json";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async () => {
  const url = `https://discord.com/api/v10/applications/${client.application?.id}/emojis`;
  const images = await readdir("./sado/");
  await (async () => {
    for (let e of images) {
      const img = await readFile(`./sado/${e}`);
      const base64 = img.toString("base64");
      const req = await fetch(url, {
        headers: {
          Authorization: `Bot ${token}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          name: e.slice(19, -4),
          image: `data:image/jpeg;base64,${base64}`,
        }),
      });
      console.log(e, req.status, req.statusText, await req.text());
    }
    console.log("end!");
  })();
});
// Log in to Discord with your client's token
client.login(token);
