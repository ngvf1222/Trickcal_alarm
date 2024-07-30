import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  CacheType,
} from "discord.js";
import { get_event } from "../../lounge";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
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
module.exports = {
  data: new SlashCommandBuilder()
    .setName("이벤트")
    .setDescription("이벤트 관련 사항")
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
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    if (interaction.options.getSubcommand() === "불러오기") {
      await interaction.reply(
        (
          await get_event(30)
        )
          .filter((e) => e.is_progress)
          .map((e) => `* [${e.title}](<${e.link}>)`)
          .reverse()
          .join("\n\n")
      );
    } else if (interaction.options.getSubcommand() === "채널") {
      const channel = interaction.options.getChannel("채널");
      if (channel) {
        try {
          await setDoc(
            doc(db, "trickcal-alarm", interaction.guildId),
            {
              evet_alarm: interaction.channelId,
            },
            { merge: true }
          );
          await interaction.reply(`알림 채널이${channel}로 설정되었어요!`);
        } catch (e) {
          console.log(e);
        }
      } else {
        const doc_ = await getDoc(
          doc(db, "trickcal-alarm", interaction.guildId)
        );
        if (doc_.exists()) {
          await interaction.reply(
            `<#${doc_.data().evet_alarm}>채널이 알림 채널로 설정되어 있어요!`
          );
        } else {
          await interaction.reply("아직 설정된 알림 채널이 없어요!");
        }
      }
    }
  },
};
