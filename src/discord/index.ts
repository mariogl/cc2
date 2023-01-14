import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import chalk from "chalk";
import environment from "../loadEnvironment.js";
import { welcomeNewMember } from "./actions.js";
import processChatCommand from "./commands/index.js";

const client = new Client({
  partials: [Partials.Channel],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages,
  ],
});

client.on(Events.ClientReady, () => {
  console.log(
    `${chalk.blue("[BOT]")}: ${chalk.green(`Logged in as ${client.user.tag}!`)}`
  );
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    await processChatCommand(interaction);
  }
});

client.on(Events.GuildMemberAdd, welcomeNewMember);

await client.login(environment.discord.token);

export default client;
