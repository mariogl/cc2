import chalk from "chalk";
import type { Guild, GuildMember, Message } from "discord.js";
import roles from "./roles.js";

export const isAdmin = (member: GuildMember): boolean =>
  member.roles.cache.some((role) => role.name === roles.admin);

export const isTeacher = (member: GuildMember): boolean =>
  member.roles.cache.some((role) => role.name === roles.teachers);

export const isMemberNameValid = (name: string): boolean => {
  const nameWords = name.split(" ");
  return nameWords.length > 1;
};

export const extractInfoMessage = async (messageData: Message) => {
  try {
    const message = messageData.content.trim();

    let {
      nickname,
      // eslint-disable-next-line prefer-const
      user: { username },
    } = await messageData.guild.members.fetch({
      user: messageData.author,
      force: true,
    });
    const firstLine = message.split("\n")[0];
    if (firstLine.startsWith("Challenge de grupo")) {
      nickname = firstLine.split(" de ")[2].trim();
    } else {
      nickname = firstLine.split(" de ")[1].trim();
    }

    nickname = nickname || username;
    nickname = nickname
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replaceAll(" ", "-")
      .toLowerCase();

    return {
      message,
      nickname,
    };
  } catch (error: unknown) {
    console.log(chalk.red("Error al intentar obtener la info del mensaje"));
    throw error;
  }
};

export const getNormalizedNickname = async (
  member: GuildMember,
  guild: Guild
) => {
  let {
    nickname,
    user: { username },
  } = await guild.members.fetch({ user: member });

  nickname = nickname || username;
  nickname = nickname
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replaceAll(" ", "-")
    .toLowerCase();

  return nickname;
};
