import chalk from "chalk";
import type { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { isAdmin, isMemberNameValid, isTeacher } from "./utils.js";

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
