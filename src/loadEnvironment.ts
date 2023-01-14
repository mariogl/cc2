import dotenv from "dotenv";

dotenv.config();

const environment = {
  port: +process.env.PORT || 4010,
  mongoDb: {
    url: process.env.MONGODB_URL,
    debug: process.env.MONGODB_DEBUG === "true",
  },
};

export default environment;
