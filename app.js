import express from "express";
import apartmentRouter from "./routes/apartment.routes.js";
import authRouter from "./routes/auth.routes.js";
import itemsRouter from "./routes/item.routes.js";
import cors from "cors";
import passport from "passport";

const app = express();

app.use(cors());

app.use(express.json());

app.use(passport.initialize());
import "./passport.js";

app.use("/api/user", authRouter);
app.use("/api/apart", apartmentRouter);
app.use("/api/item", itemsRouter);

export default app;
