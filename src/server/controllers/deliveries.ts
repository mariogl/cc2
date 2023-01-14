import chalk from "chalk";
import type { VoiceChannel } from "discord.js";
import type { Request, Response } from "express";
import client from "../../discord/index.js";
import environment from "../../loadEnvironment.js";

interface GetDeliveriesQueryParams {
  week: number;
  challenge: string;
}
export const getDeliveries = async (
  req: Request<
    Record<string, any>,
    Record<string, any>,
    Record<string, any>,
    GetDeliveriesQueryParams
  >,
  res: Response
) => {
  const { week, challenge } = req.query;

  if (!week || !challenge) {
    console.log(chalk.red("Missing parameters week or challenge"));
    res.status(400).json({ error: "Missing parameters" });
    return;
  }

  const completeChallengeName = challenge === "we" ? "weekend" : challenge;

  const guild = client.guilds.cache.get(environment.discord.guildId);

  const deliveriesChannel = guild.channels.cache.find(
    (channel) =>
      channel.parent?.name.startsWith(
        `${environment.bootcampPromo}-bcn-week${week}`
      ) && channel.name === `challenge-${completeChallengeName}`
  );

  if (!deliveriesChannel) {
    console.log(
      chalk.red(`Couldn't find channel week ${week} and challenge ${challenge}`)
    );
    res.status(404).json({ error: "Channel not found" });
  }

  const frontRepos: string[] = [];

  (
    await (deliveriesChannel as VoiceChannel).messages.fetch({ limit: 100 })
  ).forEach((message) => {
    const lines = message.content.split("\n");
    lines.forEach((line) => {
      if (line.startsWith("Front - repo: ")) {
        frontRepos.push(line.split("Front - repo: ")[1]);
      }
    });
  });

  res.status(200).json({
    repos: frontRepos,
  });
};
