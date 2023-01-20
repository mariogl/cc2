import type {
  GuildBasedChannel,
  GuildTextBasedChannel,
  User,
} from "discord.js";

export interface DeliveryData {
  category: GuildBasedChannel;
  channel: GuildTextBasedChannel;
  nickname: string;
}

export interface DeliveryCommandOptions {
  frontRepo: string;
  frontProd: string;
  backRepo: string;
  backProd: string;
  partner: User;
  partner2: User;
}

export type Side = "front" | "back";
