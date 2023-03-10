import dotenv from "dotenv";

dotenv.config();

const environment = {
  port: +process.env.PORT || 4010,
  mongoDb: {
    url: process.env.MONGODB_URL,
    debug: process.env.MONGODB_DEBUG === "true",
  },
  discord: {
    token: process.env.DISCORD_BOT_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    guildId: process.env.DISCORD_GUILD_ID,
  },
  github: {
    token: process.env.GITHUB_TOKEN,
  },
  bootcampPromo: process.env.BOOTCAMP_PROMO,
  studentsRole: process.env.STUDENTS_ROLE,
};

export default environment;
