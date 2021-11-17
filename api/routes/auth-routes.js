import { Router } from "express";
import { UserController } from "../../controllers/auth-controller.js";

const authRouter = Router();
const userController = new UserController();

//register
authRouter.post('/user/register', userController.createUser);

//fetch all info
authRouter.get('/user/:id', userController.getUser);

//fetch
authRouter.get('/user/:id/:query', userController.getUserQuery);

//isFound
authRouter.post('/user/check', userController.check);

//update password
authRouter.put('/user/changePass', userController.updatePassword);

//update avatar
authRouter.put('/user/changeAvatar', userController.updateAvatar);

//delete
authRouter.delete('/user/delete', userController.deleteUser);

export default authRouter