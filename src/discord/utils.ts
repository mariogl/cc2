import type { GuildMember } from "discord.js";
import roles from "./roles.js";

export const isAdmin = (member: GuildMember): boolean =>
  member.roles.cache.some((role) => role.name === roles.admin);

export const isTeacher = (member: GuildMember): boolean =>
  member.roles.cache.some((role) => role.name === roles.teachers);

export const isMemberNameValid = (name: string): boolean => {
  const nameWords = name.split(" ");
  return nameWords.length > 1;
};
