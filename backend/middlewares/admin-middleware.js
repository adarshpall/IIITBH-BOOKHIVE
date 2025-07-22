import { ErrorHandlerService } from "../services/index.js";

const adminMiddleware = (req,res,next) => {
    /* CHECK ROLE OF USER IF ADMIN THEN GO TO THE NEXT ROUTES */
    // console.log("ADMIN MIDDLEWARE RUN");
    const role = req.userData.role;
    if(role === "Admin"){
        return next();
    }
    else{
        next(ErrorHandlerService.forbidden());
    }
}

export default adminMiddleware;