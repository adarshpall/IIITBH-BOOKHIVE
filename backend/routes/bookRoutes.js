import { Router } from "express";
import authMiddleware from "../middlewares/auth-middleware.js";
import adminMiddleware from "../middlewares/admin-middleware.js";
import bookControllers from "../controllers/bookControllers.js";

const bookRouter = Router();

bookRouter.post("/",authMiddleware,adminMiddleware,bookControllers.createBook);
bookRouter.get("/",bookControllers.getBooks);
bookRouter.get("/:_id",bookControllers.getBook);
bookRouter.put("/:_id",authMiddleware,adminMiddleware,bookControllers.updateBook);
bookRouter.delete("/:_id",authMiddleware,adminMiddleware,bookControllers.deleteBook);
bookRouter.get("/files/export",authMiddleware,adminMiddleware,bookControllers.exportBooks);

export default bookRouter;