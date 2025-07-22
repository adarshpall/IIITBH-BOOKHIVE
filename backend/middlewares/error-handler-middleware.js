import { DEBUG_MODE } from "../config/index.js";
import {ErrorHandlerService} from "../services/index.js";
import ValidationError  from "joi";

const errorHandlerMiddleware = (err,req,res,next) => {
    /* DEFAULT ERROR = SERVER ERROR */
    let statusCode = 500;
    let data = {
        message : 'Internal Server Error',
        ...(DEBUG_MODE === "true" && {
            originalError : err.message
        })
    }
    /* JOI ERROR */
    if (err instanceof ValidationError.ValidationError){
        statusCode = 422;
        data = {
            message : err.message
        }
    }

    /* CUSTOM ERRORS */
    if(err instanceof ErrorHandlerService){
        statusCode = err.status;
        data = {
            message : err.message
        }
    }

    return res.status(statusCode).json(data);
}

export default errorHandlerMiddleware;