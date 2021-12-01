//рабочие библиотеки
import express from "express";
import cors from "cors";

//импорт роутов
import apartmentRouter from "../api/routes/apartment.routes.js";
import authRouter from "../api/routes/auth.routes.js";
import itemRouter from "../api/routes/item.routes.js";


//инициализация express
const app = express();

//для работы POST
app.use(cors());

//для нормальной работы JSON
app.use(express.json());

//подключение роутов
app.use("/api/user", authRouter);
app.use("/api/apart", apartmentRouter);
app.use("/api/item", itemRouter);

export default app;
