import dotenv from "dotenv";

dotenv.config();

const environment = {
  mongoDb: {
    url: process.env.MONGODB_URL,
    debug: process.env.MONGODB_DEBUG === "true",
  },
};

export default environment;
