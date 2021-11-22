import express from "express";
import apartmentRouter from "./routes/apartment.routes.js";
import authRouter from "./routes/auth.routes.js";
import itemsRouter from "./routes/item.routes.js";
import cors from "cors";

const app = express();

//для работы POST
app.use(cors());

//для нормальной работы JSON
app.use(express.json());

app.use("/api/user", authRouter);
app.use("/api/apart", apartmentRouter);
app.use("/api/item", itemsRouter);

export default app;
