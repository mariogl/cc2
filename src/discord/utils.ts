import chalk from "chalk";
import { Octokit } from "@octokit/rest";
import type {
  ChatInputCommandInteraction,
  Guild,
  GuildMember,
  Message,
  User,
} from "discord.js";
import environment from "../loadEnvironment.js";
import roles from "./roles.js";
import type { DeliveryCommandOptions, DeliveryData, Side } from "./types.js";
import axios from "axios";

const octokit = new Octokit({ auth: environment.github.token });

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

export const normalizeNickname = (nickname: string): string =>
  nickname
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replaceAll(" ", "-")
    .toLowerCase();

export const getMemberNickname = async (
  partner: User,
  guild: Guild
): Promise<string> => {
  const {
    nickname,
    user: { username },
  } = await guild.members.fetch(partner);

  return normalizeNickname(nickname || username);
};

export const getChallengeName = (categoryName: string, channelName: string) => {
  const weekRegExp = new RegExp(`${environment.bootcampPromo}-bcn-week(\\d)`);
  const nWeek = categoryName.match(weekRegExp)[1];
  const nChallenge = channelName.split("-")[1];

  const challengeName = `w${nWeek}ch${
    nChallenge === "weekend" ? "we" : nChallenge
  }`;

  const fullChallengeName = `${environment.bootcampPromo}-${challengeName}`;

  return {
    challengeName,
    fullChallengeName,
  };
};

export const getOptionsFromCommand = (
  interaction: ChatInputCommandInteraction
): DeliveryCommandOptions => {
  const { options } = interaction;

  const frontRepo = options.getString("front-repo");
  const frontProd = options.getString("front-prod");
  const backRepo = options.getString("back-repo");
  const backProd = options.getString("back-prod");
  const partner = options.getUser("partner");
  const partner2 = options.getUser("partner2");

  return {
    frontRepo,
    frontProd,
    backRepo,
    backProd,
    partner,
    partner2,
  };
};

export const checkCommandOptions = ({
  frontRepo,
  frontProd,
  backRepo,
  backProd,
}: DeliveryCommandOptions) => {
  if (!frontRepo && !backRepo) {
    throw new Error("Tienes que entregar la URL del repo o repos 😿");
  }

  if ((!frontRepo && frontProd) || (frontRepo && !frontProd)) {
    throw new Error(
      "Tienes que entregar las URL del repo y de producción del front 😿"
    );
  }

  if ((!backRepo && backProd) || (backRepo && !backProd)) {
    throw new Error(
      "Tienes que entregar las URL del repo y de producción del back 😿"
    );
  }
};

export const checkPartners = async (
  { partner, partner2 }: DeliveryCommandOptions,
  guild: Guild,
  deliveryData: DeliveryData
): Promise<DeliveryData> => {
  let newNickname = deliveryData.nickname;

  if (partner) {
    const partnerNickname = await getMemberNickname(partner, guild);

    console.log(chalk.blue("\nReceived partner:"));
    console.log(partnerNickname);

    newNickname += `-${partnerNickname}`;
  }

  if (partner2) {
    const partner2Nickname = await getMemberNickname(partner2, guild);

    console.log(chalk.blue("\nReceived partner:"));
    console.log(partner2Nickname);

    newNickname += `-${partner2Nickname}`;
  }

  return {
    ...deliveryData,
    nickname: newNickname,
  };
};

const extractInfoRepo = (repoUrl: string) => {
  const repoPath = repoUrl.split("https://github.com/")[1];
  const parts = repoPath.split("/");
  const owner = parts[0];
  const repoName = parts.slice(1).join("").replace(".git", "");

  return {
    owner,
    repoName,
  };
};

const checkRepoPrefix = (
  expectedRepoPrefix: string,
  nickname: string,
  repoName: string
) => {
  if (
    !repoName.toLowerCase().startsWith(expectedRepoPrefix.toLowerCase()) ||
    !repoName.toLowerCase().includes(nickname.toLowerCase())
  ) {
    const error = new Error(
      `Nombre de repo mal formado. El nombre del repo debería empezar por ${expectedRepoPrefix.toLowerCase()}-${nickname.toLowerCase()} 🥱`
    );
    throw error;
  }
};

export const getRandomYield = (): string => {
  const yields = ["Achtung!", "Oju eh?", "EH!", "Eeeooo!", "PSSST!"];
  return yields[Math.floor(Math.random() * yields.length)];
};

export const checkRepo = async (
  side: Side,
  repoUrl: string,
  fullChallengeName: string,
  nickname: string
) => {
  console.log(chalk.blue(` Repo ${side}: ${repoUrl}`));

  try {
    if (!/^https:\/\/github.com/.test(repoUrl)) {
      throw new Error("Parece que eso no es una URL de GitHub 😕");
    }

    const { owner, repoName } = extractInfoRepo(repoUrl);

    checkRepoPrefix(fullChallengeName, nickname, repoName);

    await octokit.request("GET /repos/{owner}/{repo}/commits", {
      owner,
      repo: repoName,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      per_page: 1,
    });
  } catch (error: unknown) {
    let errorMessage = (error as Error).message;

    if ((error as Error).message.includes("empty")) {
      errorMessage = "Creo que ese repo está vacío 😭";
    } else if ((error as Error).message.toLowerCase() === "not found") {
      errorMessage = "Parece que ese repo no existe 🤔";
    }

    throw new Error(
      `🚫 ${getRandomYield()} Error en el repo ${side}: ${errorMessage}`
    );
  }
};

export const checkProduction = async (side: Side, productionUrl: string) => {
  try {
    await axios.get(productionUrl);
  } catch {
    throw new Error(
      `🚫 ${getRandomYield()} Error en producción ${side}: la URL devuelve 404 😶‍🌫️`
    );
  }

  console.log(chalk.blue(` URL prod: ${productionUrl}`));
};

export const buildDeliveryReply = (
  {
    frontRepo,
    frontProd,
    backRepo,
    backProd,
    partner,
    partner2,
  }: DeliveryCommandOptions,
  deliveryData: DeliveryData,
  challengeName: string
): string => {
  let replyContent = `Challenge ${
    partner || partner2 ? "de grupo" : ""
  } ${challengeName} de ${deliveryData.nickname}\n`;
  if (frontRepo) {
    replyContent += `\nFront - repo: ${frontRepo}`;
    replyContent += `\nFront - prod: ${frontProd}`;
  }

  if (backRepo) {
    replyContent += `\nBack - repo: ${backRepo}`;
    replyContent += `\nBack - prod: ${backProd}`;
  }

  return replyContent;
};
