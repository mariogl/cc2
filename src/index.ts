import chalk from "chalk";
import connectDatabase from "./database/connectDatabase.js";
import environment from "./loadEnvironment.js";
import startServer from "./server/startServer.js";

await startServer(environment.port);
console.log(
  chalk.blue(`Server listening on http://localhost:${environment.port}`)
);

connectDatabase(environment.mongoDb.url)
  .then(() => {
    console.log(chalk.blue("Connected to database"));
  })
  .catch((error: unknown) => {
    console.log(
      chalk.red(`Error on starting database: ${(error as Error).message}`)
    );
  });
