import { Router } from "express";
import { UserController } from "../controllers/auth.controller.js";
import { limiterChangeData, limiterRegister } from "../../shared/limits.js";

const authRouter = Router();
const userController = new UserController();

//регистрация
authRouter.post("/register", limiterRegister, userController.createUser);

//логин
authRouter.post("/login", userController.userAuthorization);

//логин через access_token
authRouter.get("/loginToken", userController.userAuthorizationToken);

//обновить токены
authRouter.post("/update", userController.getNewJWTtokens);

//получить данные пользователя
authRouter.get("/fetch", userController.getUserPublicInformation);

//изменить данные пользователя
authRouter.put("/changeData", limiterChangeData, userController.changeUserInformation);

//сбросить пароль
authRouter.put("/resetPassword", userController.resetPassword);

//удалить пользователя
authRouter.delete("/deleteUser", userController.deleteUser);

export default authRouter;
