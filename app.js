import express from "express";
import authRouter from "./api/routes/auth-routes.js";

const app = express();

app.use(express.json());
app.use('/api', authRouter);

export default app