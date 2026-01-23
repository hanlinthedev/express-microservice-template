import { errorHandler } from "@/middlewares/global-error-handler.middleware.js";
import routes from "@/routes/index.js";
import express from "express";
import { setCorrelationId } from "./middlewares/correlation-id.middleware.js";

const app = express();

app.use(setCorrelationId);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);
app.use(errorHandler);

export default app;
