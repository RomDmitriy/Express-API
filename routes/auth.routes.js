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

//fetch some info
//authRouter.get("/fetch/:id/:query", userController.getUserQuery);

//update password
//authRouter.put("/changePass/:id", userController.updatePassword);

//update avatar
//authRouter.put("/changeAvatar/:id", userController.updateAvatar);

//update nickname
//authRouter.put("/changeNickname/:id", userController.updateNickname);

//delete user
//authRouter.delete("/delete/:id", userController.deleteUser);

export default authRouter;
