import { Router } from "express";
import { UserController } from "../controllers/auth-controller.js";

const authRouter = Router();
const userController = new UserController();

//register
authRouter.post('/register', userController.createUser);

//isFound
authRouter.post('/check', userController.check);

//fetch all info
authRouter.get('/fetch/:id', userController.getUser);

//fetch
authRouter.get('/fetch/:id/:query', userController.getUserQuery);

//update password
authRouter.put('/changePass', userController.updatePassword);

//update avatar
authRouter.put('/changeAvatar', userController.updateAvatar);

//delete
authRouter.delete('/delete', userController.deleteUser);

export default authRouter