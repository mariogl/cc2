import chalk from "chalk";
import connectDatabase from "./database/connectDatabase.js";
import environment from "./loadEnvironment.js";

connectDatabase(environment.mongoDb.url)
  .then(() => {
    console.log(chalk.blue("Connected to database"));
  })
  .catch((error: unknown) => {
    console.log(
      chalk.red(`Error on starting database: ${(error as Error).message}`)
    );
    process.exit(1);
  });
