import { Router } from "express";
import { authControllers } from "../controllers/index.js";
import authMiddleware from "../middlewares/auth-middleware.js";

const authRouter = Router();

/* END PONTS */
authRouter.post("/login",authControllers.login);
authRouter.get("/refresh-tokens",authControllers.refreshTokens);
authRouter.post("/forget-password",authControllers.forgetPassword);
authRouter.post("/reset-password",authControllers.resetPassword);
authRouter.get("/user-details",authControllers.getUserDetails);
/* AUTHENTICATED USER ONLY */
authRouter.post("/change-password", authMiddleware ,authControllers.changePassword);
authRouter.get("/logout", authMiddleware ,authControllers.logout);
authRouter.post("/update-profile-image", authMiddleware ,authControllers.updateProfileImage);


export default authRouter;