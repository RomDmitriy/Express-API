import { Router } from "express";
import { UserController } from "../controllers/auth.controller.js";

const authRouter = Router();
const userController = new UserController();

//регистрация
authRouter.post("/register", userController.createUser);

//логин
authRouter.post("/login", userController.userAuthorization);

//обновить токены
authRouter.post("/update", userController.getNewJWTtokens);

//получить данные пользователя
authRouter.post("/fetch/", userController.getUserPublicInformation);

//сбросить пароль
authRouter.put("/resetPassword/", userController.resetPassword);

//удалить пользователя
authRouter.delete("/deleteUser/", userController.deleteUser);

export default authRouter;
