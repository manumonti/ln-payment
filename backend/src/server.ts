import express from "express";
import morgan from "morgan";

// morgan provides easy logging for express, and by default it logs to stdout which is a best practice in Docker.

const app = express();
app.use(morgan("common"));

export default app;
