import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  CacheType,
  PermissionsBitField,
  EmbedBuilder,
  AttachmentBuilder,
} from "discord.js";
import { get_food_json } from "../../libs/data";
import * as k2e from "../../libs/k2e.json";
import * as n2i from "../../libs/fn2i.json";
import { emoji } from "../../libs/emojis";
const pre_food_data = {
  "로네(시장)": {
    "1": ["금탕후루", "초콜릿 아이스크림"],
    "2": ["백금탕후루"],
    "-1": ["우주식량", "공기 커틀릿"],
  },
};
module.exports = {
  data: new SlashCommandBuilder()
    .setName("연회장")
    .setDescription("사도별 연회장 호불호 음식을 확인합니다")
    .addStringOption((option) =>
      option
        .setName("사도명")
        .setDescription("사도 이름")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const food_json = await get_food_json();
    const filtered = Object.keys({ ...food_json, ...pre_food_data })
      .filter((e) => e.startsWith(focusedValue))
      .slice(0, 25);
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    await interaction.deferReply();
    const sado = interaction.options.getString("사도명");
    const food_datas = await get_food_json();
    let food_data;
    if (!(sado in food_datas)) {
      if (sado in pre_food_data) {
        food_data = pre_food_data[sado];
      } else {
        await interaction.editReply("현재 해당 사도의 데이터가 없어요!");
        return;
      }
    } else {
      food_data = food_datas[sado];
    }
    console.log(k2e[sado]);
    const file = new AttachmentBuilder(
      `./sado/Icon_GraduateSKill_${k2e[sado]}.png`
    );
    const Embed = new EmbedBuilder()
      .setTitle((await emoji(k2e[sado])) + "    " + sado)
      .setImage(`attachment://Icon_GraduateSKill_${k2e[sado]}.png`)
      .addFields(
        {
          name: "매우 좋아함",
          value:
            food_data["2"].length === 0
              ? "없음"
              : (await append_emoji(food_data["2"])).join(", "),
          inline: false,
        },
        {
          name: "좋아함",
          value:
            food_data["1"].length === 0
              ? "없음"
              : (await append_emoji([...food_data["1"]])).join(", ") +
                "\n-# " +
                (
                  await append_emoji([
                    "새콤비타F",
                    "얌얌비타C",
                    "부쉬 드 노엘",
                    "아몬드 로쉐",
                    "떡국",
                    "에심당 뽈사탕",
                    ...(sado != "로네" ? ["송편"] : []),
                  ])
                ).join(", "),
          inline: false,
        },
        {
          name: "싫어함",
          value:
            food_data["-1"].length === 0
              ? "없음"
              : (await append_emoji(food_data["-1"])).join(", "),
          inline: false,
        }
      )
      .setFooter({
        text: "본 자료는 수많은 유저의 제보를 통해 기록된 것입니다.",
      });
    await interaction.editReply({ embeds: [Embed], files: [file] });
  },
};
async function append_emoji(foods: string[]) {
  let result = [];
  for (let i of foods) {
    result = [
      ...result,
      i +
        (await emoji(
          "Food_" +
            n2i[
              (Object.keys(n2i) as (keyof typeof n2i)[]).filter(
                (e) => i.split(" ").join("") == e.split(" ").join("")
              )[0]
            ]
        )),
    ];
  }
  return result;
}
