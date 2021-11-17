import { Router } from "express";
import { UserController } from "../controllers/auth-controller.js";

const authRouter = Router();
const userController = new UserController();

//register
authRouter.post('/register', userController.createUser);

//fetch all info
authRouter.get('/:id', userController.getUser);

//fetch
authRouter.get('/:id/:query', userController.getUserQuery);

//isFound
authRouter.post('/check', userController.check);

//update password
authRouter.put('/changePass', userController.updatePassword);

//update avatar
authRouter.put('/changeAvatar', userController.updateAvatar);

//delete
authRouter.delete('/delete', userController.deleteUser);

export default authRouter