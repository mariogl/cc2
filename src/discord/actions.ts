import chalk from "chalk";
import type { GuildMember } from "discord.js";

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
