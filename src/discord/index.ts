import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import chalk from "chalk";
import environment from "../loadEnvironment.js";

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
  console.log(chalk.yellow(`Logged in as ${client.user.tag}!`));
});

await client.login(environment.discord.token);

export default client;
