import express from "express";
import morgan from "morgan";
import pingController from "./controllers/pingController.js";

const app = express();

app.use(morgan("dev"));

app.get("/", pingController);

export default app;
