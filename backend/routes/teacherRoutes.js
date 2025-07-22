import { Router } from "express";
import teacherControllers from "../controllers/teacherControllers.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import adminMiddleware from "../middlewares/admin-middleware.js";

const teacherRouter = Router();

/* END POINTS */
teacherRouter.get("/",authMiddleware,adminMiddleware,teacherControllers.getTeachers);
teacherRouter.post("/",authMiddleware,adminMiddleware,teacherControllers.createTeacher);
teacherRouter.get("/files/export",authMiddleware,adminMiddleware,teacherControllers.exportTeachers);
teacherRouter.get("/:_id",authMiddleware,teacherControllers.getTeacher);
teacherRouter.put("/:_id",authMiddleware,adminMiddleware,teacherControllers.updateTeacher);
teacherRouter.delete("/:_id",authMiddleware,adminMiddleware,teacherControllers.deleteTeacher);

export default teacherRouter;