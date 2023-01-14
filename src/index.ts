import chalk from "chalk";
import connectDatabase from "./database/connectDatabase.js";
import environment from "./loadEnvironment.js";
import startServer from "./server/startServer.js";
import "./discord/index.js";

try {
  await startServer(environment.port);
  console.log(
    `${chalk.blue("[SERVER]")}: ${chalk.green(
      `listening on http://localhost:${environment.port}`
    )}`
  );
} catch (error: unknown) {
  console.log(
    chalk.red(
      `${chalk.blue("[SERVER]")}: ${chalk.red((error as Error).message)}`
    )
  );
  process.exit(1);
}

try {
  await connectDatabase(environment.mongoDb.url);
  console.log(
    `${chalk.blue("[DATABASE]")}: ${chalk.green("Connected successfully")}`
  );
} catch (error: unknown) {
  console.log(
    chalk.red(
      `${chalk.blue("[DATABASE]")}: ${chalk.red((error as Error).message)}`
    )
  );
}
