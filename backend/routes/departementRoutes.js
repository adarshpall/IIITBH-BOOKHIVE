import { Router } from "express";
import {departementControllers} from "../controllers/index.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import adminMiddleware from "../middlewares/admin-middleware.js";

const departementRouter = Router();

/* END POINTS */

/* PROTECTED ONLY FOR ADMIN */
departementRouter.post("/",authMiddleware,adminMiddleware,departementControllers.createDepartement);
departementRouter.put("/:_id",authMiddleware,adminMiddleware,departementControllers.updateDepartement);
departementRouter.delete("/:_id",authMiddleware,adminMiddleware,departementControllers.deleteDepartement);
departementRouter.get("/files/export",authMiddleware,adminMiddleware,departementControllers.exportDepartements);


departementRouter.get("/",departementControllers.getDepartements);
departementRouter.get("/:_id",departementControllers.getDepartement);

export default departementRouter;