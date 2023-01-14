import chalk from "chalk";
import type { ChatInputCommandInteraction } from "discord.js";
import {
  checkAllMembersNames,
  checkDeliveries,
  replyToUnknownCommand,
} from "../actions.js";
import commandsNames from "./commandsNames.js";

const processChatCommand = async (interaction: ChatInputCommandInteraction) => {
  const { guild, user, commandName } = interaction;
  const { displayName } = await guild.members.fetch(user);

  console.log(
    chalk.blue(`Received command "${commandName}" from ${displayName}`)
  );

  switch (commandName) {
    case commandsNames.checkAllMembersNames:
      await checkAllMembersNames(interaction);
      break;
    case commandsNames.checkDeliveries:
      await checkDeliveries(interaction);
      break;
    default:
      await replyToUnknownCommand(interaction);
      break;
  }
};

export default processChatCommand;
