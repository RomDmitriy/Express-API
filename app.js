import express from "express";
import apartmentRouter from "./routes/apartment-routes.js";
import authRouter from "./routes/auth-routes.js";
import itemsRouter from "./routes/items-routes.js";

const app = express();

app.use((req, res, next) => {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5000');

    // Pass to next layer of middleware
    next();
});
app.use(express.json());
app.use('/api/user', authRouter);
app.use('/api/apart', apartmentRouter);
app.use('/api/item', itemsRouter);

export default app