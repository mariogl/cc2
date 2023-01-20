/* eslint-disable max-depth */
import axios from "axios";
import chalk from "chalk";
import type { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { MessageFlags } from "discord.js";
import Challenge from "../database/models/Challenge.js";
import environment from "../loadEnvironment.js";
import type { DeliveryData } from "./types.js";
import {
  buildDeliveryReply,
  checkCommandOptions,
  checkPartners,
  checkProduction,
  checkRepo,
  extractInfoMessage,
  getChallengeName,
  getMemberNickname,
  getNormalizedNickname,
  getOptionsFromCommand,
  isAdmin,
  isMemberNameValid,
  isTeacher,
} from "./utils.js";

export const replyToUnknownCommand = async (
  interaction: ChatInputCommandInteraction
) => {
  await interaction.reply({
    content: "Has usado un comando desconocido",
    ephemeral: true,
  });
};

export const welcomeNewMember = async (member: GuildMember) => {
  console.log(chalk.blue(`${member.displayName} se ha unido al servidor`));
  await member.send(
    `👋 ¡Hola, ${member.displayName}! Soy el gatobot de ISDI Coders y te doy la bienvenida al servidor de la escuela. Necesito que lo primero que hagas sea ponerte tu nombre y apellido en este servidor.`
  );
  await member.send(
    `Para ello, haz click en tu nombre en la columna de la derecha (la lista de usuarios) y luego haz click en "Editar perfil de servidor". Ahí puedes ponerte un nombre que sólo aparecerá en este servidor.`
  );
  await member.send("Recuerda: sólo un nombre y un apellido 😎");
  await member.send(
    "Espero que disfrutes de todo lo que encuentres por aquí. ¡Hasta pronto! 😸"
  );
};

const askMemberToChangeDisplayName = async (member: GuildMember) => {
  await member.send("🐱 ¡Miau! Aquí Coder Cat, el bot de ISDI Coders");
  await member.send(
    `Estoy revisando los nombres de cada usuaria/o de nuestro server, y creo que tu nombre ${member.displayName} no tiene el formato correcto. Recuerda que estamos en familia y cada uno ponemos nuestro nombre y apellido 😸`
  );
  await member.send(
    "Si vas al canal de #reglas, ahí verás las instrucciones para cambiarte el nombre. Tranquila/o, que ese nombre sólo será visible en nuestro server."
  );
  await member.send(
    "También puedes cambiarte el nombre si vas al servidor y lanzas el comando `/nick`."
  );
  await member.send("Gracias por colaborar, Coder 😽");
};

export const checkAllMembersNames = async (
  interaction: ChatInputCommandInteraction
) => {
  const { guild } = interaction;

  const members = await guild.members.fetch();
  const membersWithInvalidNames = members.filter(
    (member) =>
      !isMemberNameValid(member.displayName) &&
      !isTeacher(member) &&
      !isAdmin(member)
  );

  await interaction.reply({
    content: `Se ha avisado a los siguientes usuarios para que cambien su nombre: ${membersWithInvalidNames
      .map((member) => member.displayName)
      .join(", ")}`,
    ephemeral: true,
  });

  membersWithInvalidNames.forEach(async (member) => {
    console.log(`Asking ${member.displayName} to change their display name`);
    await askMemberToChangeDisplayName(member);
  });
};

export const checkDeliveries = async (
  interaction: ChatInputCommandInteraction
) => {
  const { guild, channel } = interaction;

  const messages = await channel.messages.fetch();

  await interaction.deferReply({ ephemeral: true });

  const studentsDelivered: string[] = [];

  for (const [, message] of messages) {
    try {
      if (message.author.username !== "Coder Cat") {
        continue;
      }

      const { message: content, nickname } = await extractInfoMessage(message);

      if (nickname.split("-").length === 2) {
        console.log(nickname);
        studentsDelivered.push(nickname);
      } else {
        console.log(`Grupo: ${nickname}`);
        const nicknames = nickname.split("-");
        for (let position = 0; position < nicknames.length; position += 2) {
          const studentNickname = `${nicknames[position]}-${
            nicknames[position + 1]
          }`;
          console.log(`-> ${studentNickname}`);
          studentsDelivered.push(studentNickname);
        }
      }

      const lines = content.split("\n");

      for (const line of lines) {
        if (line.startsWith("Front - prod:")) {
          const frontProductionUrl = line.split("Front - prod: ")[1];
          const response = await axios.get(frontProductionUrl, {
            validateStatus: (status) => status < 500,
          });
          if (response.status === 404) {
            console.log(chalk.red("La URL de producción da 404"));
            break;
          }

          const { options } = interaction;
          if (!options.getBoolean("html-validation")) {
            break;
          }

          console.log(chalk.bgMagenta(`\nEntrega de ${nickname}\n`));
          console.log(chalk.green("Comprobando HTML Validator"));
          const validatorUrl = `https://validator.w3.org/nu/?doc=${frontProductionUrl}`;
          const {
            data: { messages: validatorMessages },
          } = await axios.get<{ messages: Array<Record<string, any>> }>(
            `${validatorUrl}&out=json`
          );
          const errors = validatorMessages.filter(
            (validatorMessage) => validatorMessage.type === "error"
          );
          const warnings = validatorMessages.filter(
            (validatorMessage) => validatorMessage.type === "info"
          );
          if (errors.length > 0) {
            console.log(
              chalk.red.bold(`${errors.length} errores al validar HTML`)
            );
          }

          if (warnings.length > 0) {
            console.log(
              chalk.yellow.bold(`${warnings.length} warnings al validar HTML`)
            );
          }

          if (errors.length === 0 && warnings.length === 0) {
            console.log(chalk.green.bold("OK"));
          } else {
            console.log(chalk.red(validatorUrl));
          }
        }
      }
    } catch (error: unknown) {
      console.log(chalk.red((error as Error).message));
    }
  }

  const studentsRole = guild.roles.cache.find(
    (role) => role.name === environment.studentsRole
  );

  const studentsInRole = studentsRole.members.filter(
    (student) => !student.displayName.startsWith("Inna")
  );
  const numberOfStudentsInRole = studentsInRole.size;
  const missingStudents: string[] = [];

  for (const [, member] of studentsInRole) {
    const nickname = await getNormalizedNickname(member, guild);

    if (!studentsDelivered.includes(nickname)) {
      missingStudents.push(nickname);
    }
  }

  console.log(studentsDelivered);

  await interaction.editReply({
    content: `Han entregado ${
      studentsDelivered.length
    } alumnos de ${numberOfStudentsInRole}. Faltan: ${missingStudents.join(
      ", "
    )}`,
  });
};

export const pickDelivery = async (
  interaction: ChatInputCommandInteraction
) => {
  try {
    const { guild, channel } = interaction;
    const category = guild.channels.cache.get(channel.parentId);

    const messages = await channel.messages.fetch();

    console.log(
      chalk.blue(`On category "${category.name}" & channel "${channel.name}"`)
    );

    const nickname = await getMemberNickname(interaction.user, guild);

    let deliveryData: DeliveryData = {
      category,
      channel,
      nickname,
    };

    const { challengeName, fullChallengeName } = getChallengeName(
      category.name,
      channel.name
    );

    console.log(chalk.yellow(`>>>>> ${challengeName} <<<<<`));

    const sameDeliveryMessage = messages.find((message) =>
      message.content.toLowerCase().includes(`${challengeName} de ${nickname}`)
    );

    const commandOptions = getOptionsFromCommand(interaction);

    checkCommandOptions(commandOptions);

    deliveryData = await checkPartners(commandOptions, guild, deliveryData);

    const { frontRepo, frontProd, backRepo, backProd } = commandOptions;

    if (frontRepo) {
      console.log(chalk.blue("\nChecking front repo..."));
      await checkRepo("front", frontRepo, fullChallengeName, nickname);

      console.log(chalk.blue("\nChecking front prod..."));
      await checkProduction("front", frontProd);
    }

    if (backRepo) {
      console.log(chalk.blue("\nChecking back repo..."));
      await checkRepo("back", backRepo, fullChallengeName, nickname);

      console.log(chalk.blue("\nChecking back prod..."));
      await checkProduction("back", backProd);
    }

    let challengeDb = await Challenge.findOne({
      name: challengeName,
    });

    if (!challengeDb) {
      challengeDb = await Challenge.create({
        name: challengeName,
        week: challengeName[1],
        number: challengeName.split("ch")[1],
      });
    }

    if (sameDeliveryMessage) {
      console.log(chalk.green("Found previous delivery of the same challenge"));
    }

    const replyContent = buildDeliveryReply(
      commandOptions,
      deliveryData,
      challengeName
    );

    if (sameDeliveryMessage) {
      await sameDeliveryMessage.edit(replyContent);
      await interaction.reply({
        content: `He actualizado tu entrega anterior con los nuevos datos 👌`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: replyContent,
        flags: MessageFlags.SuppressEmbeds,
      });
    }
  } catch (error: unknown) {
    console.log(chalk.red((error as Error).message));

    await interaction.reply({
      content: (error as Error).message,
      ephemeral: true,
    });
  }
};
