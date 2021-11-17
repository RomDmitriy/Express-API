import express from "express";
import apartmentRouter from "./routes/apartment-routes.js";
import authRouter from "./routes/auth-routes.js";
import itemsRouter from "./routes/items-routes.js";

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST, PUT');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
    next();
});
app.use(express.json());
app.use('/api/user', authRouter);
app.use('/api/apart', apartmentRouter);
app.use('/api/item', itemsRouter);

export default app