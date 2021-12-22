import { Router } from "express";
import { ItemController } from "../controllers/item.controller.js";

const itemRouter = Router();
const itemController = new ItemController();

itemRouter.post("/add", itemController.addItem);

//itemsRouter.get('/list', itemController.getList);

export default itemRouter;
