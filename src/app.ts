import { errorHandler } from "@/middlewares/errorHandler.middleware.js";
import routes from "@/routes/index.js";
import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(errorHandler);

export default app;
