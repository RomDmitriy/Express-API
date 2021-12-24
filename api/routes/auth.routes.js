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
authRouter.get("/login_token", userController.userAuthorizationToken);

//обновить токены
authRouter.post("/new_tokens", userController.getNewJWTtokens);

//получить данные пользователя
authRouter.get("/get_info", userController.getUserPublicInformation);

//изменить данные пользователя
authRouter.put("/change_data", limiterChangeData, userController.changeUserInformation);

//сбросить пароль
//authRouter.put("/reset_password", userController.resetPassword);

//удалить пользователя
authRouter.delete("/delete_user", userController.deleteUser);

export default authRouter;
