import { Router } from "express";
import eBookControllers from "../controllers/eBookControllers.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import adminMiddleware from "../middlewares/admin-middleware.js";

const eBookRouter = Router();

/* END POINTS */

eBookRouter.post("/", authMiddleware,adminMiddleware,eBookControllers.createEBook);
eBookRouter.get("/",eBookControllers.getEBooks);
eBookRouter.get("/:_id",eBookControllers.getEBook);
eBookRouter.put("/:_id",authMiddleware,adminMiddleware,eBookControllers.updateEBook);
eBookRouter.delete("/:_id",authMiddleware,adminMiddleware,eBookControllers.deleteEBook);
eBookRouter.get("/files/export",authMiddleware,adminMiddleware,eBookControllers.exportEBooks);
eBookRouter.get("/read/online",authMiddleware,adminMiddleware,eBookControllers.readEBook);


export default eBookRouter;