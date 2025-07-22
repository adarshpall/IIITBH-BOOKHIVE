import { Router } from "express";
import genralControllers from "../controllers/genralControllers.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import adminMiddleware from "../middlewares/admin-middleware.js";
const genralRouter = Router();

genralRouter.post("/contact-us",genralControllers.contactUs);
genralRouter.get("/contact-us",authMiddleware,adminMiddleware,genralControllers.getMessages);
genralRouter.post("/handle-messages",authMiddleware,adminMiddleware,genralControllers.handleMessages);
genralRouter.get("/home-data",genralControllers.getHomeData);
/* ONLY AUTHENTICATED USER CAN ALLOW TO CREATE REVIEW */
genralRouter.post("/books/:_id/reviews",authMiddleware,genralControllers.createReview);

export default genralRouter;