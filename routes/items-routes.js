import { Router } from "express";
import { ItemController } from "../controllers/item-controller.js";

const itemsRouter = Router();
const itemController = new ItemController();

itemsRouter.post('/add', itemController.addItem);

itemsRouter.get('/list', itemController.getList);

export default itemsRouter