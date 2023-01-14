import express from "express";
import morgan from "morgan";
import { getDeliveries } from "./controllers/deliveries.js";
import { pingController } from "./controllers/ping.js";

const app = express();

app.use(morgan("dev"));

app.get("/", pingController);
app.get("/deliveries", getDeliveries);

export default app;
