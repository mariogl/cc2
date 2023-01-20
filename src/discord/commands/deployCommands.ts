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
  new SlashCommandBuilder()
    .setName(commandsNames.checkDeliveries)
    .setDescription(
      "Comprueba las entregas en este canal (comando sólo para admins)"
    )
    .addBooleanOption((option) =>
      option
        .setName("html-validation")
        .setDescription("¿Quieres pasar el validador HTML?")
    ),
  new SlashCommandBuilder()
    .setName("entrega")
    .setDescription("Realizar una entrega")
    .addStringOption((option) =>
      option.setName("front-repo").setDescription("Repo del front")
    )
    .addStringOption((option) =>
      option.setName("front-prod").setDescription("URL de producción del front")
    )
    .addStringOption((option) =>
      option.setName("back-repo").setDescription("Repo del back")
    )
    .addStringOption((option) =>
      option.setName("back-prod").setDescription("URL de producción del back")
    )
    .addUserOption((option) =>
      option.setName("partner").setDescription("Compañera/o de equipo")
    )
    .addUserOption((option) =>
      option.setName("partner2").setDescription("Compañera/o de equipo")
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
