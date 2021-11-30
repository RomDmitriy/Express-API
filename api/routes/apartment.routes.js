import { Router } from "express";
import { ApartmentController } from "../controllers/apartment.controller.js";

const apartmentRouter = Router();
const apartamentController = new ApartmentController();

//apartmentRouter.post("/add", apartamentController.addApartment);

export default apartmentRouter;
