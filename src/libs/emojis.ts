import { token, clientId } from "../../config.json";
async function get_emojis() {
  const req = await fetch(
    `https://discord.com/api/v10/applications/${clientId}/emojis`,
    {
      headers: {
        Authorization: `Bot ${token}`,
      },
    }
  );
  const data = (await req.json()).items;
  return data;
}
async function get_emoji_by_name(name) {
  const emojis = await get_emojis();
  return emojis.filter((e) => e.name == name)[0];
}
function get_emoji_text(emoji) {
  return `<:${emoji.name}:${emoji.id}>`;
}
async function emoji(name) {
  const emoji = await get_emoji_by_name(name);
  return get_emoji_text(emoji);
}
export { get_emojis, get_emoji_by_name, get_emoji_text, emoji };
