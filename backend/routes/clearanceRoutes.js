import { Router } from "express";
import clearanceControllers from "../controllers/clearanceControllers.js";
import authMiddleware from "../middlewares/auth-middleware.js";


const clearanceRouter = Router();

clearanceRouter.post("/submit-form",authMiddleware,clearanceControllers.submitForm);
clearanceRouter.get("/student-requests",authMiddleware,clearanceControllers.getClearanceRequestsByStudent);
clearanceRouter.get("/requests",clearanceControllers.getClearanceRequests);
clearanceRouter.post("/handle-request",authMiddleware,clearanceControllers.handleClearanceRequest);


export default clearanceRouter;