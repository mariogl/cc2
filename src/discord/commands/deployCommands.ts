import chalk from "chalk";
import { REST, SlashCommandBuilder, Routes } from "discord.js";
import environment from "../../loadEnvironment.js";
import commandsNames from "./commandsNames.js";

const commands = [
  new SlashCommandBuilder()
    .setName(commandsNames.checkAllMembersNames)
    .setDescription(
      "Comprueba el formato del nombre de los usuarios (comando sólo para admins)"
    ),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(environment.discord.token);

rest
  .put(Routes.applicationCommands(environment.discord.clientId), {
    body: commands,
  })
  .then(() => {
    console.log(chalk.green("Successfully registered application commands."));
  })
  .catch(console.error);
