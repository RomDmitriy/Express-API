import { Router } from "express";
import { UserController } from "../controllers/auth.controller.js";

const authRouter = Router();
const userController = new UserController();

//register
authRouter.post("/register", userController.createUser);

//login
authRouter.post("/login", userController.loginUser);

//update tokens
authRouter.post("/update", userController.updateJWT);

//isFound
//authRouter.post("/check", userController.check);

//fetch all info
authRouter.post("/fetch/", userController.getUser);

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
