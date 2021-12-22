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

//Обновление отметки
itemRouter.put('/mark/:item_id/:item_mark', itemController.updateMark);

export default itemRouter;
