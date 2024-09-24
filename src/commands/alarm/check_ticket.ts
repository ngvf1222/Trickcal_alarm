import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  CacheType,
  PermissionsBitField
} from "discord.js";
import { get_event, get_ticket } from "../../lounge";
import { doc, setDoc, getDoc, Firestore } from "firebase/firestore";
const TICKET_REGEX=/"value":"[0-9A-Z]{4,}"/g
module.exports = {
  data: new SlashCommandBuilder()
    .setName("티켓")
    .setDescription("티켓 관련 사항")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("불러오기")
        .setDescription("현재 진행중인 이벤트를 불러옵니다.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("채널")
        .setDescription("채널을 확인하거나 설정합니다.")
        .addChannelOption((option) =>
          option.setName("채널").setDescription("알림 채널")
        )
    ),
  async execute(
    interaction: ChatInputCommandInteraction<CacheType>,
    db: Firestore
  ) {
    if (interaction.options.getSubcommand() === "불러오기") {
      await interaction.reply(
        (
          await get_ticket(30)
        )
          .filter((e) => e.is_progress)
          .map((e) => `* [${e.title}](<${e.link}>)(${Array.from(e.contents.matchAll(TICKET_REGEX)).map(e=>e[0].slice(9,-1)).join(',')})`)
          .reverse()
          .join("\n\n")
      );
    } else if (interaction.options.getSubcommand() === "채널") {
      const channel = interaction.options.getChannel("채널");
      if (channel) {
        if(interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator)){
        try {
          await setDoc(
            doc(db, "trickcal-alarm", interaction.guildId),
            {
              ticket_alarm: channel.id,
            },
            { merge: true }
          );
          await interaction.reply(`알림 채널이${channel}로 설정되었어요!`);
        } catch (e) {
          console.log(e);
        }
      }else{
        await interaction.reply("권한이 부족합니다! 관리자 권한을 가지신 분만 설정이 가능하셔요!");
      }
      } else {
        const doc_ = await getDoc(
          doc(db, "trickcal-alarm", interaction.guildId)
        );
        if (doc_.exists() && 'ticket_alarm' in doc_.data()) {
          await interaction.reply(
            `<#${doc_.data().ticket_alarm}>채널이 알림 채널로 설정되어 있어요!`
          );
        } else {
          await interaction.reply("아직 설정된 알림 채널이 없어요!\n이벤트 채널이 설정되어있다면 이벤트 채널에 올라와요!");
        }
      }
    }
  },
};
