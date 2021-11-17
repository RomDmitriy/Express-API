import { Router } from "express";
import { ApartmentController } from "../controllers/apartment-controller.js";

const apartmentRouter = Router();
const apartsController = new ApartmentController();

apartmentRouter.post('/add', apartsController.addUser);

export default apartmentRouter