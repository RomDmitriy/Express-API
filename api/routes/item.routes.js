import { Router } from "express";
import { ItemController } from "../controllers/item.controller.js";

const itemRouter = Router();
const itemController = new ItemController();

//Добавление
itemRouter.post("/add", itemController.addItem);

//Получение списка предметов
itemRouter.get('/get', itemController.getItems);

//Удаление
itemRouter.delete('/delete/:item_id', itemController.deleteItem);

export default itemRouter;
