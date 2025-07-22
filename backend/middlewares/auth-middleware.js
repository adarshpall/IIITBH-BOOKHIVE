import { ErrorHandlerService,tokenService } from "../services/index.js";

const authMiddleware = async (req,res,next) => {  
    const { accessToken } = req.cookies;
    // console.log("AUTH MIDDLEWARE RUN");
    try {
        if (!accessToken) {
          throw new Error();
        }
        /* VERIFY ACCESS TOKEN */
        const userData = await tokenService.verifyAccessToken(accessToken);
        // console.log(userData);
        if (!userData) {
          throw new Error();
        }
    
        req.userData = userData;
        next();
      } catch (error) {
        next(ErrorHandlerService.unAuthorized());
      }
}

export default authMiddleware;