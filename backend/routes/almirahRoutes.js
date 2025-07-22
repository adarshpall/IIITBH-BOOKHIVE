import { Router } from "express";
import authMiddleware from "../middlewares/auth-middleware.js";
import adminMiddleware from "../middlewares/admin-middleware.js";
import almirahControllers from "../controllers/almirahControllers.js";

const almirahRouter = Router();

/* END POINTS */
almirahRouter.post("/",authMiddleware,adminMiddleware,almirahControllers.createAlmirah);
almirahRouter.get("/",authMiddleware,adminMiddleware,almirahControllers.getAlmirahs);
almirahRouter.get("/:_id",authMiddleware,adminMiddleware,almirahControllers.getAlmirah);
almirahRouter.put("/:_id",authMiddleware,adminMiddleware,almirahControllers.updateAlmirah);
almirahRouter.delete("/:_id",authMiddleware,adminMiddleware,almirahControllers.deleteAlmirah);
almirahRouter.get("/files/export",authMiddleware,adminMiddleware,almirahControllers.exportAlmirahs);

export default almirahRouter;