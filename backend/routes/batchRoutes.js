import { Router } from "express";
import { batchControllers } from "../controllers/index.js";
import adminMiddleware from "../middlewares/admin-middleware.js";
import authMiddleware from "../middlewares/auth-middleware.js";

const batchRouter = Router();

/* ENDPOINTS */
batchRouter.get("/",batchControllers.getBatches);
batchRouter.get("/:_id",batchControllers.getBatch);

/* PROTECTED ROUTES ONLY FOR ADMIN */
batchRouter.post("/", authMiddleware ,adminMiddleware, batchControllers.createBatch);
batchRouter.put("/:_id", authMiddleware ,adminMiddleware, batchControllers.updateBatch);
batchRouter.delete("/:_id", authMiddleware ,adminMiddleware, batchControllers.deleteBatch);
batchRouter.get("/files/export", authMiddleware ,adminMiddleware, batchControllers.exportBatches);


export default batchRouter;